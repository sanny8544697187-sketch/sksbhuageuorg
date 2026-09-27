const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

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

c = c.replace(
  '<div id="profileAchievements" data-eng="true" style="display:flex;gap:10px;flex-wrap:wrap;"></div>\n      </div>',
  '<div id="profileAchievements" data-eng="true" style="display:flex;gap:10px;flex-wrap:wrap;"></div>\n      </div>\n' + profileBadgePanel
);

fs.writeFileSync('index.html', c);
console.log('Fixed profile injection.');
