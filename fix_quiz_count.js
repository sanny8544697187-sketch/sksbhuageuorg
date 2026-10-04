/**
 * fix_quiz_count.js
 *
 * Fixes the "Quiz Qs" counter on the home/dashboard.
 *
 * Formula (as user specified):
 *   Quiz Qs = QUIZ_BANK total questions  (MCQ Bank = builtin + admin-added from Firebase)
 *           + pyqData.length             (Quiz Bank = PYQ questions from Firebase)
 *
 * Changes:
 * 1. Replace the fragile inline `getAllQuizQuestions().length` call in renderHome
 *    with a safe call to a new `updateQuizCount()` function.
 * 2. Add `updateQuizCount()` — a robust, safe function that:
 *    - Reads directly from QUIZ_BANK (already merged by rebuildQuizBank())
 *    - Reads from pyqData (PYQ questions)
 *    - Never throws even if data is still loading
 * 3. Call updateQuizCount() at all the right moments:
 *    - After loadCustomQuizBank() completes
 *    - After pyqData is loaded from Firebase
 *    - When renderHome runs
 */
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

console.log('File size before:', (html.length / 1024).toFixed(0), 'KB');

// ── Step 1: Add updateQuizCount() function right before getAllQuizQuestions ────
const insertBefore = 'function getAllQuizQuestions()';
if (!html.includes('function updateQuizCount()')) {
  const newFn = `// ── Quiz Qs counter (MCQ Bank + Quiz Bank) ─────────────────────────────────
function updateQuizCount() {
  try {
    // QUIZ_BANK = builtin questions + admin-added (customQuizBank) merged by rebuildQuizBank()
    const mcqBankCount = (typeof QUIZ_BANK !== 'undefined')
      ? Object.values(QUIZ_BANK).reduce(function(s, a){ return s + a.length; }, 0)
      : 0;
    // pyqData = Previous Year Questions loaded from Firebase
    const quizBankCount = (typeof pyqData !== 'undefined' && Array.isArray(pyqData))
      ? pyqData.length
      : 0;
    const total = mcqBankCount + quizBankCount;
    var el = document.getElementById('statQuizCount');
    if (el) el.textContent = total + '+';
  } catch(e) {
    console.warn('updateQuizCount error (non-critical):', e);
  }
}

`;
  html = html.replace(insertBefore, newFn + insertBefore);
  console.log('Added updateQuizCount() function.');
} else {
  console.log('updateQuizCount() already present.');
}

// ── Step 2: Replace fragile inline call in renderHome ─────────────────────────
// Old:
//   document.getElementById("statQuizCount").textContent=(getAllQuizQuestions().length + (typeof pyqData !== 'undefined' ? pyqData.length : 0)) + "+";
// New: safe call
const oldStatLine = /document\.getElementById\("statQuizCount"\)\.textContent=\(getAllQuizQuestions\(\)\.length[^;]+\)\s*\+\s*"?\+"?;/g;
const newStatLine = 'updateQuizCount(); // MCQ Bank + Quiz Bank';
const replaced = (html.match(oldStatLine)||[]).length;
html = html.replace(oldStatLine, newStatLine);
console.log('Replaced ' + replaced + ' inline statQuizCount update(s) in renderHome.');

// ── Step 3: Call updateQuizCount() after loadCustomQuizBank completes ─────────
// Find: rebuildQuizBank(); at end of loadCustomQuizBank
// Add:  updateQuizCount(); right after
const rebuildCall = 'rebuildQuizBank();\n';
if (!html.includes('rebuildQuizBank();\n  updateQuizCount();')) {
  // Find the last rebuildQuizBank() call (inside loadCustomQuizBank or loadAll)
  const pos = html.lastIndexOf(rebuildCall);
  if (pos > -1) {
    html = html.substring(0, pos + rebuildCall.length) +
           '  updateQuizCount(); // refresh counter after quiz bank loads\n' +
           html.substring(pos + rebuildCall.length);
    console.log('Added updateQuizCount() after last rebuildQuizBank() call.');
  }
}

// ── Step 4: Call updateQuizCount() after pyqData loads from Firebase ──────────
// Find the line where pyqData is set from Firebase in loadAll/init
// Look for: pyqData = ... (from sGet)
const pyqLoadPattern = /pyqData\s*=\s*await\s+sGet\([^)]+\)[^;]*;/g;
const pyqMatches = html.match(pyqLoadPattern);
if (pyqMatches && pyqMatches.length > 0) {
  html = html.replace(pyqLoadPattern, function(match) {
    return match + '\n    updateQuizCount(); // refresh counter after PYQ data loads';
  });
  console.log('Added updateQuizCount() after ' + pyqMatches.length + ' pyqData load(s).');
} else {
  // Alternative: find where pyqData is first loaded
  const pyqSGet = html.indexOf('sGet("bhu:pyqdata")');
  if (pyqSGet > -1) {
    console.log('pyqData loads via bhu:pyqdata at', pyqSGet);
  }
}

// ── Step 5: Save and verify ───────────────────────────────────────────────────
fs.writeFileSync('index.html', html);

const final = fs.readFileSync('index.html', 'utf8');
console.log('\n=== VERIFY ===');
console.log('updateQuizCount defined:', final.includes('function updateQuizCount()'));
console.log('fragile getAllQuizQuestions in renderHome:', final.includes('getAllQuizQuestions().length'));
console.log('updateQuizCount called in renderHome:', final.includes('updateQuizCount(); // MCQ Bank'));
console.log('updateQuizCount called after rebuildQuizBank:', final.includes('updateQuizCount(); // refresh counter after quiz bank'));
console.log('File size after:', (final.length / 1024).toFixed(0), 'KB');
