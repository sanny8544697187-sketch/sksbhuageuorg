const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const s = c.indexOf('<div id="askDoubtForm"');
const e = c.indexOf('</section>', s);
console.log(c.substring(s, e));
