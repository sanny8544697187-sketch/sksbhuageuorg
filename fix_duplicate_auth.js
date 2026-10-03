const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newDoGoogleLogin = `async function doGoogleLogin(){
  if(!window.firebase || !firebase.auth) { toast('Firebase not initialized.','e'); return; }
  try {
    // ANDROID (Capacitor): Use native Google Sign-In via @capacitor-firebase/authentication
    if (window.Capacitor && window.Capacitor.isNative && window.CapacitorFirebaseAuth) {
      try {
        toast('Opening Google Sign-In...','');
        const result = await window.CapacitorFirebaseAuth.signInWithGoogle();
        if (result && result.idToken) {
          const credential = firebase.auth.GoogleAuthProvider.credential(result.idToken);
          const res = await firebase.auth().signInWithCredential(credential);
          if (res && res.user) {
            await processGoogleUser(res.user);
          }
        }
        return;
      } catch(nativeErr) {
        if (nativeErr.message && nativeErr.message.includes('cancel')) {
          console.log('User cancelled Google sign-in');
          return;
        }
        console.error('Native Google Sign-In error:', nativeErr);
        toast('Google login failed. Please try again.', 'e');
        return;
      }
    }

    // WEB: Use signInWithPopup
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });
    toast('Opening Google Sign-In...','');
    const res = await firebase.auth().signInWithPopup(provider);
    if (res && res.user) {
      await processGoogleUser(res.user);
    }
  } catch(e) {
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
      console.log('Popup closed by user');
    } else {
      console.error('Google login failed:', e);
      toast('Google login failed: ' + (e.message||e.code||'Please try again.'), 'e');
    }
  }
}`;

const blockRegex = /async function doGoogleLogin\(\)\{[\s\S]*?(?=function handleGoogleRedirectResult|function openForgotPassword)/g;

let matches = html.match(blockRegex);
console.log('Found ' + (matches ? matches.length : 0) + ' instances of doGoogleLogin');

if (matches) {
  html = html.replace(blockRegex, '');
  html = html.replace('function openForgotPassword(e)', newDoGoogleLogin + '\n\nfunction openForgotPassword(e)');
  fs.writeFileSync('index.html', html);
  console.log('Successfully fixed doGoogleLogin duplication.');
} else {
  console.log('Could not find doGoogleLogin to replace.');
}
