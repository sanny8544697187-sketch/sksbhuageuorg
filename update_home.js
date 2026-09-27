const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// 1. Update the QOTD Widget header to include "Daily Challenge", Streak, and "Start Today's Challenge" button
const oldQotdHtml = `<div>
          <div style="font-weight:800;font-size:15px;color:#0F3D23;">📌 Question of the Day</div>
          <div style="font-size:12px;color:#777;margin-top:2px;">Test your knowledge instantly</div>
        </div>
        <div style="font-size:28px;">🎯</div>`;

const newQotdHtml = `<div>
          <div style="font-weight:800;font-size:15px;color:#0F3D23;">📌 Daily Challenge</div>
          <div style="font-size:12px;color:#777;margin-top:2px;">🔥 Streak: <strong id="qotdStreakBadge" style="color:#f59e0b;">0 Days</strong></div>
        </div>
        <button class="btn btn-primary" style="padding:6px 14px;font-size:11px;" onclick="setSection('quiz');setTimeout(()=>setQuizTab('daily'),100);">Start Today's Challenge 🎯</button>`;

c = c.replace(oldQotdHtml, newQotdHtml);

// 2. Add qotdStreakBadge update in initAndroidDashboard()
const oldStreakUpdate = `if(streakEl) streakEl.textContent = getDailyStreak();
    } else {`;
const newStreakUpdate = `if(streakEl) streakEl.textContent = getDailyStreak();
      const qsBadge = document.getElementById("qotdStreakBadge");
      if(qsBadge) qsBadge.textContent = getDailyStreak() + " Days";
    } else {`;
c = c.replace(oldStreakUpdate, newStreakUpdate);

const oldStreakUpdate0 = `if(streakEl) streakEl.textContent = "0";
    }`;
const newStreakUpdate0 = `if(streakEl) streakEl.textContent = "0";
      const qsBadge = document.getElementById("qotdStreakBadge");
      if(qsBadge) qsBadge.textContent = "0 Days";
    }`;
c = c.replace(oldStreakUpdate0, newStreakUpdate0);

// 3. Update statQuizCount to include PYQ questions
// Currently: document.getElementById("statQuizCount").textContent=Object.values(QUIZ_BANK).reduce((s, arr) => s + arr.length, 0) + "+";
// Change to: document.getElementById("statQuizCount").textContent=(getAllQuizQuestions().length + (typeof pyqData !== 'undefined' ? pyqData.length : 0)) + "+";
const oldQuizCount = `document.getElementById("statQuizCount").textContent=Object.values(QUIZ_BANK).reduce((s, arr) => s + arr.length, 0) + "+";`;
const newQuizCount = `document.getElementById("statQuizCount").textContent=(getAllQuizQuestions().length + (typeof pyqData !== 'undefined' ? pyqData.length : 0)) + "+";`;
c = c.replace(oldQuizCount, newQuizCount);

fs.writeFileSync('index.html', c);
console.log('done.');
