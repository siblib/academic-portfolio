import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imgDir = path.join(__dirname, '..', 'img');

if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// 1. Case A: Before Image (1200x800) - Muted background, red flags, mangled citations
const beforeSvg = `
<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" style="background:#F1F5F9; font-family:'Inter', -apple-system, sans-serif;">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0A192F" flood-opacity="0.1"/>
    </filter>
  </defs>

  <!-- Sheet Container -->
  <rect x="80" y="40" width="1040" height="720" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2" filter="url(#shadow)"/>

  <!-- Top Header bar on sheet -->
  <rect x="80" y="40" width="1040" height="54" rx="8" fill="#FEE2E2" stroke="#FCA5A5" stroke-width="1"/>
  <text x="110" y="74" fill="#991B1B" font-size="16" font-weight="700" letter-spacing="1">DEMONSTRATION SAMPLE · BEFORE APA 7 REVISION</text>
  <rect x="940" y="52" width="150" height="30" rx="15" fill="#DC2626"/>
  <text x="1015" y="72" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle">5 ISSUES FLAGGED</text>

  <!-- Content text lines -->
  <text x="120" y="130" font-family="'Merriweather', Georgia, serif" font-size="19" font-weight="700" fill="#1E293B">References &amp; Excerpt (Draft v2)</text>

  <!-- Red Flag Annotation 1 -->
  <rect x="120" y="150" width="960" height="74" rx="6" fill="#FFF5F5" stroke="#F87171" stroke-width="1.5"/>
  <text x="140" y="178" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#DC2626">🚩 ERROR: Non-Standard Heading &amp; Running Head in Student Paper</text>
  <text x="140" y="204" font-family="'Merriweather', Georgia, serif" font-size="15" fill="#475569">RUNNING HEAD: INFLUENCE OF COMMUNITY HEALTH ... (Running heads not required in student APA 7)</text>

  <!-- Red Flag Annotation 2 -->
  <rect x="120" y="240" width="960" height="96" rx="6" fill="#FFF5F5" stroke="#F87171" stroke-width="1.5"/>
  <text x="140" y="268" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#DC2626">🚩 ERROR: Missing 0.5-in Hanging Indent · Unreconciled In-Text Citation</text>
  <text x="140" y="294" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#334155">Williams, B. J., Davis, K. L., &amp; Miller, R. T. (2018). Interventions in Community Health.</text>
  <text x="140" y="318" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#64748B">Journal of Clinical Nursing, 42(3), pp. 115-128. [In-text citation was (Williams et al., 2017) — date conflict]</text>

  <!-- Red Flag Annotation 3 -->
  <rect x="120" y="352" width="960" height="96" rx="6" fill="#FFF5F5" stroke="#F87171" stroke-width="1.5"/>
  <text x="140" y="380" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#DC2626">🚩 ERROR: Outdated APA 6 "Retrieved from http://dx.doi.org" · Redundant City/State</text>
  <text x="140" y="406" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#334155">Adams, H. E. (2016). Clinical Leadership in Primary Care. New York, NY: Academic Press.</text>
  <text x="140" y="430" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#64748B">Retrieved from http://dx.doi.org/10.1016/j.clin.2016.02.001</text>

  <!-- Red Flag Annotation 4 -->
  <rect x="120" y="464" width="960" height="96" rx="6" fill="#FFF5F5" stroke="#F87171" stroke-width="1.5"/>
  <text x="140" y="492" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#DC2626">🚩 ERROR: Incorrect Author Truncation (Used "et al." after 6 authors instead of APA 7 rule)</text>
  <text x="140" y="518" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#334155">Chen, Y., Zhang, Q., Liu, S., Patel, N., Gupta, V., Rodriguez, M., et al. (2020).</text>
  <text x="140" y="542" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#64748B">Global Epidemiological Surveillance. Lancet Infectious Diseases, 20(8), 920-931.</text>

  <!-- Red Flag Annotation 5 -->
  <rect x="120" y="576" width="960" height="90" rx="6" fill="#FFF5F5" stroke="#F87171" stroke-width="1.5"/>
  <text x="140" y="604" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#DC2626">🚩 ERROR: Journal Title Missing Italics · Volume &amp; Issue Formatting Mismatched</text>
  <text x="140" y="630" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#334155">Rodriguez, M. A. Qualitative metrics in health equity research. BMC Public Health. Vol 19, issue 4.</text>
  <text x="140" y="652" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#64748B">https://bmcpublichealth.biomedcentral.com/articles/10.1186/s12889</text>

  <!-- Bottom summary strip -->
  <rect x="120" y="682" width="960" height="54" rx="6" fill="#FEE2E2"/>
  <text x="600" y="715" font-family="'Inter', sans-serif" font-size="14" font-weight="600" fill="#991B1B" text-anchor="middle">❌ Desk-Rejection Risk: 186 citation mismatches, non-standard DOIs, heading hierarchy errors</text>
</svg>
`;

// 2. Case A: After Image (1200x800) - Crisp white background, green checkmarks, perfect APA 7
const afterSvg = `
<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" style="background:#0A192F; font-family:'Inter', -apple-system, sans-serif;">
  <defs>
    <filter id="shadow-after" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Sheet Container -->
  <rect x="80" y="40" width="1040" height="720" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#shadow-after)"/>

  <!-- Top Header bar on sheet -->
  <rect x="80" y="40" width="1040" height="54" rx="8" fill="#D1FAE5" stroke="#A7F3D0" stroke-width="1"/>
  <text x="110" y="74" fill="#065F46" font-size="16" font-weight="700" letter-spacing="1">DEMONSTRATION SAMPLE · COMPLIANT APA 7TH EDITION</text>
  <rect x="910" y="52" width="180" height="30" rx="15" fill="#047857"/>
  <text x="1000" y="72" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle">100% SUBMISSION READY</text>

  <!-- Section Heading -->
  <text x="600" y="130" font-family="'Merriweather', Georgia, serif" font-size="20" font-weight="700" fill="#0A192F" text-anchor="middle">References</text>

  <!-- Green Check 1 -->
  <rect x="120" y="150" width="960" height="74" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5"/>
  <text x="140" y="178" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#047857">✓ Level 1 Centered Bold Heading · Running Head Removed for Student Paper</text>
  <text x="140" y="204" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#334155">Page number "38" aligned flush-right. Header hierarchy verified to APA 7.0 standards.</text>

  <!-- Green Check 2 -->
  <rect x="120" y="240" width="960" height="96" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5"/>
  <text x="140" y="268" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#047857">✓ 0.5-in Hanging Indent · In-Text Citation Reconciled</text>
  <text x="140" y="294" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#0F172A">Adams, H. E. (2016). <tspan font-style="italic">Clinical leadership in primary care</tspan>. Academic Press. https://doi.org/10.1016/j.clin.2016.02.001</text>
  <text x="140" y="318" font-family="'Inter', sans-serif" font-size="13" fill="#059669">Publisher location omitted · DOI formatted as live https://doi.org URL without "Retrieved from"</text>

  <!-- Green Check 3 -->
  <rect x="120" y="352" width="960" height="96" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5"/>
  <text x="140" y="380" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#047857">✓ APA 7 Author Rule: Up to 20 authors listed before ellipsis</text>
  <text x="140" y="406" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#0F172A">Chen, Y., Zhang, Q., Liu, S., Patel, N., Gupta, V., Rodriguez, M., … Vance, L. K. (2020).</text>
  <text x="140" y="430" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#0F172A"><tspan dx="36">Global epidemiological surveillance. <tspan font-style="italic">The Lancet Infectious Diseases</tspan>, <tspan font-style="italic">20</tspan>(8), 920–931. https://doi.org/10.1016/S1473</tspan></text>

  <!-- Green Check 4 -->
  <rect x="120" y="464" width="960" height="96" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5"/>
  <text x="140" y="492" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#047857">✓ Title Case Journal Italicized · Issue Number in Parentheses Not Italicized</text>
  <text x="140" y="518" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#0F172A">Rodriguez, M. A. (2019). Qualitative metrics in health equity research. <tspan font-style="italic">BMC Public Health</tspan>, <tspan font-style="italic">19</tspan>(4), Article 512.</text>
  <text x="140" y="542" font-family="'Inter', sans-serif" font-size="13" fill="#059669"><tspan dx="36">https://doi.org/10.1186/s12889-019-6842-1</tspan></text>

  <!-- Green Check 5 -->
  <rect x="120" y="576" width="960" height="90" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5"/>
  <text x="140" y="604" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#047857">✓ Verified In-Text Citation Correspondence</text>
  <text x="140" y="630" font-family="'Merriweather', Georgia, serif" font-size="14" fill="#0F172A">Williams, B. J., Davis, K. L., &amp; Miller, R. T. (2018). Interventions in community health. <tspan font-style="italic">Journal of Clinical Nursing</tspan>, <tspan font-style="italic">42</tspan>(3), 115–128.</text>
  <text x="140" y="652" font-family="'Inter', sans-serif" font-size="13" fill="#059669"><tspan dx="36">Date corrected from 2017 to 2018; in-text citation updated to (Williams et al., 2018).</tspan></text>

  <!-- Bottom summary strip -->
  <rect x="120" y="682" width="960" height="54" rx="6" fill="#D1FAE5"/>
  <text x="600" y="715" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#065F46" text-anchor="middle">✓ Journal Submission Approved: 186/186 references verified, 0 formatting revisions requested</text>
</svg>
`;

// 3. OG Card Image (1200x630)
const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" style="background:#0A192F; font-family:'Inter', -apple-system, sans-serif;">
  <rect x="40" y="40" width="1120" height="550" rx="16" fill="#16283F" stroke="#1E293B" stroke-width="2"/>
  
  <text x="100" y="140" fill="#059669" font-size="16" font-weight="700" letter-spacing="3">ACADEMIC EDITING · APA 7TH SPECIALIST</text>
  <text x="100" y="220" font-family="'Merriweather', Georgia, serif" font-size="46" font-weight="900" fill="#FFFFFF">ManuscriptReady</text>
  <text x="100" y="280" font-family="'Merriweather', Georgia, serif" font-size="28" font-weight="700" fill="#E2E8F0">Your manuscript, journal-submission ready.</text>
  
  <text x="100" y="350" font-size="18" fill="#94A3B8">
    APA 7th manuscript formatting, comprehensive academic editing, and literature review structuring.
  </text>
  <text x="100" y="380" font-size="18" fill="#94A3B8">
    48-hour express turnaround · 14-day revision guarantee · 100% confidential.
  </text>

  <!-- Metrics row -->
  <line x1="100" y1="430" x2="1100" y2="430" stroke="#334155" stroke-width="1"/>
  
  <text x="100" y="480" font-family="'Merriweather', serif" font-size="32" font-weight="900" fill="#059669">100+</text>
  <text x="100" y="510" font-size="14" fill="#CBD5E1">Manuscripts Formatted</text>

  <text x="360" y="480" font-family="'Merriweather', serif" font-size="32" font-weight="900" fill="#059669">48 hr</text>
  <text x="360" y="510" font-size="14" fill="#CBD5E1">Express Turnaround</text>

  <text x="620" y="480" font-family="'Merriweather', serif" font-size="32" font-weight="900" fill="#059669">14 days</text>
  <text x="620" y="510" font-size="14" fill="#CBD5E1">Revision Window</text>

  <text x="880" y="480" font-family="'Merriweather', serif" font-size="32" font-weight="900" fill="#059669">100%</text>
  <text x="880" y="510" font-size="14" fill="#CBD5E1">Strictly Confidential</text>
</svg>
`;

async function buildImages() {
  console.log('Generating images in', imgDir);

  // Write SVGs
  fs.writeFileSync(path.join(imgDir, 'case-a-before.svg'), beforeSvg);
  fs.writeFileSync(path.join(imgDir, 'case-a-after.svg'), afterSvg);
  fs.writeFileSync(path.join(imgDir, 'og-card.svg'), ogSvg);

  // Generate WebP & PNG via sharp
  await sharp(Buffer.from(beforeSvg))
    .webp({ quality: 90 })
    .toFile(path.join(imgDir, 'case-a-before.webp'));
  console.log('✓ Created case-a-before.webp (1200x800)');

  await sharp(Buffer.from(afterSvg))
    .webp({ quality: 90 })
    .toFile(path.join(imgDir, 'case-a-after.webp'));
  console.log('✓ Created case-a-after.webp (1200x800)');

  await sharp(Buffer.from(ogSvg))
    .png({ quality: 90 })
    .toFile(path.join(imgDir, 'og-card.png'));
  console.log('✓ Created og-card.png (1200x630)');

  console.log('All visual assets successfully generated.');
}

buildImages().catch(err => {
  console.error(err);
  process.exit(1);
});
