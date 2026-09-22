
const fs = require("fs");
const content = fs.readFileSync("index.html", "utf8");
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match, count = 0, errors = 0;
while ((match = scriptRegex.exec(content)) !== null) {
  count++;
  try { new Function(match[1]); }
  catch(e) { errors++; console.error("Error in block", count, ":", e.message); }
}
console.log(`Checked ${count} script blocks. Errors: ${errors}`);

