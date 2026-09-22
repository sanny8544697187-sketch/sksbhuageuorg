
const fs = require("fs");
let content = fs.readFileSync("index.html", "utf8");

const old1 = "  const cqb = await loadCustomQuizBank();\r\n  if(cqb){ customQuizBank=cqb; }\r\n\r\n  // Check for app updates via SW";
const new1 = "  const cqb = await loadCustomQuizBank();\r\n  if(cqb){ customQuizBank=cqb; }\r\n\r\n  // Load admin-uploaded ebooks from Firebase (must run AFTER Firebase init)\r\n  const _startupEbooks = await sGet(`bhu:adminebooks`);\r\n  if(_startupEbooks && _startupEbooks.length) adminEbooks = _startupEbooks;\r\n\r\n  // Check for app updates via SW";

if (content.includes(old1)) {
  content = content.replace(old1, new1);
  console.log("Fix 1 applied: adminEbooks startup load");
} else {
  console.log("Fix 1 FAILED - pattern not found");
}

const old2 = "      const [nn,np,nu,nq]=await Promise.all([sGet(`bhu:notes`),sGet(`bhu:pending`),sGet(`bhu:users`),sGet(`bhu:questions`)]);\r\n      if(nn) notes=nn; if(np) pending=np; if(nu) usersDB=nu; if(nq) questions=nq;\r\n      renderHeader(); renderHome();";
const new2 = "      const [nn,np,nu,nq,nae]=await Promise.all([sGet(`bhu:notes`),sGet(`bhu:pending`),sGet(`bhu:users`),sGet(`bhu:questions`),sGet(`bhu:adminebooks`)]);\r\n      if(nn) notes=nn; if(np) pending=np; if(nu) usersDB=nu; if(nq) questions=nq;\r\n      if(nae) adminEbooks=nae;\r\n      // Refresh custom quiz bank so users see admin-added quizzes without reloading\r\n      const _cqbSync = await loadCustomQuizBank();\r\n      if(_cqbSync && Object.keys(_cqbSync).length > 0){ customQuizBank=_cqbSync; rebuildQuizBank(); }\r\n      renderHeader(); renderHome();";
const old2_fixed = old2.replace(/`/g, "\"");
const new2_fixed = new2.replace(/`/g, "\"");

if (content.includes(old2_fixed)) {
  content = content.replace(old2_fixed, new2_fixed);
  console.log("Fix 2 applied: sync interval expanded");
} else {
  console.log("Fix 2 FAILED - pattern not found");
}

const old3 = "(async function loadAdminEbooks(){\r\n  const stored = await sGet(`bhu:adminebooks`);\r\n  if(stored && stored.length) adminEbooks = stored;\r\n})();".replace(/`/g, "\"");
const new3 = "// adminEbooks is now loaded inside DOMContentLoaded after Firebase is ready (see startup sequence above)";

if (content.includes(old3)) {
  content = content.replace(old3, new3);
  console.log("Fix 3 applied: removed broken IIFE");
} else {
  console.log("Fix 3: IIFE pattern not found");
}

fs.writeFileSync("index.html", content, "utf8");
console.log("Done");

