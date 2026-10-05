/**
 * patch_capacitor_bridge.js
 * 
 * Modifies capacitor-app.js so that it correctly initializes the native plugins 
 * using `window.Capacitor.registerPlugin` if they aren't pre-populated on 
 * `window.Capacitor.Plugins` (which happens in non-bundled apps).
 */
const fs = require('fs');

let code = fs.readFileSync('capacitor-app.js', 'utf8');

// Replace the plugin extraction
const oldExtract = "const { App, StatusBar, SplashScreen, Network, Dialog, FirebaseAuthentication } = window.Capacitor.Plugins;";

const newExtract = `const getPlugin = (name) => {
      if (window.Capacitor.Plugins && window.Capacitor.Plugins[name]) return window.Capacitor.Plugins[name];
      if (typeof window.Capacitor.registerPlugin === 'function') return window.Capacitor.registerPlugin(name);
      return null;
    };

    const App = getPlugin('App');
    const StatusBar = getPlugin('StatusBar');
    const SplashScreen = getPlugin('SplashScreen');
    const Network = getPlugin('Network');
    const Dialog = getPlugin('Dialog');
    const FirebaseAuthentication = getPlugin('FirebaseAuthentication');`;

if (code.includes(oldExtract)) {
  code = code.replace(oldExtract, newExtract);
  // Relax the check so it works even if Plugins isn't populated
  code = code.replace('if (window.Capacitor && window.Capacitor.Plugins) {', 'if (window.Capacitor && window.Capacitor.isNative) {');
  
  fs.writeFileSync('capacitor-app.js', code);
  console.log('Successfully patched capacitor-app.js');
} else {
  console.log('Could not find exact extract string to replace.');
}
