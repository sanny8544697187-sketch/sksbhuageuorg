const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Find what function contains line 3086
const lines = c.split('\n');
// Look backwards from line 3085 to find the function name
for(let i = 3085; i >= 3050; i--) {
  if(lines[i] && lines[i].includes('function ')) {
    console.log(`Function found at L${i+1}: ${lines[i].trim()}`);
    break;
  }
}

// Check what quickQList element is
const qqIdx = c.indexOf('id="quickQList"');
console.log('\nquickQList in HTML:');
console.log(c.substring(qqIdx, qqIdx + 100));

// Check if quickQList still exists in HTML (we replaced aiChat HTML)
const allQQ = [...c.matchAll(/quickQList/g)];
console.log('\nAll quickQList occurrences:', allQQ.length);
allQQ.forEach(m => console.log('  at index', m.index, ':', c.substring(m.index, m.index+60)));
