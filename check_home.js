const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const s = c.indexOf('<section id="home"');
console.log(c.substring(s, s + 1500));
