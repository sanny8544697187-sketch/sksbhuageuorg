// ══════════════════════════════════════════════════════════════════════
// KRISHIGYAN ENGAGEMENT SYSTEM  v1.0
// Modules: 1-Daily Quiz+Streak  2-XP+Levels+Badges  3-Progress Dashboard
//          4-Leaderboard        5-Challenge+Share     6-Referral
//          7-Notifications      8-Exam Countdown      9-Daily Goals
// ══════════════════════════════════════════════════════════════════════

// ─── CONSTANTS ────────────────────────────────────────────────────────
const ENG = {
  DAILY_QUIZ_XP  : 10,
  BONUS_QUIZ_XP  : 5,
  STREAK_7_XP    : 50,
  STREAK_30_XP   : 100,
  REFERRAL_XP    : 50,
  CHALLENGE_XP   : 10,
  NOTE_READ_XP   : 2,
  LEVELS: [
    { min:0,    max:199,  name:"🌱 Seedling",       color:"#A5D6A7" },
    { min:200,  max:499,  name:"🌿 Sprout",          color:"#66BB6A" },
    { min:500,  max:999,  name:"🌾 Agri Explorer",   color:"#FFA726" },
    { min:1000, max:1999, name:"🌳 Agri Scholar",    color:"#26A69A" },
    { min:2000, max:9999, name:"🏆 KrishiGyan Master",color:"#5C6BC0" },
  ],
  BADGES: [
    { id:"first_quiz",     icon:"🎯", label:"First Quiz",      cond:s => s.quizCount >= 1 },
    { id:"quiz_5",         icon:"📚", label:"5 Quizzes",       cond:s => s.quizCount >= 5 },
    { id:"quiz_10",        icon:"🏆", label:"10 Quizzes",      cond:s => s.quizCount >= 10 },
    { id:"accuracy_80",    icon:"⭐", label:"Top Scorer",      cond:s => s.accuracy >= 80 },
    { id:"streak_7",       icon:"🔥", label:"7-Day Streak",    cond:s => s.streak >= 7 },
    { id:"streak_14",      icon:"🔥", label:"14-Day Streak",   cond:s => s.streak >= 14 },
    { id:"streak_30",      icon:"🔥", label:"30-Day Streak",   cond:s => s.streak >= 30 },
    { id:"streak_100",     icon:"👑", label:"100-Day Streak",  cond:s => s.streak >= 100 },
    { id:"questions_100",  icon:"🎯", label:"100 Questions",   cond:s => s.totalQ >= 100 },
    { id:"questions_500",  icon:"🎯", label:"500 Questions",   cond:s => s.totalQ >= 500 },
    { id:"referral_5",     icon:"🤝", label:"5 Friends Invited",cond:s => s.referrals >= 5 },
    { id:"xp_1000",        icon:"💎", label:"1000 XP",         cond:s => s.xp >= 1000 },
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────
function engUser() { return window.currentUser || null; }
function today()   { return new Date().toISOString().split("T")[0]; }

function getEngData(email) {
  try { return JSON.parse(localStorage.getItem("bhu:eng:" + email) || "{}"); } catch{ return {}; }
}
function setEngData(email, d) {
  localStorage.setItem("bhu:eng:" + email, JSON.stringify(d));
}

function eng_emptyStats() {
  return { xp:0, quizCount:0, totalQ:0, totalCorrect:0, streak:0, bestStreak:0,
           lastDate:"", referrals:0, badges:[], dailyDone:false, dailyDate:"",
           goals:{ quiz:false, topic:false, pyq:false }, goalsDate:"" };
}

function getStats() {
  const u = engUser(); if(!u) return eng_emptyStats();
  const d = getEngData(u.email);
  // Migrate legacy streak
  if(!d.streak) {
    try {
      const old = JSON.parse(localStorage.getItem("bhu:streak") || "{}");
      const ud = old[u.email] || {};
      d.streak = ud.streak || 0;
      d.bestStreak = ud.best || 0;
      d.lastDate = ud.lastDate || "";
    } catch{}
  }
  // Migrate legacy quizStats
  if(!d.quizCount) {
    try {
      const old = JSON.parse(localStorage.getItem("bhu:quizStats") || "{}");
      const ud = old[u.email] || {};
      d.quizCount = ud.quizCount || 0;
      d.totalQ = ud.totalQ || 0;
      d.totalCorrect = ud.totalCorrect || 0;
    } catch{}
  }
  return { ...eng_emptyStats(), ...d };
}

function saveStats(d) {
  const u = engUser(); if(!u) return;
  setEngData(u.email, d);
  // Keep legacy streak in sync so existing code still works
  try {
    let old = JSON.parse(localStorage.getItem("bhu:streak") || "{}");
    old[u.email] = { streak: d.streak, best: d.bestStreak, lastDate: d.lastDate };
    localStorage.setItem("bhu:streak", JSON.stringify(old));
  } catch{}
}

function getLevelInfo(xp) {
  const lvls = ENG.LEVELS;
  for(let i = lvls.length-1; i >= 0; i--) {
    if(xp >= lvls[i].min) {
      const next = lvls[i+1];
      return { ...lvls[i], xp, nextXP: next ? next.min : lvls[i].max, progress: next ? Math.round((xp - lvls[i].min) / (next.min - lvls[i].min) * 100) : 100, levelIndex: i };
    }
  }
  return { ...lvls[0], xp, nextXP: lvls[1].min, progress: 0, levelIndex: 0 };
}

function checkBadges(stats) {
  const newBadges = [];
  ENG.BADGES.forEach(b => {
    if(!(stats.badges||[]).includes(b.id) && b.cond(stats)) {
      newBadges.push(b.id);
    }
  });
  if(newBadges.length) {
    stats.badges = [...(stats.badges||[]), ...newBadges];
    newBadges.forEach(id => {
      const b = ENG.BADGES.find(x => x.id === id);
      if(b) showEngToast(`🏅 New Badge: ${b.icon} ${b.label}!`, "badge");
    });
  }
}

function showEngToast(msg, type = "success") {
  // Use existing toast or create our own
  if(typeof toast === "function") { toast(msg); return; }
  const div = document.createElement("div");
  div.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#0F3D23;color:#fff;padding:10px 18px;border-radius:20px;font-size:13px;font-weight:700;z-index:9999;animation:fadeInUp .3s ease;`;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// ─── MODULE 1: XP AWARD ───────────────────────────────────────────────
function awardXP(amount, reason) {
  const u = engUser(); if(!u) return;
  const s = getStats();
  s.xp = (s.xp || 0) + amount;
  checkBadges(s);
  saveStats(s);
  // Sync XP to Firebase
  try {
    if(window.sSet) window.sSet("bhu:eng:" + u.email, s).catch(()=>{});
  } catch{}
  showEngToast(`+${amount} XP · ${reason}`);
  // Refresh UI elements if visible
  refreshEngUI();
  return s.xp;
}

// ─── MODULE 1: STREAK UPDATE ──────────────────────────────────────────
function updateStreak() {
  const u = engUser(); if(!u) return null;
  const s = getStats();
  const t = today();
  if(s.lastDate === t) return s; // already done today
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if(s.lastDate === yesterday) {
    s.streak = (s.streak || 0) + 1;
  } else {
    s.streak = 1;
  }
  s.bestStreak = Math.max(s.bestStreak || 0, s.streak);
  s.lastDate = t;
  // Streak milestone XP
  if(s.streak === 7)  awardXP(ENG.STREAK_7_XP, "7-day streak 🔥");
  if(s.streak === 30) awardXP(ENG.STREAK_30_XP, "30-day streak 👑");
  checkBadges(s);
  saveStats(s);
  return s;
}

// ─── MODULE 1: DAILY QUIZ COMPLETION ─────────────────────────────────
function engFinishDailyQuiz(score, total) {
  const u = engUser(); if(!u) return;
  const s = getStats();
  // XP (one per day)
  if(s.dailyDate !== today()) {
    s.dailyDate = today();
    s.dailyDone = true;
    s.quizCount = (s.quizCount || 0) + 1;
    s.totalQ = (s.totalQ || 0) + total;
    s.totalCorrect = (s.totalCorrect || 0) + score;
    saveStats(s);
    updateStreak();
    awardXP(ENG.DAILY_QUIZ_XP, "Daily Quiz completed");
    // Mark today's goal
    markGoal("quiz");
  }
}

// ─── MODULE 1: RECORD ANY QUIZ ───────────────────────────────────────
function engRecordQuiz(correct, total) {
  const u = engUser(); if(!u) return;
  const s = getStats();
  s.quizCount = (s.quizCount || 0) + 1;
  s.totalQ = (s.totalQ || 0) + total;
  s.totalCorrect = (s.totalCorrect || 0) + correct;
  checkBadges(s);
  saveStats(s);
  awardXP(ENG.BONUS_QUIZ_XP, "Quiz completed");
}

// ─── MODULE 8: DAILY GOALS ───────────────────────────────────────────
function getGoals() {
  const s = getStats();
  const t = today();
  if(s.goalsDate !== t) {
    s.goals = { quiz:false, topic:false, pyq:false };
    s.goalsDate = t;
    saveStats(s);
  }
  return s.goals;
}

function markGoal(key) {
  const u = engUser(); if(!u) return;
  const s = getStats();
  const t = today();
  if(s.goalsDate !== t) { s.goals = { quiz:false, topic:false, pyq:false }; s.goalsDate = t; }
  s.goals[key] = true;
  // Check if all done → bonus XP
  if(s.goals.quiz && s.goals.topic && s.goals.pyq && !s.goalsBonusDate) {
    s.goalsBonusDate = t;
    saveStats(s);
    awardXP(15, "All daily goals completed! 🎉");
  } else {
    saveStats(s);
  }
  renderDailyGoals();
}

// ─── MODULE 6: REFERRAL ───────────────────────────────────────────────
function getRefCode() {
  const u = engUser(); if(!u) return "";
  const raw = (u.email || u.id || "user").split("@")[0].replace(/[^a-z0-9]/gi,"").toUpperCase();
  return "KG" + raw.substring(0,6);
}

function getReferralLink() {
  return "https://krishigyan.online/?ref=" + getRefCode();
}

function checkIncomingReferral() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if(ref && ref !== getRefCode()) {
    sessionStorage.setItem("bhu:incomingRef", ref);
  }
}

function rewardReferrer(refCode) {
  if(!refCode) return;
  // Find referrer in usersDB by their refCode
  const u = engUser(); if(!u) return;
  const users = window.usersDB || [];
  users.forEach(user => {
    const rc = "KG" + (user.email||"").split("@")[0].replace(/[^a-z0-9]/gi,"").toUpperCase().substring(0,6);
    if(rc === refCode && user.email !== u.email) {
      // Award XP to referrer via their eng data
      let s = {};
      try { s = JSON.parse(localStorage.getItem("bhu:eng:" + user.email) || "{}"); } catch{}
      s.xp = (s.xp || 0) + ENG.REFERRAL_XP;
      s.referrals = (s.referrals || 0) + 1;
      localStorage.setItem("bhu:eng:" + user.email, JSON.stringify(s));
      if(window.sSet) window.sSet("bhu:eng:" + user.email, s).catch(()=>{});
    }
  });
}

// ─── MODULE 5: WHATSAPP SHARE ─────────────────────────────────────────
function shareViaWhatsApp(text, url) {
  const msg = encodeURIComponent(text + "\n\n" + (url || "https://krishigyan.online/"));
  window.open("https://wa.me/?text=" + msg, "_blank");
}

function shareQuizResult(score, total, subj) {
  const pct = Math.round(score/total*100);
  const text = `🌱 I just scored ${score}/${total} (${pct}%) on KrishiGyan${subj ? " · " + subj : ""}!\n\nCan you beat me? 😎🔥\n\n📚 India's #1 Agriculture Learning App`;
  if(navigator.share) {
    navigator.share({ title:"KrishiGyan Quiz Result", text, url:"https://krishigyan.online/" }).catch(()=> shareViaWhatsApp(text));
  } else {
    shareViaWhatsApp(text);
  }
}

function shareStreak(streak) {
  const text = `🔥 I'm on a ${streak}-day learning streak on KrishiGyan!\n\nJoin me in mastering Agriculture 🌾\n📚 Daily Quizzes | Notes | PYQs`;
  if(navigator.share) {
    navigator.share({ title:"KrishiGyan Streak", text, url: getReferralLink() }).catch(()=> shareViaWhatsApp(text, getReferralLink()));
  } else {
    shareViaWhatsApp(text, getReferralLink());
  }
}

// ─── MODULE 4: LEADERBOARD ───────────────────────────────────────────
function getEngLeaderboard(period) {
  const users = window.usersDB || [];
  const today_d = today();
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay()); const weekKey = weekStart.toISOString().split("T")[0];
  const monthKey = today_d.substring(0,7);

  return users.map(u => {
    let s = {};
    try { s = JSON.parse(localStorage.getItem("bhu:eng:" + u.email) || "{}"); } catch{}
    // Merge legacy
    try {
      if(!s.xp) {
        const qs = JSON.parse(localStorage.getItem("bhu:quizStats") || "{}");
        const ud = qs[u.email] || {};
        s.xp = (ud.totalCorrect || 0) * 2;
        s.totalCorrect = ud.totalCorrect || 0;
        s.quizCount = ud.quizCount || 0;
      }
    } catch{}
    const sk = (() => { try { return (JSON.parse(localStorage.getItem("bhu:streak")||"{}")[u.email]||{}).streak||0; } catch{ return 0; }})();
    return {
      name: u.name || "Student",
      email: u.email,
      college: u.institution || u.college || "",
      year: u.year || "",
      xp: s.xp || 0,
      streak: sk,
      quizCount: s.quizCount || 0,
      accuracy: s.totalQ ? Math.round((s.totalCorrect||0)/s.totalQ*100) : 0,
    };
  }).sort((a,b) => b.xp - a.xp);
}

// ─── MODULE 3: PROGRESS DASHBOARD ────────────────────────────────────
function getSubjectAccuracy() {
  const u = engUser(); if(!u) return {};
  try {
    const ss = JSON.parse(localStorage.getItem("bhu:subjectStats") || "{}");
    return ss[u.email] || {};
  } catch { return {}; }
}

function getWeakSubjects() {
  const sa = getSubjectAccuracy();
  return Object.entries(sa)
    .map(([subj, st]) => ({ subj, acc: st.total ? Math.round(st.correct/st.total*100) : 0 }))
    .sort((a,b) => a.acc - b.acc)
    .slice(0, 5);
}

// ─── UI RENDERERS ─────────────────────────────────────────────────────

function refreshEngUI() {
  renderEngStreakCard();
  renderEngXPBar();
  renderDailyGoals();
  renderEngBadges();
}

function renderEngStreakCard() {
  const el = document.getElementById("engStreakCard");
  if(!el) return;
  const u = engUser();
  const s = u ? getStats() : eng_emptyStats();
  const streak = s.streak || 0;
  const best   = s.bestStreak || 0;
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <div>
        <div style="font-weight:900;font-size:28px;color:#f59e0b;line-height:1;">🔥${streak}</div>
        <div style="font-weight:700;font-size:13px;color:#0F3D23;">Day Streak</div>
        <div style="font-size:11px;color:#777;margin-top:2px;">Best: ${best} days</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${[7,14,30,100].map(n => `<div style="text-align:center;opacity:${streak>=n?1:0.3};">
          <div style="font-size:18px;">${streak>=n?'🔥':'⬜'}</div>
          <div style="font-size:9px;font-weight:700;color:#0F3D23;">${n}d</div>
        </div>`).join("")}
      </div>
      ${streak > 0 ? `<button class="btn btn-light" style="font-size:11px;padding:5px 12px;" onclick="shareStreak(${streak})">Share 🔥</button>` : ""}
    </div>`;
}

function renderEngXPBar() {
  const el = document.getElementById("engXPBar");
  if(!el) return;
  const u = engUser();
  const s = u ? getStats() : eng_emptyStats();
  const lv = getLevelInfo(s.xp || 0);
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <div style="font-weight:800;font-size:14px;">${lv.name}</div>
      <div style="font-size:12px;color:#777;">${s.xp||0} / ${lv.nextXP} XP</div>
    </div>
    <div style="background:#E8F5E9;border-radius:20px;height:10px;overflow:hidden;">
      <div style="background:${lv.color};height:100%;width:${lv.progress}%;border-radius:20px;transition:width .5s ease;"></div>
    </div>
    <div style="font-size:10px;color:#777;margin-top:4px;">${lv.progress}% to next level</div>`;
}

function renderDailyGoals() {
  const el = document.getElementById("engDailyGoals");
  if(!el) return;
  const u = engUser();
  if(!u) { el.innerHTML = `<div style="color:#777;font-size:13px;text-align:center;padding:10px;">Login to track daily goals</div>`; return; }
  const goals = getGoals();
  const all_done = goals.quiz && goals.topic && goals.pyq;
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${[
        { key:"quiz",  icon:"🎯", label:"Complete Daily Quiz",  done:goals.quiz,  action:"setSection('quiz');setTimeout(()=>setQuizTab('daily'),60)" },
        { key:"topic", icon:"📚", label:"Revise one resource",  done:goals.topic, action:"setSection('subjects');setTimeout(()=>setSubjectsTab('resources'),60)" },
        { key:"pyq",   icon:"📖", label:"Attempt 10 PYQs",      done:goals.pyq,   action:"setSection('pyq')" },
      ].map(g => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:${g.done?'#E8F5E9':'#F8FBF8'};border-radius:10px;cursor:pointer;" onclick="${g.action}">
          <div style="font-size:18px;">${g.done?'✅':g.icon}</div>
          <div style="font-size:13px;font-weight:600;color:${g.done?'#0F3D23':'#333'};flex:1;${g.done?'text-decoration:line-through;opacity:.7':''}">${g.label}</div>
          ${!g.done ? `<div style="font-size:11px;color:#00B050;font-weight:700;">GO →</div>` : ""}
        </div>`).join("")}
      ${all_done ? `<div style="text-align:center;padding:8px;background:linear-gradient(90deg,#E8F5E9,#F8FBF8);border-radius:10px;font-weight:700;font-size:13px;color:#0F3D23;">🎉 All Goals Complete! +15 XP Bonus</div>` : `<div style="font-size:11px;color:#777;text-align:center;">${[goals.quiz,goals.topic,goals.pyq].filter(Boolean).length}/3 completed · Complete all for bonus XP</div>`}
    </div>`;
}

function renderEngBadges() {
  const el = document.getElementById("engBadgesPanel");
  if(!el) return;
  const u = engUser();
  const s = u ? getStats() : eng_emptyStats();
  const earned = s.badges || [];
  el.innerHTML = ENG.BADGES.map(b => `
    <div title="${b.label}" style="text-align:center;padding:8px;background:${earned.includes(b.id)?'#E8F5E9':'#F0F0F0'};border-radius:10px;opacity:${earned.includes(b.id)?1:.35};">
      <div style="font-size:22px;">${b.icon}</div>
      <div style="font-size:9px;font-weight:700;margin-top:2px;color:#333;">${b.label}</div>
    </div>`).join("");
}

function renderProgressDashboard() {
  const el = document.getElementById("engProgressPanel");
  if(!el) return;
  const u = engUser();
  if(!u) { el.innerHTML = `<div style="text-align:center;padding:20px;color:#777;">Login to see your progress</div>`; return; }
  const s = getStats();
  const lv = getLevelInfo(s.xp || 0);
  const weak = getWeakSubjects();
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px;">
      ${[
        ["🎯","Quizzes Done", s.quizCount||0],
        ["❓","Questions",    s.totalQ||0],
        ["✅","Accuracy",     s.totalQ?Math.round((s.totalCorrect||0)/s.totalQ*100)+"%" : "—"],
        ["🔥","Streak",       (s.streak||0)+" days"],
        ["⭐","XP Earned",    s.xp||0],
        ["🏅","Badges",       (s.badges||[]).length+"/"+ENG.BADGES.length],
      ].map(([icon,label,val]) => `
        <div style="background:#F8FBF8;border-radius:12px;padding:12px;text-align:center;">
          <div style="font-size:20px;">${icon}</div>
          <div style="font-weight:800;font-size:16px;color:#0F3D23;">${val}</div>
          <div style="font-size:10px;color:#777;">${label}</div>
        </div>`).join("")}
    </div>
    ${weak.length ? `
    <div style="margin-bottom:14px;">
      <div style="font-weight:700;font-size:13px;margin-bottom:8px;color:#0F3D23;">📊 Subject Performance</div>
      ${weak.map(w => `
        <div style="margin-bottom:7px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">
            <span>${w.subj}</span>
            <span style="font-weight:700;color:${w.acc>=70?'#00B050':w.acc>=40?'#f59e0b':'#E53935'};">${w.acc}%</span>
          </div>
          <div style="background:#E0E0E0;border-radius:10px;height:6px;">
            <div style="background:${w.acc>=70?'#00B050':w.acc>=40?'#f59e0b':'#E53935'};height:100%;width:${w.acc}%;border-radius:10px;"></div>
          </div>
        </div>`).join("")}
      <button class="btn btn-primary" style="margin-top:8px;width:100%;font-size:12px;" onclick="openRevisionPlan()">📖 Start Revision Plan</button>
    </div>` : ""}`;
}

function openRevisionPlan() {
  const weak = getWeakSubjects();
  if(!weak.length) { showEngToast("Complete more quizzes first!"); return; }
  const subj = weak[0].subj;
  if(typeof setSection === "function") {
    setSection("quiz");
    setTimeout(() => { if(typeof setQuizTab === "function") setQuizTab("daily"); }, 100);
    showEngToast(`📖 Focus on: ${subj} (${weak[0].acc}% accuracy)`);
  }
}

function renderEngLeaderboard() {
  const el = document.getElementById("engLeaderboardPanel");
  if(!el) return;
  const u = engUser();
  const lb = getEngLeaderboard("all").slice(0, 20);
  if(!lb.length) { el.innerHTML = `<div style="text-align:center;padding:20px;color:#777;">No users yet!</div>`; return; }
  const medals = ["🥇","🥈","🥉"];
  el.innerHTML = lb.map((row, i) => {
    const isMe = u && row.email === u.email;
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:${isMe?'#E8F5E9':'#fff'};border-radius:12px;margin-bottom:6px;border:${isMe?'2px solid #00B050':'1px solid #F0F5F0'};">
      <div style="font-size:18px;min-width:28px;text-align:center;">${i<3?medals[i]:i+1}</div>
      <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#1565C0,#42A5F5);display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;font-weight:800;flex-shrink:0;">${(row.name||"?")[0].toUpperCase()}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${row.name}${isMe?" · You":""}</div>
        <div style="font-size:10px;color:#777;">${row.quizCount} quizzes · 🔥${row.streak}</div>
      </div>
      <div style="font-weight:800;font-size:14px;color:#0F3D23;">${row.xp} XP</div>
    </div>`;
  }).join("");
}

function renderReferralCard() {
  const el = document.getElementById("engReferralCard");
  if(!el) return;
  const u = engUser();
  if(!u) { el.innerHTML = `<div style="color:#777;text-align:center;font-size:13px;padding:10px;">Login to get your referral link</div>`; return; }
  const s = getStats();
  const link = getReferralLink();
  el.innerHTML = `
    <div style="margin-bottom:10px;display:flex;gap:12px;">
      <div style="text-align:center;flex:1;background:#E8F5E9;border-radius:10px;padding:10px;">
        <div style="font-weight:800;font-size:20px;color:#0F3D23;">${s.referrals||0}</div>
        <div style="font-size:10px;color:#777;">Friends Invited</div>
      </div>
      <div style="text-align:center;flex:1;background:#FFF8E1;border-radius:10px;padding:10px;">
        <div style="font-weight:800;font-size:20px;color:#f59e0b;">${(s.referrals||0)*ENG.REFERRAL_XP}</div>
        <div style="font-size:10px;color:#777;">XP Earned</div>
      </div>
    </div>
    <div style="background:#F8FBF8;border-radius:10px;padding:8px 12px;font-size:11px;color:#555;word-break:break-all;margin-bottom:8px;">${link}</div>
    <div style="display:flex;gap:6px;">
      <button class="btn btn-primary" style="flex:1;font-size:12px;" onclick="shareReferral()">📲 Invite Friend</button>
      <button class="btn btn-light" style="font-size:12px;padding:8px 12px;" onclick="copyRefLink()">📋 Copy</button>
    </div>`;
}

function shareReferral() {
  const link = getReferralLink();
  const text = `🌱 Join me on KrishiGyan — India's #1 Agriculture Learning App!\n\n📚 Daily Quizzes | Notes | PYQs | ICAR JRF Prep\n\n🎓 Join free:`;
  if(navigator.share) {
    navigator.share({ title:"Join KrishiGyan", text, url: link }).catch(()=> shareViaWhatsApp(text, link));
  } else {
    shareViaWhatsApp(text, link);
  }
}

function copyRefLink() {
  const link = getReferralLink();
  if(navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => showEngToast("Link copied! 📋"));
  } else {
    const el = document.createElement("textarea");
    el.value = link;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showEngToast("Link copied! 📋");
  }
}

// ─── MODULE 8: EXAM COUNTDOWN ─────────────────────────────────────────
const DEFAULT_EXAMS = [
  { id:"icar_pg",  name:"ICAR PG",  date:"2026-04-15" },
  { id:"icar_jrf", name:"ICAR JRF", date:"2026-12-10" },
  { id:"ibps_afo", name:"IBPS AFO", date:"2027-02-01" },
  { id:"upsc_agri",name:"UPSC Agri",date:"2026-10-15" },
];

function getExams() {
  try {
    const saved = JSON.parse(localStorage.getItem("bhu:examDates") || "[]");
    return saved.length ? saved : DEFAULT_EXAMS;
  } catch { return DEFAULT_EXAMS; }
}

function renderExamCountdown() {
  const el = document.getElementById("engExamCountdown");
  if(!el) return;
  const exams = getExams();
  const now = Date.now();
  el.innerHTML = exams.map(ex => {
    const diff = new Date(ex.date).getTime() - now;
    const days = diff > 0 ? Math.ceil(diff / 86400000) : 0;
    const color = days < 30 ? "#E53935" : days < 90 ? "#f59e0b" : "#00B050";
    return `<div style="background:#F8FBF8;border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <div style="text-align:center;background:${color};color:#fff;border-radius:10px;padding:6px 10px;min-width:52px;">
        <div style="font-size:20px;font-weight:900;line-height:1;">${days}</div>
        <div style="font-size:9px;font-weight:700;">DAYS</div>
      </div>
      <div>
        <div style="font-weight:700;font-size:14px;">🎯 ${ex.name}</div>
        <div style="font-size:11px;color:#777;">${new Date(ex.date).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>
      </div>
    </div>`;
  }).join("");
}

// ─── MODULE 7: NOTIFICATIONS ──────────────────────────────────────────
const ENG_NOTIF_PREFS_KEY = "bhu:notifPrefs";

function getNotifPrefs() {
  try { return JSON.parse(localStorage.getItem(ENG_NOTIF_PREFS_KEY) || "{}"); } catch { return {}; }
}

function saveNotifPrefs(prefs) {
  localStorage.setItem(ENG_NOTIF_PREFS_KEY, JSON.stringify(prefs));
}

async function requestNotifPermission() {
  if(!("Notification" in window)) return false;
  if(Notification.permission === "granted") return true;
  if(Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function sendLocalNotif(title, body, icon) {
  if(!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: icon || "/icons/icon-192.png", badge: "/icons/icon-192.png" });
  } catch{}
}

function scheduleDailyReminder() {
  if(!("Notification" in window) || Notification.permission !== "granted") return;
  const prefs = getNotifPrefs();
  if(prefs.daily === false) return;
  // Schedule for 7PM daily
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0);
  if(next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  const key = "bhu:notifSched";
  // Don't double-schedule
  const last = localStorage.getItem(key);
  if(last === today()) return;
  setTimeout(() => {
    const u = engUser();
    if(!u) return;
    const s = getStats();
    const streak = s.streak || 0;
    const title = "🌱 KrishiGyan Daily Quiz";
    const body = streak > 0 ? `🔥 Don't break your ${streak}-day streak! Today's quiz is live.` : "Today's Daily Quiz is live! Can you score 10/10? 🎯";
    sendLocalNotif(title, body);
    localStorage.setItem(key, today());
  }, delay);
}

function renderNotifSettings() {
  const el = document.getElementById("engNotifSettings");
  if(!el) return;
  const prefs = getNotifPrefs();
  const notifItems = [
    { key:"daily",   label:"Daily Quiz Reminder",       desc:"Get notified when today's quiz is ready" },
    { key:"streak",  label:"Streak Reminder",            desc:"Don't forget to maintain your streak" },
    { key:"notes",   label:"New Notes Added",            desc:"When new study material is uploaded" },
    { key:"quiz",    label:"New Quiz Questions",         desc:"When new MCQs or PYQs are added" },
    { key:"updates", label:"KrishiGyan Updates",         desc:"Important app updates and announcements" },
  ];
  const hasPermission = "Notification" in window && Notification.permission === "granted";
  el.innerHTML = `
    ${!hasPermission ? `<div style="background:#FFF3E0;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:12px;display:flex;align-items:center;gap:10px;">
      <span>🔔</span>
      <div style="flex:1;">Enable notifications to get daily reminders.</div>
      <button class="btn btn-primary" style="font-size:11px;padding:5px 10px;" onclick="engEnableNotifs()">Enable</button>
    </div>` : ""}
    ${notifItems.map(item => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #F0F5F0;">
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:600;">${item.label}</div>
          <div style="font-size:11px;color:#777;">${item.desc}</div>
        </div>
        <label style="position:relative;display:inline-block;width:40px;height:22px;flex-shrink:0;">
          <input type="checkbox" ${prefs[item.key]!==false?'checked':''} onchange="engToggleNotif('${item.key}',this.checked)" style="opacity:0;width:0;height:0;">
          <span style="position:absolute;cursor:pointer;inset:0;background:${prefs[item.key]!==false?'#00B050':'#ccc'};border-radius:22px;transition:.3s;">
            <span style="position:absolute;height:16px;width:16px;left:${prefs[item.key]!==false?'21':'3'}px;bottom:3px;background:#fff;border-radius:50%;transition:.3s;"></span>
          </span>
        </label>
      </div>`).join("")}`;
}

function engToggleNotif(key, val) {
  const prefs = getNotifPrefs();
  prefs[key] = val;
  saveNotifPrefs(prefs);
  renderNotifSettings();
}

async function engEnableNotifs() {
  const ok = await requestNotifPermission();
  if(ok) {
    showEngToast("✅ Notifications enabled!");
    scheduleDailyReminder();
  } else {
    showEngToast("Please enable in browser settings");
  }
  renderNotifSettings();
}

// ─── HOOK INTO EXISTING QUIZ SYSTEMS ─────────────────────────────────
// Wrap the existing finishDailyTabQuiz to also call our engagement system
const _orig_finishDailyTabQuiz = window.finishDailyTabQuiz;
window.finishDailyTabQuiz = function() {
  if(typeof _orig_finishDailyTabQuiz === "function") _orig_finishDailyTabQuiz();
  // Grab result from existing data
  try {
    const score = window.dqTabQs ? window.dqTabQs.filter((q,i) => window.dqTabAns && window.dqTabAns[i] === q.ans).length : 0;
    const total = window.dqTabQs ? window.dqTabQs.length : 10;
    engFinishDailyQuiz(score, total);
    // Show engagement share panel
    renderEngDailyResult(score, total);
  } catch(e){ console.warn("eng daily hook:", e); }
};

// Wrap finishQuiz (regular quizzes)
const _orig_finishQuiz = window.finishQuiz;
window.finishQuiz = function() {
  if(typeof _orig_finishQuiz === "function") _orig_finishQuiz.apply(this, arguments);
  try {
    const correct = window.quizAns ? window.quizAns.filter((a,i) => a === (window.quizQs[i]||{}).ans).length : 0;
    const total = window.quizQs ? window.quizQs.length : 0;
    if(total > 0) engRecordQuiz(correct, total);
  } catch(e){ console.warn("eng quiz hook:", e); }
};

function renderEngDailyResult(score, total) {
  const el = document.getElementById("engDailyResultPanel");
  if(!el) return;
  const u = engUser();
  const s = u ? getStats() : eng_emptyStats();
  const pct = Math.round(score/total*100);
  el.style.display = "block";
  el.innerHTML = `
    <div style="text-align:center;padding:20px;background:linear-gradient(135deg,#E8F5E9,#F8FBF8);border-radius:16px;margin-top:16px;">
      <div style="font-size:40px;margin-bottom:8px;">${pct>=80?"🎉":pct>=60?"👍":"📖"}</div>
      <div style="font-weight:900;font-size:22px;color:#0F3D23;">Challenge Completed!</div>
      <div style="font-size:16px;font-weight:700;color:#333;margin:8px 0;">${score}/${total} · ${pct}%</div>
      <div style="display:flex;justify-content:center;gap:16px;margin:12px 0;flex-wrap:wrap;">
        <div style="background:#fff;border-radius:10px;padding:8px 16px;text-align:center;">
          <div style="font-weight:800;color:#00B050;">+${ENG.DAILY_QUIZ_XP} XP</div>
          <div style="font-size:10px;color:#777;">XP Earned</div>
        </div>
        <div style="background:#fff;border-radius:10px;padding:8px 16px;text-align:center;">
          <div style="font-weight:800;color:#f59e0b;">🔥 ${s.streak} Days</div>
          <div style="font-size:10px;color:#777;">Streak</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
        <button class="btn btn-primary" onclick="shareQuizResult(${score},${total},'Daily Quiz')">📲 Share Result</button>
        <button class="btn btn-light" onclick="shareStreak(${s.streak||0})">🔥 Share Streak</button>
        <button class="btn btn-light" onclick="shareReferral()">🎁 Invite Friend</button>
      </div>
    </div>`;
}

// ─── HOMEPAGE ENGAGEMENT WIDGETS ──────────────────────────────────────
// Called when home section renders — inject engagement cards if elements exist
function injectHomepageEngagement() {
  const el = document.getElementById("androidDashboard");
  if(!el || el.getAttribute("data-eng-injected")) return;
  el.setAttribute("data-eng-injected", "true");
  refreshEngUI();
}

// ─── INIT ─────────────────────────────────────────────────────────────
function engInit() {
  checkIncomingReferral();
  // Check if referred user is new and reward referrer after signup
  const ref = sessionStorage.getItem("bhu:incomingRef");
  if(ref && engUser()) {
    const s = getStats();
    if(!s.refProcessed) {
      s.refProcessed = true;
      saveStats(s);
      rewardReferrer(ref);
      sessionStorage.removeItem("bhu:incomingRef");
    }
  }
  refreshEngUI();
  scheduleDailyReminder();
  // Ask for notification permission after 30 seconds of use
  setTimeout(() => {
    if("Notification" in window && Notification.permission === "default") {
      const u = engUser();
      if(u) requestNotifPermission();
    }
  }, 30000);
}

// Run init when DOM is ready
if(document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", engInit);
} else {
  engInit();
}

// Export key functions for global access
window.awardXP = awardXP;
window.engRecordQuiz = engRecordQuiz;
window.engFinishDailyQuiz = engFinishDailyQuiz;
window.shareQuizResult = shareQuizResult;
window.shareStreak = shareStreak;
window.shareReferral = shareReferral;
window.copyRefLink = copyRefLink;
window.markGoal = markGoal;
window.renderProgressDashboard = renderProgressDashboard;
window.renderEngLeaderboard = renderEngLeaderboard;
window.renderExamCountdown = renderExamCountdown;
window.renderNotifSettings = renderNotifSettings;
window.engEnableNotifs = engEnableNotifs;
window.engToggleNotif = engToggleNotif;
window.openRevisionPlan = openRevisionPlan;
window.refreshEngUI = refreshEngUI;
window.renderReferralCard = renderReferralCard;
window.getStats = getStats;
window.getLevelInfo = getLevelInfo;
window.ENG = ENG;
