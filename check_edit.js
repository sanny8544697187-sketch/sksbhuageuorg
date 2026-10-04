const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const checks = ['gcContextMenu','gcEditMessage','gcDeleteMessage','gcTouchStart','gcEditBanner','gcOpenMenu'];
checks.forEach(k => console.log((c.includes(k)?'✅':'❌') + ' ' + k));
