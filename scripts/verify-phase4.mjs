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

console.log('--- Verifying Phase 1.4: Single-Page Public Portfolio ---');

// 1. Check index.html exists
const indexPath = path.join(root, 'index.html');
const indexExists = fs.existsSync(indexPath);
check('index.html exists', indexExists);

if (indexExists) {
  const html = fs.readFileSync(indexPath, 'utf8');

  // 2. Semantic landmarks
  check('Semantic <header> present', /<header[^>]*class="[^"]*site-header[^"]*"/.test(html));
  check('Accessible skip-link present', /class="skip-link"[^>]*href="#main"/.test(html));
  check('Semantic <main id="main"> present', /<main[^>]*id="main"/.test(html));
  check('Semantic <footer> present', /<footer[^>]*class="[^"]*site-footer[^"]*"/.test(html));

  // 3. Section IDs
  const sections = ['services', 'portfolio', 'process', 'about', 'faq', 'contact'];
  for (const s of sections) {
    check(`Section #${s} present`, new RegExp(`id="${s}"`).test(html));
  }

  // 4. Hero section & proof metrics
  check('Hero eyebrow & H1 present', html.includes('Your manuscript, journal-submission ready.'));
  check('Metrics dl present with 4 proof cards', (html.match(/<div class="metric">/g) || []).length === 4);

  // 5. Four service cards
  const serviceCards = (html.match(/<article class="service-card">/g) || []).length;
  check('Four service cards present', serviceCards === 4, `found ${serviceCards}`);
  check('Service cards have .includes lists', (html.match(/class="includes"/g) || []).length === 4);
  check('Service cards have .excluded scope boundaries', (html.match(/class="excluded"/g) || []).length === 4);
  check('Service cards have .pricing-basis notes', (html.match(/class="pricing-basis"/g) || []).length === 4);

  // 6. Interactive Before/After slider
  check('Slider container .ba-slider present', html.includes('class="ba-slider"'));
  check('Slider native range input present', html.includes('class="ba-range"'));
  check('Slider before/after image markup present', html.includes('case-a-before.webp') && html.includes('case-a-after.webp'));

  // 7. Three case studies
  const caseCards = (html.match(/<article class="case-study-card">/g) || []).length;
  check('Three case study cards present', caseCards === 3, `found ${caseCards}`);
  check('Case studies include stats bars', (html.match(/class="stats-bar"/g) || []).length === 3);
  check('Case studies include outcome lines', (html.match(/class="case-outcome"/g) || []).length === 3);

  // 8. Process steps & terms strip
  check('4-step process grid present', (html.match(/class="process-step"/g) || []).length === 4);
  check('Terms strip present (SLA, Revisions, Ethics, Privacy)', html.includes('terms-strip') && html.includes('Turnaround SLA'));

  // 9. About section & lead magnet
  check('About section present with APA expertise focus', html.includes('Why APA Expertise Matters'));
  check('Lead magnet checklist card present', html.includes('The APA 7th Quick-Reference QA Checklist'));

  // 10. FAQ accordion
  const faqItems = (html.match(/<details class="faq-item">/g) || []).length;
  check('FAQ accordion with at least 5 <details> items', faqItems >= 5, `found ${faqItems}`);
  check('First FAQ item covers academic ethics / ghostwriting', html.includes('Do you write or rewrite content for clients?'));

  // 11. Contact form
  check('Contact form present', html.includes('id="contact-form"'));
  check('Contact form anti-spam honeypot present', html.includes('name="botcheck"'));
  check('Contact form live status region present', html.includes('class="form-status"') && html.includes('role="status"'));

  // 12. Clean URLs check (no .html on internal links)
  const internalHtmlLinks = (html.match(/href="\/[^"]+\.html"/g) || []);
  check('Clean URLs enforced (zero .html links)', internalHtmlLinks.length === 0, internalHtmlLinks.join(', '));

  // 13. Zero heavy frameworks on landing page
  const hasReact = /react|vue|angular|tailwind|bootstrap/i.test(html);
  const hasSupabaseOnLanding = html.includes('supabase-client.js');
  check('Zero heavy frontend frameworks', !hasReact);
  check('Landing page free of heavy backend SDKs', !hasSupabaseOnLanding);
}

// 14. Check visual assets exist
const imgDir = path.join(root, 'img');
check('img/case-a-before.webp exists', fs.existsSync(path.join(imgDir, 'case-a-before.webp')));
check('img/case-a-after.webp exists', fs.existsSync(path.join(imgDir, 'case-a-after.webp')));
check('img/og-card.png exists', fs.existsSync(path.join(imgDir, 'og-card.png')));

// 15. Check CSS & JS files
const landingCssPath = path.join(root, 'css', 'landing.css');
const mainJsPath = path.join(root, 'js', 'main.js');
check('css/landing.css exists', fs.existsSync(landingCssPath));
check('js/main.js exists', fs.existsSync(mainJsPath));

if (fs.existsSync(mainJsPath)) {
  const jsContent = fs.readFileSync(mainJsPath, 'utf8');
  check('main.js wires mobile drawer', jsContent.includes('setDrawer') && jsContent.includes('mobile-drawer'));
  check('main.js wires before/after slider', jsContent.includes('.ba-slider') && jsContent.includes('--pos'));
  check('main.js wires contact form submit', jsContent.includes('contact-form') && jsContent.includes('fetch'));
}

const allPass = checks.every(c => c.pass);
console.log(`\nVerification Result: ${checks.filter(c => c.pass).length}/${checks.length} checks passed.`);
if (!allPass) {
  process.exit(1);
}
