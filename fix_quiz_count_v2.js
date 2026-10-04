/**
 * fix_quiz_count_v2.js
 * Adds updateQuizCount() calls at the right Firebase load points.
 */
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let changes = 0;

// ── Fix 1: Replace remaining getAllQuizQuestions().length calls ────────────────
const oldCall = /getAllQuizQuestions\(\)\.length/g;
const remaining = (html.match(oldCall)||[]).length;
if (remaining > 0) {
  html = html.replace(oldCall,
    'Object.values(QUIZ_BANK).reduce(function(s,a){return s+a.length;},0)');
  changes += remaining;
  console.log('Replaced ' + remaining + ' remaining getAllQuizQuestions().length call(s).');
}

// ── Fix 2: Add updateQuizCount() after loadCustomQuizBank's rebuildQuizBank() ──
// Target: the rebuildQuizBank() at position ~199367 (inside the await sGet custom bank load)
// Context: "rebuildQuizBank();\r\n\r\n  const mv = await sGet(\"bhu:mcqvotes\");"
const afterCustomBank = 'rebuildQuizBank();\r\n\r\n  const mv = await sGet("bhu:mcqvotes")';
const afterCustomBankLF = 'rebuildQuizBank();\n\n  const mv = await sGet("bhu:mcqvotes")';
if (html.includes(afterCustomBank)) {
  html = html.replace(afterCustomBank,
    'rebuildQuizBank();\r\n  updateQuizCount(); // update counter after Firebase quiz bank loads\r\n\r\n  const mv = await sGet("bhu:mcqvotes")');
  changes++;
  console.log('Added updateQuizCount() after loadCustomQuizBank rebuildQuizBank() [CRLF].');
} else if (html.includes(afterCustomBankLF)) {
  html = html.replace(afterCustomBankLF,
    'rebuildQuizBank();\n  updateQuizCount(); // update counter after Firebase quiz bank loads\n\n  const mv = await sGet("bhu:mcqvotes")');
  changes++;
  console.log('Added updateQuizCount() after loadCustomQuizBank rebuildQuizBank() [LF].');
} else {
  console.log('WARNING: Could not find the loadCustomQuizBank rebuildQuizBank() anchor.');
}

// ── Fix 3: Add updateQuizCount() after pyqData loads from Firebase ─────────────
// Target: "if(pyq) pyqData=pyq;"
const pyqAssign = 'if(pyq) pyqData=pyq;';
if (html.includes(pyqAssign)) {
  html = html.replace(pyqAssign,
    'if(pyq) { pyqData=pyq; updateQuizCount(); } // update counter after PYQ loads');
  changes++;
  console.log('Added updateQuizCount() after pyqData loads from Firebase.');
} else {
  console.log('WARNING: pyqData assign pattern not found.');
}

// ── Fix 4: Also add after admin uploads a new question (rebuildQuizBank at pos 415527) ──
// Context: 'rebuildQuizBank();\r\n  // ✅ FIXED: Only update list & count'
const afterAdminAdd = 'rebuildQuizBank();\r\n  // ✅ FIXED: Only update list';
const afterAdminAddLF = 'rebuildQuizBank();\n  // ✅ FIXED: Only update list';
if (html.includes(afterAdminAdd)) {
  html = html.replace(afterAdminAdd,
    'rebuildQuizBank();\r\n  updateQuizCount(); // refresh stat after admin adds question\r\n  // ✅ FIXED: Only update list');
  changes++;
  console.log('Added updateQuizCount() after admin question add.');
} else if (html.includes(afterAdminAddLF)) {
  html = html.replace(afterAdminAddLF,
    'rebuildQuizBank();\n  updateQuizCount(); // refresh stat after admin adds question\n  // ✅ FIXED: Only update list');
  changes++;
  console.log('Added updateQuizCount() after admin question add [LF].');
}

// ── Save ─────────────────────────────────────────────────────────────────────
fs.writeFileSync('index.html', html);

// ── Final verify ─────────────────────────────────────────────────────────────
const final = fs.readFileSync('index.html', 'utf8');
console.log('\n=== FINAL VERIFY ===');
console.log('updateQuizCount defined:', final.includes('function updateQuizCount()'));
console.log('getAllQuizQuestions().length remaining:', (final.match(/getAllQuizQuestions\(\)\.length/g)||[]).length, '(want 0)');
console.log('updateQuizCount in renderHome:', final.includes('updateQuizCount(); // MCQ Bank'));
console.log('updateQuizCount after Firebase load:', final.includes('updateQuizCount(); // update counter after Firebase'));
console.log('updateQuizCount after pyqData:', final.includes('updateQuizCount(); } // update counter after PYQ'));
console.log('Total changes applied:', changes);
console.log('File size:', (final.length / 1024).toFixed(0), 'KB');
