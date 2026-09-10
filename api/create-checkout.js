// api/create-checkout.js
const Stripe = require('stripe');
const { admin, verifyUser } = require('../lib/server-supabase');

const SERVICE_LABELS = {
  formatting: 'APA 7 Formatting',
  editing: 'Comprehensive Editing',
  lit_review: 'Lit Review Structuring',
  coaching: 'Research Coaching',
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1 — Authentication check: verify the caller's JWT
    const user = await verifyUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // 2 — Request validation: client supplies only projectId (never the amount)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }
    const { projectId } = body || {};
    if (!projectId) {
      return res.status(400).json({ error: 'projectId required' });
    }

    // 3 — Source of truth: read amount_due and state directly from the database
    const { data: project, error } = await admin
      .from('projects')
      .select('id, user_id, title, service_type, amount_due, paid, status')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 4 — Ownership check
    if (project.user_id !== user.id) {
      return res.status(403).json({ error: 'Not your project' });
    }

    // 5 — State checks: payable only when invoiced, unpaid, and priced
    if (project.paid) {
      return res.status(409).json({ error: 'This invoice is already paid' });
    }
    if (project.status !== 'awaiting_payment') {
      return res.status(409).json({ error: 'No invoice is due on this project yet' });
    }
    if (!Number(project.amount_due) || Number(project.amount_due) <= 0) {
      return res.status(409).json({ error: 'Invoice amount not set' });
    }

    // 6 — Create Stripe Checkout session with server-controlled unit_amount
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
    const origin = process.env.PUBLIC_SITE_URL || 'https://academic-portfolio-alpha-eosin.vercel.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(Number(project.amount_due) * 100), // convert dollars to cents
            product_data: {
              name: `${SERVICE_LABELS[project.service_type] ?? 'Editorial services'} — ${project.title}`,
            },
          },
        },
      ],
      metadata: {
        projectId: project.id,
        userId: user.id,
      },
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-checkout error:', err);
    return res.status(500).json({ error: 'Could not start checkout' });
  }
};
