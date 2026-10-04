const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// 1. Remove the old installBtn from sidebar
const oldBtnHtml = `\n      <button id="installAppBtn" class="nav-btn" style="display:none; color:#f59e0b;" onclick="installPWA()">⬇️ Install App</button>`;
if(c.includes(oldBtnHtml)) {
  c = c.replace(oldBtnHtml, '');
}

// 2. Add a mobile-friendly sticky install banner
const bodyEnd = c.indexOf('</body>');
const bannerHtml = `
<!-- PWA Install Banner -->
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
</div>
`;
c = c.substring(0, bodyEnd) + bannerHtml + c.substring(bodyEnd);

fs.writeFileSync('index.html', c);
console.log('Fixed PWA banner location.');
