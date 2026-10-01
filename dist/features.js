// ══════════════════════════════════════════════════════════════════════
// KRISHIGYAN FEATURES v2.0
// Modules: Wrong Answer Practice | Bookmarks | Continue Learning |
//          Global Search | Flashcards | Krishi Tools | Recommendations |
//          PYQ Analyzer | Today's Study | Admin Quick Actions
// Safe additive — does NOT touch existing data
// ══════════════════════════════════════════════════════════════════════

// ─── UTILITIES ────────────────────────────────────────────────────────
function kgUser() { return window.currentUser || null; }
function kgToday() { return new Date().toISOString().split("T")[0]; }
function kgEscape(s) { return typeof escapeHTML === "function" ? escapeHTML(s) : String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function kgToast(msg) { if(typeof toast === "function") toast(msg); }

// ─── CONTINUE LEARNING TRACKER ────────────────────────────────────────
const CL_KEY = "bhu:continueLearning";

function clRecord(type, id, title, subj, route) {
  const u = kgUser(); if(!u) return;
  const k = CL_KEY + ":" + u.email;
  let items = [];
  try { items = JSON.parse(localStorage.getItem(k) || "[]"); } catch{}
  // Remove duplicate
  items = items.filter(x => !(x.type === type && x.id === id));
  items.unshift({ type, id, title: title || "Untitled", subj: subj || "", route, ts: Date.now() });
  items = items.slice(0, 10); // keep last 10
  localStorage.setItem(k, JSON.stringify(items));
}

function clGet() {
  const u = kgUser(); if(!u) return [];
  try { return JSON.parse(localStorage.getItem(CL_KEY + ":" + u.email) || "[]"); } catch { return []; }
}

// Hook into existing navigation to track PDF/note opens
const _origOpenDrivePreview = window.openDrivePreview;
window.openDrivePreview = function(id, title, type, link) {
  if(typeof _origOpenDrivePreview === "function") _origOpenDrivePreview.apply(this, arguments);
  clRecord("pdf", id, title, "", "setSection('subjects')");
};

// ─── BOOKMARKS ────────────────────────────────────────────────────────
const BM_KEY = "bhu:bookmarks";

function bmGet() {
  const u = kgUser(); if(!u) return [];
  try { return JSON.parse(localStorage.getItem(BM_KEY + ":" + u.email) || "[]"); } catch { return []; }
}
function bmSet(items) {
  const u = kgUser(); if(!u) return;
  localStorage.setItem(BM_KEY + ":" + u.email, JSON.stringify(items));
}

function bmAdd(type, id, title, subj, meta) {
  const u = kgUser();
  if(!u) { kgToast("Login to bookmark!"); return false; }
  let items = bmGet();
  if(items.some(x => x.id === id && x.type === type)) {
    items = items.filter(x => !(x.id === id && x.type === type));
    bmSet(items);
    kgToast("📌 Bookmark removed");
    return false;
  }
  items.unshift({ type, id, title: title || "Untitled", subj: subj || "", meta: meta || {}, ts: Date.now() });
  bmSet(items);
  kgToast("📌 Bookmarked!");
  return true;
}

function bmHas(type, id) {
  return bmGet().some(x => x.id === id && x.type === type);
}

function bmToggleBtn(btn, type, id) {
  if(!btn) return;
  const active = bmHas(type, id);
  btn.textContent = active ? "📌 Saved" : "🔖 Save";
  btn.style.background = active ? "#E8F5E9" : "";
}

function renderBookmarks() {
  const el = document.getElementById("kgBookmarksPanel");
  if(!el) return;
  const u = kgUser();
  if(!u) { el.innerHTML = `<div style="text-align:center;padding:20px;color:#777;">Login to see your bookmarks</div>`; return; }
  const items = bmGet();
  if(!items.length) { el.innerHTML = `<div style="text-align:center;padding:20px;color:#777;">No bookmarks yet.<br><small>Use the 🔖 Save button on any question, PDF, or note.</small></div>`; return; }

  const byType = {};
  items.forEach(b => { if(!byType[b.type]) byType[b.type] = []; byType[b.type].push(b); });
  const typeLabel = { mcq:"📝 MCQs", pyq:"📄 PYQs", pdf:"📚 Notes & PDFs", note:"📚 Notes" };

  el.innerHTML = Object.entries(byType).map(([type, list]) => `
    <div style="margin-bottom:16px;">
      <div style="font-weight:700;font-size:13px;color:#0F3D23;margin-bottom:8px;">${typeLabel[type]||type} (${list.length})</div>
      ${list.map(b => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#F8FBF8;border-radius:10px;margin-bottom:6px;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${kgEscape(b.title)}</div>
            ${b.subj ? `<div style="font-size:11px;color:#777;">${kgEscape(b.subj)}</div>` : ""}
          </div>
          <button onclick="bmAdd('${type}','${b.id}','','',{}); renderBookmarks();" style="background:none;border:none;cursor:pointer;font-size:16px;padding:4px;" title="Remove">🗑️</button>
          ${b.route ? `<button onclick="${b.route}" style="background:#00B050;color:#fff;border:none;border-radius:20px;padding:4px 10px;font-size:11px;cursor:pointer;font-weight:600;">Open</button>` : ""}
        </div>`).join("")}
    </div>`).join("");
}

// ─── WRONG ANSWERS SYSTEM (ENHANCED) ─────────────────────────────────
// The app already has getWrongQs/setWrongQs — we enhance the practice UI

function renderPracticeMyMistakes() {
  const el = document.getElementById("kgMistakesPanel");
  if(!el) return;
  const u = kgUser();
  if(!u) { el.innerHTML = `<div style="text-align:center;padding:20px;color:#777;">Login to track your mistakes</div>`; return; }

  let wrongQs = [];
  try { wrongQs = typeof getWrongQs === "function" ? getWrongQs() : []; } catch{}

  if(!wrongQs.length) {
    el.innerHTML = `<div style="text-align:center;padding:24px;">
      <div style="font-size:36px;margin-bottom:8px;">🎉</div>
      <div style="font-weight:700;color:#0F3D23;">No wrong answers yet!</div>
      <div style="font-size:12px;color:#777;margin-top:4px;">Complete quizzes to see your mistakes here.</div>
    </div>`;
    return;
  }

  const bySubj = {};
  wrongQs.forEach(q => {
    const s = q.subj || q.subject || "General";
    if(!bySubj[s]) bySubj[s] = [];
    bySubj[s].push(q);
  });

  el.innerHTML = `
    <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
      <div style="font-size:13px;color:#777;">${wrongQs.length} question${wrongQs.length!==1?"s":""} to revise</div>
      <button class="btn btn-primary" style="font-size:11px;padding:6px 14px;" onclick="kgStartMistakesPractice()">🔁 Practice All</button>
    </div>
    ${Object.entries(bySubj).map(([subj, qs]) => `
      <div style="margin-bottom:14px;">
        <div style="font-weight:700;font-size:13px;color:#0F3D23;margin-bottom:8px;">📚 ${kgEscape(subj)} (${qs.length})</div>
        ${qs.map((q, i) => `
          <div style="background:#FFF8F8;border:1px solid #FFCDD2;border-radius:10px;padding:12px;margin-bottom:8px;">
            <div style="font-size:13px;font-weight:600;margin-bottom:8px;line-height:1.5;">${kgEscape(q.q||q.question||"")}</div>
            ${(q.opts||q.options||[]).map((opt, oi) => {
              const isCorrect = oi === (q.ans !== undefined ? q.ans : q.correct);
              return `<div style="padding:4px 8px;border-radius:6px;font-size:12px;margin-bottom:2px;background:${isCorrect?"#E8F5E9":"transparent"};color:${isCorrect?"#0F3D23":"#555"};">${isCorrect?"✅ ":"⬜ "}${kgEscape(opt)}</div>`;
            }).join("")}
            ${(q.exp||q.explanation) ? `<div style="margin-top:8px;font-size:11px;color:#555;background:#F8FBF8;border-radius:6px;padding:6px 8px;">💡 ${kgEscape(q.exp||q.explanation)}</div>` : ""}
            <button onclick="kgRemoveWrongQ('${q._qid||""}','${kgEscape(subj)}',${i})" style="margin-top:6px;font-size:10px;color:#E53935;background:none;border:none;cursor:pointer;">Mark as Revised ✓</button>
          </div>`).join("")}
      </div>`).join("")}`;
}

function kgRemoveWrongQ(qid, subj, idx) {
  let wq = typeof getWrongQs === "function" ? getWrongQs() : [];
  if(qid) wq = wq.filter(q => q._qid !== qid);
  if(typeof setWrongQs === "function") setWrongQs(wq);
  renderPracticeMyMistakes();
  kgToast("✅ Marked as revised!");
}

let mistakePracticeQs = [], mistakePracticeIdx = 0, mistakePracticeScore = 0;

function kgStartMistakesPractice() {
  let wrongQs = [];
  try { wrongQs = typeof getWrongQs === "function" ? getWrongQs() : []; } catch{}
  if(!wrongQs.length) { kgToast("No wrong answers to practice!"); return; }
  mistakePracticeQs = wrongQs.slice(0, 20); // max 20 at a time
  mistakePracticeIdx = 0;
  mistakePracticeScore = 0;
  kgRenderMistakePracticeQ();
}

function kgRenderMistakePracticeQ() {
  const el = document.getElementById("kgMistakesPanel");
  if(!el) return;
  if(mistakePracticeIdx >= mistakePracticeQs.length) {
    // Done
    const pct = Math.round(mistakePracticeScore / mistakePracticeQs.length * 100);
    el.innerHTML = `<div style="text-align:center;padding:24px;">
      <div style="font-size:36px;margin-bottom:8px;">${pct>=70?"🎉":"📖"}</div>
      <div style="font-weight:800;font-size:18px;color:#0F3D23;">Practice Complete!</div>
      <div style="font-size:15px;margin:8px 0;">${mistakePracticeScore}/${mistakePracticeQs.length} · ${pct}%</div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">
        <button class="btn btn-primary" onclick="renderPracticeMyMistakes()">Back to Mistakes</button>
        <button class="btn btn-light" onclick="kgStartMistakesPractice()">Practice Again</button>
      </div>
    </div>`;
    return;
  }
  const q = mistakePracticeQs[mistakePracticeIdx];
  const opts = q.opts || q.options || [];
  el.innerHTML = `
    <div style="margin-bottom:8px;font-size:12px;color:#777;">Question ${mistakePracticeIdx+1} of ${mistakePracticeQs.length} · ${kgEscape(q.subj||"")}</div>
    <div style="background:#E8F5E9;border-radius:50px;height:6px;margin-bottom:14px;"><div style="background:#00B050;height:100%;width:${(mistakePracticeIdx/mistakePracticeQs.length*100)}%;border-radius:50px;"></div></div>
    <div style="font-weight:700;font-size:15px;line-height:1.6;margin-bottom:14px;">${kgEscape(q.q||q.question||"")}</div>
    <div id="kgMpOpts" class="quiz-options">
      ${opts.map((opt,i) => `<div class="quiz-option" onclick="kgMistakeAnswer(${i})">${kgEscape(opt)}</div>`).join("")}
    </div>
    <div id="kgMpFeedback" style="display:none;margin-top:12px;"></div>`;
}

function kgMistakeAnswer(selectedIdx) {
  const q = mistakePracticeQs[mistakePracticeIdx];
  const correctIdx = q.ans !== undefined ? q.ans : q.correct;
  const isCorrect = selectedIdx === correctIdx;
  if(isCorrect) mistakePracticeScore++;

  // Highlight options
  const optsEl = document.getElementById("kgMpOpts");
  if(optsEl) {
    optsEl.querySelectorAll(".quiz-option").forEach((el, i) => {
      el.style.pointerEvents = "none";
      if(i === correctIdx) el.style.background = "#E8F5E9", el.style.border = "2px solid #00B050";
      else if(i === selectedIdx && !isCorrect) el.style.background = "#FFEBEE", el.style.border = "2px solid #E53935";
    });
  }

  const opts = q.opts || q.options || [];
  const fbEl = document.getElementById("kgMpFeedback");
  if(fbEl) {
    fbEl.style.display = "block";
    fbEl.innerHTML = `
      <div style="background:${isCorrect?"#E8F5E9":"#FFEBEE"};border-radius:10px;padding:10px 12px;margin-bottom:10px;">
        ${isCorrect ? "✅ Correct!" : `❌ Wrong! Correct: <strong>${kgEscape(opts[correctIdx]||"")}</strong>`}
        ${(q.exp||q.explanation) ? `<div style="font-size:11px;color:#555;margin-top:6px;">💡 ${kgEscape(q.exp||q.explanation)}</div>` : ""}
      </div>
      <button class="btn btn-primary" style="width:100%;" onclick="mistakePracticeIdx++;kgRenderMistakePracticeQ();">
        ${mistakePracticeIdx+1<mistakePracticeQs.length?"Next Question →":"See Results"}
      </button>`;
  }

  // If they got it right, remove from wrong list
  if(isCorrect && q._qid) {
    let wq = typeof getWrongQs === "function" ? getWrongQs() : [];
    wq = wq.filter(x => x._qid !== q._qid);
    if(typeof setWrongQs === "function") setWrongQs(wq);
  }
}

// ─── GLOBAL SEARCH ────────────────────────────────────────────────────
let kgSearchTimeout = null;

function kgGlobalSearch(query) {
  if(!query || query.length < 2) {
    const el = document.getElementById("kgSearchResults");
    if(el) el.style.display = "none";
    return;
  }
  const q = query.toLowerCase().trim();
  const results = { notes:[], mcqs:[], pyqs:[], subjects:[], ebooks:[] };

  // Search notes/PDFs
  try {
    const allNotes = (typeof getApproved === "function" ? getApproved() : (window.notes||[])).filter(n => n.status === "approved" || n.status === undefined);
    allNotes.forEach(n => {
      if((n.title||"").toLowerCase().includes(q) || (n.subject||"").toLowerCase().includes(q) || (n.desc||"").toLowerCase().includes(q)) {
        results.notes.push(n);
      }
    });
  } catch{}

  // Search MCQs
  try {
    const allQs = typeof getAllQuizQuestions === "function" ? getAllQuizQuestions() : [];
    allQs.forEach(q2 => {
      if((q2.q||"").toLowerCase().includes(q) || (q2.subj||"").toLowerCase().includes(q)) {
        results.mcqs.push(q2);
      }
    });
  } catch{}

  // Search PYQs
  try {
    const pyqs = window.pyqData || [];
    pyqs.forEach(p => {
      if((p.question||p.q||"").toLowerCase().includes(q) || (p.subject||"").toLowerCase().includes(q) || (p.exam||"").toLowerCase().includes(q)) {
        results.pyqs.push(p);
      }
    });
  } catch{}

  // Search subjects
  try {
    const subjs = typeof getSubjects === "function" ? getSubjects() : [];
    subjs.forEach(s => {
      if((s.name||"").toLowerCase().includes(q)) results.subjects.push(s);
    });
  } catch{}

  // Search ebooks
  try {
    const ebooks = (window.EBOOKS_LIBRARY||[]).concat(window.adminEbooks||[]);
    ebooks.forEach(e => {
      if((e.title||"").toLowerCase().includes(q) || (e.subject||"").toLowerCase().includes(q)) {
        results.ebooks.push(e);
      }
    });
  } catch{}

  kgShowSearchResults(results, query);
}

function kgShowSearchResults(results, query) {
  const el = document.getElementById("kgSearchResults");
  if(!el) return;

  const total = results.notes.length + results.mcqs.length + results.pyqs.length + results.subjects.length + results.ebooks.length;
  if(total === 0) {
    el.style.display = "block";
    el.innerHTML = `<div style="padding:16px;text-align:center;color:#777;">No results for "${kgEscape(query)}"</div>`;
    return;
  }

  const sections = [];
  if(results.subjects.length) {
    sections.push(`<div class="kgsr-group"><div class="kgsr-type">📚 Subjects</div>${results.subjects.slice(0,3).map(s => `<div class="kgsr-item" onclick="setSection('subjects');document.getElementById('kgSearchResults').style.display='none';">📖 ${kgEscape(s.name)}</div>`).join("")}</div>`);
  }
  if(results.notes.length) {
    sections.push(`<div class="kgsr-group"><div class="kgsr-type">📄 Notes & PDFs (${results.notes.length})</div>${results.notes.slice(0,4).map(n => `<div class="kgsr-item" onclick="setSection('subjects');document.getElementById('kgSearchResults').style.display='none';">📄 ${kgEscape(n.title)} <span style="color:#777;font-size:11px;">${kgEscape(n.subject||"")}</span></div>`).join("")}</div>`);
  }
  if(results.mcqs.length) {
    sections.push(`<div class="kgsr-group"><div class="kgsr-type">🧠 MCQs (${results.mcqs.length})</div>${results.mcqs.slice(0,3).map(q => `<div class="kgsr-item" onclick="setSection('quiz');document.getElementById('kgSearchResults').style.display='none';">🧠 ${kgEscape((q.q||"").substring(0,70))}... <span style="color:#777;font-size:11px;">${kgEscape(q.subj||"")}</span></div>`).join("")}</div>`);
  }
  if(results.pyqs.length) {
    sections.push(`<div class="kgsr-group"><div class="kgsr-type">📝 PYQs (${results.pyqs.length})</div>${results.pyqs.slice(0,3).map(p => `<div class="kgsr-item" onclick="setSection('pyq');document.getElementById('kgSearchResults').style.display='none';">📝 ${kgEscape((p.question||p.q||"").substring(0,70))}... <span style="color:#777;font-size:11px;">${kgEscape(p.exam||"")} ${p.year||""}</span></div>`).join("")}</div>`);
  }
  if(results.ebooks.length) {
    sections.push(`<div class="kgsr-group"><div class="kgsr-type">📖 eBooks (${results.ebooks.length})</div>${results.ebooks.slice(0,3).map(e => `<div class="kgsr-item" onclick="setSection('subjects');document.getElementById('kgSearchResults').style.display='none';">📖 ${kgEscape(e.title)}</div>`).join("")}</div>`);
  }

  el.style.display = "block";
  el.innerHTML = sections.join("");
}

// Hook into existing search bar
function kgHookSearch() {
  const existing = document.getElementById("headerSearchInput") || document.querySelector("input[placeholder*='Search']");
  if(!existing || existing.dataset.kgHooked) return;
  existing.dataset.kgHooked = "true";

  // Inject results dropdown if not existing
  let resultsEl = document.getElementById("kgSearchResults");
  if(!resultsEl) {
    resultsEl = document.createElement("div");
    resultsEl.id = "kgSearchResults";
    resultsEl.style.cssText = "display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:9999;max-height:400px;overflow-y:auto;";
    const parent = existing.parentElement;
    parent.style.position = "relative";
    parent.appendChild(resultsEl);
  }

  existing.addEventListener("input", function() {
    clearTimeout(kgSearchTimeout);
    kgSearchTimeout = setTimeout(() => kgGlobalSearch(this.value), 300);
  });

  document.addEventListener("click", function(e) {
    if(!resultsEl.contains(e.target) && e.target !== existing) resultsEl.style.display = "none";
  });
}

// ─── TODAY'S STUDY SECTION ────────────────────────────────────────────
function renderTodayStudy() {
  const el = document.getElementById("kgTodayStudy");
  if(!el) return;

  const u = kgUser();
  const streak = u ? (typeof getDailyStreak === "function" ? getDailyStreak() : 0) : 0;
  const stats = u && typeof getQuizStats === "function" ? getQuizStats() : { quizCount:0, accuracy:0 };

  // Get a random recommended resource
  let recResource = null;
  try {
    const approved = typeof getApproved === "function" ? getApproved() : [];
    if(approved.length) recResource = approved[Math.floor(Math.random() * Math.min(10, approved.length))];
  } catch{}

  // Get a random important question from weak subject or general
  let featuredQ = null;
  try {
    const allQs = typeof getAllQuizQuestions === "function" ? getAllQuizQuestions() : [];
    if(allQs.length) featuredQ = allQs[Math.floor(new Date().getDate() * 7 % allQs.length)]; // deterministic by date
  } catch{}

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">
      <div style="background:linear-gradient(135deg,#E8F5E9,#F8FBF8);border-radius:12px;padding:14px;cursor:pointer;" onclick="setSection('quiz');setTimeout(()=>setQuizTab('daily'),60);">
        <div style="font-size:22px;margin-bottom:6px;">🔥</div>
        <div style="font-weight:700;font-size:13px;">Daily Quiz</div>
        <div style="font-size:11px;color:#777;">10 questions</div>
      </div>
      <div style="background:linear-gradient(135deg,#E3F2FD,#F8FBF8);border-radius:12px;padding:14px;cursor:pointer;" onclick="setSection('quiz');setTimeout(()=>setQuizTab('wrong'),60);">
        <div style="font-size:22px;margin-bottom:6px;">📖</div>
        <div style="font-weight:700;font-size:13px;">My Mistakes</div>
        <div style="font-size:11px;color:#777;">Revise wrong</div>
      </div>
      <div style="background:linear-gradient(135deg,#FFF8E1,#F8FBF8);border-radius:12px;padding:14px;cursor:pointer;" onclick="setSection('pyq');">
        <div style="font-size:22px;margin-bottom:6px;">📝</div>
        <div style="font-weight:700;font-size:13px;">PYQs</div>
        <div style="font-size:11px;color:#777;">Previous papers</div>
      </div>
      ${recResource ? `<div style="background:linear-gradient(135deg,#F3E5F5,#F8FBF8);border-radius:12px;padding:14px;cursor:pointer;" onclick="setSection('subjects');">
        <div style="font-size:22px;margin-bottom:6px;">📚</div>
        <div style="font-weight:700;font-size:13px;">${kgEscape((recResource.subject||"Notes").substring(0,12))}</div>
        <div style="font-size:11px;color:#777;">Study material</div>
      </div>` : ""}
    </div>
    ${featuredQ ? `
    <div style="margin-top:12px;background:#F8FBF8;border-radius:12px;padding:12px 14px;border-left:3px solid #00B050;">
      <div style="font-size:11px;font-weight:700;color:#00B050;margin-bottom:4px;">🎯 TODAY'S QUESTION · ${kgEscape(featuredQ.subj||"")}</div>
      <div style="font-size:13px;font-weight:600;color:#0F3D23;line-height:1.5;">${kgEscape((featuredQ.q||"").substring(0,120))}${(featuredQ.q||"").length>120?"...":""}</div>
      <button class="btn btn-primary" style="margin-top:8px;font-size:11px;padding:5px 14px;" onclick="setSection('quiz');setTimeout(()=>setQuizTab('quiz'),60);">Answer →</button>
    </div>` : ""}`;
}

// ─── CONTINUE LEARNING RENDERER ───────────────────────────────────────
function renderContinueLearning() {
  const el = document.getElementById("kgContinueLearning");
  if(!el) return;
  const items = clGet();
  if(!items.length) { el.style.display = "none"; return; }
  el.style.display = "block";
  el.innerHTML = `
    <div style="font-weight:800;font-size:14px;color:#0F3D23;margin-bottom:10px;">📚 Continue Learning</div>
    <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;">
      ${items.slice(0,5).map(item => `
        <div style="min-width:130px;max-width:130px;background:#F8FBF8;border-radius:12px;padding:12px;cursor:pointer;flex-shrink:0;" onclick="${item.route||"setSection('subjects')"}">
          <div style="font-size:20px;margin-bottom:6px;">${{pdf:"📄",mcq:"🧠",pyq:"📝",note:"📚"}[item.type]||"📖"}</div>
          <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${kgEscape(item.title)}</div>
          <div style="font-size:10px;color:#777;margin-top:2px;">${kgEscape(item.subj||item.type)}</div>
        </div>`).join("")}
    </div>`;
}

// ─── FLASHCARDS ────────────────────────────────────────────────────────
const FC_KEY = "bhu:flashcards";

function getFlashcardSets() {
  try { return JSON.parse(localStorage.getItem(FC_KEY) || "[]"); } catch { return []; }
}
function saveFlashcardSets(sets) { localStorage.setItem(FC_KEY, JSON.stringify(sets)); }

let fcCurrentSet = null, fcIdx = 0, fcFlipped = false;

function renderFlashcards() {
  const el = document.getElementById("kgFlashcardsPanel");
  if(!el) return;
  const sets = getFlashcardSets();
  const u = kgUser();
  const isAdmin = u && (u.isAdmin || (typeof isManager === "function" && isManager(u)));

  if(fcCurrentSet) {
    // Show flashcard practice
    const card = fcCurrentSet.cards[fcIdx];
    el.innerHTML = `
      <button onclick="fcCurrentSet=null;fcIdx=0;renderFlashcards();" style="background:none;border:none;cursor:pointer;font-size:13px;color:#777;margin-bottom:12px;">← Back to sets</button>
      <div style="text-align:center;margin-bottom:8px;font-size:12px;color:#777;">Card ${fcIdx+1} of ${fcCurrentSet.cards.length} · ${kgEscape(fcCurrentSet.name)}</div>
      <div style="background:#E8F5E9;border-radius:50px;height:6px;margin-bottom:16px;"><div style="background:#00B050;height:100%;width:${(fcIdx/fcCurrentSet.cards.length*100)}%;border-radius:50px;"></div></div>
      <div id="fcCard" style="background:white;border-radius:16px;padding:28px 20px;text-align:center;min-height:160px;cursor:pointer;border:2px solid #E0EAE0;box-shadow:0 4px 16px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center;flex-direction:column;" onclick="document.getElementById('fcCard').style.background='#E8F5E9';document.getElementById('fcBack').style.display='block';document.getElementById('fcFront').style.display='none';">
        <div id="fcFront">
          <div style="font-size:12px;color:#777;margin-bottom:8px;font-weight:600;">QUESTION — Tap to reveal</div>
          <div style="font-size:16px;font-weight:700;color:#0F3D23;line-height:1.6;">${kgEscape(card.front)}</div>
        </div>
        <div id="fcBack" style="display:none;">
          <div style="font-size:12px;color:#00B050;margin-bottom:8px;font-weight:600;">ANSWER</div>
          <div style="font-size:15px;font-weight:700;color:#0F3D23;line-height:1.6;">${kgEscape(card.back)}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;justify-content:center;">
        ${fcIdx>0 ? `<button class="btn btn-light" onclick="fcIdx--;renderFlashcards();">← Prev</button>` : ""}
        ${fcIdx<fcCurrentSet.cards.length-1 ? `<button class="btn btn-primary" onclick="fcIdx++;renderFlashcards();">Next →</button>` : `<button class="btn btn-primary" onclick="fcIdx=0;renderFlashcards();kgToast('🎉 Set Complete!');">🔁 Restart</button>`}
      </div>`;
    return;
  }

  if(!sets.length) {
    el.innerHTML = `<div style="text-align:center;padding:24px;color:#777;">
      <div style="font-size:36px;margin-bottom:8px;">🃏</div>
      <div style="font-weight:700;color:#0F3D23;">No flashcard sets yet</div>
      <div style="font-size:12px;margin-top:4px;">Admin can create sets from the Admin panel.</div>
    </div>`;
    return;
  }

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;">
      ${sets.map((set, i) => `
        <div style="background:#F8FBF8;border-radius:12px;padding:14px;cursor:pointer;border:1px solid #E0EAE0;" onclick="fcCurrentSet=getFlashcardSets()[${i}];fcIdx=0;renderFlashcards();">
          <div style="font-size:24px;margin-bottom:6px;">${set.icon||"🃏"}</div>
          <div style="font-weight:700;font-size:13px;">${kgEscape(set.name)}</div>
          <div style="font-size:11px;color:#777;margin-top:2px;">${set.cards.length} cards · ${kgEscape(set.subject||"")}</div>
        </div>`).join("")}
    </div>`;
}

// Admin: add flashcard set
function kgAdminAddFlashcardSet() {
  const name = prompt("Set name (e.g. Botanical Names):");
  if(!name) return;
  const subject = prompt("Subject:");
  const icon = prompt("Emoji icon (e.g. 🌱):", "🃏");
  const sets = getFlashcardSets();
  sets.push({ id: Date.now()+"", name, subject: subject||"", icon: icon||"🃏", cards:[] });
  saveFlashcardSets(sets);
  kgToast("Flashcard set created!");
  renderFlashcards();
}

function kgAdminAddFlashcard(setIdx) {
  const front = prompt("Question / Term:");
  if(!front) return;
  const back = prompt("Answer / Definition:");
  if(!back) return;
  const sets = getFlashcardSets();
  if(!sets[setIdx]) return;
  sets[setIdx].cards.push({ front, back });
  saveFlashcardSets(sets);
  kgToast("Card added!");
}

// ─── KRISHI TOOLS (CALCULATORS) ───────────────────────────────────────
function renderKrishiTools() {
  const el = document.getElementById("kgKrishiTools");
  if(!el) return;
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-bottom:16px;">
      ${[
        ["🌾","Seed Rate","kgCalcSeedRate()"],
        ["📐","Plant Population","kgCalcPlantPop()"],
        ["🌱","Fertilizer","kgCalcFertilizer()"],
        ["💰","B:C Ratio","kgCalcBC()"],
        ["📏","Area Converter","kgCalcArea()"],
        ["⚖️","Unit Converter","kgCalcUnit()"],
      ].map(([icon,label,fn]) => `
        <button onclick="${fn}" style="background:#F8FBF8;border:1px solid #E0EAE0;border-radius:12px;padding:16px 12px;cursor:pointer;text-align:center;font-family:inherit;">
          <div style="font-size:28px;margin-bottom:6px;">${icon}</div>
          <div style="font-weight:600;font-size:13px;color:#0F3D23;">${label}</div>
        </button>`).join("")}
    </div>
    <div id="kgToolResult" style="display:none;background:#E8F5E9;border-radius:12px;padding:16px;"></div>`;
}

function kgToolShow(html) {
  const el = document.getElementById("kgToolResult");
  if(el) { el.style.display = "block"; el.innerHTML = html; }
}

function kgCalcSeedRate() {
  const area = parseFloat(prompt("Area (hectare):", "1"));
  const seedRate = parseFloat(prompt("Seed rate (kg/ha):", "25"));
  if(isNaN(area)||isNaN(seedRate)) return;
  kgToolShow(`<div style="font-weight:700;font-size:15px;color:#0F3D23;">🌾 Seed Rate Calculator</div>
    <div style="margin-top:8px;">Area: ${area} ha × Seed rate: ${seedRate} kg/ha</div>
    <div style="font-weight:800;font-size:18px;color:#00B050;margin-top:6px;">= ${(area*seedRate).toFixed(2)} kg of seed required</div>`);
}

function kgCalcPlantPop() {
  const rowS = parseFloat(prompt("Row spacing (cm):", "45"));
  const plantS = parseFloat(prompt("Plant spacing (cm):", "15"));
  if(isNaN(rowS)||isNaN(plantS)) return;
  const pop = (10000 / (rowS/100 * plantS/100));
  kgToolShow(`<div style="font-weight:700;font-size:15px;color:#0F3D23;">📐 Plant Population</div>
    <div style="margin-top:8px;">Row spacing: ${rowS}cm × Plant spacing: ${plantS}cm</div>
    <div style="font-weight:800;font-size:18px;color:#00B050;margin-top:6px;">= ${Math.round(pop).toLocaleString()} plants/hectare</div>`);
}

function kgCalcFertilizer() {
  const N = parseFloat(prompt("N required (kg/ha):", "120"));
  const urea = (N / 0.46).toFixed(1);
  const dap = ((N*0.5) / 0.18).toFixed(1);
  kgToolShow(`<div style="font-weight:700;font-size:15px;color:#0F3D23;">🌱 Fertilizer Calculator</div>
    <div style="margin-top:8px;">For ${N} kg N/ha:</div>
    <div style="margin-top:6px;">Urea (46% N): <strong>${urea} kg/ha</strong></div>
    <div>Or DAP (18% N + P): <strong>${dap} kg/ha</strong></div>`);
}

function kgCalcBC() {
  const income = parseFloat(prompt("Total income (₹):", "50000"));
  const cost = parseFloat(prompt("Total cost (₹):", "25000"));
  if(isNaN(income)||isNaN(cost)||cost===0) return;
  const bc = (income/cost).toFixed(2);
  const profit = (income-cost).toFixed(0);
  kgToolShow(`<div style="font-weight:700;font-size:15px;color:#0F3D23;">💰 B:C Ratio</div>
    <div style="margin-top:8px;">Income: ₹${income.toLocaleString()} / Cost: ₹${cost.toLocaleString()}</div>
    <div style="font-weight:800;font-size:18px;color:${bc>=1?"#00B050":"#E53935"};margin-top:6px;">B:C = ${bc}</div>
    <div>Net Profit: ₹${parseFloat(profit).toLocaleString()}</div>
    <div style="font-size:12px;color:#777;margin-top:4px;">${bc>=1?"✅ Profitable":"❌ Not profitable"}</div>`);
}

function kgCalcArea() {
  const hectares = parseFloat(prompt("Area in hectares:", "1"));
  if(isNaN(hectares)) return;
  kgToolShow(`<div style="font-weight:700;font-size:15px;color:#0F3D23;">📏 Area Converter</div>
    <div style="margin-top:10px;display:grid;gap:6px;">
      <div>${hectares} hectare = <strong>${(hectares*2.471).toFixed(3)} Acres</strong></div>
      <div>${hectares} hectare = <strong>${(hectares*10000).toFixed(0)} m²</strong></div>
      <div>${hectares} hectare = <strong>${(hectares*10).toFixed(2)} Bigha (approx)</strong></div>
      <div>${hectares} hectare = <strong>${(hectares*100).toFixed(2)} Are</strong></div>
    </div>`);
}

function kgCalcUnit() {
  const choices = ["kg→g","g→kg","kg→quintal","quintal→kg","L→mL","mL→L"];
  const choice = prompt("Convert:\n" + choices.map((c,i)=>`${i+1}. ${c}`).join("\n") + "\n\nEnter number:", "1");
  const val = parseFloat(prompt("Enter value:", "1"));
  if(isNaN(val)) return;
  const conversions = [
    [val*1000,"g"], [val/1000,"kg"], [val/100,"quintal"],
    [val*100,"kg"], [val*1000,"mL"], [val/1000,"L"]
  ];
  const c = conversions[parseInt(choice)-1];
  if(!c) return;
  kgToolShow(`<div style="font-weight:800;font-size:18px;color:#00B050;">${val} ${choices[parseInt(choice)-1].split("→")[0]} = ${c[0].toFixed(3)} ${c[1]}</div>`);
}

// ─── PYQ ANALYZER ─────────────────────────────────────────────────────
function renderPYQAnalyzer() {
  const el = document.getElementById("kgPYQAnalyzer");
  if(!el) return;
  const pyqs = window.pyqData || [];
  if(!pyqs.length) {
    el.innerHTML = `<div style="text-align:center;padding:20px;color:#777;">No PYQs available yet.</div>`;
    return;
  }

  // Group by exam, subject, year
  const byExam = {}, bySubj = {}, byYear = {};
  pyqs.forEach(q => {
    const e = q.exam||"Other", s = q.subject||"General", y = q.year||"Unknown";
    byExam[e] = (byExam[e]||0)+1;
    bySubj[s] = (bySubj[s]||0)+1;
    byYear[y] = (byYear[y]||0)+1;
  });

  const topSubjs = Object.entries(bySubj).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const topExams = Object.entries(byExam).sort((a,b)=>b[1]-a[1]);
  const maxSubj = topSubjs[0] ? topSubjs[0][1] : 1;

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
      <div style="background:#E8F5E9;border-radius:12px;padding:12px;text-align:center;">
        <div style="font-weight:800;font-size:22px;color:#0F3D23;">${pyqs.length}</div>
        <div style="font-size:11px;color:#777;">Total PYQs</div>
      </div>
      <div style="background:#FFF8E1;border-radius:12px;padding:12px;text-align:center;">
        <div style="font-weight:800;font-size:22px;color:#f59e0b;">${Object.keys(bySubj).length}</div>
        <div style="font-size:11px;color:#777;">Subjects</div>
      </div>
      <div style="background:#E3F2FD;border-radius:12px;padding:12px;text-align:center;">
        <div style="font-weight:800;font-size:22px;color:#1565C0;">${Object.keys(byYear).length}</div>
        <div style="font-size:11px;color:#777;">Years</div>
      </div>
    </div>
    <div style="margin-bottom:14px;">
      <div style="font-weight:700;font-size:13px;margin-bottom:8px;color:#0F3D23;">📊 By Subject (questions)</div>
      ${topSubjs.map(([s,n]) => `
        <div style="margin-bottom:6px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px;"><span>${kgEscape(s)}</span><span style="font-weight:700;">${n}</span></div>
          <div style="background:#E8F5E9;border-radius:4px;height:6px;"><div style="background:#00B050;height:100%;width:${Math.round(n/maxSubj*100)}%;border-radius:4px;"></div></div>
        </div>`).join("")}
    </div>
    <div>
      <div style="font-weight:700;font-size:13px;margin-bottom:8px;color:#0F3D23;">🎯 By Exam</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${topExams.map(([e,n]) => `<div style="background:#F0F9F0;border:1px solid #C8E6C9;border-radius:20px;padding:4px 12px;font-size:12px;"><strong>${kgEscape(e)}</strong> · ${n} Qs</div>`).join("")}
      </div>
    </div>`;
}

// ─── STUDY RECOMMENDATIONS ────────────────────────────────────────────
function renderStudyRecommendations() {
  const el = document.getElementById("kgRecommendations");
  if(!el) return;
  const u = kgUser();
  if(!u) { el.style.display = "none"; return; }

  let recs = [];
  try {
    const ss = JSON.parse(localStorage.getItem("bhu:subjectStats") || "{}");
    const userStats = ss[u.email] || {};
    // Find weak subjects
    Object.entries(userStats).forEach(([subj, stat]) => {
      if(stat.total >= 3) {
        const acc = Math.round(stat.correct/stat.total*100);
        if(acc < 60) recs.push({ subj, acc, type:"weak" });
      }
    });
  } catch{}

  if(!recs.length) {
    // Default recommendations
    try {
      const subjs = typeof getSubjects === "function" ? getSubjects() : [];
      if(subjs.length) {
        const randSubj = subjs[Math.floor(Math.random() * Math.min(3, subjs.length))];
        recs.push({ subj: randSubj.name, type:"explore" });
      }
    } catch{}
  }

  if(!recs.length) { el.style.display = "none"; return; }
  el.style.display = "block";
  el.innerHTML = `
    <div style="font-weight:800;font-size:14px;color:#0F3D23;margin-bottom:10px;">🎯 Recommended for You</div>
    ${recs.slice(0,3).map(r => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#FFF8E1;border-radius:10px;margin-bottom:8px;border-left:3px solid #f59e0b;cursor:pointer;" onclick="setSection('quiz');">
        <div style="font-size:20px;">📖</div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:13px;">${r.type==="weak"?`Revise ${kgEscape(r.subj)}`:`Explore ${kgEscape(r.subj)}`}</div>
          <div style="font-size:11px;color:#777;">${r.type==="weak"?`Accuracy: ${r.acc}% — needs practice`:"Start learning"}</div>
        </div>
        <div style="font-size:12px;color:#f59e0b;font-weight:700;">Study →</div>
      </div>`).join("")}`;
}

// ─── INIT ─────────────────────────────────────────────────────────────
function kgFeaturesInit() {
  // Hook search
  kgHookSearch();
  // Render all panels that exist on current page
  renderTodayStudy();
  renderContinueLearning();
  renderBookmarks();
  renderPracticeMyMistakes();
  renderFlashcards();
  renderKrishiTools();
  renderPYQAnalyzer();
  renderStudyRecommendations();
}

// Re-render panels when section changes — defer wrapping until AFTER main scripts load
function kgHookSectionListeners() {
  const _origSetSection = window.setSection;
  if(typeof _origSetSection === "function") {
    window.setSection = function(sec) {
      _origSetSection.apply(this, arguments);
      setTimeout(() => {
        kgHookSearch();
        if(sec === "home") { renderTodayStudy(); renderContinueLearning(); renderStudyRecommendations(); }
        if(sec === "profile") { renderBookmarks(); renderPracticeMyMistakes(); }
        if(sec === "games") { typeof renderKrishiTools==="function" && renderKrishiTools(); typeof renderFlashcards==="function" && renderFlashcards(); }
        if(sec === "pyq") { typeof renderPYQAnalyzer==="function" && renderPYQAnalyzer(); }
      }, 150);
    };
  }

  const _origSetQuizTab = window.setQuizTab;
  if(typeof _origSetQuizTab === "function") {
    window.setQuizTab = function(tab) {
      _origSetQuizTab.apply(this, arguments);
      setTimeout(() => {
        if(tab === "wrong") renderPracticeMyMistakes();
        if(tab === "saved") renderBookmarks();
      }, 100);
    };
  }
}

// Init — run AFTER main scripts define setSection/setQuizTab
function kgFeaturesInitFull() {
  kgFeaturesInit();
  kgHookSectionListeners();
}

if(document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => setTimeout(kgFeaturesInitFull, 600));
} else {
  setTimeout(kgFeaturesInitFull, 800);
}

// Globals
window.bmAdd = bmAdd; window.bmHas = bmHas; window.bmToggleBtn = bmToggleBtn;
window.renderBookmarks = renderBookmarks; window.renderPracticeMyMistakes = renderPracticeMyMistakes;
window.kgStartMistakesPractice = kgStartMistakesPractice; window.kgMistakeAnswer = kgMistakeAnswer;
window.kgRemoveWrongQ = kgRemoveWrongQ;
window.renderFlashcards = renderFlashcards; window.kgAdminAddFlashcardSet = kgAdminAddFlashcardSet;
window.renderKrishiTools = renderKrishiTools;
window.kgCalcSeedRate = kgCalcSeedRate; window.kgCalcPlantPop = kgCalcPlantPop;
window.kgCalcFertilizer = kgCalcFertilizer; window.kgCalcBC = kgCalcBC;
window.kgCalcArea = kgCalcArea; window.kgCalcUnit = kgCalcUnit;
window.renderPYQAnalyzer = renderPYQAnalyzer; window.renderTodayStudy = renderTodayStudy;
window.renderContinueLearning = renderContinueLearning; window.renderStudyRecommendations = renderStudyRecommendations;
window.clRecord = clRecord; window.kgGlobalSearch = kgGlobalSearch;
window.fcCurrentSet = null; window.fcIdx = 0;
window.mistakePracticeIdx = 0; window.kgRenderMistakePracticeQ = kgRenderMistakePracticeQ;
