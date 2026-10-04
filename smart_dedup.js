/**
 * smart_dedup.js
 *
 * Precise surgery on index.html.bak:
 *
 * Structure (verified by position analysis):
 *   [0 – 448264]       First half: HTML sections + JS functions (renderAll, QUIZ_BANK, etc.)
 *   [448264 – 789464]  Duplicate block: same content as first half repeated
 *   [789464 – 919866]  UNIQUE content: doGoogleLogin, openForgotPassword + closing </body></html>
 *
 * Fix:
 *   Keep [0–448264] + [789464–end]
 *   Remove the 341KB duplicate middle block.
 */
const fs = require('fs');
const html = fs.readFileSync('index.html.bak', 'utf8');

console.log('Backup size:', (html.length / 1024).toFixed(0), 'KB');

const KEEP_START_1 = 0;
const KEEP_END_1   = 448264;   // end of first half
const KEEP_START_2 = 789464;   // start of unique doGoogleLogin
// Keep from KEEP_START_2 to end

const part1 = html.substring(KEEP_START_1, KEEP_END_1);
const part2 = html.substring(KEEP_START_2);

const result = part1 + part2;

console.log('New size:', (result.length / 1024).toFixed(0), 'KB');
console.log('Removed bytes:', KEEP_START_2 - KEEP_END_1, '(' + ((KEEP_START_2 - KEEP_END_1)/1024).toFixed(0) + ' KB)');

// Verify
const checks = [
  ['hero-stats == 1',      (result.split('<div class="hero-stats">').length - 1) === 1],
  ['QUIZ_BANK == 1',       (result.split('let QUIZ_BANK').length - 1) === 1],
  ['renderHome == 1',      (result.split('function renderHome()').length - 1) === 1],
  ['renderAll == 1',       (result.split('function renderAll()').length - 1) === 1],
  ['doLogin == 1',         (result.split('async function doLogin()').length - 1) === 1],
  ['doRegister == 1',      (result.split('async function doRegister()').length - 1) === 1],
  ['doGoogleLogin == 1',   (result.split('async function doGoogleLogin()').length - 1) === 1],
  ['openForgotPassword',   result.includes('function openForgotPassword(')],
  ['processGoogleUser',    result.includes('async function processGoogleUser')],
  ['initializeApp == 1',   (result.split('firebase.initializeApp').length - 1) === 1],
  ['signInWithRedirect==0',!result.includes('signInWithRedirect')],
  ['has </html>',          result.includes('</html>')],
  ['has </body>',          result.includes('</body>')],
];

let pass = 0, fail = 0;
checks.forEach(([name, ok]) => {
  if (ok) { pass++; console.log('PASS  ' + name); }
  else    { fail++; console.log('FAIL  ' + name); }
});

if (fail === 0) {
  fs.writeFileSync('index.html', result);
  console.log('\nSUCCESS: index.html saved. ' + pass + '/'+checks.length+' checks passed.');
} else {
  console.log('\nWARNING: ' + fail + ' checks failed — not saving.');
}
