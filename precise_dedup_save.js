/**
 * precise_dedup_save.js
 * Same as precise_dedup.js but saves even with missing auth fixes
 * (we re-apply them in a separate step)
 */
const fs = require('fs');
const html = fs.readFileSync('index.html.bak', 'utf8');

const DUPE_START = 448264;
const DUPE_LEN   = 368164;
const DUPE_END   = DUPE_START + DUPE_LEN;

const part1 = html.substring(0, DUPE_START);
const part2 = html.substring(DUPE_END);
const result = part1 + part2;

// Verify core structure is correct
const coreChecks = [
  (result.split('<div class="hero-stats">').length - 1) === 1,
  (result.split('let QUIZ_BANK').length - 1) === 1,
  (result.split('function renderHome()').length - 1) === 1,
  (result.split('function doLogin()').length - 1) === 1,
  result.includes('</html>'),
  !result.includes('signInWithRedirect'),
];
const allCorePass = coreChecks.every(Boolean);

if (allCorePass) {
  fs.writeFileSync('index.html', result);
  console.log('SAVED. Size:', (result.length / 1024).toFixed(0), 'KB');
  console.log('All core structural checks pass.');
  // Report current state
  console.log('doGoogleLogin present:', result.includes('async function doGoogleLogin()'));
  console.log('capacitor-app.js tag present:', result.includes('capacitor-app.js'));
  console.log('signInWithPopup count:', (result.split('signInWithPopup').length - 1));
} else {
  console.log('CORE CHECKS FAILED - not saving');
}
