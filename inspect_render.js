const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const s = c.indexOf('function renderGroupChat()');
console.log(c.substring(s, s + 2000));
