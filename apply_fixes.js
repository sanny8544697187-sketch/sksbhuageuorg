const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// 1. Add isManager helper alongside isSubActive
c = c.replace(
  'const isSubActive = u =>',
  'const isRep = u => u && u.role === \"representative\";\nconst isManager = u => u && (u.isAdmin || isRep(u));\nconst isSubActive = u =>'
);

// 2. Replace !u.isAdmin with !isManager(u) for UI buttons in renderAll
c = c.replace(/adminBtn\.classList\.toggle\(\"hidden\",!u\.isAdmin\)/g, 'adminBtn.classList.toggle(\"hidden\",!isManager(u))');
c = c.replace(/uploadBtn\.classList\.toggle\(\"hidden\",!u\.isAdmin\)/g, 'uploadBtn.classList.toggle(\"hidden\",!isManager(u))');
c = c.replace(/sbAdminBtn\.classList\.toggle\(\"hidden\",!u\.isAdmin\)/g, 'sbAdminBtn.classList.toggle(\"hidden\",!isManager(u))');
c = c.replace(/sbUploadBtn\.classList\.toggle\(\"hidden\",!u\.isAdmin\)/g, 'sbUploadBtn.classList.toggle(\"hidden\",!isManager(u))');
c = c.replace(/diAdminBtn\.classList\.toggle\(\"hidden\",!u\.isAdmin\)/g, 'diAdminBtn.classList.toggle(\"hidden\",!isManager(u))');
c = c.replace(/diUploadBtn\.classList\.toggle\(\"hidden\",!u\.isAdmin\)/g, 'diUploadBtn.classList.toggle(\"hidden\",!isManager(u))');
c = c.replace(/\.forEach\(e=>e\.classList\.toggle\('hidden',!u\.isAdmin\)\)/g, '.forEach(e=>e.classList.toggle(\"hidden\",!isManager(u)))');

// 3. Update upload status logic to allow instant publish for reps
c = c.replace(/u\.isAdmin\?\"approved\":\"pending\"/g, 'isManager(u)?\"approved\":\"pending\"');
c = c.replace(/u\.isAdmin\?\"Admin uploads are published instantly\.\":/g, 'isManager(u)?\"Manager uploads are published instantly.\":');
c = c.replace(/pwrap\.style\.display=u\.isAdmin\?\"flex\":\"none\"/g, 'pwrap.style.display=isManager(u)?\"flex\":\"none\"');
c = c.replace(/ubtn\.innerHTML=u\.isAdmin\?\"\\?\\? Publish Now\":\"\\?\\? Submit for Review\"/g, 'ubtn.innerHTML=isManager(u)?\"?? Publish Now\":\"?? Submit for Review\"');
c = c.replace(/btn\.textContent=u\.isAdmin\?\"\\?\\? Publish Now\":\"\\?\\? Submit for Review\"/g, 'btn.textContent=isManager(u)?\"?? Publish Now\":\"?? Submit for Review\"');
c = c.replace(/btn\.innerHTML=u\.isAdmin\?\"\\?\\? Publish Now\":\"\\?\\? Submit for Review\"/g, 'btn.innerHTML=isManager(u)?\"?? Publish Now\":\"?? Submit for Review\"');

// 4. Update resCardHTML edit button
c = c.replace(/u\?\.isAdmin\?\\<button class=\"btn\" style=\"background:#E3F2FD;color:#1565C0;padding:5px 10px;font-size:11px;\" onclick=\"setSection\('admin'\);setTimeout\(\(\)=>{setAdminTab\('uploads'\);setTimeout\(\(\)=>editUpload\('\','approved'\),100);},80\);\"\>\\?\\? Edit\<\/button\>\:/g, 'isManager(u)?<button class=\"btn\" style=\"background:#E3F2FD;color:#1565C0;padding:5px 10px;font-size:11px;\" onclick=\"setSection(\\'admin\\');setTimeout(()=>{setAdminTab(\\'uploads\\');setTimeout(()=>editUpload(\\'\\',\\'approved\\'),100);},80);\">?? Edit</button>:');
c = c.replace(/u&&\((u\.isAdmin\|\|u\.email===n\.uploaderEmail)\)/g, 'u&&(isManager(u)||u.email===n.uploaderEmail)');

// 5. Update renderAdmin access
c = c.replace('if(!currentUser?.isAdmin) return;', 'if(!isManager(currentUser)) return;');

// Hide specific admin tabs from non-admin managers inside renderAdmin
c = c.replace(
  'const pb=document.getElementById("pendingBadge");',
  'const pb=document.getElementById("pendingBadge");\n  // Hide sensitive tabs from Reps\n  ["atUsers", "atSubs", "atOffers", "atReps", "atSettings"].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = currentUser.isAdmin ? "inline-block" : "none"; });'
);

fs.writeFileSync('index.html', c);
console.log('Applied rep access fixes.');
