const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Look at the home section from id="home" onward to find all structural cards in order
const homeStart = c.indexOf('id="home"');
const homeEnd = c.indexOf('id="subjects"');
const homeSection = c.substring(homeStart, homeEnd);

// Find key elements and their positions within home section
const keys = [
  'class="hero"',
  'id="androidDashboard"',
  'gamificationName',
  'ai-widget',
  'Daily Challenge',
  'kgTodayStudy',
  'kgContinueLearning',
  'kgRecommendations',
  'qotdContainer'
];
keys.forEach(k => {
  const i = homeSection.indexOf(k);
  if (i > -1) console.log(`[${k}] relative position: ${i}`);
  else console.log(`[${k}] NOT FOUND in home section`);
});
