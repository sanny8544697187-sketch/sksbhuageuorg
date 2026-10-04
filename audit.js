const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
const src  = fs.readFileSync('index.html', 'utf8');
const cap  = fs.readFileSync('dist/capacitor-app.js', 'utf8');

const checks = [];

// dist/index.html checks
checks.push(['dist: header count (must be 1)',         (html.match(/<header>/g)||[]).length === 1]);
checks.push(['dist: initializeApp count (must be 1)',  (html.match(/firebase\.initializeApp/g)||[]).length === 1]);
checks.push(['dist: signInWithRedirect (must be 0)',   (html.match(/signInWithRedirect/g)||[]).length === 0]);
checks.push(['dist: doGoogleLogin exists',             html.includes('async function doGoogleLogin()')]);
checks.push(['dist: Android native guard exists',      html.includes('window.Capacitor.isNative')]);
checks.push(['dist: signInWithPopup for web',          html.includes('signInWithPopup')]);
checks.push(['dist: Firebase config present',          html.includes('FIREBASE_CONFIG')]);
checks.push(['dist: capacitor-app.js script tag',      html.includes('src="capacitor-app.js"')]);
checks.push(['dist: duplicate FIREBASE_CONFIG (must be 1)', (html.match(/const FIREBASE_CONFIG/g)||[]).length === 1]);
checks.push(['dist: email signIn exists',              html.includes('signInWithEmailAndPassword')]);
checks.push(['dist: processGoogleUser exists',         html.includes('processGoogleUser')]);

// dist/capacitor-app.js checks
checks.push(['cap: CapacitorFirebaseAuth bridge',      cap.includes('window.CapacitorFirebaseAuth')]);
checks.push(['cap: FirebaseAuthentication plugin',     cap.includes('FirebaseAuthentication')]);
checks.push(['cap: signInWithGoogle method',           cap.includes('signInWithGoogle')]);
checks.push(['cap: signOut method',                    cap.includes('signOut')]);
checks.push(['cap: back button handler',               cap.includes('backButton')]);
checks.push(['cap: StatusBar configured',              cap.includes('StatusBar')]);
checks.push(['cap: SplashScreen hidden',               cap.includes('SplashScreen')]);

// source index.html checks
checks.push(['src: header count (must be 1)',          (src.match(/<header>/g)||[]).length === 1]);
checks.push(['src: initializeApp count (must be 1)',   (src.match(/firebase\.initializeApp/g)||[]).length === 1]);
checks.push(['src: signInWithRedirect (must be 0)',    (src.match(/signInWithRedirect/g)||[]).length === 0]);

// google-services.json
try {
  const gsJson = JSON.parse(fs.readFileSync('android/app/google-services.json', 'utf8'));
  const client = gsJson.client.find(c => c.client_info.android_client_info.package_name === 'online.sannykumar.krishigyan_v1');
  checks.push(['gms: correct package name exists',     !!client]);
  if (client) {
    const androidOauth = (client.oauth_client||[]).find(o => o.client_type === 1);
    checks.push(['gms: Android OAuth client type 1',   !!androidOauth]);
    if (androidOauth) {
      checks.push(['gms: SHA-1 certificate_hash set',  !!(androidOauth.android_info && androidOauth.android_info.certificate_hash)]);
    }
    const webOauth = (client.oauth_client||[]).find(o => o.client_type === 3);
    checks.push(['gms: Web OAuth client type 3',       !!webOauth]);
  }
} catch(e) {
  checks.push(['gms: google-services.json readable',  false]);
}

let pass = 0, fail = 0;
checks.forEach(([name, ok]) => {
  if (ok) { pass++; console.log('PASS  ' + name); }
  else    { fail++; console.log('FAIL  ' + name); }
});
console.log('');
console.log('Result: ' + pass + ' passed, ' + fail + ' failed');
