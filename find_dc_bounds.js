const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// ─── 1. Find the full Daily Challenge card block ───────────────────────────
// The card starts with the outer wrapper div just before "Daily Challenge" text
// Pattern: <div style="background:white;border-radius:20px;padding:18px;margin-bottom:14px;box-shadow:0 2px 12px rgba(0,0,0,.07);">
//   ... 📌 Daily Challenge ... qotdContainer ... </div>

const dcCardStart = c.indexOf('background:white;border-radius:20px;padding:18px;margin-bottom:14px;box-shadow:0 2px 12px rgba(0,0,0,.07);">\r\n      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">\r\n        <div>\r\n          <div style="font-weight:800;font-size:15px;color:#0F3D23;">📌 Daily Challenge</div>');

if(dcCardStart === -1) {
  console.log('Could not find DC card start pattern');
  // Try different line endings
  const dcCardStart2 = c.indexOf('background:white;border-radius:20px;padding:18px;margin-bottom:14px;box-shadow:0 2px 12px rgba(0,0,0,.07);">\n      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">\n        <div>\n          <div style="font-weight:800;font-size:15px;color:#0F3D23;">📌 Daily Challenge</div>');
  console.log('LF version:', dcCardStart2);
  process.exit(1);
}

// Find the opening <div for this card (go back from dcCardStart)
const cardDivOpen = c.lastIndexOf('<div', dcCardStart);
console.log('DC card opening div at:', cardDivOpen);
console.log('Opening:', c.substring(cardDivOpen, cardDivOpen + 100));

// Find the closing tag - qotdContainer div closes, then the outer card closes
const qotdClose = c.indexOf('</div>\n    </div>\n', dcCardStart);
const qotdClose2 = c.indexOf('</div>\r\n    </div>\r\n', dcCardStart);
const qotdEnd = Math.max(qotdClose, qotdClose2);
console.log('qotd content end around:', qotdEnd);
if(qotdEnd > -1) {
  console.log(c.substring(qotdEnd, qotdEnd + 200));
}
