const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const s = c.indexOf('class="app-container');
console.log('app-container found at:', s);
if(s > -1) {
  console.log(c.substring(s-100, s+500));
} else {
  const s2 = c.indexOf('<body>');
  console.log('body start:', c.substring(s2, s2+1500));
}
