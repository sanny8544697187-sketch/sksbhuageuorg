const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

if (!content.includes('getRedirectResult')) {
  console.log('Adding getRedirectResult logic to index.html');
  const injection = `
  try {
    firebase.auth().getRedirectResult().then(async (result) => {
      if (result && result.user) {
        console.log('Google redirect login successful!');
        await processGoogleUser(result.user);
      }
    }).catch(error => {
      console.error('Redirect auth error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        const toastEl = document.getElementById('toast');
        if (toastEl) {
          toastEl.innerText = 'Google Login failed: You must add localhost to Firebase Authorized Domains.';
          toastEl.classList.remove('hidden');
          setTimeout(() => toastEl.classList.add('hidden'), 5000);
        }
      } else {
        const toastEl = document.getElementById('toast');
        if (toastEl) {
          toastEl.innerText = 'Google Login failed: ' + error.message;
          toastEl.classList.remove('hidden');
          setTimeout(() => toastEl.classList.add('hidden'), 5000);
        }
      }
    });
  } catch(e) { console.error(e); }
`;
  content = content.replace('window._fbConfigured = true;', 'window._fbConfigured = true;\n' + injection);
}

// Modify signInWithPopup to conditionally use signInWithRedirect in Capacitor
content = content.replace(
  /const res = await firebase\.auth\(\)\.signInWithPopup\(provider\);/g,
  `let res;
    if (window.Capacitor && window.Capacitor.isNative) {
      await firebase.auth().signInWithRedirect(provider);
      return; // Stop execution as the page will redirect
    } else {
      res = await firebase.auth().signInWithPopup(provider);
    }`
);

content = content.replace(
  /const res = await firebase\.auth\(\)\.signInWithPopup\(p2\);/g,
  `let res;
    if (window.Capacitor && window.Capacitor.isNative) {
      await firebase.auth().signInWithRedirect(p2);
      return; // Stop execution as the page will redirect
    } else {
      res = await firebase.auth().signInWithPopup(p2);
    }`
);

fs.writeFileSync('index.html', content);
console.log('index.html patched with Capacitor Auth fixes.');
