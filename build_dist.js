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
  'store_icon.png'
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

// Update index.html to inject capacitor.js script
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const headEnd = html.indexOf('</head>');
html = html.substring(0, headEnd) + '\n  <!-- Capacitor JS -->\n  <script src="capacitor-app.js"></script>\n' + html.substring(headEnd);
fs.writeFileSync(path.join(dist, 'index.html'), html);

const capAppCodeGlobal = `
// Capacitor Native App Logic
document.addEventListener('DOMContentLoaded', () => {
  if (window.Capacitor && window.Capacitor.Plugins) {
    const { App, StatusBar, SplashScreen, Network, Dialog } = window.Capacitor.Plugins;

    // Set Status bar color
    if (StatusBar) {
      try {
        StatusBar.setStyle({ style: 'DARK' });
        StatusBar.setBackgroundColor({ color: '#0F3D23' });
        StatusBar.setOverlaysWebView({ overlay: false });
      } catch(e) {}
    }

    // Hide splash screen safely
    if (SplashScreen) {
      setTimeout(() => {
        SplashScreen.hide();
      }, 1000);
    }

    // Back button handling
    if (App && Dialog) {
      App.addListener('backButton', async (event) => {
        // If a modal is open, close it
        const visibleModals = document.querySelectorAll('.modal:not(.hidden)');
        if (visibleModals.length > 0) {
          visibleModals.forEach(m => m.classList.add('hidden'));
          return;
        }
        
        // If not home, go home
        const activeSec = document.querySelector('.section.active');
        if (activeSec && activeSec.id !== 'home') {
          if (typeof window.setSection === 'function') {
            window.setSection('home');
          } else {
            window.history.back();
          }
          return;
        }

        // We are on Home. Ask to exit
        const result = await Dialog.confirm({
          title: 'Exit',
          message: 'Are you sure you want to exit KrishiGyan?',
          okButtonTitle: 'Exit',
          cancelButtonTitle: 'Cancel'
        });
        if (result.value) {
          App.exitApp();
        }
      });
    }

    // Network checking
    if (Network) {
      Network.addListener('networkStatusChange', status => {
        if (!status.connected) {
          console.warn('Network lost');
          // Could inject a full-screen offline overlay here if needed
        }
      });
    }

    // Hide browser-specific UI
    const style = document.createElement('style');
    style.innerHTML = '#pwaInstallBanner { display: none !important; }';
    document.head.appendChild(style);
  }
});
`;
fs.writeFileSync(path.join(dist, 'capacitor-app.js'), capAppCodeGlobal);

console.log('Dist folder ready for Capacitor');
