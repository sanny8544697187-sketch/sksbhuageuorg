const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

const s = c.indexOf('<div id="communityChat">');
const e = c.indexOf('<!-- END of community chat? -->', s) > -1 ? c.indexOf('<!-- END of community chat? -->', s) : c.indexOf('</section>', s);
console.log(c.substring(s, Math.min(s+3000, e)));
