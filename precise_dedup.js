/**
 * precise_dedup.js
 *
 * The index.html has a 368164-byte block duplicated.
 * Structure: [Preamble][Original][Duplicate][Closing]
 * First hero-stats: 80100 → duplicate starts at: 448264
 * Gap: 368164 bytes (verified consistent across all duplicate markers)
 *
 * Fix: Remove the duplicate block [448264 to 448264+368164] = [448264 to 816428]
 * Keep: [0 to 448264] + [816428 to end]
 */
const fs = require('fs');
const html = fs.readFileSync('index.html.bak', 'utf8');

console.log('Original size:', (html.length / 1024).toFixed(0), 'KB');

const DUPE_START = 448264;   // Start of duplicate (second hero-stats)
const DUPE_LEN   = 368164;   // Length of duplicate block
const DUPE_END   = DUPE_START + DUPE_LEN; // 816428

console.log('Removing bytes:', DUPE_START, 'to', DUPE_END);

// Inspect the boundary to confirm
console.log('\n--- Content at DUPE_START-100 (end of original block) ---');
console.log(JSON.stringify(html.substring(DUPE_START - 150, DUPE_START + 10)));

console.log('\n--- Content at DUPE_END-50 (end of duplicate block) ---');
console.log(JSON.stringify(html.substring(DUPE_END - 50, DUPE_END + 100)));

// Build new file
const part1 = html.substring(0, DUPE_START);
const part2 = html.substring(DUPE_END);
const result = part1 + part2;

console.log('\nNew size:', (result.length / 1024).toFixed(0), 'KB');

// Verify
const checks = [
  ['hero-stats count == 1', (result.split('<div class="hero-stats">').length - 1) === 1],
  ['QUIZ_BANK count == 1',  (result.split('let QUIZ_BANK').length - 1) === 1],
  ['renderHome count == 1', (result.split('function renderHome()').length - 1) === 1],
  ['doLogin count == 1',    (result.split('function doLogin()').length - 1) === 1],
  ['doRegister count == 1', (result.split('function doRegister()').length - 1) === 1],
  ['renderAll count == 1',  (result.split('function renderAll()').length - 1) === 1],
  ['has </html>',           result.includes('</html>')],
  ['has </body>',           result.includes('</body>')],
  ['initializeApp == 1',    (result.split('firebase.initializeApp').length - 1) === 1],
  ['signInWithRedirect == 0', !result.includes('signInWithRedirect')],
  ['doGoogleLogin exists',  result.includes('async function doGoogleLogin()')],
  ['CapacitorFirebaseAuth in script tag', result.includes('capacitor-app.js')],
];

let pass = 0, fail = 0;
checks.forEach(([name, ok]) => {
  if (ok) { pass++; console.log('PASS  ' + name); }
  else    { fail++; console.log('FAIL  ' + name); }
});

if (fail === 0) {
  fs.writeFileSync('index.html', result);
  console.log('\nSUCCESS: index.html cleaned. ' + pass + '/'+checks.length+' checks passed.');
} else {
  console.log('\nWARNING: ' + fail + ' checks failed. NOT saving. Try adjusting DUPE_END.');
}
