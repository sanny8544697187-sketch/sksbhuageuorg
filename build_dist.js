const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');
if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist);

// Files and folders to strictly copy
const toCopy = [
  'index.html',
  'features.js',
  'representative-system.js',
  'pwa-install.js',
  'logo.jpg',
  'manifest.json',
  'sw.js',
  'offline.html',
  'store_icon.png',
  'capacitor-app.js'  // Always copy the REAL capacitor-app.js (not the inline version)
];

const folders = ['icons'];

toCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(dist, file));
  }
});

folders.forEach(folder => {
  if (fs.existsSync(folder)) {
    fs.cpSync(folder, path.join(dist, folder), { recursive: true });
  }
});

// Update index.html to inject capacitor.js script (only if not already injected)
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!html.includes('<script src="capacitor-app.js">')) {
  const headEnd = html.indexOf('</head>');
  html = html.substring(0, headEnd) + '\n  <!-- Capacitor JS -->\n  <script src="capacitor-app.js"></script>\n' + html.substring(headEnd);
  fs.writeFileSync(path.join(dist, 'index.html'), html);
}

// Verify no signInWithRedirect left in dist/index.html
const redirectCount = (html.match(/signInWithRedirect/g) || []).length;
const initCount = (html.match(/firebase\.initializeApp\(FIREBASE_CONFIG\)/g) || []).length;
console.log('Dist folder ready for Capacitor');
console.log('signInWithRedirect occurrences: ' + redirectCount + ' (should be 0)');
console.log('initializeApp occurrences: ' + initCount + ' (should be 1)');
if (redirectCount > 0 || initCount > 1) {
  console.error('WARNING: Detected duplicate/broken code in dist/index.html!');
}
