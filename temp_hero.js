const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const heroStart = c.indexOf('<div class="hero">');
console.log(c.substring(heroStart, heroStart + 2000));
