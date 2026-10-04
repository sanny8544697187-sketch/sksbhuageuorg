const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

const s = c.indexOf('let msgs');
console.log('msgs loc:', s);
console.log(c.substring(s, s+150));

const e = c.indexOf('function loadNotices()');
console.log('loadNotices loc:', e);
