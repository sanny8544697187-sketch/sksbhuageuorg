const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const s = c.indexOf('<section id="chat"');
const e = c.indexOf('</section>', s);
console.log(c.substring(s, Math.min(s+3000, e+10)));
