const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const start = c.indexOf('<section id="home"');
const end = c.indexOf('</section>', start);
console.log(c.substring(start, start + 4000));
