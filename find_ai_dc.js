const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Find KrishiGyan AI widget location
const aiIdx = c.indexOf('KrishiGyan AI');
console.log('AI WIDGET AREA (first occurrence):');
console.log(c.substring(Math.max(0, aiIdx - 100), aiIdx + 400));

console.log('\n\n=== DAILY CHALLENGE LOCATION ===');
const dcIdx = c.indexOf('Daily Challenge');
console.log(c.substring(Math.max(0, dcIdx - 200), dcIdx + 400));
