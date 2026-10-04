const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Check existing sections/tabs
const sections = (c.match(/id="[a-z_-]+" class="section/g)||[]);
console.log('== Sections ==');
sections.forEach(s => console.log(s));

// Check quiz tabs
const quizTabs = (c.match(/id="quiz[A-Za-z]+Tab"/g)||[]);
console.log('\n== Quiz tabs ==');
quizTabs.forEach(t => console.log(t));

// Check profile section
const profileIdx = c.indexOf('<section id="profile"');
console.log('\n== Profile section start ==');
console.log(c.substring(profileIdx, profileIdx + 500));
