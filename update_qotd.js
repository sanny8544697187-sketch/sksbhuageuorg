const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

c = c.replace(
  /<div>\s*<div style="font-weight:800;font-size:15px;color:#0F3D23;">[\s\S]*?Question of the Day<\/div>\s*<div style="font-size:12px;color:#777;margin-top:2px;">Test your knowledge instantly<\/div>\s*<\/div>\s*<div style="font-size:28px;">[^<]*<\/div>/,
  `<div>
          <div style="font-weight:800;font-size:15px;color:#0F3D23;">📌 Daily Challenge</div>
          <div style="font-size:12px;color:#777;margin-top:2px;">🔥 Streak: <strong id="qotdStreakBadge" style="color:#f59e0b;">0 Days</strong></div>
        </div>
        <button class="btn btn-primary" style="padding:6px 14px;font-size:11px;" onclick="setSection('quiz');setTimeout(()=>setQuizTab('daily'),100);">Start Today's Challenge 🎯</button>`
);

fs.writeFileSync('index.html', c);
console.log('done.');
