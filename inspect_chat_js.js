const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

const s = c.indexOf('function setChatTab');
console.log(c.substring(s, s + 1000));

const aiS = c.indexOf('function sendAI');
console.log('\n\n--- sendAI ---');
console.log(c.substring(aiS, aiS + 500));
