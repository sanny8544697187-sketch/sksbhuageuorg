const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Find mobileHeader
const s = c.indexOf('mobileHeader');
console.log('MOBILE HEADER AREA:');
console.log(c.substring(Math.max(0, s-100), s + 800));

// Now look for what's inside home section
console.log('\n\nHOME SECTION:');
const h = c.indexOf('id="home"');
console.log(c.substring(Math.max(0, h-50), h + 800));
