const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Find line 3086 area  
const lines = c.split('\n');
console.log('Lines around 3085-3090:');
for(let i = 3082; i <= 3092; i++) {
  console.log(`L${i+1}: ${lines[i]}`);
}
