const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// quickQList is referenced in JS but the HTML was inside old chat sidebar we removed.
// Find the function that uses quickQList
const qqlIdx = c.indexOf('quickQList");');
console.log('Context around quickQList usage:');
console.log(c.substring(Math.max(0, qqlIdx - 400), qqlIdx + 300));
