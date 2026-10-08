const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const targetStr = '<div id="mobileDrawer">';
const first = html.indexOf(targetStr);
const second = html.indexOf(targetStr, first + 1);

console.log('First at offset:', first);
console.log('Second at offset:', second);

const len = second - first;
const possibleDuplicate = html.substring(first, first + len);
const nextStr = html.substring(second, second + len);

if (possibleDuplicate === nextStr) {
  console.log('EXACT duplicate of length', len, 'found!');
  // If it's an exact duplicate, we should just delete the second one.
  const newHtml = html.substring(0, second) + html.substring(second + len);
  fs.writeFileSync('index_fixed.html', newHtml);
  console.log('Wrote fixed version to index_fixed.html');
} else {
  console.log('Not an exact match of length', len, '. Let us find the divergence point.');
  let i = 0;
  // Make sure we don't go out of bounds on nextStr
  const maxLen = Math.min(possibleDuplicate.length, nextStr.length);
  while (i < maxLen && possibleDuplicate[i] === nextStr[i]) i++;
  console.log('Diverges at relative offset:', i);
  console.log('Context of divergence:');
  console.log('Original:', possibleDuplicate.substring(Math.max(0, i-50), i+50));
  console.log('Second:', nextStr.substring(Math.max(0, i-50), i+50));
  
  // Wait, what if the duplicate just goes to the end of the HTML?
  // Let's find out how much it matches exactly.
  console.log('Matches perfectly for', i, 'characters.');
  
  const exactMatchBlock = html.substring(second, second + i);
  const newHtml = html.substring(0, second) + html.substring(second + i);
  fs.writeFileSync('index_fixed.html', newHtml);
  console.log('Wrote fixed version (removed duplicate block of size ' + i + ') to index_fixed.html');
}
