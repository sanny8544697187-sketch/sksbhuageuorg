/**
 * fix_google_auth.js
 *
 * ROOT CAUSE:
 * signInWithRedirect() stores OAuth state in the Capacitor WebView's sessionStorage.
 * Firebase then redirects to bhuagorg.firebaseapp.com/__/auth/handler which opens
 * in an EXTERNAL browser (Chrome). Chrome cannot access the WebView's sessionStorage,
 * so Firebase gets "missing initial state" error.
 *
 * FIX:
 * On Android (Capacitor), use @capacitor-firebase/authentication which invokes
 * the NATIVE Google Sign-In SDK directly, bypassing the browser entirely.
 * On Web, continue using signInWithPopup() normally.
 */
const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// ==========================================
// STEP 1: Remove old signInWithRedirect code
// ==========================================

// Remove the broken redirect-based logic added in patch_auth.js
// (the getRedirectResult block that was injected after window._fbConfigured = true)
const redirectResultBlock = /\s*try \{[\s\S]*?firebase\.auth\(\)\.getRedirectResult\(\)\.then[\s\S]*?\} catch\(e\) \{ console\.error\(e\); \}/;
if (redirectResultBlock.test(html)) {
  html = html.replace(redirectResultBlock, '');
  console.log('✅ Removed old getRedirectResult block');
}

// ==========================================
// STEP 2: Replace the doGoogleLogin function
// ==========================================

const oldDoGoogleLogin = /async function doGoogleLogin\(\)\{[\s\S]*?^}/m;

const newDoGoogleLogin = `async function doGoogleLogin(){
  if(!window.firebase || !firebase.auth) { toast("Firebase not initialized.","e"); return; }
  try {
    // ANDROID (Capacitor): Use native Google Sign-In via @capacitor-firebase/authentication
    // This avoids the WebView sessionStorage issue that breaks signInWithRedirect
    if (window.Capacitor && window.Capacitor.isNative && window.CapacitorFirebaseAuth) {
      try {
        toast("Opening Google Sign-In…","");
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
          console.log("User cancelled Google sign-in");
          return;
        }
        console.error("Native Google Sign-In error:", nativeErr);
        toast("Google login failed. Please try again.", "e");
        return;
      }
    }

    // WEB: Use signInWithPopup (works fine in real browsers)
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });
    toast("Opening Google Sign-In…","");
    const res = await firebase.auth().signInWithPopup(provider);
    if (res && res.user) {
      await processGoogleUser(res.user);
    }
  } catch(e) {
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
      console.log("Popup closed by user");
    } else {
      console.error("Google login failed:", e);
      toast("Google login failed: " + (e.message||e.code||"Please try again."), "e");
    }
  }
}

// Keeping this empty — we no longer rely on redirect
function handleGoogleRedirectResult() {
  // No-op: replaced by native sign-in on Android, popup on web
}`;

// Find the existing doGoogleLogin function and replace it
const doGoogleStart = html.indexOf('async function doGoogleLogin(){');
if (doGoogleStart === -1) {
  console.error('❌ Could not find doGoogleLogin function!');
  process.exit(1);
}

// Find the end of the function (next top-level function)
const afterGoogleLogin = html.indexOf('\nasync function handleGoogleRedirectResult', doGoogleStart);
const afterNoOp = html.indexOf('\n// ', afterGoogleLogin + 10);

const endPos = afterNoOp === -1 ? html.indexOf('\nfunction openForgotPassword', doGoogleStart) : afterNoOp;

if (endPos === -1) {
  console.error('❌ Could not find end of doGoogleLogin function block!');
  process.exit(1);
}

html = html.substring(0, doGoogleStart) + newDoGoogleLogin + '\n' + html.substring(endPos);
console.log('✅ Replaced doGoogleLogin with native+web hybrid implementation');

// ==========================================
// STEP 3: Also fix the duplicate p2 redirect block (account mismatch retry)
// ==========================================

// Replace any remaining signInWithRedirect(p2) with popup
html = html.replace(
  /if \(window\.Capacitor && window\.Capacitor\.isNative\) \{\s*await firebase\.auth\(\)\.signInWithRedirect\(p2\);\s*return;[^}]*\} else \{\s*res = await firebase\.auth\(\)\.signInWithPopup\(p2\);\s*\}/g,
  `res = await firebase.auth().signInWithPopup(p2);`
);
console.log('✅ Cleaned up p2 redirect code');

fs.writeFileSync('index.html', html);
console.log('✅ index.html written successfully');
