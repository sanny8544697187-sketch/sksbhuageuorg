const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Count occurrences of gcInterval declarations
const matches = [...c.matchAll(/let gcInterval/g)];
console.log('gcInterval declarations found:', matches.length);
matches.forEach(m => {
  console.log('  at index', m.index, ':', c.substring(m.index, m.index + 80));
});

// Also check for duplicate renderGroupChat declarations
const rg = [...c.matchAll(/function renderGroupChat/g)];
console.log('\nrenderGroupChat declarations:', rg.length);
rg.forEach(m => console.log('  at index', m.index));

// Check for duplicate setChatTab
const sc = [...c.matchAll(/function setChatTab/g)];
console.log('\nsetChatTab declarations:', sc.length);
sc.forEach(m => console.log('  at index', m.index));
