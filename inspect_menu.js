const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

const s = c.indexOf('function gcOpenMenu');
console.log(c.substring(s, s + 1000));

const m = c.indexOf('id="gcContextMenu"');
console.log('\n--- Menu HTML ---');
console.log(c.substring(m, m + 800));

