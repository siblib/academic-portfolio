// scripts/verify-setup.js
// Verification suite for Phase 3 (1.3: Project Structure & Setup)
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
let failures = 0;

function pass(msg) {
  console.log(`\x1b[32m✔ [PASS]\x1b[0m ${msg}`);
}

function fail(msg) {
  console.error(`\x1b[31m✖ [FAIL]\x1b[0m ${msg}`);
  failures++;
}

console.log('\n--- 1. Scaffolding Integrity Check ---');
const requiredFiles = [
  '.gitignore',
  'vercel.json',
  'css/style.css',
  'css/landing.css',
  'index.html',
  'login.html',
  'register.html',
  'dashboard.html',
  'new-project.html',
  'js/supabase-client.js',
  'js/main.js',
  'api/contact.js',
  'supabase/schema.sql'
];

for (const relPath of requiredFiles) {
  const fullPath = path.join(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    pass(`Found required file: ${relPath}`);
  } else {
    fail(`Missing required file: ${relPath}`);
  }
}

console.log('\n--- 2. Security & Secret Leak Audit ---');
// Rule: Service role key and Stripe secret key must NEVER appear in client files
const clientDirsAndFiles = ['js', 'css', 'index.html', 'login.html', 'register.html', 'dashboard.html', 'new-project.html'];
const forbiddenPatterns = [
  { name: 'Stripe Secret Key', regex: /sk_(test|live)_[0-9a-zA-Z]+/g },
  { name: 'Stripe Webhook Secret', regex: /whsec_[0-9a-zA-Z]+/g },
  { name: 'Supabase Service Role Key', regex: /service_role/gi }
];

function scanDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDir(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

let clientFiles = [];
for (const item of clientDirsAndFiles) {
  const p = path.join(rootDir, item);
  if (fs.existsSync(p)) {
    if (fs.statSync(p).isDirectory()) {
      clientFiles = clientFiles.concat(scanDir(p));
    } else {
      clientFiles.push(p);
    }
  }
}

for (const file of clientFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pat of forbiddenPatterns) {
    if (pat.regex.test(content)) {
      fail(`Forbidden secret pattern [${pat.name}] detected in ${path.relative(rootDir, file)}`);
    }
  }
}
pass('No secret keys found in client files (js/, css/, *.html)');

// Catch #2: Verify js/main.js never imports Supabase
const mainJsPath = path.join(rootDir, 'js/main.js');
if (fs.existsSync(mainJsPath)) {
  const mainContent = fs.readFileSync(mainJsPath, 'utf8');
  if (/supabase/i.test(mainContent)) {
    fail('js/main.js must not reference or import Supabase SDK (Catch #2)');
  } else {
    pass('js/main.js has zero Supabase references (Catch #2 preserved)');
  }
}

console.log('\n--- 3. Clean URL Compliance ---');
for (const file of clientFiles.filter(f => f.endsWith('.html'))) {
  const content = fs.readFileSync(file, 'utf8');
  const badLinkMatch = content.match(/href=["']\/(login|register|dashboard|new-project)\.html["']/i);
  if (badLinkMatch) {
    fail(`Clean URL violation in ${path.relative(rootDir, file)}: found ${badLinkMatch[0]}`);
  }
}
pass('All checked HTML files comply with Clean URLs (.html omitted from internal links)');

console.log('\n--- 4. API Contact Handler Verification ---');
try {
  const contactHandler = require(path.join(rootDir, 'api/contact.js'));
  let responseData = null;
  let responseStatus = null;
  const mockRes = {
    status: (s) => {
      responseStatus = s;
      return {
        json: (d) => { responseData = d; }
      };
    }
  };
  contactHandler({}, mockRes);
  if (responseStatus === 200 && responseData && responseData.ok === true) {
    pass('api/contact.js successfully returns { ok: true } with HTTP 200');
  } else {
    fail(`api/contact.js returned unexpected response: status ${responseStatus}, body: ${JSON.stringify(responseData)}`);
  }
} catch (err) {
  fail(`Failed to execute api/contact.js: ${err.message}`);
}

console.log('\n--- Verification Summary ---');
if (failures === 0) {
  console.log('\x1b[32mAll local checks PASSED!\x1b[0m\n');
  process.exit(0);
} else {
  console.error(`\x1b[31m${failures} checks FAILED!\x1b[0m\n`);
  process.exit(1);
}
