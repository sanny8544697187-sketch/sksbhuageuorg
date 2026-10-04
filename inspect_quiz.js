const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');

// Find where quiz data comes from Firebase
const patterns = ['bhu:quizdata', 'bhu:mcq', 'adminQs', 'customQuizBank', 'adminQuiz'];
patterns.forEach(p => {
  const pos = html.indexOf(p);
  if (pos > -1) {
    console.log('=== ' + p + ' at ' + pos + ' ===');
    console.log(html.substring(Math.max(0,pos-80), pos+250));
    console.log();
  }
});

// Find where QUIZ_BANK size is computed
const qbPos = html.indexOf('let QUIZ_BANK = {');
console.log('QUIZ_BANK at:', qbPos);

// Count quiz questions in QUIZ_BANK by counting {q: patterns
const qbContent = html.substring(qbPos, html.indexOf('const BUILTIN_QUIZ_BANK', qbPos));
const qCount = (qbContent.match(/\{q:/g)||[]).length;
console.log('Questions in QUIZ_BANK (builtin):', qCount);

// Find getAllQuizQuestions().length call
const callPos = html.indexOf('getAllQuizQuestions().length');
console.log('\ngetAllQuizQuestions call at:', callPos);
console.log('Context:', html.substring(Math.max(0,callPos-150), callPos+200));

// Find pyqData loading from Firebase
const pyqLoad = html.indexOf('pyqData =');
console.log('\npyqData = assignment at:', pyqLoad);
console.log(html.substring(Math.max(0,pyqLoad-100), pyqLoad+200));
