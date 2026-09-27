const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

c = c.replace(/status:u\.isAdmin\?"approved":"pending"/g, 'status:isManager(u)?"approved":"pending"');
c = c.replace(/pwrap\.style\.display=u\.isAdmin\?"flex":"none"/g, 'pwrap.style.display=isManager(u)?"flex":"none"');
c = c.replace(/u\.isAdmin\?"Admin uploads are published instantly\.":"Your upload goes to admin review first\."/g, 'isManager(u)?"Manager uploads are published instantly.":"Your upload goes to admin review first."');
c = c.replace(/ubtn\.innerHTML=u\.isAdmin\?/g, 'ubtn.innerHTML=isManager(u)?');
c = c.replace(/btn\.textContent=u\.isAdmin\?/g, 'btn.textContent=isManager(u)?');
c = c.replace(/btn\.innerHTML=u\.isAdmin\?/g, 'btn.innerHTML=isManager(u)?');

c = c.replace(/if\(u\.isAdmin\)\{ notes=\[\.\.\.newEntries/g, 'if(isManager(u)){ notes=[...newEntries');
c = c.replace(/if\(u\.isAdmin\)\{notes=\[note,\.\.\.notes\];/g, 'if(isManager(u)){notes=[note,...notes];');

c = c.replace(/u&&\((u\.isAdmin\|\|u\.email===n\.uploaderEmail)\)/g, 'u&&(isManager(u)||u.email===n.uploaderEmail)');

// Edit note button (regex works fine if escaped)
c = c.replace(/u\?\.isAdmin\?\`\<button class=\"btn\" style=\"background:#E3F2FD;color:#1565C0;padding:5px 10px;font-size:11px;\" onclick=\"setSection\('admin'\);setTimeout\(\(\)=>{setAdminTab\('uploads'\);setTimeout\(\(\)=>editUpload\('\$\{n\.id\}','approved'\),100\);},80\);\"\>✏️ Edit\<\/button\>\`:\'\'/g, 
  'isManager(u)?`<button class="btn" style="background:#E3F2FD;color:#1565C0;padding:5px 10px;font-size:11px;" onclick="setSection(\'admin\');setTimeout(()=>{setAdminTab(\'uploads\');setTimeout(()=>editUpload(\'${n.id}\',\'approved\'),100);},80);">✏️ Edit</button>`:\'\'');

// Add PYQ button
c = c.replace(/currentUser\?\.isAdmin\?\`\<button class=\"btn btn-primary\" style=\"margin-top:16px;\" onclick=\"setSection\('admin'\);setTimeout\(\(\)=>setAdminTab\('pyq'\),80\);\"\>\+ Add PYQ Questions ✨\<\/button\>\`\:\"\"/g, 
  'isManager(currentUser)?`<button class="btn btn-primary" style="margin-top:16px;" onclick="setSection(\'admin\');setTimeout(()=>setAdminTab(\'pyq\'),80);">+ Add PYQ Questions ✨</button>`:""');

// Add Questions button (MCQ Quiz Bank)
c = c.replace(/currentUser\?\.isAdmin\?\`\<button class=\"btn btn-primary\" style=\"margin-top:16px;\" onclick=\"setSection\('admin'\);setTimeout\(\(\)=>setAdminTab\('pyq'\),80\);\"\>\+ Add Questions ✨\<\/button\>\`\:\"\"/g, 
  'isManager(currentUser)?`<button class="btn btn-primary" style="margin-top:16px;" onclick="setSection(\'admin\');setTimeout(()=>setAdminTab(\'pyq\'),80);">+ Add Questions ✨</button>`:""');

// Edit PYQ button
c = c.replace(/currentUser\?\.isAdmin\?\`\<button class=\"btn\" style=\"background:#E3F2FD;color:#1565C0;font-size:11px;padding:5px 10px;\" onclick=\"setSection\('admin'\);setTimeout\(\(\)=>{setAdminTab\('pyq'\);setTimeout\(\(\)=>editPYQQuestion\('\$\{q\.id\}'\),100\);},80\);\"\>✏️ Edit\<\/button\>\`\:\"\"/g, 
  'isManager(currentUser)?`<button class="btn" style="background:#E3F2FD;color:#1565C0;font-size:11px;padding:5px 10px;" onclick="setSection(\'admin\');setTimeout(()=>{setAdminTab(\'pyq\');setTimeout(()=>editPYQQuestion(\'${q.id}\'),100);},80);">✏️ Edit</button>`:""');

fs.writeFileSync('index.html', c);
console.log('done.');
