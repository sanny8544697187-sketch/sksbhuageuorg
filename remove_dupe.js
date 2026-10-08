const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

const startIndex = 7271; // <div id="mobileDrawer">
const endIndex = 7416; // Right before <script>

console.log('Deleting from line', startIndex, 'to', endIndex);
console.log('Start line:', lines[startIndex]);
console.log('End line:', lines[endIndex - 1]);
console.log('Next line:', lines[endIndex]);

const newLines = [...lines.slice(0, startIndex), ...lines.slice(endIndex)];
fs.writeFileSync('index.html', newLines.join('\n'));
console.log('Deleted successfully. Total lines:', newLines.length);
