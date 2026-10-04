const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Remove the early kgFeaturesInit call in index.html's initAndroidDashboard call
c = c.replace(
  '  setTimeout(() => { if(typeof kgFeaturesInit === "function") kgFeaturesInit(); }, 500);\r\n',
  ''
);
c = c.replace(
  '  setTimeout(() => { if(typeof kgFeaturesInit === "function") kgFeaturesInit(); }, 500);\n',
  ''
);

// Remove the renderTodayStudy line if it's a separate comment-only line
const rtLine = '  if(typeof renderTodayStudy === "function") { renderTodayStudy(); renderContinueLearning && renderContinueLearning(); renderStudyRecommendations && renderStudyRecommendations(); } // re-init QOTD widget with complete quiz bank';
if(c.includes(rtLine + '\r\n')) {
  c = c.replace(rtLine + '\r\n', '');
  console.log('Removed renderTodayStudy inline call (CRLF)');
} else if(c.includes(rtLine + '\n')) {
  c = c.replace(rtLine + '\n', '');
  console.log('Removed renderTodayStudy inline call (LF)');
} else {
  console.log('renderTodayStudy line not found or already removed');
}

// Verify kgFeaturesInit references remaining
const refs = [...c.matchAll(/kgFeaturesInit/g)];
console.log('kgFeaturesInit references in index.html:', refs.length);
refs.forEach(m => console.log('  at', m.index, ':', c.substring(m.index, m.index+80)));

fs.writeFileSync('index.html', c);
console.log('Done.');
