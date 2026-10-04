const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// 1. Extract pieces
const startSec = c.indexOf('<section id="home"');
const endSec = c.indexOf('</section>', startSec);
const homeHtml = c.substring(startSec, endSec + 10);

function extractPiece(html, startMarker, endMarker) {
    const s = html.indexOf(startMarker);
    if(s === -1) return '';
    let e;
    if (endMarker) {
        e = html.indexOf(endMarker, s);
        if(e === -1) e = html.length;
        else e += endMarker.length;
    } else {
        // Find matching closing div
        let depth = 0;
        let pos = s;
        while(pos < html.length) {
            const nextOpen = html.indexOf('<div', pos);
            const nextClose = html.indexOf('</div', pos);
            if (nextClose === -1) break;
            
            if (nextOpen !== -1 && nextOpen < nextClose) {
                depth++;
                pos = nextOpen + 4;
            } else {
                depth--;
                pos = nextClose + 6;
                if (depth === 0) {
                    e = pos;
                    break;
                }
            }
        }
    }
    return html.substring(s, e);
}

const weatherWidget = extractPiece(homeHtml, '<div class="weather-widget"');
const healWidget = extractPiece(homeHtml, '<div class="heal-widget"'); // Daily Challenge
const aiWidget = extractPiece(homeHtml, '<!-- KrishiGyan AI Widget -->\n    <div style="background:white;border-radius:20px;padding:18px;');
const engDailyResult = extractPiece(homeHtml, '<!-- ENG: Daily Result Panel');
const hero = extractPiece(homeHtml, '<div class="hero">');
const userBar = extractPiece(homeHtml, '<div id="userBar"></div>');
const premBanner = extractPiece(homeHtml, '<div id="premBannerHome"></div>');
const quickGrid = extractPiece(homeHtml, '<div class="quick-grid"');

// 2. Build the new #home section
const newHomeHtml = `<section id="home" class="section active fu">
  <!-- PART 1: Hello User -->
  <div class="android-home" id="androidDashboard">
    ${weatherWidget}
  </div>

  <!-- PART 2: KrishiGyan e-learning panel -->
  ${hero}

  <!-- PART 3: KrishiGyan AI & Daily Challenge -->
  <div class="android-home">
    ${aiWidget}
    ${engDailyResult}
    ${healWidget}
  </div>

  ${userBar}
  ${premBanner}
  ${quickGrid}
</section>`;

const newC = c.substring(0, startSec) + newHomeHtml + c.substring(endSec + 10);
fs.writeFileSync('index_new.html', newC);
console.log('Reordered home section');
