/**
 * find_dupe_boundary.js
 * Find EXACT positions of key structural tags to understand duplication pattern
 */
const fs = require('fs');
const html = fs.readFileSync('index.html.bak', 'utf8');

console.log('File size:', (html.length / 1024).toFixed(0), 'KB');

// Find all </body> and </html> tags
const markers = ['</body>', '</html>', '<body', '<!DOCTYPE', '<html', 
                  'window._fbConfigured', 'let QUIZ_BANK', 
                  '<div class="hero-stats">', 'function renderHome()'];

markers.forEach(m => {
  let idx = 0, count = 0, positions = [];
  while (true) {
    const pos = html.indexOf(m, idx);
    if (pos === -1) break;
    count++;
    positions.push(pos);
    idx = pos + 1;
  }
  console.log(`${m}: ${count}x at [${positions.slice(0,4).join(', ')}]`);
});
