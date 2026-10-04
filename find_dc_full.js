const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Find the AI widget HTML block in the home section
const homeStart = c.indexOf('id="home"');
const homeEnd = c.indexOf('id="subjects"');
const homeSection = c.substring(homeStart, homeEnd);

// Look for AI widget class in home HTML
const aiWidgetIdx = homeSection.indexOf('class="ai-widget"');
if(aiWidgetIdx > -1) {
  console.log('ai-widget found at relative:', aiWidgetIdx);
  console.log(homeSection.substring(aiWidgetIdx - 100, aiWidgetIdx + 400));
} else {
  console.log('ai-widget NOT in home section directly');
  // check for the AI ask link
  const askIdx = homeSection.indexOf('Ask Now');
  console.log('Ask Now at:', askIdx);
  if(askIdx > -1) console.log(homeSection.substring(Math.max(0, askIdx-200), askIdx+200));
}

// Find the Daily Challenge card start (the whole card wrapper)
const dcIdx = homeSection.indexOf('Daily Challenge');
console.log('\n\nFull Daily Challenge card context:');
console.log(homeSection.substring(Math.max(0, dcIdx - 300), dcIdx + 100));
