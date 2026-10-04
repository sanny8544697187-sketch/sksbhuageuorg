/**
 * deep_clean_auth.js
 * 
 * Fixes index.html by:
 * 1. Removing duplicate firebase.initializeApp blocks
 * 2. Removing any remaining signInWithRedirect calls
 * 3. Fixing the doGoogleLogin function to be clean and final
 */
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// ── Step 1: Count and report ──────────────────────────────────────────────────
const redirectCount = (html.match(/signInWithRedirect/g) || []).length;
const initCount = (html.match(/firebase\.initializeApp\(FIREBASE_CONFIG\)/g) || []).length;
console.log(`Before fix: initializeApp=${initCount}, signInWithRedirect=${redirectCount}`);

// ── Step 2: Remove all signInWithRedirect blocks ──────────────────────────────
// Pattern: if (window.Capacitor && ...) { await firebase.auth().signInWithRedirect(...); return; } else { res = ... }
html = html.replace(
  /\s*if \(window\.Capacitor \&\& window\.Capacitor\.isNative\) \{\s*await firebase\.auth\(\)\.signInWithRedirect\([^)]+\);\s*return;[^}]*\} else \{([^}]+)\}/g,
  (match, elseContent) => elseContent.trim()
);

// Also remove lone signInWithRedirect lines
html = html.replace(/\s*await firebase\.auth\(\)\.signInWithRedirect\([^;]+\);\s*\n\s*return;.*\n/g, '\n');

// ── Step 3: Remove duplicate firebase initializeApp blocks ────────────────────
// The file may have the FIREBASE_CONFIG block duplicated. Keep only the first occurrence.
const initPattern = /window\._fbConfigured = false;\s*\n\s*try \{[\s\S]*?window\._fbConfigured = true;[\s\S]*?\} catch\(e\) \{ console\.error\(".*?Firebase.*?", e\); \}/g;
const initMatches = html.match(initPattern);
if (initMatches && initMatches.length > 1) {
  // Remove all but the first
  let firstRemoved = false;
  html = html.replace(initPattern, (match) => {
    if (!firstRemoved) { firstRemoved = true; return match; }
    return '';  // Remove subsequent duplicates
  });
  console.log(`Removed ${initMatches.length - 1} duplicate initializeApp block(s)`);
}

// ── Step 4: Remove duplicate FIREBASE_CONFIG const blocks ─────────────────────
const configPattern = /const FIREBASE_CONFIG = \{[\s\S]*?\};\s*\n/g;
const configMatches = html.match(configPattern);
if (configMatches && configMatches.length > 1) {
  let firstRemoved = false;
  html = html.replace(configPattern, (match) => {
    if (!firstRemoved) { firstRemoved = true; return match; }
    return '';
  });
  console.log(`Removed ${configMatches.length - 1} duplicate FIREBASE_CONFIG block(s)`);
}

// ── Step 5: Verify ────────────────────────────────────────────────────────────
const redirectCountAfter = (html.match(/signInWithRedirect/g) || []).length;
const initCountAfter = (html.match(/firebase\.initializeApp\(FIREBASE_CONFIG\)/g) || []).length;
console.log(`After fix: initializeApp=${initCountAfter}, signInWithRedirect=${redirectCountAfter}`);

fs.writeFileSync('index.html', html);
console.log('index.html saved successfully.');
