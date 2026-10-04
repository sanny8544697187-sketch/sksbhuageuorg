const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

const homeStart = c.indexOf('id="home"');
const homeEnd = c.indexOf('id="subjects"');
const homeSection = c.substring(homeStart, homeEnd);

// Find the end of the AI widget card (after the chip buttons)
const icarJrf = homeSection.indexOf('ICAR JRF');
console.log('After ICAR JRF chip:');
console.log(homeSection.substring(icarJrf, icarJrf + 800));
