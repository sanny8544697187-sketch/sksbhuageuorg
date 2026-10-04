const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// The missing items are references in JS - they're defined in features.js but 
// the index.html just needs to call them via the setSection hook.
// Let's add the missing trigger calls and search results container.

// 1. Add kgFeaturesInit call in the main init block after page loads
// Find the window.onload or DOMContentLoaded, or the main init call
const initTarget = 'initPWA();';
if(c.includes(initTarget)) {
  c = c.replace(initTarget, initTarget + '\n  setTimeout(() => { if(typeof kgFeaturesInit === "function") kgFeaturesInit(); }, 600);');
  console.log('Added kgFeaturesInit call after initPWA');
} else {
  console.log('initPWA not found, trying alternate...');
  // Try another hook point - find the last sGet/sSet init
  const altTarget = 'initAndroidDashboard();';
  if(c.includes(altTarget)) {
    c = c.replace(altTarget, altTarget + '\n  setTimeout(() => { if(typeof kgFeaturesInit === "function") kgFeaturesInit(); }, 500);');
    console.log('Added kgFeaturesInit after initAndroidDashboard');
  }
}

// 2. Also trigger games section render
const gamesRenderTarget = "if(sec === \"games\") { renderKrishiTools";
if(!c.includes(gamesRenderTarget)) {
  // Add it
  c = c.replace(
    'if(sec === "quiz") { /* handled by tab */ }',
    'if(sec === "quiz") { /* handled by tab */ }\n    if(sec === "games") { setTimeout(() => { if(typeof renderKrishiTools === "function") renderKrishiTools(); if(typeof renderFlashcards === "function") renderFlashcards(); }, 100); }'
  );
  console.log('Added games render trigger');
} else {
  console.log('games trigger already exists');
}

fs.writeFileSync('index.html', c);
console.log('Done.');
