const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Find QUIZ_BANK properly
const qbIdx = c.indexOf('QUIZ_BANK = {');
if(qbIdx > -1) {
  console.log('QUIZ_BANK structure:');
  console.log(c.substring(qbIdx, qbIdx + 600));
} else {
  const qbIdx2 = c.indexOf('QUIZ_BANK=');
  console.log('QUIZ_BANK alt:');
  console.log(c.substring(qbIdx2, qbIdx2 + 600));
}

// Find getWrongQs / setWrongQs
const wqIdx = c.indexOf('function getWrongQs');
console.log('\n== getWrongQs ==');
console.log(c.substring(wqIdx, wqIdx + 400));

// Find getSavedQs
const sqIdx = c.indexOf('function getSavedQs');
console.log('\n== getSavedQs ==');
console.log(c.substring(sqIdx, sqIdx + 400));

// Find setQuizTab function
const stIdx = c.indexOf('function setQuizTab(');
console.log('\n== setQuizTab ==');
console.log(c.substring(stIdx, stIdx + 600));

// Find quiz tab HTML container
const qTabHtml = c.indexOf('quizTab');
console.log('\n== quizTab html ==');
console.log(c.substring(qTabHtml, qTabHtml + 200));
