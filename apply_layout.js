const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// 1. Remove Exam Countdown
const examStart = c.indexOf('<!-- ENG: Exam Countdown -->');
if (examStart !== -1) {
    const examEnd = c.indexOf('</div>', c.indexOf('</div>', c.indexOf('<div id="engExamCountdown">')) + 1) + 6;
    c = c.substring(0, examStart) + c.substring(examEnd);
}

// 2. Move Streak + XP Card to Quiz > Daily section
const streakCardStart = c.indexOf('<!-- ENG: Streak + XP Card -->');
if (streakCardStart !== -1) {
    // Find the end of this card (it has 3 nested divs inside, so it's a bit tricky to find the exact end, let's use exact string matching)
    const exactStreakCard = `<!-- ENG: Streak + XP Card -->
    <div class="card" style="padding:16px;margin-bottom:14px;">
      <div style="font-weight:800;font-size:14px;color:#0F3D23;margin-bottom:10px;">🔥 Your Streak &amp; Level</div>
      <div id="engStreakCard" style="margin-bottom:12px;"><div style="color:#777;font-size:12px;text-align:center;">Login to track your streak</div></div>
      <div id="engXPBar"></div>
    </div>`;
    
    if (c.includes(exactStreakCard)) {
        c = c.replace(exactStreakCard, ''); // Remove from home
        
        // Insert into quizDailyTab
        const quizDailyTarget = '<div id="quizDailyTab" class="quiz-tab-content active">';
        c = c.replace(quizDailyTarget, quizDailyTarget + '\n    ' + exactStreakCard + '\n');
    } else {
        console.log("Could not find exact streak card string to extract.");
    }
}

// 3. Move Hero (KrishiGyan e-learning panel) above Hello User (androidDashboard)
// We'll extract the hero div and place it right before the androidDashboard div
const heroStart = c.indexOf('<div class="hero">');
if (heroStart !== -1) {
    // Find end of hero by counting divs
    let depth = 0;
    let pos = heroStart;
    let heroEnd = -1;
    while(pos < c.length) {
        const nextOpen = c.indexOf('<div', pos);
        const nextClose = c.indexOf('</div', pos);
        if (nextClose === -1) break;
        
        if (nextOpen !== -1 && nextOpen < nextClose) {
            depth++;
            pos = nextOpen + 4;
        } else {
            depth--;
            pos = nextClose + 6;
            if (depth === 0) {
                heroEnd = pos;
                break;
            }
        }
    }
    
    if (heroEnd !== -1) {
        const heroContent = c.substring(heroStart, heroEnd);
        c = c.substring(0, heroStart) + c.substring(heroEnd); // Remove hero from original position
        
        // Find section home start and insert hero right after it
        const homeStart = c.indexOf('<section id="home" class="section active fu">');
        const insertPos = homeStart + '<section id="home" class="section active fu">'.length;
        
        c = c.substring(0, insertPos) + '\n  ' + heroContent + '\n' + c.substring(insertPos);
    }
}

// 4. Remove duplicate qotdStreakBadge from Daily Challenge panel (since it's in Hello User panel)
c = c.replace('<div style="font-size:12px;color:#777;margin-top:2px;">🔥 Streak: <strong id="qotdStreakBadge" style="color:#f59e0b;">0 Days</strong></div>', '<div style="font-size:12px;color:#777;margin-top:2px;">Test your knowledge instantly</div>');

fs.writeFileSync('index.html', c);
console.log('Modifications applied.');
