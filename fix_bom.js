const fs = require('fs');
const content = fs.readFileSync('.well-known/assetlinks.json', 'utf8');

// The fs.readFileSync with 'utf8' usually strips or handles BOM, but let's be explicitly safe.
// Wait, no, Node.js readFileSync doesn't strip BOM by default.
let cleanContent = content;
if (cleanContent.charCodeAt(0) === 0xFEFF) {
  cleanContent = cleanContent.slice(1);
}

// Make sure it's valid JSON
try {
  const obj = JSON.parse(cleanContent);
  const jsonStr = JSON.stringify(obj, null, 2);
  fs.writeFileSync('.well-known/assetlinks.json', jsonStr, 'utf8');
  console.log('Successfully removed BOM and formatted assetlinks.json');
} catch (e) {
  console.error('Error parsing JSON:', e);
}
