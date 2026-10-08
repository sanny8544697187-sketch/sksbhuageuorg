const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.indexOf('main class="content"') > -1) {
    console.log('Line ' + i + ':', l);
  }
});
