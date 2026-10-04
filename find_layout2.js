const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

const matches = [...c.matchAll(/<div[^>]*(id|class)="[^"]*"[^>]*>/g)];
matches.slice(30).forEach(m => {
  console.log(m.index, m[0].substring(0, 120));
});
