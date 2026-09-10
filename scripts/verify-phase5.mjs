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

console.log('--- Verifying Phase 1.5: Authentication & Client Dashboard ---');

// 1. Landing page drawer bug fix check
const styleCss = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');
const landingCss = fs.readFileSync(path.join(root, 'css', 'landing.css'), 'utf8');
check('Global [hidden] rule present in style.css', styleCss.includes('[hidden]') && styleCss.includes('display: none !important'));
check('.drawer[hidden] rule present in landing.css', landingCss.includes('.drawer[hidden]') && landingCss.includes('display: none !important'));
check('Drawer isolated from desktop via media query', landingCss.includes('min-width: 769px') && landingCss.includes('.drawer'));

// 2. Portal files existence
const requiredFiles = [
  'css/dashboard.css',
  'login.html',
  'register.html',
  'dashboard.html',
  'new-project.html',
  'js/auth.js',
  'js/dashboard.js',
];
for (const f of requiredFiles) {
  check(`File ${f} exists`, fs.existsSync(path.join(root, f)));
}

// 3. Clean URLs check across all portal pages
const htmlFiles = ['login.html', 'register.html', 'dashboard.html', 'new-project.html'];
for (const hf of htmlFiles) {
  const content = fs.readFileSync(path.join(root, hf), 'utf8');
  const dirtyLinks = (content.match(/href="\/[^"]+\.html"/g) || []);
  check(`${hf} complies with Clean URLs (no .html links)`, dirtyLinks.length === 0, dirtyLinks.join(', '));
}

// 4. Auth pages markup (login.html and register.html)
const loginHtml = fs.readFileSync(path.join(root, 'login.html'), 'utf8');
check('login.html contains #login-form', loginHtml.includes('id="login-form"'));
check('login.html contains #login-email and #login-password', loginHtml.includes('id="login-email"') && loginHtml.includes('id="login-password"'));
check('login.html contains live status region with role="status"', loginHtml.includes('id="login-status"') && loginHtml.includes('role="status"'));

const registerHtml = fs.readFileSync(path.join(root, 'register.html'), 'utf8');
check('register.html contains #register-form', registerHtml.includes('id="register-form"'));
check('register.html contains #reg-name, #reg-email, #reg-password', registerHtml.includes('id="reg-name"') && registerHtml.includes('id="reg-email"') && registerHtml.includes('id="reg-password"'));
check('register.html contains live status region with role="status"', registerHtml.includes('id="register-status"') && registerHtml.includes('role="status"'));

// 5. Route guard & flash prevention
const dashboardHtml = fs.readFileSync(path.join(root, 'dashboard.html'), 'utf8');
check('dashboard.html has structural flash guard (#portal hidden)', dashboardHtml.includes('id="portal" hidden'));
check('dashboard.html has loading indicator (#portal-loading)', dashboardHtml.includes('id="portal-loading"'));
check('dashboard.html contains #projects-tbody and #logout-btn', dashboardHtml.includes('id="projects-tbody"') && dashboardHtml.includes('id="logout-btn"'));

const newProjectHtml = fs.readFileSync(path.join(root, 'new-project.html'), 'utf8');
check('new-project.html has structural flash guard (#portal hidden)', newProjectHtml.includes('id="portal" hidden'));
check('new-project.html has dropzone with 5-state spec (#dropzone)', newProjectHtml.includes('id="dropzone"') && newProjectHtml.includes('data-state="idle"'));
check('new-project.html dropzone is keyboard-accessible (tabindex="0" role="button")', newProjectHtml.includes('tabindex="0"') && newProjectHtml.includes('role="button"'));

// 6. JavaScript auth & dashboard logic
const authJs = fs.readFileSync(path.join(root, 'js', 'auth.js'), 'utf8');
check('auth.js checks session and bounces to /dashboard', authJs.includes('getSession') && authJs.includes('/dashboard'));
check('auth.js calls signInWithPassword', authJs.includes('signInWithPassword'));
check('auth.js passes full_name in metadata for DB trigger', authJs.includes('signUp') && authJs.includes('full_name'));
check('auth.js wires logout button', authJs.includes('signOut'));

const dashboardJs = fs.readFileSync(path.join(root, 'js', 'dashboard.js'), 'utf8');
check('dashboard.js enforces route guard (redirects if not authenticated)', dashboardJs.includes('getSession') && dashboardJs.includes("replace('/login')"));
check('dashboard.js escapes HTML to prevent XSS (esc function)', dashboardJs.includes('esc') && dashboardJs.includes('&amp;'));
check('dashboard.js respects storage path convention ({user.id}/{projectId}/)', dashboardJs.includes('${user.id}/${projectId}/'));
check('dashboard.js creates 5-minute signed URLs for downloads', dashboardJs.includes('createSignedUrl') && dashboardJs.includes('300'));
check('dashboard.js subscribes to realtime Postgres changes', dashboardJs.includes('postgres_changes') && dashboardJs.includes('projects-'));

// 7. Dashboard CSS tokens & components
const dashboardCss = fs.readFileSync(path.join(root, 'css', 'dashboard.css'), 'utf8');
const expectedBadges = ['badge-submitted', 'badge-review', 'badge-editing', 'badge-payment', 'badge-completed'];
for (const b of expectedBadges) {
  check(`dashboard.css defines .${b}`, dashboardCss.includes(b));
}

const dropzoneStates = ['dragover', 'uploading', 'success', 'error'];
for (const st of dropzoneStates) {
  check(`dashboard.css defines dropzone state [data-state="${st}"]`, dashboardCss.includes(`data-state="${st}"`));
}

check('dashboard.css defines responsive table card transformation using attr(data-label)', dashboardCss.includes('attr(data-label)') && dashboardCss.includes('max-width: 768px'));

const allPass = checks.every(c => c.pass);
console.log(`\nVerification Result: ${checks.filter(c => c.pass).length}/${checks.length} checks passed.`);
if (!allPass) {
  process.exit(1);
}
