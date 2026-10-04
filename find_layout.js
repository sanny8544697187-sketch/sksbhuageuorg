const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Find all top-level divs and their IDs/classes
const matches = [...c.matchAll(/<div[^>]*(id|class)="[^"]*"[^>]*>/g)];
matches.slice(0, 30).forEach(m => {
  console.log(m.index, m[0].substring(0, 120));
});
