const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
console.log('dist/index.html size:', (h.length/1024).toFixed(0), 'KB');
console.log('doGoogleLogin count before:', (h.match(/async function doGoogleLogin\(\)/g)||[]).length);

// Remove the misplaced definition (preceded by </div> HTML tag)
const patterns = [
  '></div>\r\n\r\nasync function doGoogleLogin()',
  '></div>\n\nasync function doGoogleLogin()',
  '></div>\r\nasync function doGoogleLogin()',
];
for (const p of patterns) {
  const idx = h.indexOf(p);
  if (idx > -1) {
    const fnStart = idx + p.length - 'async function doGoogleLogin()'.length;
    let depth=0, inFn=false, fnEnd=-1;
    for(let i=fnStart; i<fnStart+9000; i++){
      if(h[i]==='{'){depth++;inFn=true;}
      if(h[i]==='}'){depth--;if(inFn&&depth===0){fnEnd=i+1;break;}}
    }
    if(fnEnd>-1){ h=h.substring(0,fnStart)+h.substring(fnEnd); console.log('Removed misplaced fn via pattern: '+p.substring(0,30)); break; }
  }
}

// Insert clean doGoogleLogin BEFORE processGoogleUser (which IS in correct JS scope)
const anchor = h.indexOf('async function processGoogleUser');
console.log('processGoogleUser at:', anchor, '- context:', JSON.stringify(h.substring(anchor-40,anchor)));

const newFn = `async function doGoogleLogin(){
  if(!window.firebase||!firebase.auth){toast('Firebase not ready.','e');return;}
  try{
    if(window.Capacitor&&window.Capacitor.isNative&&window.CapacitorFirebaseAuth){
      try{
        toast('Opening Google Sign-In...','');
        var result=await window.CapacitorFirebaseAuth.signInWithGoogle();
        if(result&&result.idToken){
          var cred=firebase.auth.GoogleAuthProvider.credential(result.idToken);
          var res=await firebase.auth().signInWithCredential(cred);
          if(res&&res.user)await processGoogleUser(res.user);
        }
        return;
      }catch(nErr){
        if(nErr.message&&nErr.message.includes('cancel'))return;
        console.warn('Native Google Sign-In failed:',nErr);
      }
    }
    var provider=new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');provider.addScope('profile');
    provider.setCustomParameters({prompt:'select_account'});
    toast('Opening Google Sign-In...','');
    var res=await firebase.auth().signInWithPopup(provider);
    if(res&&res.user)await processGoogleUser(res.user);
  }catch(e){
    if(e.code==='auth/popup-closed-by-user'||e.code==='auth/cancelled-popup-request')return;
    console.error('Google login error:',e);
    toast('Google login failed: '+(e.message||e.code||'Try again.'),'e');
  }
}

`;

h = h.substring(0,anchor) + newFn + h.substring(anchor);
fs.writeFileSync('dist/index.html', h);
fs.writeFileSync('index.html', h);
console.log('doGoogleLogin count after:', (h.match(/async function doGoogleLogin\(\)/g)||[]).length);
console.log('signInWithRedirect:', (h.match(/signInWithRedirect/g)||[]).length, '(want 0)');
console.log('doLogin:', h.includes('async function doLogin()'));
console.log('doRegister:', h.includes('async function doRegister()'));
console.log('DONE. Saved both dist/index.html and index.html');
