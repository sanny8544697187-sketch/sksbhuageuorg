const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// 1. Find what tabs exist in quiz section
const quizSection = c.substring(c.indexOf('<section id="quiz"'), c.indexOf('<section id="chat"'));
const tabBtns = quizSection.match(/onclick="setQuizTab\('[^']+'\)"/g)||[];
console.log('== Quiz setQuizTab calls ==');
tabBtns.forEach(t => console.log(t));

// 2. Find quiz-tab-content IDs
const tabContents = quizSection.match(/id="[a-zA-Z]+Tab" class="quiz-tab-content/g)||[];
console.log('\n== Quiz Tab Content IDs ==');
tabContents.forEach(t => console.log(t));

// 3. Find sidebar navigation items
const sidebarHtml = c.substring(c.indexOf('id="mainSidebar"')||c.indexOf('class="sidebar"'), c.indexOf('</aside>'));
const navItems = sidebarHtml.match(/setSection\('[^']+'\)/g)||[];
console.log('\n== Sidebar nav ==');
[...new Set(navItems)].forEach(n => console.log(n));

// 4. Check existing wrong/saved structures  
const wrongQKeys = (c.match(/bhu:wrong[^ "']+/g)||[]);
const savedKeys = (c.match(/bhu:saved[^ "']+/g)||[]);
console.log('\n== Wrong Q keys ==', [...new Set(wrongQKeys)]);
console.log('== Saved keys ==', [...new Set(savedKeys)]);

// 5. Check how questions are structured in QUIZ_BANK
const qbIdx = c.indexOf('const QUIZ_BANK');
console.log('\n== QUIZ_BANK start ==');
console.log(c.substring(qbIdx, qbIdx + 400));
