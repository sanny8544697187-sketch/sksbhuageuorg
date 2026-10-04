const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

const homeStart = c.indexOf('id="home"');
const homeEnd = c.indexOf('id="subjects"');
const homeSection = c.substring(homeStart, homeEnd);

// Find Ask Now context - that's the end of the AI widget
const askIdx = homeSection.indexOf('Ask Now');
// Go back to find the card opening <div 
const aiCardStart = homeSection.lastIndexOf('<div', askIdx);
const aiCardOpenContext = homeSection.substring(Math.max(0, aiCardStart - 50), aiCardStart + 200);
console.log('AI card start context:');
console.log(aiCardOpenContext);

// Find what comes after the AI widget to understand order
const afterAsk = homeSection.indexOf('\n', askIdx + 200);
console.log('\nContent after AI widget:');
console.log(homeSection.substring(afterAsk, afterAsk + 600));
