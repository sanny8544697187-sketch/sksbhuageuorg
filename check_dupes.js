const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const items = [
  'function renderHome()',
  'function renderAll()',
  'let QUIZ_BANK',
  'const BUILTIN_QUIZ_BANK',
  'function getAllQuizQuestions()',
  'function doLogin()',
  'function doRegister()',
  'function renderProfile()',
  '<div class="hero-stats">'
];

items.forEach(item => {
  const count = (html.split(item).length - 1);
  const status = count === 1 ? 'OK      ' : 'DUPE x' + count + ' ';
  console.log(status + ' | ' + item);
});
