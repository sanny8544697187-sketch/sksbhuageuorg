const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const bannerStart = c.indexOf('<div id="pwaInstallBanner"');
const bannerEnd = c.indexOf('</div>\r\n</body>', bannerStart);
const bannerEndFallback = c.indexOf('</div>\n</body>', bannerStart);

const endIdx = Math.max(bannerEnd, bannerEndFallback) + 6;

const fullBanner = c.substring(bannerStart, endIdx);

const newBanner = `<div id="pwaInstallBanner" style="display:flex; position:fixed; bottom:0; left:0; width:100%; background:#fff; color:#111; z-index:10000; padding:12px 16px; box-shadow:0 -4px 16px rgba(0,0,0,0.18); align-items:center; justify-content:space-between; flex-wrap:nowrap; gap:12px; border-top:1px solid #e0e0e0;">
  <img src="/icons/playstore.png" alt="Play Store" style="width:44px; height:44px; border-radius:10px; flex-shrink:0;">
  <button onclick="installPWA()" style="flex:1; display:flex; align-items:center; justify-content:center; background:#00B050; color:white; border:none; border-radius:8px; padding:12px; font-size:14px; font-weight:700; cursor:pointer; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; box-shadow:0 2px 8px rgba(0,176,80,0.3);">
    KrishiGyan ON Google Play
  </button>
  <button onclick="document.getElementById('pwaInstallBanner').style.display='none'" style="background:transparent; border:none; color:#777; font-size:22px; padding:4px 8px; cursor:pointer; line-height:1; flex-shrink:0;">✕</button>
</div>`;

c = c.replace(fullBanner, newBanner);

fs.writeFileSync('index.html', c);
console.log('✅ Banner updated to trigger PWA install with Play Store styling.');
