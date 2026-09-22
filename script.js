
const fs = require("fs");
const lines = fs.readFileSync("block3.js", "utf8").split("\n");
let start = lines.findIndex(l => l.includes("async function doLogin"));
console.log(lines.slice(start, start + 30).join("\n"));

