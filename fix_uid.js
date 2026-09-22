
const fs = require("fs");
let content = fs.readFileSync("representative-system.js", "utf8");
content = content.replace(/window\.currentUser\.uid/g, "(window.currentUser.uid || window.currentUser.id)");
fs.writeFileSync("representative-system.js", content);
console.log("Fixed currentUser.uid");

