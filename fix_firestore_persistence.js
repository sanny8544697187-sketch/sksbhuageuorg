const fs = require('fs');
const FILES = ['index.html', 'dist/index.html'];
const TARGET = 'window._db = firebase.firestore();';
const ADDITION = `
    // OFFLINE FIX: Enable Firestore disk persistence for offline support
    try {
      window._db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
        if (err.code === 'failed-precondition') {
          console.warn('[KG] Firestore persistence: multiple tabs open, single-tab mode');
        } else if (err.code === 'unimplemented') {
          console.warn('[KG] Firestore persistence not supported in this browser');
        }
      });
    } catch(e) { console.warn('[KG] Firestore persistence error:', e); }`;

for (const f of FILES) {
  if (!fs.existsSync(f)) { console.log('skip', f); continue; }
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('enablePersistence')) { console.log('already patched:', f); continue; }
  if (c.includes(TARGET)) {
    c = c.replace(TARGET, TARGET + ADDITION);
    fs.writeFileSync(f, c);
    console.log('  ✓ Firestore persistence enabled in:', f);
  } else {
    console.log('  ⚠ target not found in:', f);
  }
}
