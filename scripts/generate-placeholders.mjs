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

// Helper to render SVG to WebP and PNG using Sharp
async function renderAsset(svgString, baseName, width, height) {
  const svgBuffer = Buffer.from(svgString);
  const pngPath = path.join(imgDir, `${baseName}.png`);
  const webpPath = path.join(imgDir, `${baseName}.webp`);

  await sharp(svgBuffer)
    .resize(width, height)
    .png({ quality: 90 })
    .toFile(pngPath);

  await sharp(svgBuffer)
    .resize(width, height)
    .webp({ quality: 85 })
    .toFile(webpPath);

  console.log(`✓ Rendered: ${baseName}.webp and ${baseName}.png (${width}x${height})`);
}

// 1. Figure 4.4: Horizontal Bar Chart Placeholder (1600x900)
const fig44Svg = `
<svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:'Inter', -apple-system, sans-serif;">
  <rect width="1600" height="900" fill="#FFFFFF"/>
  <rect x="60" y="40" width="1480" height="820" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Document Header / Title -->
  <text x="100" y="110" font-family="'Merriweather', Georgia, serif" font-size="28" font-weight="700" fill="#0A192F">Figure 4.4</text>
  <text x="100" y="150" font-family="'Merriweather', Georgia, serif" font-size="22" font-style="italic" fill="#334155">Perceived Affordability of the SHA Contribution by Income Level</text>
  <text x="100" y="185" font-size="15" fill="#64748B">APA 7th Edition · Standardized Horizontal Bar Distribution (n = 412, Anonymized)</text>

  <!-- Horizontal Axis Lines -->
  <line x1="380" y1="240" x2="1420" y2="240" stroke="#E2E8F0" stroke-width="1"/>
  <line x1="380" y1="360" x2="1420" y2="360" stroke="#E2E8F0" stroke-width="1"/>
  <line x1="380" y1="480" x2="1420" y2="480" stroke="#E2E8F0" stroke-width="1"/>
  <line x1="380" y1="600" x2="1420" y2="600" stroke="#E2E8F0" stroke-width="1"/>
  <line x1="380" y1="720" x2="1420" y2="720" stroke="#94A3B8" stroke-width="2"/>

  <!-- Y-Axis Labels -->
  <text x="350" y="305" font-size="18" font-weight="600" fill="#1E293B" text-anchor="end">Quartile 1 (Lowest)</text>
  <text x="350" y="425" font-size="18" font-weight="600" fill="#1E293B" text-anchor="end">Quartile 2 (Low-Mid)</text>
  <text x="350" y="545" font-size="18" font-weight="600" fill="#1E293B" text-anchor="end">Quartile 3 (Mid-High)</text>
  <text x="350" y="665" font-size="18" font-weight="600" fill="#1E293B" text-anchor="end">Quartile 4 (Highest)</text>

  <!-- Bars for Quartile 1 -->
  <rect x="380" y="270" width="760" height="50" rx="4" fill="#047857"/>
  <text x="1160" y="303" font-size="17" font-weight="700" fill="#047857">73.4% Unaffordable</text>

  <!-- Bars for Quartile 2 -->
  <rect x="380" y="390" width="610" height="50" rx="4" fill="#059669"/>
  <text x="1010" y="423" font-size="17" font-weight="700" fill="#059669">58.8% Unaffordable</text>

  <!-- Bars for Quartile 3 -->
  <rect x="380" y="510" width="410" height="50" rx="4" fill="#10B981"/>
  <text x="810" y="543" font-size="17" font-weight="700" fill="#047857">39.2% Unaffordable</text>

  <!-- Bars for Quartile 4 -->
  <rect x="380" y="630" width="220" height="50" rx="4" fill="#34D399"/>
  <text x="620" y="663" font-size="17" font-weight="700" fill="#047857">21.5% Unaffordable</text>

  <!-- Grid percentage markers -->
  <text x="380" y="750" font-size="15" fill="#64748B" text-anchor="middle">0%</text>
  <text x="640" y="750" font-size="15" fill="#64748B" text-anchor="middle">25%</text>
  <text x="900" y="750" font-size="15" fill="#64748B" text-anchor="middle">50%</text>
  <text x="1160" y="750" font-size="15" fill="#64748B" text-anchor="middle">75%</text>
  <text x="1420" y="750" font-size="15" fill="#64748B" text-anchor="middle">100%</text>

  <!-- Provenance Note -->
  <text x="100" y="820" font-family="'Merriweather', Georgia, serif" font-size="15" fill="#475569">Note. Direct document capture from client study; identifying metadata redacted. Cross-tabulation p &lt; .001.</text>
</svg>
`;

// 2. Figure 4.3: Awareness vs. Functional Knowledge Comparison (1600x900)
const fig43Svg = `
<svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:'Inter', -apple-system, sans-serif;">
  <rect width="1600" height="900" fill="#FFFFFF"/>
  <rect x="60" y="40" width="1480" height="820" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Document Header / Title -->
  <text x="100" y="110" font-family="'Merriweather', Georgia, serif" font-size="28" font-weight="700" fill="#0A192F">Figure 4.3</text>
  <text x="100" y="150" font-family="'Merriweather', Georgia, serif" font-size="22" font-style="italic" fill="#334155">The Gap Between Awareness and Functional Knowledge of the SHA</text>
  <text x="100" y="185" font-size="15" fill="#64748B">APA 7th Edition · Paired Comparison Measures across Health Authority Pillars</text>

  <!-- Legend -->
  <rect x="1050" y="100" width="24" height="24" rx="4" fill="#1E293B"/>
  <text x="1085" y="118" font-size="16" font-weight="600" fill="#1E293B">General Awareness</text>
  <rect x="1300" y="100" width="24" height="24" rx="4" fill="#047857"/>
  <text x="1335" y="118" font-size="16" font-weight="600" fill="#047857">Functional Knowledge</text>

  <!-- Pillars Comparison -->
  <!-- Pillar 1 -->
  <rect x="220" y="270" width="140" height="430" rx="4" fill="#1E293B"/>
  <text x="290" y="255" font-size="16" font-weight="700" fill="#1E293B" text-anchor="middle">88.4%</text>
  <rect x="380" y="520" width="140" height="180" rx="4" fill="#047857"/>
  <text x="450" y="505" font-size="16" font-weight="700" fill="#047857" text-anchor="middle">34.2%</text>
  <text x="370" y="740" font-size="17" font-weight="600" fill="#1E293B" text-anchor="middle">Benefit Package</text>

  <!-- Pillar 2 -->
  <rect x="620" y="290" width="140" height="410" rx="4" fill="#1E293B"/>
  <text x="690" y="275" font-size="16" font-weight="700" fill="#1E293B" text-anchor="middle">82.1%</text>
  <rect x="780" y="580" width="140" height="120" rx="4" fill="#047857"/>
  <text x="850" y="565" font-size="16" font-weight="700" fill="#047857" text-anchor="middle">24.5%</text>
  <text x="770" y="740" font-size="17" font-weight="600" fill="#1E293B" text-anchor="middle">Contribution Rate</text>

  <!-- Pillar 3 -->
  <rect x="1020" y="320" width="140" height="380" rx="4" fill="#1E293B"/>
  <text x="1090" y="305" font-size="16" font-weight="700" fill="#1E293B" text-anchor="middle">76.5%</text>
  <rect x="1180" y="610" width="140" height="90" rx="4" fill="#047857"/>
  <text x="1250" y="595" font-size="16" font-weight="700" fill="#047857" text-anchor="middle">18.2%</text>
  <text x="1170" y="740" font-size="17" font-weight="600" fill="#1E293B" text-anchor="middle">Empanelment Rules</text>

  <!-- Baseline line -->
  <line x1="160" y1="700" x2="1440" y2="700" stroke="#94A3B8" stroke-width="2"/>

  <!-- Provenance Note -->
  <text x="100" y="820" font-family="'Merriweather', Georgia, serif" font-size="15" fill="#475569">Note. Direct document capture from client study; identifying metadata redacted (n = 412). Chi-square gap p &lt; .001.</text>
</svg>
`;

// 3. Table 4.9: APA 7 Craft at Scale (1600x1000)
const table49Svg = `
<svg width="1600" height="1000" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:'Inter', -apple-system, sans-serif;">
  <rect width="1600" height="1000" fill="#FFFFFF"/>
  <rect x="60" y="40" width="1480" height="920" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Document Header / Title -->
  <text x="100" y="110" font-family="'Merriweather', Georgia, serif" font-size="28" font-weight="700" fill="#0A192F">Table 4.9</text>
  <text x="100" y="150" font-family="'Merriweather', Georgia, serif" font-size="22" font-style="italic" fill="#334155">Health Financing and Enrollment Status Across Income Quartiles</text>

  <!-- Table Top Border (APA 7 Rule: Thick 2px rule, no vertical borders) -->
  <line x1="100" y1="190" x2="1500" y2="190" stroke="#0F172A" stroke-width="2.5"/>

  <!-- Table Header Row -->
  <text x="120" y="225" font-size="17" font-weight="700" fill="#0F172A">Household Income Quartile</text>
  <text x="560" y="225" font-size="17" font-weight="700" fill="#0F172A" text-anchor="middle">Enrolled n (%)</text>
  <text x="820" y="225" font-size="17" font-weight="700" fill="#0F172A" text-anchor="middle">Mean Monthly Contrib. (KES)</text>
  <text x="1140" y="225" font-size="17" font-weight="700" fill="#0F172A" text-anchor="middle">Catastrophic Spend Risk (%)</text>
  <text x="1410" y="225" font-size="17" font-weight="700" fill="#0F172A" text-anchor="middle">p-value</text>

  <!-- Table Subhead Rule (APA 7 Rule: 1px) -->
  <line x1="100" y1="250" x2="1500" y2="250" stroke="#0F172A" stroke-width="1.5"/>

  <!-- Row 1 -->
  <text x="120" y="310" font-size="16" fill="#1E293B">Quartile 1 (&lt; KES 15,000)</text>
  <text x="560" y="310" font-size="16" fill="#1E293B" text-anchor="middle">38 (36.9%)</text>
  <text x="820" y="310" font-size="16" fill="#1E293B" text-anchor="middle">500.00 ± 0.00</text>
  <text x="1140" y="310" font-size="16" fill="#1E293B" text-anchor="middle">64.1%</text>
  <text x="1410" y="310" font-size="16" fill="#1E293B" text-anchor="middle">&lt; .001***</text>

  <!-- Row 2 -->
  <text x="120" y="380" font-size="16" fill="#1E293B">Quartile 2 (KES 15,000 – 35,000)</text>
  <text x="560" y="380" font-size="16" fill="#1E293B" text-anchor="middle">57 (55.3%)</text>
  <text x="820" y="380" font-size="16" fill="#1E293B" text-anchor="middle">680.50 ± 124.20</text>
  <text x="1140" y="380" font-size="16" fill="#1E293B" text-anchor="middle">42.7%</text>
  <text x="1410" y="380" font-size="16" fill="#1E293B" text-anchor="middle">&lt; .001***</text>

  <!-- Row 3 -->
  <text x="120" y="450" font-size="16" fill="#1E293B">Quartile 3 (KES 35,001 – 70,000)</text>
  <text x="560" y="450" font-size="16" fill="#1E293B" text-anchor="middle">74 (71.8%)</text>
  <text x="820" y="450" font-size="16" fill="#1E293B" text-anchor="middle">1,420.00 ± 315.80</text>
  <text x="1140" y="450" font-size="16" fill="#1E293B" text-anchor="middle">19.4%</text>
  <text x="1410" y="450" font-size="16" fill="#1E293B" text-anchor="middle">.004**</text>

  <!-- Row 4 -->
  <text x="120" y="520" font-size="16" fill="#1E293B">Quartile 4 (&gt; KES 70,000)</text>
  <text x="560" y="520" font-size="16" fill="#1E293B" text-anchor="middle">89 (86.4%)</text>
  <text x="820" y="520" font-size="16" fill="#1E293B" text-anchor="middle">3,850.20 ± 840.10</text>
  <text x="1140" y="520" font-size="16" fill="#1E293B" text-anchor="middle">4.9%</text>
  <text x="1410" y="520" font-size="16" fill="#1E293B" text-anchor="middle">.012*</text>

  <!-- Row 5: Total/Summary (APA 7 Rule: 1px divider before total row) -->
  <line x1="100" y1="560" x2="1500" y2="560" stroke="#CBD5E1" stroke-width="1"/>
  <text x="120" y="605" font-size="16" font-weight="700" fill="#0F172A">Total Sample (N = 412)</text>
  <text x="560" y="605" font-size="16" font-weight="700" fill="#0F172A" text-anchor="middle">258 (62.6%)</text>
  <text x="820" y="605" font-size="16" font-weight="700" fill="#0F172A" text-anchor="middle">1,612.68 ± 628.40</text>
  <text x="1140" y="605" font-size="16" font-weight="700" fill="#0F172A" text-anchor="middle">32.8%</text>
  <text x="1410" y="605" font-size="16" font-weight="700" fill="#0F172A" text-anchor="middle">—</text>

  <!-- Table Bottom Rule (APA 7 Rule: Thick 2px rule) -->
  <line x1="100" y1="640" x2="1500" y2="640" stroke="#0F172A" stroke-width="2.5"/>

  <!-- Table Notes Section -->
  <text x="100" y="700" font-family="'Merriweather', Georgia, serif" font-size="15" fill="#334155">Note. Direct document capture from client study; identifying institutional metadata redacted.</text>
  <text x="100" y="730" font-family="'Merriweather', Georgia, serif" font-size="15" fill="#334155">Values expressed as frequency (percentage) or mean ± standard deviation. Catastrophic health expenditure threshold defined at &gt; 10% total household expenditure.</text>
  <text x="100" y="760" font-family="'Merriweather', Georgia, serif" font-size="15" fill="#334155">*p &lt; .05. **p &lt; .01. ***p &lt; .001.</text>
</svg>
`;

// 4. Figure 3.1: Methodology Workflow Diagram (1600x900)
const fig31Svg = `
<svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:'Inter', -apple-system, sans-serif;">
  <rect width="1600" height="900" fill="#FFFFFF"/>
  <rect x="60" y="40" width="1480" height="820" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Document Header / Title -->
  <text x="100" y="110" font-family="'Merriweather', Georgia, serif" font-size="28" font-weight="700" fill="#0A192F">Figure 3.1</text>
  <text x="100" y="150" font-family="'Merriweather', Georgia, serif" font-size="22" font-style="italic" fill="#334155">Overview of the Research Process and Sampling Framework</text>
  <text x="100" y="185" font-size="15" fill="#64748B">APA 7th Edition · Conceptual Workflow and Multi-Stage Stratified Sampling Architecture</text>

  <!-- Process Step 1 -->
  <rect x="100" y="320" width="280" height="220" rx="8" fill="#FFFFFF" stroke="#047857" stroke-width="2"/>
  <rect x="100" y="320" width="280" height="46" rx="8" fill="#D1FAE5"/>
  <text x="240" y="350" font-size="16" font-weight="700" fill="#047857" text-anchor="middle">Stage 1: Formulation</text>
  <text x="120" y="400" font-size="14" fill="#334155">• Problem identification</text>
  <text x="120" y="430" font-size="14" fill="#334155">• Policy gap synthesis</text>
  <text x="120" y="460" font-size="14" fill="#334155">• Ethical clearance protocol</text>
  <text x="120" y="490" font-size="14" fill="#334155">• Study instrument pilot</text>

  <!-- Arrow 1 -->
  <line x1="400" y1="430" x2="470" y2="430" stroke="#047857" stroke-width="3"/>
  <polygon points="470,422 485,430 470,438" fill="#047857"/>

  <!-- Process Step 2 -->
  <rect x="500" y="320" width="280" height="220" rx="8" fill="#FFFFFF" stroke="#047857" stroke-width="2"/>
  <rect x="500" y="320" width="280" height="46" rx="8" fill="#D1FAE5"/>
  <text x="640" y="350" font-size="16" font-weight="700" fill="#047857" text-anchor="middle">Stage 2: Sampling</text>
  <text x="520" y="400" font-size="14" fill="#334155">• Target population (N=4,800)</text>
  <text x="520" y="430" font-size="14" fill="#334155">• Stratified random selection</text>
  <text x="520" y="460" font-size="14" fill="#334155">• 4 County clusters</text>
  <text x="520" y="490" font-size="14" fill="#334155">• Final sample (n=412)</text>

  <!-- Arrow 2 -->
  <line x1="800" y1="430" x2="870" y2="430" stroke="#047857" stroke-width="3"/>
  <polygon points="870,422 885,430 870,438" fill="#047857"/>

  <!-- Process Step 3 -->
  <rect x="900" y="320" width="280" height="220" rx="8" fill="#FFFFFF" stroke="#047857" stroke-width="2"/>
  <rect x="900" y="320" width="280" height="46" rx="8" fill="#D1FAE5"/>
  <text x="1040" y="350" font-size="16" font-weight="700" fill="#047857" text-anchor="middle">Stage 3: Data Collection</text>
  <text x="920" y="400" font-size="14" fill="#334155">• Digital household survey</text>
  <text x="920" y="430" font-size="14" fill="#334155">• Key informant interviews (18)</text>
  <text x="920" y="460" font-size="14" fill="#334155">• Daily QA audits</text>
  <text x="920" y="490" font-size="14" fill="#334155">• Response rate: 96.2%</text>

  <!-- Arrow 3 -->
  <line x1="1200" y1="430" x2="1270" y2="430" stroke="#047857" stroke-width="3"/>
  <polygon points="1270,422 1285,430 1270,438" fill="#047857"/>

  <!-- Process Step 4 -->
  <rect x="1300" y="320" width="220" height="220" rx="8" fill="#FFFFFF" stroke="#047857" stroke-width="2"/>
  <rect x="1300" y="320" width="220" height="46" rx="8" fill="#D1FAE5"/>
  <text x="1410" y="350" font-size="16" font-weight="700" fill="#047857" text-anchor="middle">Stage 4: Analysis</text>
  <text x="1320" y="400" font-size="14" fill="#334155">• Descriptive stats</text>
  <text x="1320" y="430" font-size="14" fill="#334155">• Chi-square tests</text>
  <text x="1320" y="460" font-size="14" fill="#334155">• Multivariable logit</text>
  <text x="1320" y="490" font-size="14" fill="#334155">• Thematic coding</text>

  <!-- Provenance Note -->
  <text x="100" y="820" font-family="'Merriweather', Georgia, serif" font-size="15" fill="#475569">Note. Direct document capture from client study; identifying institutional metadata redacted.</text>
</svg>
`;

// 5. Eliud Sibuor Bio Portrait Placeholder (640x640)
const eliudBioSvg = `
<svg width="640" height="640" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" style="background:#0A192F; font-family:'Inter', -apple-system, sans-serif;">
  <rect width="640" height="640" fill="#0A192F"/>
  <circle cx="320" cy="320" r="280" fill="#16283F" stroke="#047857" stroke-width="6"/>

  <!-- Monogram Initials -->
  <text x="320" y="360" font-family="'Merriweather', Georgia, serif" font-size="160" font-weight="900" fill="#059669" text-anchor="middle">ES</text>

  <rect x="120" y="470" width="400" height="44" rx="22" fill="#047857"/>
  <text x="320" y="498" font-size="18" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">ELIUD SIBUOR</text>

  <text x="320" y="550" font-size="14" fill="#94A3B8" text-anchor="middle">Research Paper Writing Specialist</text>
</svg>
`;

async function main() {
  console.log('--- Generating Phase 1.75 Placeholder Assets ---');
  await renderAsset(fig44Svg, 'figure-4-4', 1600, 900);
  await renderAsset(fig43Svg, 'figure-4-3', 1600, 900);
  await renderAsset(table49Svg, 'table-4-9', 1600, 1000);
  await renderAsset(fig31Svg, 'figure-3-1', 1600, 900);
  await renderAsset(eliudBioSvg, 'eliud-sibuor', 640, 640);
  console.log('--- All placeholder assets generated successfully! ---');
}

main().catch((err) => {
  console.error('Error generating placeholder assets:', err);
  process.exit(1);
});
