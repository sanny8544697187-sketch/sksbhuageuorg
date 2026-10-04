const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const oldButton = `<button onclick="installPWA()" style="flex:1; display:flex; align-items:center; justify-content:center; background:#00B050; color:white; border:none; border-radius:8px; padding:12px; font-size:14px; font-weight:700; cursor:pointer; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; box-shadow:0 2px 8px rgba(0,176,80,0.3);">
    KrishiGyan ON Google Play
  </button>`;

const newButton = `<a href="https://play.google.com/store/apps/details?id=online.sannykumar.krishigyan_v1" target="_blank" rel="noopener" style="flex:1; display:flex; align-items:center; justify-content:center; background:#00B050; color:white; border:none; border-radius:8px; padding:12px; font-size:14px; font-weight:700; cursor:pointer; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; box-shadow:0 2px 8px rgba(0,176,80,0.3); text-decoration:none;">
    KrishiGyan ON Google Play
  </a>`;

if (c.includes(oldButton)) {
  c = c.replace(oldButton, newButton);
  fs.writeFileSync('index.html', c);
  console.log('✅ Button changed to Play Store link.');
} else {
  console.log('❌ Could not find the button to replace.');
}
