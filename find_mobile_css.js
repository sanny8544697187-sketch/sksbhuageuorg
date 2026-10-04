const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Get the full mobile CSS block 
const mhIdx = c.indexOf('.mobile-header {');
console.log('MOBILE HEADER CSS:');
console.log(c.substring(mhIdx, mhIdx + 800));

// check .hero css
const heroIdx = c.indexOf('.hero{');
console.log('\nHERO CSS:');
console.log(c.substring(heroIdx, heroIdx + 300));

// check content
const cntIdx = c.indexOf('.content{');
console.log('\nCONTENT CSS:');
console.log(c.substring(cntIdx, cntIdx + 150));
