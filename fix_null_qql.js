const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// FIX 1: Add null guard for quickQList (removed when we replaced chat sidebar)
c = c.replace(
  'const qql=document.getElementById("quickQList");\n  QUICK_QS.forEach(q=>{',
  'const qql=document.getElementById("quickQList");\n  if(qql) QUICK_QS.forEach(q=>{'
);
// Close the if-block
c = c.replace(
  'qql.innerHTML+=`<button class="btn" onclick="setAiInput(\'${escapeHTML(q)}\')" style="display:block;width:100%;text-align:left;background:#F8FBF8;border:1px solid #E0EAE0;border-radius:9px;padding:7px 10px;font-size:12px;color:#333;cursor:pointer;font-family:inherit;margin-bottom:5px;font-weight:500;">💬 ${escapeHTML(q)}</button>`;\n  });',
  'qql.innerHTML+=`<button class="btn" onclick="setAiInput(\'${escapeHTML(q)}\')" style="display:block;width:100%;text-align:left;background:#F8FBF8;border:1px solid #E0EAE0;border-radius:9px;padding:7px 10px;font-size:12px;color:#333;cursor:pointer;font-family:inherit;margin-bottom:5px;font-weight:500;">💬 ${escapeHTML(q)}</button>`;\n  });'
);

// Verify
const qqlCtx = c.indexOf('const qql=document.getElementById("quickQList")');
console.log('Fixed quickQList:', c.substring(qqlCtx, qqlCtx + 200));

fs.writeFileSync('index.html', c);
console.log('Done');
