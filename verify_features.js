const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const checks = [
  'features.js', 'kgTodayStudy', 'kgContinueLearning', 'kgRecommendations',
  'kgBookmarksPanel', 'kgMistakesPanel', 'kgFlashcardsPanel', 'kgKrishiTools',
  'kgPYQAnalyzer', 'kgSearchResults', 'kgsr-group', 'kgFeaturesInit',
  'renderTodayStudy', 'renderKrishiTools', 'renderFlashcards',
];
let pass = 0, fail = 0;
checks.forEach(k => {
  const found = c.includes(k);
  console.log((found ? '✅' : '❌') + ' ' + k);
  found ? pass++ : fail++;
});
console.log(`\n${pass}/${checks.length} checks passed`);
