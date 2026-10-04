const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// The DC card starts at index 84152 with <div class="heal-widget" ...
// It ends at qotdContainer closing
// Let's find the exact end by looking for the closing pattern after qotdContainer
const qotdIdx = c.indexOf('id="qotdContainer"');
console.log('qotdContainer at:', qotdIdx);
// The qotdContainer ends with </div>, then outer card closes </div>
const qotdClose = c.indexOf('</div>', qotdIdx + 50); // first close is qotdContainer inner
const outerCardClose = c.indexOf('</div>', qotdClose + 1); // this closes the outer card
console.log('qotd inner close at:', qotdClose, ':', c.substring(qotdClose, qotdClose + 30));
console.log('outer close at:', outerCardClose, ':', c.substring(outerCardClose, outerCardClose + 100));

// Let's look at the actual pattern to understand
const dcArea = c.substring(84140, 85200);
console.log('\n\nFULL DC CARD AREA:');
console.log(dcArea);
