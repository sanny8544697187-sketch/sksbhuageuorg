const fs = require('fs');
const html = fs.readFileSync('index.html.bak', 'utf8');

// Find ALL major JS functions and HTML sections with positions
const items = [
  'async function doGoogleLogin()',
  'async function doLogin()',
  'async function doRegister()',
  'function renderHome()',
  'function renderAll()',
  'let QUIZ_BANK',
  '<div class="hero-stats">',
  'firebase.initializeApp',
  '</html>',
  '</body>',
  'function openForgotPassword(',
  'async function processGoogleUser',
];

items.forEach(item => {
  let positions = [];
  let idx = 0;
  while (true) {
    const pos = html.indexOf(item, idx);
    if (pos === -1) break;
    positions.push(pos);
    idx = pos + 1;
  }
  console.log(`[${positions.join(', ')}]  ${item}`);
});
