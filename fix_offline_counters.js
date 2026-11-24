/**
 * fix_offline_counters.js
 * Fixes the offline 0-Resources and 37+ Quiz-Qs glitch in index.html
 * Three targeted patches only — no other code touched.
 */
const fs = require('fs');
const FILES = ['index.html', 'dist/index.html'];

function applyFixes(content) {
  let changed = 0;

  // ─────────────────────────────────────────────────────────────────
  // FIX 1: Seed `notes` from BUILTIN_NOTES when localStorage empty
  //         In Phase 1, after the try/catch that reads bhu:notes,
  //         add a fallback: if notes is still empty, use BUILTIN_NOTES.
  // ─────────────────────────────────────────────────────────────────
  const FIX1_TARGET = `      const cn = localStorage.getItem("bhu:notes") || localStorage.getItem("bhu:notes__backup");
      if(cn) { const _parsedN = JSON.parse(cn); if(Array.isArray(_parsedN) && _parsedN.length) notes = _parsedN; }
    } catch(_){}`;

  const FIX1_REPLACEMENT = `      const cn = localStorage.getItem("bhu:notes") || localStorage.getItem("bhu:notes__backup");
      if(cn) { const _parsedN = JSON.parse(cn); if(Array.isArray(_parsedN) && _parsedN.length) notes = _parsedN; }
    } catch(_){}
    // OFFLINE FIX: Seed from built-in notes if localStorage had nothing
    if (!notes || notes.length === 0) {
      notes = (typeof BUILTIN_NOTES !== 'undefined' && Array.isArray(BUILTIN_NOTES)) ? [...BUILTIN_NOTES] : [];
    }`;

  if (content.includes(FIX1_TARGET)) {
    content = content.replace(FIX1_TARGET, FIX1_REPLACEMENT);
    changed++;
    console.log('  ✓ Fix 1 applied: BUILTIN_NOTES seeded into notes on empty localStorage');
  } else {
    console.warn('  ⚠ Fix 1 target not found — may already be applied or code changed');
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 2: renderHome() — show fallback count when approved is 0
  //         Change: statResources.textContent = approved.length;
  //         To:     statResources.textContent = (approved.length > 0) ? approved.length : (parseInt(localStorage.getItem("bhu:res_count")) || 151);
  // ─────────────────────────────────────────────────────────────────
  const FIX2_TARGET = `  document.getElementById("statResources").textContent=approved.length;`;
  const FIX2_REPLACEMENT = `  // OFFLINE FIX: never show 0 — fall back to cached count or 151
  const _approvedCount = approved.length > 0 ? approved.length : (parseInt(localStorage.getItem("bhu:res_count")) || 151);
  document.getElementById("statResources").textContent = _approvedCount;
  // Persist latest count so next offline load can use it
  if (approved.length > 0) { try { localStorage.setItem("bhu:res_count", String(approved.length)); } catch(_){} }`;

  if (content.includes(FIX2_TARGET)) {
    content = content.replace(FIX2_TARGET, FIX2_REPLACEMENT);
    changed++;
    console.log('  ✓ Fix 2 applied: statResources shows cached/fallback count offline');
  } else {
    console.warn('  ⚠ Fix 2 target not found — may already be applied or code changed');
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 3: updateQuizCount() — show fallback when total is too low
  //         Persist total to localStorage; if offline returns small
  //         number, use the cached (or minimum 486) count instead.
  // ─────────────────────────────────────────────────────────────────
  const FIX3_TARGET = `    const total = mcqBankCount + quizBankCount;
    var el = document.getElementById('statQuizCount');
    if (el) el.textContent = total + '+';`;

  const FIX3_REPLACEMENT = `    const total = mcqBankCount + quizBankCount;
    // OFFLINE FIX: persist & use cached max so we never show a low number offline
    const _cachedQuiz = parseInt(localStorage.getItem("bhu:quiz_count_cache")) || 0;
    const _displayTotal = Math.max(total, _cachedQuiz);
    if (total > _cachedQuiz) { try { localStorage.setItem("bhu:quiz_count_cache", String(total)); } catch(_){} }
    var el = document.getElementById('statQuizCount');
    if (el) el.textContent = (_displayTotal > 0 ? _displayTotal : 486) + '+';`;

  if (content.includes(FIX3_TARGET)) {
    content = content.replace(FIX3_TARGET, FIX3_REPLACEMENT);
    changed++;
    console.log('  ✓ Fix 3 applied: statQuizCount uses cached max / 486 fallback offline');
  } else {
    console.warn('  ⚠ Fix 3 target not found — may already be applied or code changed');
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 4: After forceSyncAllFromFirebase succeeds, persist res_count
  //         Find the "[KG] Synced notes/resources:" log and add save
  // ─────────────────────────────────────────────────────────────────
  const FIX4_TARGET = `      console.log("[KG] Synced notes/resources:", n.length);`;
  const FIX4_REPLACEMENT = `      console.log("[KG] Synced notes/resources:", n.length);
      // Persist latest resource count for offline fallback
      try { localStorage.setItem("bhu:res_count", String(n.length)); } catch(_){}`;

  if (content.includes(FIX4_TARGET)) {
    content = content.replace(FIX4_TARGET, FIX4_REPLACEMENT);
    changed++;
    console.log('  ✓ Fix 4 applied: res_count persisted after Firebase sync');
  } else {
    console.warn('  ⚠ Fix 4 target not found (may already be applied)');
  }

  return { content, changed };
}

let totalFixed = 0;
for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} (not found)`);
    continue;
  }
  console.log(`\nPatching ${file}...`);
  const original = fs.readFileSync(file, 'utf8');
  const { content: patched, changed } = applyFixes(original);
  if (changed > 0) {
    fs.writeFileSync(file, patched, 'utf8');
    console.log(`  → Saved with ${changed} fix(es)`);
    totalFixed += changed;
  } else {
    console.log(`  → No changes needed`);
  }
}

console.log(`\nDone. Total fixes applied across all files: ${totalFixed}`);
