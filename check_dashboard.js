const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const s = c.indexOf('id="androidDashboard"');
console.log(c.substring(s, s + 1500));
