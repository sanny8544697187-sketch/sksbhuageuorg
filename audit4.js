const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Find quiz section HTML
const qStart = c.indexOf('<section id="quiz"');
const qEnd = c.indexOf('<section id="chat"');
const quizHtml = c.substring(qStart, qEnd);

// Find the tab buttons container
const tabContainer = quizHtml.indexOf('qtab_quiz');
console.log('== Quiz tab buttons area ==');
console.log(quizHtml.substring(Math.max(0, tabContainer - 100), tabContainer + 1000));
