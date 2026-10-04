const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Remove the SECOND duplicate `let gcInterval = null;` (at index 262340)
// It's right before `function setChatTab(t) {`
// We replace `let gcInterval = null;\n\nfunction setChatTab` with just `function setChatTab`
c = c.replace('let gcInterval = null;\n\nfunction setChatTab(t) {', 'function setChatTab(t) {');

// Verify fix
const matches = [...c.matchAll(/let gcInterval/g)];
console.log('gcInterval declarations after fix:', matches.length);

fs.writeFileSync('index.html', c);
console.log('Fixed!');
