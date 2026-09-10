import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

const checks = [];
function check(name, pass, detail = '') {
  checks.push({ name, pass, detail });
  const mark = pass ? '✓' : '✗';
  console.log(`${mark} ${name}${detail ? ` (${detail})` : ''}`);
}

console.log('--- Verifying Phase 1.6: Payment Gateway & Invoicing ---');

// 1. Dependencies in package.json
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
check('stripe is declared in package.json', Boolean(allDeps.stripe));
check('@supabase/supabase-js is declared in package.json', Boolean(allDeps['@supabase/supabase-js']));

// 2. Server Supabase client (lib/server-supabase.js)
const serverSupabasePath = path.join(root, 'lib', 'server-supabase.js');
check('lib/server-supabase.js exists', fs.existsSync(serverSupabasePath));
if (fs.existsSync(serverSupabasePath)) {
  const content = fs.readFileSync(serverSupabasePath, 'utf8');
  check('server-supabase.js exports admin client', content.includes('admin') && content.includes('createClient'));
  check('server-supabase.js exports verifyUser helper', content.includes('verifyUser') && content.includes('Bearer'));
  check('server-supabase.js disables session persistence on server', content.includes('persistSession: false'));
}

// 3. Serverless Checkout endpoint (api/create-checkout.js)
const checkoutPath = path.join(root, 'api', 'create-checkout.js');
check('api/create-checkout.js exists', fs.existsSync(checkoutPath));
if (fs.existsSync(checkoutPath)) {
  const content = fs.readFileSync(checkoutPath, 'utf8');
  check('create-checkout enforces POST method (405)', content.includes('405'));
  check('create-checkout checks user authentication (401)', content.includes('verifyUser') && content.includes('401'));
  check('create-checkout checks projectId presence (400)', content.includes('projectId') && content.includes('400'));
  check('create-checkout verifies project ownership (403)', content.includes('user_id !== user.id') && content.includes('403'));
  check('create-checkout enforces state check for unpaid & awaiting_payment (409)', content.includes('awaiting_payment') && content.includes('409'));
  check('create-checkout derives unit_amount from database amount_due (Catch #1)', content.includes('unit_amount: Math.round(Number(project.amount_due) * 100)'));
  check('create-checkout binds projectId and userId in Stripe metadata', content.includes('metadata:') && content.includes('projectId: project.id'));
  check('create-checkout sets success_url and cancel_url redirects', content.includes('success_url:') && content.includes('cancel_url:'));
}

// 4. Stripe Webhook Listener (api/stripe-webhook.js)
const webhookPath = path.join(root, 'api', 'stripe-webhook.js');
check('api/stripe-webhook.js exists', fs.existsSync(webhookPath));
if (fs.existsSync(webhookPath)) {
  const content = fs.readFileSync(webhookPath, 'utf8');
  check('stripe-webhook buffers raw body stream for signature', content.includes('getRawBody') && content.includes('Buffer.concat'));
  check('stripe-webhook verifies signature with constructEvent', content.includes('constructEvent') && content.includes('stripe-signature'));
  check('stripe-webhook listens for checkout.session.completed', content.includes('checkout.session.completed'));
  check('stripe-webhook updates status to "editing" and paid to true (Catch #2)', content.includes("status: 'editing'") && content.includes('paid: true'));
  check('stripe-webhook checks database before update for idempotency', content.includes('!project.paid'));
}

// 5. Dashboard HTML & Invoice Modal (dashboard.html)
const dashboardHtmlPath = path.join(root, 'dashboard.html');
const dashboardHtml = fs.readFileSync(dashboardHtmlPath, 'utf8');
check('dashboard.html contains <dialog id="pay-modal">', dashboardHtml.includes('id="pay-modal"'));
check('pay-modal contains #pay-project, #pay-service, and #pay-amount', dashboardHtml.includes('id="pay-project"') && dashboardHtml.includes('id="pay-service"') && dashboardHtml.includes('id="pay-amount"'));
check('pay-modal contains #pay-cancel and #pay-confirm', dashboardHtml.includes('id="pay-cancel"') && dashboardHtml.includes('id="pay-confirm"'));

// 6. Dashboard CSS (css/dashboard.css)
const dashboardCssPath = path.join(root, 'css', 'dashboard.css');
const dashboardCss = fs.readFileSync(dashboardCssPath, 'utf8');
check('dashboard.css styles .pay-modal and ::backdrop', dashboardCss.includes('.pay-modal') && dashboardCss.includes('::backdrop'));
check('dashboard.css styles .invoice-lines and .invoice-total', dashboardCss.includes('.invoice-lines') && dashboardCss.includes('.invoice-total'));
check('dashboard.css styles .toast notifications with animation', dashboardCss.includes('.toast') && dashboardCss.includes('toast-in'));

// 7. Dashboard JS (js/dashboard.js)
const dashboardJsPath = path.join(root, 'js', 'dashboard.js');
const dashboardJs = fs.readFileSync(dashboardJsPath, 'utf8');
check('dashboard.js formats currency using Intl.NumberFormat (USD)', dashboardJs.includes('Intl.NumberFormat') && dashboardJs.includes('USD'));
check('dashboard.js renders Pay button for awaiting_payment status', dashboardJs.includes('awaiting_payment') && dashboardJs.includes('data-pay'));
check('dashboard.js wires Pay modal showModal and close', dashboardJs.includes('payModal.showModal') && dashboardJs.includes('payModal.close'));
check('dashboard.js calls /api/create-checkout with Bearer token', dashboardJs.includes('/api/create-checkout') && dashboardJs.includes('Bearer'));
check('dashboard.js handles payment=success and payment=cancelled redirects', dashboardJs.includes('payment') && dashboardJs.includes('success') && dashboardJs.includes('toast'));

const allPass = checks.every(c => c.pass);
console.log(`\nVerification Result: ${checks.filter(c => c.pass).length}/${checks.length} checks passed.`);
if (!allPass) {
  process.exit(1);
}
