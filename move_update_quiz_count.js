/**
 * move_update_quiz_count.js
 *
 * updateQuizCount() was inserted near getAllQuizQuestions() (~pos 510K)
 * but is called from loadCustomQuizBank() and pyqData loader (~pos 196K-199K)
 * which are in a DIFFERENT earlier script block.
 *
 * Fix: Remove the definition from its late position and re-insert it
 *      right after rebuildQuizBank() definition (~pos 193K),
 *      which is in the SAME script block as all the call sites.
 */
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const FN_MARKER_START = '// ── Quiz Qs counter (MCQ Bank + Quiz Bank) ─────────────────────────────────\nfunction updateQuizCount()';
const FN_END_MARKER = '\nfunction getAllQuizQuestions()';

// ── Step 1: Extract and remove the existing definition ───────────────────────
const defStart = html.indexOf(FN_MARKER_START);
if (defStart === -1) {
  console.error('ERROR: Could not find updateQuizCount definition marker.');
  process.exit(1);
}

// Find end: the next top-level function after updateQuizCount
const defEnd = html.indexOf(FN_END_MARKER, defStart);
if (defEnd === -1) {
  console.error('ERROR: Could not find end of updateQuizCount definition.');
  process.exit(1);
}

const fnDefinition = html.substring(defStart, defEnd);
console.log('Extracted updateQuizCount definition (' + fnDefinition.length + ' chars):');
console.log(fnDefinition.substring(0, 150) + '...');

// Remove from old position
html = html.substring(0, defStart) + html.substring(defEnd);
console.log('\nRemoved definition from old position.');

// ── Step 2: Re-insert right after rebuildQuizBank() function definition ───────
// Find the closing brace of rebuildQuizBank function
// rebuildQuizBank starts with: "function rebuildQuizBank(){"
// It ends before: "async function loadCustomQuizBank() {"
const insertAfter = '\nasync function loadCustomQuizBank()';
const insertPos = html.indexOf(insertAfter);
if (insertPos === -1) {
  console.error('ERROR: Cannot find loadCustomQuizBank anchor to insert before.');
  process.exit(1);
}

html = html.substring(0, insertPos) +
       '\n\n' + fnDefinition + '\n' +
       html.substring(insertPos);

console.log('Re-inserted updateQuizCount() before loadCustomQuizBank() at pos', insertPos);

// ── Step 3: Save and verify ───────────────────────────────────────────────────
fs.writeFileSync('index.html', html);
const final = fs.readFileSync('index.html', 'utf8');

const defIdx = final.indexOf('function updateQuizCount()');
const callIdx1 = final.indexOf('updateQuizCount(); // update counter after Firebase');
const callIdx2 = final.indexOf('updateQuizCount(); } // update counter after PYQ');
const loadIdx = final.indexOf('async function loadCustomQuizBank()');

console.log('\n=== VERIFY ===');
console.log('updateQuizCount defined at pos:', defIdx);
console.log('loadCustomQuizBank defined at pos:', loadIdx);
console.log('First call (after Firebase load) at pos:', callIdx1);
console.log('Second call (after pyqData) at pos:', callIdx2);
console.log('Definition comes BEFORE loadCustomQuizBank?', defIdx < loadIdx);
console.log('Definition comes BEFORE calls?', defIdx < callIdx1 && defIdx < callIdx2);
console.log('File size:', (final.length / 1024).toFixed(0), 'KB');
