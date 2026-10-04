const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Add comprehensive mobile CSS just before </style>
const styleEnd = c.indexOf('</style>');

const mobileCss = `
    /* ════════════════════════════════════════════
       MOBILE RESPONSIVE OVERRIDES  (≤ 768px)
       ════════════════════════════════════════════ */
    @media (max-width: 768px) {

      /* --- Global layout --- */
      body { overflow-x: hidden; width: 100%; }
      .content { padding: 10px 10px 80px !important; max-width: 100% !important; box-sizing: border-box; }

      /* --- Hero panel --- */
      .hero { border-radius: 16px !important; padding: 20px 16px !important; margin-bottom: 14px !important; }
      .hero h1 { font-size: 20px !important; }
      .hero p { font-size: 13px !important; margin-bottom: 14px !important; }
      .hero-actions { gap: 8px !important; }
      .hero-actions .btn { font-size: 12px !important; padding: 9px 14px !important; }
      .hero-stats { gap: 14px !important; margin-top: 16px !important; padding-top: 14px !important; flex-wrap: wrap; }
      .hero-stats strong { font-size: 20px !important; }
      .hero-stats span { font-size: 10px !important; }

      /* --- Hello/Streak panel --- */
      .card { border-radius: 14px !important; }

      /* --- Quick grid nav icons --- */
      .quick-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; margin-bottom: 16px !important; }
      .quick-card { padding: 12px 6px !important; border-radius: 14px !important; }
      .quick-icon { width: 38px !important; height: 38px !important; font-size: 18px !important; }

      /* --- Subject grid --- */
      .subject-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
      .subject-card { padding: 14px !important; border-radius: 14px !important; }

      /* --- Section titles --- */
      .section-title { font-size: 18px !important; }
      .section-subtitle { font-size: 12px !important; }

      /* --- Resource cards --- */
      .res-card { padding: 12px !important; }
      .res-title { font-size: 13px !important; }
      .res-meta { font-size: 10px !important; }

      /* --- Upload grid --- */
      .upload-grid { grid-template-columns: 1fr !important; }

      /* --- Quiz --- */
      .quiz-container { max-width: 100% !important; }
      .quiz-option { font-size: 13px !important; padding: 10px 12px !important; }

      /* --- Modals --- */
      .modal { padding: 10px !important; }
      .modal-card { border-radius: 16px !important; padding: 20px !important; }

      /* --- Buttons --- */
      .btn { padding: 9px 16px !important; font-size: 13px !important; }

      /* --- Search box --- */
      .search-box { border-radius: 10px !important; padding: 8px 12px !important; }

      /* --- Features injected cards (features.js) --- */
      #kgTodayStudy, #kgContinueLearning, #kgRecommendations { margin-bottom: 12px !important; }
    }

    @media (max-width: 400px) {
      .hero h1 { font-size: 17px !important; }
      .quick-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 4px !important; }
      .quick-card { padding: 10px 4px !important; }
      .quick-icon { width: 32px !important; height: 32px !important; font-size: 16px !important; }
      .subject-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
`;

c = c.substring(0, styleEnd) + mobileCss + '\n  ' + c.substring(styleEnd);
fs.writeFileSync('index.html', c);
console.log('Mobile CSS overrides added successfully!');
