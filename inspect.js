const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const targetStr = '<div id="mobileDrawer">';
const first = html.indexOf(targetStr);
const second = html.indexOf(targetStr, first + 1);
console.log('Second copy starts at:', second);
console.log(html.substring(second, second + 8000));
