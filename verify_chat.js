const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Verify all new elements/functions are present
const checks = [
  'gcContextMenu', 'gcOpenMenu', 'gcEditMessage', 'gcDeleteMessage', 'gcCancelEdit',
  'gcTouchStart', 'gcTouchEnd', 'gcEditBanner', 'inp.dataset.editingId',
  'KrishiGyan Students', 'ECE5DD', 'F0F0F0', 'renderGroupChat()'
];
let pass = 0, fail = 0;
checks.forEach(k => {
  const found = c.includes(k);
  console.log((found ? '✅' : '❌') + ' ' + k);
  found ? pass++ : fail++;
});
console.log(`\n${pass}/${checks.length} checks passed`);
