// scripts/verify-phase7.mjs
// Verification suite for Phase 1.7: Performance, SEO, Security & QA
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

console.log('\n--- Verifying Phase 1.7: Performance, SEO, Security & QA ---');

// 1. Favicon and Static Assets
const faviconPath = path.join(rootDir, 'favicon.svg');
if (fs.existsSync(faviconPath)) {
  const svg = fs.readFileSync(faviconPath, 'utf8');
  if (svg.includes('<svg') && svg.includes('#0A192F') && svg.includes('#047857') && svg.includes('M')) {
    pass('favicon.svg exists with brand navy background and emerald monogram');
  } else {
    fail('favicon.svg does not match required brand SVG specifications');
  }
} else {
  fail('favicon.svg missing at project root');
}

// 2. Robots.txt and Sitemap.xml
const robotsPath = path.join(rootDir, 'robots.txt');
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  if (
    robots.includes('User-agent: *') &&
    robots.includes('Allow: /') &&
    robots.includes('Disallow: /dashboard') &&
    robots.includes('Disallow: /new-project') &&
    robots.includes('Sitemap:')
  ) {
    pass('robots.txt exists with proper crawler directives (allows /, disallows /dashboard & /new-project)');
  } else {
    fail('robots.txt missing required crawler allow/disallow directives');
  }
} else {
  fail('robots.txt missing at project root');
}

const sitemapPath = path.join(rootDir, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  if (
    sitemap.includes('<urlset') &&
    sitemap.includes('<loc>https://academic-portfolio-alpha-eosin.vercel.app/</loc>') &&
    !sitemap.includes('/dashboard') &&
    !sitemap.includes('/new-project') &&
    !sitemap.includes('/login') &&
    !sitemap.includes('/register')
  ) {
    pass('sitemap.xml contains only canonical homepage and excludes private pages');
  } else {
    fail('sitemap.xml is missing canonical URL or improperly includes private pages');
  }
} else {
  fail('sitemap.xml missing at project root');
}

// 3. Responsive WebP Images
const requiredImages = [
  'img/case-a-before-800.webp',
  'img/case-a-before-1200.webp',
  'img/case-a-after-800.webp',
  'img/case-a-after-1200.webp',
  'img/og-card.png'
];

for (const imgRel of requiredImages) {
  const p = path.join(rootDir, imgRel);
  if (fs.existsSync(p) && fs.statSync(p).size > 0) {
    pass(`Required responsive image asset exists: ${imgRel}`);
  } else {
    fail(`Missing or empty image asset: ${imgRel}`);
  }
}

// 4. Definitive Head Tags and Metadata in index.html
const indexPath = path.join(rootDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  // Title & Description
  if (indexHtml.includes('<title>APA 7 Formatting &amp; Academic Editing — ManuscriptReady</title>')) {
    pass('index.html contains exact Phase 7 title tag');
  } else {
    fail('index.html title tag does not match specification');
  }

  if (indexHtml.includes('name="description"') && indexHtml.includes('APA 7th manuscript formatting, comprehensive academic editing')) {
    pass('index.html contains comprehensive meta description');
  } else {
    fail('index.html meta description does not match specification');
  }

  // Canonical & Open Graph
  if (indexHtml.includes('<link rel="canonical" href="https://academic-portfolio-alpha-eosin.vercel.app/">')) {
    pass('index.html sets canonical URL to production deployment domain');
  } else {
    fail('index.html canonical URL is missing or incorrect');
  }

  const ogTags = [
    'property="og:type" content="website"',
    'property="og:url" content="https://academic-portfolio-alpha-eosin.vercel.app/"',
    'property="og:site_name" content="ManuscriptReady"',
    'property="og:title" content="ManuscriptReady — Your manuscript, journal-submission ready"',
    'property="og:description"',
    'property="og:image" content="https://academic-portfolio-alpha-eosin.vercel.app/img/og-card.png"',
    'property="og:image:width" content="1200"',
    'property="og:image:height" content="630"',
    'property="og:image:alt"',
    'property="og:locale" content="en_US"'
  ];

  let ogPassed = true;
  for (const tag of ogTags) {
    if (!indexHtml.includes(tag)) {
      ogPassed = false;
      fail(`index.html missing Open Graph tag: ${tag}`);
    }
  }
  if (ogPassed) {
    pass('index.html contains all 10 Open Graph metadata tags (including 1200x630 dimensions)');
  }

  // Twitter Cards
  const twitterTags = [
    'name="twitter:card" content="summary_large_image"',
    'name="twitter:title"',
    'name="twitter:description"',
    'name="twitter:image" content="https://academic-portfolio-alpha-eosin.vercel.app/img/og-card.png"'
  ];
  let twitterPassed = true;
  for (const tag of twitterTags) {
    if (!indexHtml.includes(tag)) {
      twitterPassed = false;
      fail(`index.html missing Twitter tag: ${tag}`);
    }
  }
  if (twitterPassed) {
    pass('index.html contains summary_large_image Twitter card tags');
  }

  // Identity: Favicon & Theme Color
  if (indexHtml.includes('<link rel="icon" href="/favicon.svg" type="image/svg+xml">') &&
      indexHtml.includes('<meta name="theme-color" content="#0A192F">')) {
    pass('index.html links to /favicon.svg and sets theme-color to #0A192F');
  } else {
    fail('index.html missing favicon or theme-color tags');
  }

  // Trimmed Fonts (Catch #3)
  if (
    indexHtml.includes('family=Inter:wght@400;600;700&family=Merriweather:wght@700;900&display=swap') &&
    !indexHtml.includes('family=Inter:wght@400;500;600;700')
  ) {
    pass('index.html uses trimmed Google Fonts URL (Catch #3: 3 fewer downloads)');
  } else {
    fail('index.html font URL has not been trimmed to Inter 400,600,700 and Merriweather 700,900');
  }

  // JSON-LD Structured Data: ProfessionalService & FAQPage
  const jsonLdMatches = [...indexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (jsonLdMatches.length >= 2) {
    let hasProfService = false;
    let hasFAQ = false;

    for (const match of jsonLdMatches) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed['@type'] === 'ProfessionalService') {
          hasProfService = true;
          if (parsed.hasOfferCatalog && parsed.hasOfferCatalog.itemListElement?.length === 4) {
            pass('JSON-LD ProfessionalService schema valid with 4 core service offers');
          } else {
            fail('JSON-LD ProfessionalService missing 4 service catalog offers');
          }
        } else if (parsed['@type'] === 'FAQPage') {
          hasFAQ = true;
          if (parsed.mainEntity && parsed.mainEntity.length >= 5) {
            pass(`JSON-LD FAQPage schema valid with ${parsed.mainEntity.length} Q&A items`);
          } else {
            fail('JSON-LD FAQPage schema missing required Q&A items');
          }
        }
      } catch (err) {
        fail(`JSON-LD block failed JSON parsing: ${err.message}`);
      }
    }

    if (!hasProfService) fail('Missing JSON-LD ProfessionalService block');
    if (!hasFAQ) fail('Missing JSON-LD FAQPage block');
  } else {
    fail(`Expected at least 2 JSON-LD script blocks, found ${jsonLdMatches.length}`);
  }

  // Responsive slider image markup
  if (
    indexHtml.includes('src="/img/case-a-before-1200.webp"') &&
    indexHtml.includes('srcset="/img/case-a-before-800.webp 800w, /img/case-a-before-1200.webp 1200w"') &&
    indexHtml.includes('src="/img/case-a-after-1200.webp"') &&
    indexHtml.includes('srcset="/img/case-a-after-800.webp 800w, /img/case-a-after-1200.webp 1200w"') &&
    indexHtml.includes('loading="lazy"') &&
    indexHtml.includes('decoding="async"')
  ) {
    pass('Before/after slider uses responsive WebP images with srcset, sizes, and lazy loading');
  } else {
    fail('Before/after slider missing responsive WebP srcset or lazy loading attributes');
  }
} else {
  fail('index.html missing');
}

// 5. Private Pages Noindex and Favicon Directives (Catch #1)
const privatePages = ['login.html', 'register.html', 'dashboard.html', 'new-project.html'];
for (const pageName of privatePages) {
  const pagePath = path.join(rootDir, pageName);
  if (fs.existsSync(pagePath)) {
    const html = fs.readFileSync(pagePath, 'utf8');
    if (html.includes('<meta name="robots" content="noindex, nofollow">')) {
      pass(`${pageName} contains <meta name="robots" content="noindex, nofollow"> (Catch #1)`);
    } else {
      fail(`${pageName} missing <meta name="robots" content="noindex, nofollow">`);
    }

    if (html.includes('<link rel="icon" href="/favicon.svg" type="image/svg+xml">') &&
        html.includes('<meta name="theme-color" content="#0A192F">')) {
      pass(`${pageName} has favicon link and theme-color meta tag`);
    } else {
      fail(`${pageName} missing favicon or theme-color tags`);
    }

    if (html.includes('family=Inter:wght@400;600;700&family=Merriweather:wght@700;900&display=swap')) {
      pass(`${pageName} uses trimmed Google Fonts stack`);
    } else {
      fail(`${pageName} has untrimmed Google Fonts stack`);
    }
  } else {
    fail(`${pageName} missing`);
  }
}

// 6. CSS & Accessibility Spec
const styleCssPath = path.join(rootDir, 'css/style.css');
if (fs.existsSync(styleCssPath)) {
  const styleCss = fs.readFileSync(styleCssPath, 'utf8');

  if (styleCss.includes('.skip-link') && styleCss.includes('left: -9999px') && styleCss.includes('.skip-link:focus')) {
    pass('css/style.css implements accessible offscreen-to-focus .skip-link (Objective 7.3)');
  } else {
    fail('css/style.css missing .skip-link spec');
  }

  if (styleCss.includes('.sr-only') && styleCss.includes('clip: rect(0, 0, 0, 0)')) {
    pass('css/style.css implements standard .sr-only screen reader utility');
  } else {
    fail('css/style.css missing .sr-only utility');
  }

  if (styleCss.includes('@media (prefers-reduced-motion: reduce)') && styleCss.includes('animation-duration: 0.01ms !important')) {
    pass('css/style.css implements global prefers-reduced-motion guard');
  } else {
    fail('css/style.css missing global prefers-reduced-motion guard');
  }
} else {
  fail('css/style.css missing');
}

// Check for stray font-weight: 500 across CSS
const cssDir = path.join(rootDir, 'css');
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
let strayWeightFound = false;
for (const cssFile of cssFiles) {
  const content = fs.readFileSync(path.join(cssDir, cssFile), 'utf8');
  if (/font-weight:\s*500\b/.test(content)) {
    strayWeightFound = true;
    fail(`Stray font-weight: 500 detected in css/${cssFile} (should be 600 per Catch #3)`);
  }
}
if (!strayWeightFound) {
  pass('Zero stray font-weight: 500 declarations across all CSS files (Catch #3)');
}

// 7. Secret Audit (Layers 1 & 3)
const clientFiles = [
  'index.html', 'login.html', 'register.html', 'dashboard.html', 'new-project.html',
  'js/main.js', 'js/auth.js', 'js/dashboard.js', 'js/supabase-client.js',
  'css/style.css', 'css/landing.css', 'css/dashboard.css'
];

const secretRegexes = [
  /sk_live_[0-9a-zA-Z]+/gi,
  /sk_test_[0-9a-zA-Z]+/gi,
  /whsec_[0-9a-zA-Z]+/gi,
  /service_role/gi
];

let leakFound = false;
for (const rel of clientFiles) {
  const p = path.join(rootDir, rel);
  if (fs.existsSync(p)) {
    const text = fs.readFileSync(p, 'utf8');
    for (const rx of secretRegexes) {
      if (rx.test(text)) {
        leakFound = true;
        fail(`Secret or privileged token pattern detected in client file ${rel}`);
      }
    }
  }
}
if (!leakFound) {
  pass('Secret Audit Layer 1: Client files clean of secret keys and service-role references');
}

// Check Catch #2: js/main.js has zero Supabase references
const mainJs = fs.readFileSync(path.join(rootDir, 'js/main.js'), 'utf8');
if (/supabase/i.test(mainJs)) {
  fail('js/main.js references Supabase (violates Catch #2)');
} else {
  pass('Catch #2: js/main.js contains zero Supabase imports or references');
}

// 8. Server Security Guardrails
const checkoutFile = path.join(rootDir, 'api/create-checkout.js');
if (fs.existsSync(checkoutFile)) {
  const code = fs.readFileSync(checkoutFile, 'utf8');
  if (code.includes("req.method !== 'POST'") && code.includes('verifyUser') && code.includes('amount_due')) {
    pass('api/create-checkout.js enforces POST method, JWT auth, and database-derived amount_due');
  } else {
    fail('api/create-checkout.js missing key security guardrails');
  }
}

const webhookFile = path.join(rootDir, 'api/stripe-webhook.js');
if (fs.existsSync(webhookFile)) {
  const code = fs.readFileSync(webhookFile, 'utf8');
  if (code.includes('constructEvent') && code.includes('stripe-signature') && code.includes("status: 'editing'")) {
    pass('api/stripe-webhook.js verifies Stripe cryptographic signature and updates valid status machine');
  } else {
    fail('api/stripe-webhook.js missing signature verification or valid status transition');
  }
}

console.log(`\nPhase 1.7 Verification Result: ${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECKS FAILED'}`);

if (failures > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
