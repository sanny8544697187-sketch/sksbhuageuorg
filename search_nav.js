const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const s = c.indexOf('mobile-circle-nav');
console.log(c.substring(Math.max(0, s-200), s + 1000));
