const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

c = c.replace(/const isPrem=u\.isAdmin&&document\.getElementById\("uPrem"\)\.checked;/g, 'const isPrem=isManager(u)&&document.getElementById("uPrem").checked;');

fs.writeFileSync('index.html', c);
console.log('done.');
