const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

const s = c.indexOf('let msgs=[');
console.log(c.substring(s, s + 3000));
