const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// ── 1. Add features.js script include ──────────────────────────────
c = c.replace('<script src="./representative-system.js"></script>',
  '<script src="./representative-system.js"></script>\n<script src="./features.js"></script>');

// ── 2. Add global search result styles ─────────────────────────────
const searchCSS = `
    /* KG Global Search Results */
    .kgsr-group { padding:8px 0; }
    .kgsr-type { font-size:11px;font-weight:700;color:#777;padding:4px 12px;text-transform:uppercase;letter-spacing:.5px; }
    .kgsr-item { padding:8px 12px;font-size:13px;cursor:pointer;border-radius:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .kgsr-item:hover { background:#F0F9F0; }
    /* Krishi Tools */
    #kgToolResult { margin-top:12px; }
`;
c = c.replace('</style>', searchCSS + '\n    </style>');

// ── 3. HOME: Add "Today's Study" + "Continue Learning" widgets ─────
// Insert after the androidDashboard opening and weatherWidget
const homeInsertTarget = '<!-- Question of the Day Widget -->';
const todayStudyWidget = `
    <!-- KG: Today's Agriculture Study -->
    <div class="card" style="padding:16px;margin-bottom:14px;">
      <div style="font-weight:800;font-size:14px;color:#0F3D23;margin-bottom:10px;">🌱 Today's Agriculture Study</div>
      <div id="kgTodayStudy"></div>
    </div>

    <!-- KG: Continue Learning -->
    <div id="kgContinueLearning" style="display:none;background:white;border-radius:20px;padding:16px;margin-bottom:14px;box-shadow:0 2px 12px rgba(0,0,0,.07);"></div>

    <!-- KG: Study Recommendations -->
    <div id="kgRecommendations" style="display:none;background:white;border-radius:20px;padding:16px;margin-bottom:14px;box-shadow:0 2px 12px rgba(0,0,0,.07);"></div>

`;
c = c.replace(homeInsertTarget, todayStudyWidget + homeInsertTarget);

// ── 4. PROFILE: Add Bookmarks + Mistakes + Flashcards + Tools tabs ─
// Find profile section and insert new card panels before the achievements card
const profileInsertTarget = '<!-- ENG: Badges Panel -->';
const profilePanels = `
    <!-- KG: Saved Bookmarks -->
    <div class="card" style="padding:18px;margin-bottom:18px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:12px;">🔖 My Saved Resources</div>
      <div id="kgBookmarksPanel"></div>
    </div>

    <!-- KG: Practice My Mistakes -->
    <div class="card" style="padding:18px;margin-bottom:18px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div style="font-weight:700;font-size:14px;">❌ Practice My Mistakes</div>
      </div>
      <div id="kgMistakesPanel"></div>
    </div>

`;
c = c.replace(profileInsertTarget, profilePanels + profileInsertTarget);

// ── 5. QUIZ > "Wrong" tab: Replace/enhance the wrong tab content ───
// Inject our enhanced mistakes panel inside the wrong tab
const wrongTabTarget = '<div id="qtab_wrong_content" style="display:none;">';
const wrongTabInjection = `<div id="qtab_wrong_content" style="display:none;">
    <!-- KG: Practice My Mistakes (Primary Wrong Tab View) -->
    <div class="card" style="padding:18px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div>
          <div style="font-weight:800;font-size:15px;color:#0F3D23;">❌ Practice My Mistakes</div>
          <div style="font-size:12px;color:#777;margin-top:2px;">Review and retry questions you got wrong</div>
        </div>
      </div>
      <div id="kgMistakesPanel"></div>
    </div>`;

if(c.includes(wrongTabTarget)) {
  c = c.replace(wrongTabTarget, wrongTabInjection);
} else {
  console.log('Wrong tab target not found, skipping');
}

// ── 6. Add Krishi Tools to Sidebar via Games section quick link ────
// We'll add a quick link in the quick feature grid on home
// Find quick feature grid and add Krishi Tools card
const quickGridTarget = '</div>\n\n  <div id="userBar"></div>';
const toolsCard = `<div class="card quick-card hov-card" onclick="setSection('games')">
        <div class="quick-icon" style="background:#E8F5E9;">🔧</div>
        <div style="font-weight:700;font-size:13px;">Krishi Tools</div>
        <div style="font-size:11px;color:#777;margin-top:2px;">Calculators</div>
      </div>`;

// Insert into the existing quick grid
c = c.replace(
  /<\/div>\s*<\/div>\s*\n\n\s*<div id="userBar"><\/div>/,
  (match) => match.replace('</div>\n\n  <div id="userBar"></div>', `\n      ${toolsCard}\n    </div>\n\n  <div id="userBar"></div>`)
);

// ── 7. Add Krishi Tools panel + Flashcards to Games section ────────
const gamesSection = c.indexOf('<section id="games"');
if(gamesSection !== -1) {
  const gamesEnd = c.indexOf('</section>', gamesSection);
  const gamesContent = c.substring(gamesSection, gamesEnd);
  // Find where the games hub content starts
  const insertAfter = 'id="gamesHub"';
  if(gamesContent.includes(insertAfter)) {
    const insertPoint = c.indexOf(insertAfter, gamesSection) + insertAfter.length + 1;
    // Find the end of the opening div tag
    const afterTagEnd = c.indexOf('>', insertPoint) + 1;
    const toolsHtml = `
    <!-- KG: Krishi Tools -->
    <div class="card" style="padding:18px;margin-bottom:18px;">
      <div style="font-weight:800;font-size:15px;color:#0F3D23;margin-bottom:4px;">🔧 Krishi Tools</div>
      <div style="font-size:12px;color:#777;margin-bottom:12px;">Free agricultural calculators</div>
      <div id="kgKrishiTools"></div>
    </div>

    <!-- KG: Flashcards -->
    <div class="card" style="padding:18px;margin-bottom:18px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <div style="font-weight:800;font-size:15px;color:#0F3D23;">🃏 Flashcards</div>
      </div>
      <div style="font-size:12px;color:#777;margin-bottom:12px;">Quick revision sets</div>
      <div id="kgFlashcardsPanel"></div>
    </div>
`;
    c = c.substring(0, afterTagEnd) + toolsHtml + c.substring(afterTagEnd);
  }
}

// ── 8. PYQ Analyzer inside PYQ section ────────────────────────────
const pyqSection = c.indexOf('<section id="pyq"');
if(pyqSection !== -1) {
  // Find section subtitle or title and insert after it
  const pyqTitleEnd = c.indexOf('class="section-subtitle"', pyqSection);
  if(pyqTitleEnd !== -1) {
    const afterSubtitle = c.indexOf('</div>', pyqTitleEnd) + 6;
    const analyzerHtml = `
    <!-- KG: PYQ Analyzer -->
    <div class="card" style="padding:16px;margin-bottom:18px;">
      <div style="font-weight:800;font-size:14px;color:#0F3D23;margin-bottom:10px;">📊 PYQ Analysis</div>
      <div id="kgPYQAnalyzer"></div>
    </div>
`;
    c = c.substring(0, afterSubtitle) + analyzerHtml + c.substring(afterSubtitle);
  }
}

// ── 9. Ensure kgFeaturesInit called after renderAll/login ─────────
c = c.replace(
  '  if(typeof engInit === "function") setTimeout(engInit, 300); toast(`Welcome back',
  '  if(typeof engInit === "function") setTimeout(engInit, 300); if(typeof kgFeaturesInit === "function") setTimeout(kgFeaturesInit, 400); toast(`Welcome back'
);

// Also trigger on renderHome
c = c.replace(
  "if(typeof refreshEngUI === \"function\") { refreshEngUI(); renderExamCountdown && renderExamCountdown(); renderReferralCard && renderReferralCard(); }",
  "if(typeof refreshEngUI === \"function\") { refreshEngUI(); renderExamCountdown && renderExamCountdown(); renderReferralCard && renderReferralCard(); }\n  if(typeof renderTodayStudy === \"function\") { renderTodayStudy(); renderContinueLearning && renderContinueLearning(); renderStudyRecommendations && renderStudyRecommendations(); }"
);

// Also trigger on renderAdmin (for admin tools)
c = c.replace(
  'if(tab === "wrong") renderPracticeMyMistakes();',
  'if(tab === "wrong") { renderPracticeMyMistakes(); const el=document.getElementById("kgMistakesPanel"); if(el) el.id="kgMistakesPanel"; }'
);

// ── 10. Games section: re-render tools on setSection ───────────────
c = c.replace(
  'if(sec === "quiz") { /* handled by tab */ }',
  'if(sec === "quiz") { /* handled by tab */ }\n    if(sec === "games") { renderKrishiTools && renderKrishiTools(); renderFlashcards && renderFlashcards(); }\n    if(sec === "pyq") { renderPYQAnalyzer && renderPYQAnalyzer(); }'
);

fs.writeFileSync('index.html', c);
console.log('Features injected into index.html.');
