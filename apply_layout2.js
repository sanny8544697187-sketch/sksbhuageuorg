const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Use regex to remove Exam Countdown
c = c.replace(/<!-- ENG: Exam Countdown -->[\s\S]*?<div id="engExamCountdown"><\/div>\s*<\/div>/, '');

// Use regex to find and extract Streak Card
const streakRegex = /<!-- ENG: Streak \+ XP Card -->[\s\S]*?<div id="engStreakCard"[^>]*>[\s\S]*?<\/div>\s*<div id="engXPBar"><\/div>\s*<\/div>/;
const match = c.match(streakRegex);

if (match) {
    const streakHtml = match[0];
    c = c.replace(streakRegex, ''); // Remove from home
    
    // Insert into quizDailyTab
    const quizDailyTarget = '<div id="quizDailyTab" class="quiz-tab-content active">';
    c = c.replace(quizDailyTarget, quizDailyTarget + '\n    ' + streakHtml + '\n');
    console.log("Streak card moved.");
} else {
    console.log("Could not find streak card with regex.");
}

fs.writeFileSync('index.html', c);
console.log('Done.');
