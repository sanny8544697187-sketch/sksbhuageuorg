const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const scriptBlocks = c.match(/<script>([\s\S]*?)<\/script>/g) || [];
let errors = 0;
scriptBlocks.forEach((block, i) => {
  try { new Function(block.replace(/<\/?script>/g,'')); }
  catch(e) { errors++; console.error(`Block ${i}: ${e.message.substring(0,120)}`); }
});
console.log(`Checked ${scriptBlocks.length} blocks. Errors: ${errors}`);

// Verify key insertions
const checks = [
  'engagement-system.js',
  'engStreakCard',
  'engXPBar',
  'engDailyGoals',
  'engDailyResultPanel',
  'engExamCountdown',
  'engReferralCard',
  'engBadgesPanel',
  'engProgressPanel',
  'engNotifSettings',
  'refreshEngUI',
];
checks.forEach(k => {
  const found = c.includes(k);
  console.log((found ? '✅' : '❌') + ' ' + k);
});
