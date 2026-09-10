// api/stripe-webhook.js
const Stripe = require('stripe');
const { admin } = require('../lib/server-supabase');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Stripe signs the raw request payload — must buffer before any JSON parsing
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  let event;
  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not configured in environment variables.');
    }

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret || 'whsec_placeholder'
    );
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const projectId = session.metadata?.projectId;

    if (!projectId) {
      return res.status(200).json({ received: true, skipped: 'no metadata' });
    }

    // Idempotency & reconciliation check
    const { data: project, error: fetchErr } = await admin
      .from('projects')
      .select('id, paid, amount_due, status')
      .eq('id', projectId)
      .single();

    if (fetchErr || !project) {
      console.warn('Webhook received for untracked project ID:', projectId);
      return res.status(200).json({ received: true, skipped: 'unknown project' });
    }

    const paidCents = session.amount_total;
    const expectedCents = Math.round(Number(project.amount_due) * 100);

    // Update state only if unpaid and amount matches invoice
    if (!project.paid && paidCents === expectedCents) {
      const { error: updateError } = await admin
        .from('projects')
        .update({
          paid: true,
          status: 'editing', // Valid CHECK constraint status
        })
        .eq('id', projectId);

      if (updateError) {
        console.error('Webhook DB update failed:', updateError);
        return res.status(500).json({ error: 'DB update failed' }); // Prompts Stripe to retry
      }
    }
  }

  return res.status(200).json({ received: true });
};
