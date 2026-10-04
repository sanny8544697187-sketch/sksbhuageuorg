const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// What does the HTML look like for the tabs?
const tabs = c.indexOf('<div style="display:flex;gap:8px;margin-bottom:16px;">');
console.log(c.substring(tabs, tabs + 400));

// What about the community chat header buttons?
const commHeader = c.indexOf('<div style="display:flex;gap:8px;flex-wrap:wrap;">');
console.log('\n\n--- Comm header ---');
console.log(c.substring(commHeader, commHeader + 400));
