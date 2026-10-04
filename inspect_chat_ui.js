const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

const s = c.indexOf('<div id="aiChat"');
const e = c.indexOf('<!-- Community Doubts -->', s);
console.log(c.substring(s, e));
