const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Add pwa-install.js script tag
const bodyEnd = c.indexOf('</body>');
if(bodyEnd > -1) {
  c = c.substring(0, bodyEnd) + '  <script src="./pwa-install.js"></script>\n' + c.substring(bodyEnd);
}

// Find sidebar
const sidebarMarker = 'onclick="setSection(\'profile\')">👤 Profile</button>';
const insertPos = c.indexOf(sidebarMarker);
if (insertPos > -1) {
  const finalPos = insertPos + sidebarMarker.length;
  const btnHtml = `\n      <button id="installAppBtn" class="nav-btn" style="display:none; color:#f59e0b;" onclick="installPWA()">⬇️ Install App</button>`;
  c = c.substring(0, finalPos) + btnHtml + c.substring(finalPos);
}

fs.writeFileSync('index.html', c);
console.log('PWA Install Button Injected.');
