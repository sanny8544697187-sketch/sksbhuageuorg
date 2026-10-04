/**
 * final_deep_clean.js
 *
 * Fixes index.html:
 * 1. Remove duplicate processGoogleUser function blocks
 * 2. Fix the no-email fallback inside processGoogleUser to be Android-aware
 *    (never call signInWithPopup when on Android Capacitor)
 * 3. Verify final state
 */
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

console.log('=== BEFORE ===');
console.log('processGoogleUser count:', (html.match(/async function processGoogleUser/g)||[]).length);
console.log('signInWithPopup count:',  (html.match(/signInWithPopup/g)||[]).length);
console.log('signInWithRedirect:',     (html.match(/signInWithRedirect/g)||[]).length);
console.log('<header> count:',         (html.match(/<header>/g)||[]).length);
console.log('initializeApp count:',    (html.match(/firebase\.initializeApp/g)||[]).length);

// ── Step 1: Remove duplicate processGoogleUser blocks ─────────────────────────
// Keep ONLY the first occurrence
const pgRegex = /async function processGoogleUser[\s\S]*?(?=\nasync function |\nfunction (?!processGoogleUser))/g;
const pgMatches = html.match(pgRegex);
if (pgMatches && pgMatches.length > 1) {
  let first = true;
  html = html.replace(pgRegex, (m) => {
    if (first) { first = false; return m; }
    return '';
  });
  console.log('\nRemoved', pgMatches.length - 1, 'duplicate processGoogleUser block(s)');
}

// ── Step 2: Fix the no-email fallback inside processGoogleUser ─────────────────
// Replace the signInWithPopup(p2) fallback with an Android-aware version
const badFallback = `toast("Please select your Google account again\\u2026","");
    let res;
    res = await firebase.auth().signInWithPopup(p2);
    if (res && res.user) await processGoogleUser(res.user);
    return;`;

const goodFallback = `toast("Please select your Google account again\\u2026","");
    let res;
    // On Android use native sign-in; on web use popup
    if (window.Capacitor && window.Capacitor.isNative && window.CapacitorFirebaseAuth) {
      const nativeResult = await window.CapacitorFirebaseAuth.signInWithGoogle();
      if (nativeResult && nativeResult.idToken) {
        const cred2 = firebase.auth.GoogleAuthProvider.credential(nativeResult.idToken);
        res = await firebase.auth().signInWithCredential(cred2);
      }
    } else {
      res = await firebase.auth().signInWithPopup(p2);
    }
    if (res && res.user) await processGoogleUser(res.user);
    return;`;

// Try replacing the exact pattern
const toastPattern = /toast\("Please select your Google account again[^"]*",""\);\s*\n?\s*let res;\s*\n?\s*res = await firebase\.auth\(\)\.signInWithPopup\(p2\);\s*\n?\s*if \(res && res\.user\) await processGoogleUser\(res\.user\);\s*\n?\s*return;/g;
const beforeCount = (html.match(toastPattern)||[]).length;
html = html.replace(toastPattern, `toast("Please select your Google account again\u2026","");
    let res;
    // On Android: use native sign-in to avoid WebView redirect loop
    if (window.Capacitor && window.Capacitor.isNative && window.CapacitorFirebaseAuth) {
      const nativeResult = await window.CapacitorFirebaseAuth.signInWithGoogle();
      if (nativeResult && nativeResult.idToken) {
        const cred2 = firebase.auth.GoogleAuthProvider.credential(nativeResult.idToken);
        res = await firebase.auth().signInWithCredential(cred2);
      }
    } else {
      res = await firebase.auth().signInWithPopup(p2);
    }
    if (res && res.user) await processGoogleUser(res.user);
    return;`);
console.log('Replaced', beforeCount, 'no-email fallback(s) with Android-aware version');

// ── Step 3: Save ──────────────────────────────────────────────────────────────
fs.writeFileSync('index.html', html);

console.log('\n=== AFTER (index.html) ===');
const html2 = fs.readFileSync('index.html', 'utf8');
console.log('processGoogleUser count:', (html2.match(/async function processGoogleUser/g)||[]).length);
console.log('signInWithPopup count:',  (html2.match(/signInWithPopup/g)||[]).length);
console.log('signInWithRedirect:',     (html2.match(/signInWithRedirect/g)||[]).length);
console.log('<header> count:',         (html2.match(/<header>/g)||[]).length);
console.log('initializeApp count:',    (html2.match(/firebase\.initializeApp/g)||[]).length);
console.log('\nDone.');
