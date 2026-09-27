
const fs = require("fs");
const content = fs.readFileSync("index.html", "utf8");
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let m, count=0, errors=0;
while((m=scriptRegex.exec(content))!==null) {
  count++;
  try { new Function(m[1]); }
  catch(e) { errors++; console.error("Error in block",count,":",e.message); }
}
console.log("Checked",count,"script blocks. Errors:",errors);

