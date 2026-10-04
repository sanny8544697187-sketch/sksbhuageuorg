const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Get more quiz section - especially daily tab content
const qStart = c.indexOf('<section id="quiz"');
const qEnd = c.indexOf('<section id="chat"');
const quizHtml = c.substring(qStart, qEnd);

// Find daily tab
const dailyIdx = quizHtml.indexOf('qtab_daily_content');
console.log('== Daily tab content ==');
console.log(quizHtml.substring(dailyIdx, dailyIdx + 2000));
