/**
 * fix_auth_final.js
 *
 * FINAL FIX: Add a hard block so the Android app NEVER falls through to
 * signInWithPopup (which Firebase converts to signInWithRedirect in WebViews).
 *
 * If the native plugin is unavailable or fails, show a clear error message
 * instead of attempting a web flow that will always fail in a WebView.
 */
const fs = require('fs');
let html = fs.readFileSync('dist/index.html', 'utf8');

const oldFn = `async function doGoogleLogin(){
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

const newFn = `async function doGoogleLogin(){
  if(!window.firebase || !firebase.auth) { toast('Firebase not initialized.','e'); return; }
  try {
    // ─── ANDROID (Capacitor native) ───────────────────────────────────────────
    // Uses @capacitor-firebase/authentication which calls the native Google
    // Sign-In SDK. This avoids ANY browser redirect entirely.
    if (window.Capacitor && window.Capacitor.isNative) {
      if (!window.CapacitorFirebaseAuth) {
        // Plugin not loaded — likely google-services.json SHA-1 is missing.
        // NEVER fall through to signInWithPopup on Android: Firebase SDK
        // automatically converts popups to signInWithRedirect in WebViews,
        // which then fails with "missing initial state".
        toast('Google Sign-In is not ready. Please restart the app.', 'e');
        console.error('CapacitorFirebaseAuth bridge not available. Check that SHA-1 fingerprints are added to Firebase Console for package online.sannykumar.krishigyan_v1');
        return;
      }
      try {
        toast('Opening Google Sign-In...', '');
        const result = await window.CapacitorFirebaseAuth.signInWithGoogle();
        if (result && result.idToken) {
          const credential = firebase.auth.GoogleAuthProvider.credential(result.idToken);
          const res = await firebase.auth().signInWithCredential(credential);
          if (res && res.user) {
            await processGoogleUser(res.user);
          }
        } else {
          toast('Google Sign-In cancelled.', '');
        }
        return;
      } catch(nativeErr) {
        console.error('Native Google Sign-In error:', nativeErr);
        if (nativeErr.message && (nativeErr.message.includes('cancel') || nativeErr.code === '12501')) {
          // User cancelled — silent
          return;
        }
        if (nativeErr.code === '10' || (nativeErr.message && nativeErr.message.includes('DEVELOPER_ERROR'))) {
          toast('Google Sign-In setup is incomplete. Please contact support.', 'e');
          console.error('DEVELOPER_ERROR (code 10): SHA-1 fingerprint is not registered in Firebase Console for this app.');
        } else {
          toast('Google login failed: ' + (nativeErr.message || nativeErr.code || 'Please try again.'), 'e');
        }
        return;
      }
    }

    // ─── WEB browser: Use signInWithPopup ─────────────────────────────────────
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });
    toast('Opening Google Sign-In...', '');
    const res = await firebase.auth().signInWithPopup(provider);
    if (res && res.user) {
      await processGoogleUser(res.user);
    }
  } catch(e) {
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
      console.log('Popup closed by user');
    } else {
      console.error('Google login failed:', e);
      toast('Google login failed: ' + (e.message || e.code || 'Please try again.'), 'e');
    }
  }
}`;

if (html.includes('async function doGoogleLogin(){')) {
  html = html.replace(oldFn, newFn);
  if (html.includes(newFn)) {
    console.log('SUCCESS: dist/index.html patched with hard Android block.');
  } else {
    // Try a looser replace
    const looseRegex = /async function doGoogleLogin\(\)\{[\s\S]*?(?=\n  \/\/ [^\n]*Forgot Password|^function handleGoogleRedirectResult|^function openForgotPassword)/m;
    html = html.replace(looseRegex, newFn + '\n');
    console.log('SUCCESS (loose): dist/index.html patched.');
  }
  fs.writeFileSync('dist/index.html', html);
} else {
  console.error('ERROR: Could not find doGoogleLogin in dist/index.html');
}
