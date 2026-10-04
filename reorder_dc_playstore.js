const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// ─── TASK 1: Move Daily Challenge card to after KrishiGyan AI ─────────────────

// The full DC card block (with comment and trailing newlines)
const dcBlockStart = c.indexOf('<!-- Question of the Day Widget -->');
const dcBlockEnd = c.indexOf('</div>\r\n\r\n    \r\n\r\n    \r\n\r\n    \r\n\r\n    <!-- ENG: Daily Result Panel', dcBlockStart);

if(dcBlockStart === -1) {
  console.log('ERROR: Could not find DC card start marker');
  process.exit(1);
}

// The DC card ends at qotdContainer's outer closing div
const dcCardEnd = dcBlockEnd + '</div>'.length;
const dcBlock = c.substring(dcBlockStart, dcCardEnd);
console.log('DC block extracted (' + dcBlock.length + ' chars):');
console.log(dcBlock.substring(0, 100));
console.log('...');
console.log(dcBlock.substring(dcBlock.length - 50));

// Remove DC from its current location (replace with empty)
c = c.replace(dcBlock, '');

// Insert DC right after the AI widget closing (after ICAR JRF chip area closing </div></div>)
// The AI widget block ends with:  </div>\n    </div>\n\n    \n    <!-- KG: Today's Agriculture Study -->
const afterAIMarker = '    <!-- KG: Today\'s Agriculture Study -->';
const insertPos = c.indexOf(afterAIMarker);
if(insertPos === -1) {
  console.log('ERROR: Could not find insert position');
  process.exit(1);
}

c = c.substring(0, insertPos) + dcBlock + '\r\n\r\n    ' + c.substring(insertPos);
console.log('\n✅ Daily Challenge moved to after KrishiGyan AI');

// ─── TASK 2: Replace PWA banner with Play Store banner ────────────────────────

const oldBanner = `<!-- PWA Install Banner -->
<div id="pwaInstallBanner" style="display:none; position:fixed; bottom:0; left:0; width:100%; background:#0F3D23; color:white; z-index:10000; padding:12px 16px; box-shadow:0 -4px 12px rgba(0,0,0,0.15); align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
  <div style="display:flex; align-items:center; gap:12px; flex:1;">
    <img src="/icons/icon-72.png" alt="Icon" style="width:40px; height:40px; border-radius:8px;">
    <div>
      <div style="font-weight:700; font-size:14px;">Install KrishiGyan App</div>
      <div style="font-size:11px; opacity:0.8;">Get the full-screen app experience</div>
    </div>
  </div>
  <div style="display:flex; gap:8px;">
    <button onclick="document.getElementById('pwaInstallBanner').style.display='none'" style="background:transparent; border:none; color:rgba(255,255,255,0.7); font-size:13px; font-weight:600; padding:8px; cursor:pointer;">Dismiss</button>
    <button onclick="installPWA()" style="background:#00B050; border:none; color:white; font-size:13px; font-weight:700; padding:8px 16px; border-radius:8px; cursor:pointer;">Install</button>
  </div>
</div>`;

const newBanner = `<!-- Play Store Banner -->
<div id="pwaInstallBanner" style="display:flex; position:fixed; bottom:0; left:0; width:100%; background:#fff; color:#111; z-index:10000; padding:12px 16px; box-shadow:0 -4px 16px rgba(0,0,0,0.18); align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; border-top:1px solid #e0e0e0;">
  <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
    <img src="/icons/icon-72.png" alt="KrishiGyan" style="width:44px; height:44px; border-radius:10px; flex-shrink:0;">
    <div style="min-width:0;">
      <div style="font-weight:700; font-size:14px; color:#0F3D23;">KrishiGyan - Agriculture App</div>
      <div style="font-size:11px; color:#555; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Free agriculture learning platform</div>
    </div>
  </div>
  <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
    <button onclick="document.getElementById('pwaInstallBanner').style.display='none'" style="background:transparent; border:none; color:#777; font-size:18px; padding:4px 8px; cursor:pointer; line-height:1;">✕</button>
    <a href="https://play.google.com/store/apps/details?id=online.sannykumar.krishigyan_v1" target="_blank" rel="noopener" style="display:flex; align-items:center; gap:6px; background:#000; color:white; border-radius:8px; padding:8px 12px; text-decoration:none; font-size:12px; font-weight:600; white-space:nowrap;">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512"><path fill="#4CAF50" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l239.6-239.6L47 0zm425.6 225.6l-58.9-34-65.7 64.5 65.7 64.5 60.1-34.3c17.1-9.8 17.1-36.4-.2-46.7l-1-.7zm-166.8 59.6L84.6 512l240.5-138.2 60.1-60.1-79.4-47.3z"/></svg>
      GET IT ON<br><span style="font-size:14px; font-weight:800;">Google Play</span>
    </a>
  </div>
</div>`;

if(c.includes(oldBanner)) {
  c = c.replace(oldBanner, newBanner);
  console.log('✅ Play Store banner injected');
} else {
  // Try to find the existing banner by id
  const bannerIdx = c.indexOf('id="pwaInstallBanner"');
  if(bannerIdx > -1) {
    const bannerDivStart = c.lastIndexOf('\n<!-- ', bannerIdx);
    const bannerEnd = c.indexOf('</div>', bannerIdx);
    const fullBanner = c.substring(bannerDivStart, bannerEnd + 6);
    console.log('Found banner by id, replacing...');
    c = c.replace(fullBanner, newBanner);
    console.log('✅ Play Store banner replaced by id search');
  } else {
    console.log('ERROR: Banner not found');
  }
}

fs.writeFileSync('index.html', c);
console.log('\nDone! Both tasks completed.');
