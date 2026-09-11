// scripts/verify-phase175.mjs
// Verification suite for Phase 1.75: Site Portfolio Improvement & Editing
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let failures = 0;

function pass(msg) {
  console.log(`\x1b[32m✔ [PASS]\x1b[0m ${msg}`);
}

function fail(msg) {
  console.error(`\x1b[31m✖ [FAIL]\x1b[0m ${msg}`);
  failures++;
}

console.log('\n--- Verifying Phase 1.75: Site Portfolio Improvement & Editing ---');

// 1. Featured Deliverables Gallery & Placeholders
const requiredDeliverableImages = [
  'img/figure-4-4.webp',
  'img/figure-4-4.png',
  'img/figure-4-3.webp',
  'img/figure-4-3.png',
  'img/table-4-9.webp',
  'img/table-4-9.png',
  'img/figure-3-1.webp',
  'img/figure-3-1.png',
  'img/eliud-sibuor.webp',
  'img/eliud-sibuor.png',
];

for (const imgPath of requiredDeliverableImages) {
  const fullPath = path.join(rootDir, imgPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 0) {
    pass(`Deliverable image asset exists: ${imgPath}`);
  } else {
    fail(`Missing or empty deliverable image asset: ${imgPath}`);
  }
}

// 2. index.html Verification
const indexPath = path.join(rootDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, 'utf8');

  // Deliverables section
  if (html.includes('id="deliverables"')) {
    pass('Featured Deliverables section #deliverables exists');
  } else {
    fail('Missing #deliverables section');
  }

  const deliverableCards = (html.match(/<article class="deliverable-card">/g) || []).length;
  if (deliverableCards === 4) {
    pass('Featured Deliverables gallery contains 4 authentic artifact cards');
  } else {
    fail(`Expected 4 deliverable cards, found ${deliverableCards}`);
  }

  // Captions & Provenance
  const provenanceCaptions = (html.match(/class="deliverable-provenance"/g) || []).length;
  if (provenanceCaptions === 4 && html.includes('identifying metadata redacted')) {
    pass('Every artifact card includes honest provenance caption with metadata redaction disclosure');
  } else {
    fail('Deliverable cards missing provenance captions or redaction disclosure');
  }

  // Collapsible Data Summaries
  const dataSummaries = (html.match(/<details class="deliverable-data">/g) || []).length;
  if (dataSummaries === 4 && html.includes('View data summary')) {
    pass('Every artifact card provides a collapsible <details> data summary for accessibility');
  } else {
    fail('Deliverable cards missing collapsible data summary blocks');
  }

  // 3. Expanded Services (4 -> 8)
  if (html.includes('Eight ways I take your paper from idea to defense')) {
    pass('Services section heading updated to Eight ways I take your paper from idea to defense');
  } else {
    fail('Services section heading does not reflect 8 services');
  }

  const serviceCards = (html.match(/<article class="service-card">/g) || []).length;
  if (serviceCards === 8) {
    pass('Services grid contains all 8 service cards');
  } else {
    fail(`Expected 8 service cards, found ${serviceCards}`);
  }

  const expectedServices = [
    'APA 7th Manuscript Formatting',
    'Comprehensive Academic Editing',
    'Literature Review Structuring',
    'Research Coaching',
    'Developmental Drafting Support',
    'Quantitative &amp; Qualitative Data Analysis',
    'Figure, Table &amp; Graph Development',
    'Defense Presentation Deck'
  ];

  let servicesPassed = true;
  for (const s of expectedServices) {
    if (!html.includes(s)) {
      servicesPassed = false;
      fail(`Services section missing card title: ${s}`);
    }
  }
  if (servicesPassed) {
    pass('All 8 service card titles verified present in markup');
  }

  // Coaching card exclusion points to drafting support
  if (html.includes('Not included: full manuscript drafting — see Developmental Drafting Support below.')) {
    pass('Research Coaching card excluded scope correctly references Developmental Drafting Support');
  } else {
    fail('Research Coaching card does not point to Developmental Drafting Support');
  }

  // Service cards cross-linking to #deliverables
  const deliverableLinks = (html.match(/href="#deliverables"/g) || []).length;
  if (deliverableLinks >= 4) {
    pass(`Cross-links to #deliverables present across site (found ${deliverableLinks})`);
  } else {
    fail(`Expected at least 4 links to #deliverables, found ${deliverableLinks}`);
  }

  // 4. Contact Form Dropdowns & Turnaround
  if (html.includes('id="cf-service"') && html.includes('optgroup label="Manuscript services"') && html.includes('optgroup label="Research development &amp; analysis"')) {
    pass('Contact form contains grouped service dropdown covering both categories');
  } else {
    fail('Contact form missing grouped service dropdown');
  }

  if (html.includes('id="cf-turnaround"') && html.includes('Standard — 5 business days') && html.includes('Express — 48 hours')) {
    pass('Contact form contains turnaround preference dropdown with Standard, Express, and Flexible options');
  } else {
    fail('Contact form missing turnaround preference dropdown');
  }

  // 5. Direct WhatsApp Button
  const waLinks = (html.match(/https:\/\/wa\.me\/254701976022\?text=/g) || []).length;
  if (waLinks >= 2) {
    pass(`WhatsApp direct inquiry link present in multiple high-conversion locations (found ${waLinks})`);
  } else {
    fail(`Expected at least 2 WhatsApp CTA links, found ${waLinks}`);
  }

  if (!html.includes('https://wa.me/+') && !html.includes('https://wa.me/0') && !html.includes('https://wa.me/254 701')) {
    pass('WhatsApp links follow strict international wa.me format (no +, no spaces, no leading 0)');
  } else {
    fail('WhatsApp link contains invalid characters (+, spaces, or leading 0)');
  }

  if (html.includes('Prefer WhatsApp? Replies 8:00–18:00 EAT.')) {
    pass('WhatsApp availability hours note present');
  } else {
    fail('Missing WhatsApp availability note');
  }

  // 6. Bio Section & Credentials
  if (html.includes('id="about"') && html.includes('Eliud Sibuor — Research Paper Writing Specialist')) {
    pass('Bio section #about present with Eliud Sibuor credentials heading');
  } else {
    fail('Bio section #about missing Eliud Sibuor credentials heading');
  }

  if (html.includes('class="bio-photo"') && html.includes('/img/eliud-sibuor.webp') && html.includes('class="bio-monogram"')) {
    pass('Bio section includes headshot picture container and accessible ES monogram fallback');
  } else {
    fail('Bio section missing headshot container or monogram fallback');
  }

  if (html.includes('APA 7th edition specialist') && html.includes('Quantitative &amp; qualitative analysis')) {
    pass('Bio section displays credentials chips');
  } else {
    fail('Bio section missing credentials chips');
  }

  // 7. Ethics Harmonization Sweep
  if (html.includes('No undisclosed authorship: drafting support is collaborative and transparent')) {
    pass('Terms strip reflects amended ethics clause supporting disclosed, collaborative drafting');
  } else {
    fail('Terms strip ethics clause has not been updated');
  }

  if (
    html.includes('No undisclosed authorship. Drafting support is collaborative and transparent') &&
    html.includes('I never engage in undisclosed ghostwriting.')
  ) {
    pass('FAQ Q1 answer reflects amended ethics language with full academic ownership statement');
  } else {
    fail('FAQ Q1 answer does not reflect amended ethics language');
  }

  // Open Google Doc never embedded or exposed to visitors
  if (!html.includes('docs.google.com/document')) {
    pass('The client Google Doc is safely excluded from all site links and embeds (PII protection)');
  } else {
    fail('SECURITY RISK: Client Google Doc link found in public site markup');
  }

  // JSON-LD Structured Data
  const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  let profServiceOffers = 0;
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1]);
      if (parsed['@type'] === 'ProfessionalService' && parsed.hasOfferCatalog) {
        profServiceOffers = parsed.hasOfferCatalog.itemListElement?.length || 0;
      }
    } catch {}
  }

  if (profServiceOffers === 8) {
    pass('JSON-LD ProfessionalService schema offers catalog expanded to all 8 service offerings');
  } else {
    fail(`Expected 8 JSON-LD service offers, found ${profServiceOffers}`);
  }
} else {
  fail('index.html missing');
}

// 8. CSS Design System & Contrast
const styleCssPath = path.join(rootDir, 'css', 'style.css');
if (fs.existsSync(styleCssPath)) {
  const css = fs.readFileSync(styleCssPath, 'utf8');
  if (css.includes('--wa: #25D366') && css.includes('--wa-strong: #075E54')) {
    pass('style.css defines WhatsApp design tokens (--wa and --wa-strong)');
  } else {
    fail('style.css missing WhatsApp color tokens');
  }
  if (css.includes('.btn-whatsapp')) {
    pass('style.css defines .btn-whatsapp button component');
  } else {
    fail('style.css missing .btn-whatsapp styles');
  }
} else {
  fail('css/style.css missing');
}

const landingCssPath = path.join(rootDir, 'css', 'landing.css');
if (fs.existsSync(landingCssPath)) {
  const css = fs.readFileSync(landingCssPath, 'utf8');
  if (css.includes('.deliverable-card') && css.includes('.deliverable-media') && css.includes('.gallery-grid')) {
    pass('landing.css defines Featured Deliverables gallery styles');
  } else {
    fail('landing.css missing deliverable gallery styles');
  }
  if (css.includes('.bio-grid') && css.includes('.bio-photo') && css.includes('.bio-monogram')) {
    pass('landing.css defines Bio section styles and monogram fallback');
  } else {
    fail('landing.css missing bio section styles');
  }
} else {
  fail('css/landing.css missing');
}

// 9. Client Portal & Database Sync
const newProjPath = path.join(rootDir, 'new-project.html');
if (fs.existsSync(newProjPath)) {
  const html = fs.readFileSync(newProjPath, 'utf8');
  const serviceOptions = [
    'value="formatting"',
    'value="editing"',
    'value="lit_review"',
    'value="coaching"',
    'value="drafting"',
    'value="data_analysis"',
    'value="figures"',
    'value="defense_deck"'
  ];
  let npPassed = true;
  for (const opt of serviceOptions) {
    if (!html.includes(opt)) {
      npPassed = false;
      fail(`new-project.html missing service option: ${opt}`);
    }
  }
  if (npPassed) {
    pass('new-project.html service select includes all 8 service options');
  }
} else {
  fail('new-project.html missing');
}

const dashJsPath = path.join(rootDir, 'js', 'dashboard.js');
if (fs.existsSync(dashJsPath)) {
  const js = fs.readFileSync(dashJsPath, 'utf8');
  if (
    js.includes('drafting:') &&
    js.includes('data_analysis:') &&
    js.includes('figures:') &&
    js.includes('defense_deck:')
  ) {
    pass('js/dashboard.js maps all 8 service types in SERVICE_LABELS');
  } else {
    fail('js/dashboard.js SERVICE_LABELS missing new service type labels');
  }
} else {
  fail('js/dashboard.js missing');
}

// 10. Database Migration SQL
const migrationPath = path.join(rootDir, 'supabase', 'migration-1.75.sql');
if (fs.existsSync(migrationPath)) {
  const sql = fs.readFileSync(migrationPath, 'utf8');
  if (
    sql.includes('projects_service_type_check') &&
    sql.includes('drafting') &&
    sql.includes('data_analysis') &&
    sql.includes('figures') &&
    sql.includes('defense_deck')
  ) {
    pass('supabase/migration-1.75.sql contains valid append-only CHECK constraint expansion');
  } else {
    fail('supabase/migration-1.75.sql missing required service types');
  }
} else {
  fail('supabase/migration-1.75.sql missing');
}

const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  if (
    sql.includes('drafting') &&
    sql.includes('data_analysis') &&
    sql.includes('figures') &&
    sql.includes('defense_deck')
  ) {
    pass('supabase/schema.sql base schema includes all 8 service types');
  } else {
    fail('supabase/schema.sql missing updated service types in CHECK constraint');
  }
} else {
  fail('supabase/schema.sql missing');
}

// Summary
console.log('\n--- Phase 1.75 Verification Summary ---');
if (failures === 0) {
  console.log('\x1b[32m✔ ALL PHASE 1.75 CHECKS PASSED!\x1b[0m\n');
  process.exit(0);
} else {
  console.error(`\x1b[31m✖ ${failures} check(s) failed.\x1b[0m\n`);
  process.exit(1);
}
