const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// 1. Remove Today's Goals
c = c.replace(/<!-- ENG: Daily Goals -->[\s\S]*?<div id="engDailyGoals"><\/div>\s*<\/div>/, '');

// 2. Swap AI Widget and Daily Challenge
const aiWidgetRegex = /<!-- KrishiGyan AI Widget -->[\s\S]*?<!-- KrishiGyan AI Widget ends -->/; 
// Wait, I don't have "AI Widget ends" comment. Let's use the explicit structure.

const aiStart = c.indexOf('<!-- KrishiGyan AI Widget -->');
const healStart = c.indexOf('<!-- Question of the Day Widget -->');

if (aiStart !== -1 && healStart !== -1 && healStart < aiStart) {
    // Extract Heal widget
    const healEnd = c.indexOf('<!-- ENG: Daily Result Panel (hidden until quiz done) -->');
    const healHtml = c.substring(healStart, healEnd);
    
    // Extract AI Widget
    const aiEnd = c.indexOf('</div>\n  </div>\n\n  <div id="userBar"></div>');
    // Let's use exact extraction for AI Widget
    let depth = 0;
    let pos = c.indexOf('<div', aiStart);
    let exactAiEnd = -1;
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
                exactAiEnd = pos;
                break;
            }
        }
    }
    
    if (exactAiEnd !== -1) {
        const aiHtml = c.substring(aiStart, exactAiEnd);
        
        // Remove both from original positions
        c = c.replace(aiHtml, '');
        c = c.replace(healHtml, '');
        
        // Find insert point (after weather widget)
        const weatherStart = c.indexOf('<!-- Gamification Dashboard Header -->');
        let wDepth = 0;
        let wPos = c.indexOf('<div', weatherStart);
        let weatherEnd = -1;
        while(wPos < c.length) {
            const nextOpen = c.indexOf('<div', wPos);
            const nextClose = c.indexOf('</div', wPos);
            if (nextClose === -1) break;
            if (nextOpen !== -1 && nextOpen < nextClose) {
                wDepth++;
                wPos = nextOpen + 4;
            } else {
                wDepth--;
                wPos = nextClose + 6;
                if (wDepth === 0) {
                    weatherEnd = wPos;
                    break;
                }
            }
        }
        
        if (weatherEnd !== -1) {
            // Insert AI first, then Heal
            const insertPos = weatherEnd;
            c = c.substring(0, insertPos) + '\n\n    ' + aiHtml + '\n\n    ' + healHtml + c.substring(insertPos);
            console.log('Swapped AI and Daily Challenge');
        }
    }
}

fs.writeFileSync('index.html', c);
console.log('Done.');
