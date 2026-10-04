/**
 * remove_duplicate_half.js
 *
 * The index.html file has been accidentally doubled — entire blocks of HTML
 * and JS appear twice. This script finds the boundary where duplication starts
 * and removes the second copy of each major duplicated block.
 *
 * Strategy: The file has the structure [BLOCK A][BLOCK A again].
 * We detect the second </html> close or the second <body> open to find the split.
 */
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

console.log('File size before:', (html.length / 1024).toFixed(0), 'KB');

// ── Find where the duplication starts ─────────────────────────────────────────
// Look for patterns that should only appear ONCE
// The second occurrence of `let QUIZ_BANK = {` marks the start of the duplicated JS block

const quizBankMarker = 'let QUIZ_BANK = {';
const first = html.indexOf(quizBankMarker);
const second = html.indexOf(quizBankMarker, first + 1);

console.log('First QUIZ_BANK at:', first);
console.log('Second QUIZ_BANK at:', second);

if (second === -1) {
  console.log('No duplication found - file is clean!');
  process.exit(0);
}

// The second block starts just before the second QUIZ_BANK.
// Go back and find the actual start of the duplicated JS/HTML section.
// Look for a clear boundary: the second `window._fbConfigured = false`
const fbMarker = 'window._fbConfigured = false';
const firstFb = html.indexOf(fbMarker);
const secondFb = html.indexOf(fbMarker, firstFb + 1);

console.log('First _fbConfigured at:', firstFb);
console.log('Second _fbConfigured at:', secondFb);

// Look for a script or section boundary near the second block
// Go back ~200 chars from the second QUIZ_BANK to find a clean cut point
let cutPoint = second;

// Walk back to find a clean section start: </script>\n\n or <!-- section
for (let i = second - 1; i > second - 5000; i--) {
  const chunk = html.substring(i, i + 9);
  if (chunk === '</script>') {
    cutPoint = i + 9;
    break;
  }
}

console.log('Cut point:', cutPoint);

// ── Check what we are cutting ─────────────────────────────────────────────────
const kept = html.substring(0, cutPoint);
const removed = html.substring(cutPoint);
console.log('Keeping:', (kept.length / 1024).toFixed(0), 'KB');
console.log('Removing:', (removed.length / 1024).toFixed(0), 'KB');

// The removed section should NOT end with </html> if we're cutting correctly
// Verify the kept section ends with </html>
const keptHasHtmlClose = kept.includes('</html>');
const removedHasHtmlClose = removed.includes('</html>');
console.log('Kept has </html>:', keptHasHtmlClose);
console.log('Removed has </html>:', removedHasHtmlClose);

// Verify counts AFTER cut
const afterRenderHome = (kept.split('function renderHome()').length - 1);
const afterQuizBank = (kept.split('let QUIZ_BANK').length - 1);
const afterHeroStats = (kept.split('<div class="hero-stats">').length - 1);
console.log('\nAfter cut:');
console.log('  renderHome:', afterRenderHome, '(want 1)');
console.log('  QUIZ_BANK:', afterQuizBank, '(want 1)');
console.log('  hero-stats:', afterHeroStats, '(want 1)');

if (afterRenderHome === 1 && afterQuizBank === 1 && afterHeroStats === 1 && keptHasHtmlClose) {
  fs.writeFileSync('index.html', kept);
  console.log('\nSUCCESS: Duplicate half removed.');
  console.log('File size after:', (kept.length / 1024).toFixed(0), 'KB');
} else {
  console.log('\nWARNING: Cut point may be wrong. Saving backup and NOT modifying.');
  fs.writeFileSync('index.html.bak', html);
}
