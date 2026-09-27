const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// 1. Add engagement script tag before </body>
c = c.replace('<script src="./representative-system.js"></script>',
  '<script src="./representative-system.js"></script>\n<script src="./engagement-system.js"></script>');

// 2. Inject engagement widgets into the android dashboard (home page)
// Find the qotdContainer div and add our widgets after it
const streakCardWidget = `
    <!-- ENG: Streak + XP Card -->
    <div class="card" style="padding:16px;margin-bottom:14px;">
      <div style="font-weight:800;font-size:14px;color:#0F3D23;margin-bottom:10px;">🔥 Your Streak &amp; Level</div>
      <div id="engStreakCard" style="margin-bottom:12px;"><div style="color:#777;font-size:12px;text-align:center;">Login to track your streak</div></div>
      <div id="engXPBar"></div>
    </div>

    <!-- ENG: Daily Goals -->
    <div class="card" style="padding:16px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div style="font-weight:800;font-size:14px;color:#0F3D23;">📅 Today's Goals</div>
        <div id="engGoalsCount" style="font-size:11px;color:#777;"></div>
      </div>
      <div id="engDailyGoals"></div>
    </div>

    <!-- ENG: Daily Result Panel (hidden until quiz done) -->
    <div id="engDailyResultPanel" style="display:none;"></div>

    <!-- ENG: Exam Countdown -->
    <div class="card" style="padding:16px;margin-bottom:14px;">
      <div style="font-weight:800;font-size:14px;color:#0F3D23;margin-bottom:10px;">🎯 Exam Countdown</div>
      <div id="engExamCountdown"></div>
    </div>

    <!-- ENG: Invite Friends -->
    <div class="card" style="padding:16px;margin-bottom:14px;">
      <div style="font-weight:800;font-size:14px;color:#0F3D23;margin-bottom:10px;">🎁 Invite Friends &amp; Earn XP</div>
      <div id="engReferralCard"></div>
    </div>`;

// Insert after the qotdContainer closing div
c = c.replace(
  '    </div>\n\n    <!-- KrishiGyan AI Widget -->',
  '    </div>\n' + streakCardWidget + '\n\n    <!-- KrishiGyan AI Widget -->'
);

// 3. Add engagement section to profile page — add after profileAchievements section
// Find the profileAchievements usage and after achEl block, add a badges panel
// We'll add an engProfilePanel placeholder near the profile section
const profileBadgePanel = `
    <!-- ENG: Badges Panel -->
    <div class="card" style="padding:18px;margin-bottom:18px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:12px;">🏅 Achievements & Badges</div>
      <div id="engBadgesPanel" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:8px;"></div>
    </div>

    <!-- ENG: Progress Dashboard -->
    <div class="card" style="padding:18px;margin-bottom:18px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:12px;">📊 My Progress</div>
      <div id="engProgressPanel"></div>
    </div>`;

// Insert after the profileAchievements card in profile section HTML
c = c.replace(
  'id="profileAchievements"',
  'id="profileAchievements" data-eng="true"'
);

// Find the closing div of the Achievements card (this is tricky without full context, so we append to profileContent)
// Instead, we'll add it before the closing of profileContent

// Add referral link section to profile
// Find Share App section in profile
const profileShareText = 'id="shareAppLink"';
if(c.includes(profileShareText)) {
  c = c.replace(
    profileShareText,
    'id="shareAppLink" data-eng="profile"'
  );
}

// 4. Add Notification Settings section to Profile
const notifSettings = `
      <!-- ENG: Notification Settings -->
      <div class="card" style="padding:18px;margin-bottom:18px;">
        <div style="font-weight:700;font-size:14px;margin-bottom:12px;">🔔 Notification Settings</div>
        <div id="engNotifSettings"></div>
      </div>`;

// Insert before the profile achievements section
c = c.replace(
  '<!-- Become Representative Card -->',
  notifSettings + '\n      <!-- Become Representative Card -->'
);

// 5. Add Engagement Leaderboard tab to quiz section
// Find the existing leaderboard tab content area and add a "XP" column reference
// Insert our enhanced leaderboard below the existing one
const engLbInsert = `
    <!-- ENG: Enhanced Leaderboard -->
    <div id="engLeaderboardSection" style="display:none;margin-top:16px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:10px;color:#0F3D23;">🏆 XP Leaderboard</div>
      <div id="engLeaderboardPanel"></div>
    </div>`;

// Add XP leaderboard after existing leaderboard list
c = c.replace('id="leaderboardListQ"', 'id="leaderboardListQ" data-eng="lb"');

// 6. Modify renderProfile to also trigger engagement UI
// Find the closing brace of renderProfile and add refreshEngUI call
c = c.replace(
  '  // Representative card\n  const repApplyCard',
  '  // Engagement UI\n  if(typeof refreshEngUI === "function") { refreshEngUI(); renderReferralCard && renderReferralCard(); renderProgressDashboard && renderProgressDashboard(); }\n\n  // Representative card\n  const repApplyCard'
);

// 7. Modify renderHome / initAndroidDashboard to trigger engagement UI
c = c.replace(
  '  renderQuizStart(); // re-render after customQuizBank is fully loaded\n  initAndroidDashboard();',
  '  renderQuizStart(); // re-render after customQuizBank is fully loaded\n  initAndroidDashboard();\n  if(typeof refreshEngUI === "function") { refreshEngUI(); renderExamCountdown && renderExamCountdown(); renderReferralCard && renderReferralCard(); }'
);

// 8. Hook into finishDailyTabQuiz's result screen: add "Share" after existing result
// (Already handled in engagement-system.js via function wrapping)

// 9. Call engInit when user logs in via renderAll
c = c.replace(
  'closeLogin(); toast(`Welcome back',
  'closeLogin(); if(typeof engInit === "function") setTimeout(engInit, 300); toast(`Welcome back'
);

// 10. Expose dqTabQs and dqTabAns to window (needed by engagement hooks)
c = c.replace(
  'let dqTabQs=[],dqTabAns=[];',
  'let dqTabQs=[],dqTabAns=[]; window.dqTabQs=dqTabQs; window.dqTabAns=dqTabAns;'
);

// Also expose quizQs, quizAns
c = c.replace(
  'let quizSubj="",quizQs=[],quizAns=[],quizIdx=0,quizDone=false;',
  'let quizSubj="",quizQs=[],quizAns=[],quizIdx=0,quizDone=false; window.quizQs=quizQs; window.quizAns=quizAns;'
);

fs.writeFileSync('index.html', c);
console.log('Engagement system integrated.');
