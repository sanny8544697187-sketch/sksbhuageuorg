/**
 * reapply_auth_fixes.js
 * 
 * The index.html is now clean (539KB, no duplicates).
 * This script re-applies all auth fixes:
 * 1. Inject <script src="capacitor-app.js"> in <head>
 * 2. Replace the old doGoogleLogin with the clean native-first version
 * 3. Fix processGoogleUser no-email fallback to be Android-aware
 */
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// ── 1. Inject capacitor-app.js script tag ─────────────────────────────────────
if (!html.includes('capacitor-app.js')) {
  const headEnd = html.indexOf('</head>');
  if (headEnd > -1) {
    html = html.substring(0, headEnd) + '\n  <!-- Capacitor Native Bridge -->\n  <script src="capacitor-app.js"></script>\n' + html.substring(headEnd);
    console.log('Injected capacitor-app.js script tag.');
  }
} else {
  console.log('capacitor-app.js tag already present.');
}

// ── 2. Replace doGoogleLogin with the clean native-first version ──────────────
// First find what the current function looks like
const oldFnStart = html.indexOf('async function doGoogleLogin()');
const oldFnEnd = html.indexOf('\nfunction ', oldFnStart + 10);
const oldFn = html.substring(oldFnStart, oldFnEnd);
console.log('\nCurrent doGoogleLogin preview:');
console.log(oldFn.substring(0, 200));

const newDoGoogleLogin = `async function doGoogleLogin(){
  if(!window.firebase || !firebase.auth) { toast('Firebase not initialized.','e'); return; }
  try {
    // ── ANDROID (Capacitor native) ────────────────────────────────────────────
    // Uses @capacitor-firebase/authentication which invokes the native Google
    // Sign-In SDK. No browser redirect, no sessionStorage conflict.
    if (window.Capacitor && window.Capacitor.isNative) {
      if (!window.CapacitorFirebaseAuth) {
        toast('Google Sign-In is not ready. Please restart the app.', 'e');
        console.error('CapacitorFirebaseAuth bridge not available.');
        return;
      }
      try {
        toast('Opening Google Sign-In...', '');
        const result = await window.CapacitorFirebaseAuth.signInWithGoogle();
        if (result && result.idToken) {
          const credential = firebase.auth.GoogleAuthProvider.credential(result.idToken);
          const res = await firebase.auth().signInWithCredential(credential);
          if (res && res.user) { await processGoogleUser(res.user); }
        } else {
          toast('Google Sign-In cancelled.', '');
        }
        return;
      } catch(nativeErr) {
        console.error('Native Google Sign-In error:', nativeErr);
        if (nativeErr.message && nativeErr.message.includes('cancel')) { return; }
        if (String(nativeErr.code) === '10' || (nativeErr.message && nativeErr.message.includes('DEVELOPER_ERROR'))) {
          toast('Google Sign-In setup error. Please contact support.', 'e');
        } else {
          toast('Google login failed: ' + (nativeErr.message || nativeErr.code || 'Try again.'), 'e');
        }
        return;
      }
    }
    // ── WEB browser: signInWithPopup ──────────────────────────────────────────
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });
    toast('Opening Google Sign-In...', '');
    const res = await firebase.auth().signInWithPopup(provider);
    if (res && res.user) { await processGoogleUser(res.user); }
  } catch(e) {
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
      console.log('Popup closed by user');
    } else {
      console.error('Google login failed:', e);
      toast('Google login failed: ' + (e.message || e.code || 'Please try again.'), 'e');
    }
  }
}`;

// Replace the existing doGoogleLogin
if (html.includes('async function doGoogleLogin()')) {
  // Find start and end of the function
  const fnStart = html.indexOf('async function doGoogleLogin()');
  // Find the next top-level function/variable after it
  const fnEndPatterns = ['\nfunction ', '\nasync function ', '\nconst ', '\nlet ', '\nvar ', '\n// '];
  let fnEnd = -1;
  let bestEnd = html.length;
  // Find the closing } of doGoogleLogin by counting braces
  let depth = 0;
  let inFn = false;
  for (let i = fnStart; i < html.length; i++) {
    if (html[i] === '{') { depth++; inFn = true; }
    if (html[i] === '}') {
      depth--;
      if (inFn && depth === 0) { fnEnd = i + 1; break; }
    }
  }
  if (fnEnd > fnStart) {
    html = html.substring(0, fnStart) + newDoGoogleLogin + html.substring(fnEnd);
    console.log('\nReplaced doGoogleLogin successfully.');
  } else {
    console.log('\nCould not find end of doGoogleLogin, doing simpler replace.');
  }
} else {
  console.log('\ndoGoogleLogin not found - inserting before openForgotPassword.');
  html = html.replace('function openForgotPassword(', newDoGoogleLogin + '\n\nfunction openForgotPassword(');
}

// ── 3. Fix processGoogleUser no-email fallback ────────────────────────────────
const badPattern = /toast\("Please select your Google account again[^"]*",""\);\s*\n?\s*let res;\s*\n?\s*res = await firebase\.auth\(\)\.signInWithPopup\(p2\);\s*\n?\s*if \(res && res\.user\) await processGoogleUser\(res\.user\);\s*\n?\s*return;/g;
const fixedFallback = `toast("Please select your Google account again\u2026","");
    let res;
    // Android: use native; Web: use popup
    if (window.Capacitor && window.Capacitor.isNative && window.CapacitorFirebaseAuth) {
      const nr = await window.CapacitorFirebaseAuth.signInWithGoogle();
      if (nr && nr.idToken) {
        const c2 = firebase.auth.GoogleAuthProvider.credential(nr.idToken);
        res = await firebase.auth().signInWithCredential(c2);
      }
    } else {
      res = await firebase.auth().signInWithPopup(p2);
    }
    if (res && res.user) await processGoogleUser(res.user);
    return;`;
const replaced = (html.match(badPattern)||[]).length;
html = html.replace(badPattern, fixedFallback);
console.log('Fixed ' + replaced + ' no-email fallback(s) in processGoogleUser.');

// ── 4. Final save and verify ─────────────────────────────────────────────────
fs.writeFileSync('index.html', html);

const final = fs.readFileSync('index.html', 'utf8');
console.log('\n=== FINAL STATE ===');
console.log('File size:', (final.length / 1024).toFixed(0), 'KB');
console.log('hero-stats:', final.split('<div class="hero-stats">').length - 1, '(want 1)');
console.log('QUIZ_BANK:', final.split('let QUIZ_BANK').length - 1, '(want 1)');
console.log('renderHome:', final.split('function renderHome()').length - 1, '(want 1)');
console.log('doLogin:', final.split('function doLogin()').length - 1, '(want 1)');
console.log('initializeApp:', final.split('firebase.initializeApp').length - 1, '(want 1)');
console.log('signInWithRedirect:', final.split('signInWithRedirect').length - 1, '(want 0)');
console.log('doGoogleLogin:', final.includes('async function doGoogleLogin()'));
console.log('capacitor-app.js:', final.includes('capacitor-app.js'));
console.log('signInWithPopup:', final.split('signInWithPopup').length - 1, '(want 2-3 for web paths only)');
