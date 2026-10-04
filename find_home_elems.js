const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Find all occurrences of key home section elements
const markers = [
  'id="home"',
  'ai-widget',
  'Daily Challenge',
  'kgTodayStudy',
  'kgContinueLearning',
  'kgRecommendations',
  'Hello,',
  'qotdContainer'
];
markers.forEach(m => {
  const idx = c.indexOf(m);
  if (idx > -1) {
    console.log(`\n[${m}] at ${idx}:`);
    console.log(c.substring(Math.max(0, idx-50), idx + 150));
  }
});
