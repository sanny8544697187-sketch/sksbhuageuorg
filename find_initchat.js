const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// quickQList is only referenced in JS but the HTML element was inside the old chat-sidebar
// which we removed when we replaced the aiChat HTML. Need to check what else is missing.
// Find catFilters too
const cf = [...c.matchAll(/catFilters/g)];
console.log('catFilters occurrences:', cf.length);
cf.forEach(m => console.log('  at index', m.index, ':', c.substring(m.index, m.index+80)));

// Find the initChat function
const initChat = c.indexOf('function initChat');
console.log('\ninitChat fn:');
console.log(c.substring(initChat, initChat + 600));
