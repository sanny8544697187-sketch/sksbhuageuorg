const fs = require('fs');
const c = fs.readFileSync('index_new.html', 'utf8');
const startSec = c.indexOf('<section id="home"');
const endSec = c.indexOf('</section>', startSec);
console.log(c.substring(startSec, endSec + 10));
