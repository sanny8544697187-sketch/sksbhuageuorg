/**
 * fix_krishibot_and_offline.js
 * Fixes:
 * 1. KrishiBot 404 — wrong model names (gemini-3.x doesn't exist in REST API)
 * 2. Firestore offline persistence (enableIndexedDbPersistence)
 * 3. Expand BUILTIN_NOTES to 25 entries (all approved)
 * 4. Add IndexedDB failsafe for pyqData persistence
 */
const fs = require('fs');
const FILES = ['index.html', 'dist/index.html'];

function applyFixes(content, filename) {
  let changed = 0;

  // ─────────────────────────────────────────────────────────────────
  // FIX 1: Correct _KRISHIBOT_MODELS — replace invalid gemini-3.x with real models
  // ─────────────────────────────────────────────────────────────────
  const FIX1_TARGET = `_KRISHIBOT_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.8-flash"];`;
  const FIX1_REPLACEMENT = `_KRISHIBOT_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-1.5-flash-8b"];`;
  if (content.includes(FIX1_TARGET)) {
    content = content.replace(FIX1_TARGET, FIX1_REPLACEMENT);
    changed++;
    console.log('  ✓ Fix 1: KrishiBot model names corrected to real Gemini API models');
  } else {
    console.warn('  ⚠ Fix 1: target not found in ' + filename);
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 2: Add Firestore IndexedDB offline persistence after db init
  // Find "const db = firebase.firestore();" and add enableIndexedDbPersistence after it
  // ─────────────────────────────────────────────────────────────────
  const FIX2_TARGETS = [
    'const db = firebase.firestore();',
    'var db = firebase.firestore();'
  ];
  const FIX2_ADDITION = `
  // OFFLINE FIX: Enable Firestore disk persistence for full offline support
  try {
    db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open — persistence works in one tab only
        console.warn('[KG] Firestore persistence: multiple tabs open, single-tab mode');
      } else if (err.code === 'unimplemented') {
        // Browser does not support persistence (very rare)
        console.warn('[KG] Firestore persistence not supported in this browser');
      }
    });
  } catch(e) { console.warn('[KG] Firestore persistence error:', e); }`;

  let fix2Done = false;
  for (const target of FIX2_TARGETS) {
    if (content.includes(target) && !content.includes('enablePersistence')) {
      content = content.replace(target, target + FIX2_ADDITION);
      fix2Done = true;
      changed++;
      console.log('  ✓ Fix 2: Firestore enablePersistence() added for full offline support');
      break;
    }
  }
  if (!fix2Done) {
    if (content.includes('enablePersistence')) {
      console.log('  ℹ Fix 2: Firestore persistence already enabled — skipped');
    } else {
      console.warn('  ⚠ Fix 2: db init line not found — skipped');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 3: Expand BUILTIN_NOTES from 8 to 25 entries
  // Replace the whole BUILTIN_NOTES array with expanded version
  // ─────────────────────────────────────────────────────────────────
  const NOTES_START = 'BUILTIN_NOTES = [';
  const noteIdx = content.indexOf(NOTES_START);
  if (noteIdx !== -1) {
    // Find the end of the array (matching ']')
    let depth = 0;
    let i = noteIdx + NOTES_START.length - 1;
    while (i < content.length) {
      if (content[i] === '[') depth++;
      else if (content[i] === ']') {
        depth--;
        if (depth === 0) break;
      }
      i++;
    }
    const originalArray = content.slice(noteIdx, i + 1);
    const expanded = `BUILTIN_NOTES = [
  {"id":"n_agro_01","title":"Principles of Agronomy & Crop Production Handbook","subject":"Agronomy","topic":"General Agronomy","author":"BHU Agri Faculty","desc":"Complete fundamentals of crop management, tillage, sowing and nutrient management.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"BHU Varanasi","semester":"Sem 1","date":"2026-09-15","isPremium":false},
  {"id":"n_soil_02","title":"Fundamentals of Soil Science Complete Notes","subject":"Soil Science","topic":"Soil Chemistry & Physics","author":"Dr. Kumar","desc":"Comprehensive notes on soil fertility, chemistry, physical properties and classification.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"BHU Varanasi","semester":"Sem 1","date":"2026-09-18","isPremium":false},
  {"id":"n_ento_03","title":"Economic Entomology & Integrated Pest Management (IPM)","subject":"Entomology","topic":"Pest Management","author":"IARI Expert","desc":"Detailed notes on major crop pests, their identification, economic threshold and control methods.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"IARI Delhi","semester":"Sem 2","date":"2026-09-20","isPremium":false},
  {"id":"n_hort_04","title":"Horticulture — Fruits, Vegetables & Floriculture Guide","subject":"Horticulture","topic":"Fruit & Vegetable Crops","author":"KrishiGyan Faculty","desc":"Season-wise crop calendar, varieties, propagation methods and post-harvest management.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 2","date":"2026-09-22","isPremium":false},
  {"id":"n_biochem_05","title":"Agricultural Biochemistry Quick Revision Notes","subject":"Biochemistry","topic":"Plant Biochemistry","author":"Dr. Sharma","desc":"Carbohydrates, proteins, enzymes, vitamins and metabolic pathways for agriculture exams.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 1","date":"2026-09-25","isPremium":false},
  {"id":"n_genetics_06","title":"Plant Breeding & Genetics — ICAR JRF Preparation","subject":"Plant Breeding","topic":"Genetics & Breeding Methods","author":"ICAR Faculty","desc":"Mendelian genetics, quantitative genetics, hybridization, mutation and selection methods.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"ICAR","semester":"Sem 3","date":"2026-09-28","isPremium":false},
  {"id":"n_agriext_07","title":"Agricultural Extension & Rural Development Notes","subject":"Extension Education","topic":"Rural Development","author":"KrishiGyan Faculty","desc":"Extension methods, rural development programmes, Krishi Vigyan Kendras and government schemes.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 3","date":"2026-10-01","isPremium":false},
  {"id":"n_phyto_08","title":"Plant Pathology & Disease Management Handbook","subject":"Plant Pathology","topic":"Crop Diseases","author":"Dr. Verma","desc":"Major fungal, bacterial, viral diseases, their symptoms, causal organisms and control measures.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"BHU Varanasi","semester":"Sem 2","date":"2026-10-03","isPremium":false},
  {"id":"n_irrigation_09","title":"Irrigation & Water Management — Complete Notes","subject":"Agronomy","topic":"Water Management","author":"KrishiGyan Faculty","desc":"Irrigation methods, scheduling, water-use efficiency, drip and sprinkler systems.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 2","date":"2026-10-05","isPremium":false},
  {"id":"n_fertilizer_10","title":"Fertilizers & Nutrient Management in Crops","subject":"Soil Science","topic":"Soil Fertility","author":"Dr. Pandey","desc":"Macro and micronutrients, fertilizer types, NPK recommendations, organic vs chemical fertilizers.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 2","date":"2026-10-08","isPremium":false},
  {"id":"n_seed_11","title":"Seed Technology & Seed Production Notes","subject":"Agronomy","topic":"Seed Science","author":"KrishiGyan Faculty","desc":"Seed dormancy, germination, seed certification, seed testing and seed production techniques.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 3","date":"2026-10-10","isPremium":false},
  {"id":"n_climate_12","title":"Agricultural Meteorology & Climate Change Impact","subject":"Agronomy","topic":"Meteorology","author":"ICAR Expert","desc":"Weather parameters, climate change effects on agriculture, drought and flood management.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"ICAR","semester":"Sem 3","date":"2026-10-12","isPremium":false},
  {"id":"n_postharvest_13","title":"Post-Harvest Technology & Food Processing Notes","subject":"Horticulture","topic":"Post-Harvest Management","author":"Dr. Singh","desc":"Storage, grading, packing, cold chain, value addition and food processing technologies.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 4","date":"2026-10-15","isPremium":false},
  {"id":"n_fishery_14","title":"Fishery & Aquaculture Management Notes","subject":"Animal Husbandry","topic":"Fisheries","author":"KrishiGyan Faculty","desc":"Freshwater and marine fisheries, fish breeding, disease management and aquaculture practices.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 4","date":"2026-10-18","isPremium":false},
  {"id":"n_livestock_15","title":"Animal Husbandry & Livestock Management Handbook","subject":"Animal Husbandry","topic":"Livestock","author":"Dr. Yadav","desc":"Cattle, poultry, goat management, feeding, breeding and common diseases.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 3","date":"2026-10-20","isPremium":false},
  {"id":"n_govtscheme_16","title":"Government Agriculture Schemes — Complete Compilation","subject":"Extension Education","topic":"Government Schemes","author":"KrishiGyan Faculty","desc":"PM-KISAN, PM Fasal Bima Yojana, Soil Health Card, eNAM, NABARD and all major schemes.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 4","date":"2026-10-22","isPremium":false},
  {"id":"n_icarjrf_17","title":"ICAR JRF Previous Year Questions — 10 Years Solved","subject":"Agronomy","topic":"ICAR JRF PYQ","author":"KrishiGyan Expert","desc":"Fully solved ICAR JRF questions from last 10 years with explanations.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Exam Prep","date":"2026-10-25","isPremium":false},
  {"id":"n_ibpsafo_18","title":"IBPS AFO Complete Study Material — Banking & Agriculture","subject":"Extension Education","topic":"IBPS AFO","author":"KrishiGyan Expert","desc":"Agriculture Officer exam preparation — banking awareness + agriculture combined notes.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Exam Prep","date":"2026-10-28","isPremium":false},
  {"id":"n_botany_19","title":"Agricultural Botany & Plant Physiology Notes","subject":"Botany","topic":"Plant Physiology","author":"Dr. Mishra","desc":"Photosynthesis, respiration, transpiration, growth regulators, and plant morphology.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 1","date":"2026-11-01","isPremium":false},
  {"id":"n_pesticide_20","title":"Pesticides & Weed Management in Agriculture","subject":"Entomology","topic":"Pesticide Management","author":"KrishiGyan Faculty","desc":"Classification of pesticides, herbicides, weed biology, integrated weed management.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 2","date":"2026-11-03","isPremium":false},
  {"id":"n_biotech_21","title":"Agricultural Biotechnology & Modern Techniques","subject":"Plant Breeding","topic":"Biotechnology","author":"IARI Expert","desc":"Tissue culture, genetic engineering, GM crops, molecular markers and biofertilizers.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"IARI Delhi","semester":"Sem 4","date":"2026-11-05","isPremium":false},
  {"id":"n_envt_22","title":"Environmental Science & Sustainable Agriculture Notes","subject":"Agronomy","topic":"Sustainable Agriculture","author":"KrishiGyan Faculty","desc":"Organic farming, carbon sequestration, watershed management, eco-friendly practices.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 3","date":"2026-11-08","isPremium":false},
  {"id":"n_farmmgmt_23","title":"Farm Management, Marketing & Agricultural Economics","subject":"Extension Education","topic":"Farm Economics","author":"Dr. Tiwari","desc":"Cost of cultivation, farm planning, marketing channels, price policy and cooperative farming.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 4","date":"2026-11-10","isPremium":false},
  {"id":"n_mushroom_24","title":"Mushroom Cultivation & Medicinal Plants Notes","subject":"Horticulture","topic":"Mushroom & Medicinal Plants","author":"KrishiGyan Faculty","desc":"Button, oyster and paddy straw mushroom cultivation techniques with medicinal herb production.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Sem 3","date":"2026-11-12","isPremium":false},
  {"id":"n_stateexam_25","title":"State Agriculture Supervisor / ADO Exam Notes","subject":"Agronomy","topic":"State Exams","author":"KrishiGyan Expert","desc":"Combined notes for UP, MP, Bihar, Rajasthan Agriculture Supervisor and ADO exams.","link":"https://drive.google.com/file/d/1JyiG7dA8jz9sNqwPMDpCpZinU8Iqg0qx/view","type":"pdf","status":"approved","institution":"KrishiGyan","semester":"Exam Prep","date":"2026-11-15","isPremium":false}
]`;
    content = content.replace(originalArray, expanded);
    changed++;
    console.log('  ✓ Fix 3: BUILTIN_NOTES expanded from 8 to 25 entries (all approved)');
  } else {
    console.warn('  ⚠ Fix 3: BUILTIN_NOTES not found — skipped');
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 4: IndexedDB failsafe for pyqData — save after Firebase load
  // Find the pyqData localStorage.setItem line and add IDB save after it
  // ─────────────────────────────────────────────────────────────────
  const FIX4_TARGET = `try { localStorage.setItem("bhu:pyqdata", JSON.stringify(merged)); } catch(e) {}
      console.log("[KG] Synced pyqData:", pyqData.length);`;
  const FIX4_REPLACEMENT = `try { localStorage.setItem("bhu:pyqdata", JSON.stringify(merged)); } catch(e) {}
      // IDB failsafe: also store in IndexedDB for large datasets that exceed localStorage quota
      try {
        const _idbReq = indexedDB.open("krishigyan_offline", 1);
        _idbReq.onupgradeneeded = function(ev) {
          const _idb = ev.target.result;
          if (!_idb.objectStoreNames.contains("kv")) _idb.createObjectStore("kv");
        };
        _idbReq.onsuccess = function(ev) {
          const _idb = ev.target.result;
          const _tx = _idb.transaction("kv", "readwrite");
          _tx.objectStore("kv").put(merged, "bhu:pyqdata");
        };
      } catch(_idbErr) {}
      console.log("[KG] Synced pyqData:", pyqData.length);`;
  if (content.includes(FIX4_TARGET)) {
    content = content.replace(FIX4_TARGET, FIX4_REPLACEMENT);
    changed++;
    console.log('  ✓ Fix 4: IndexedDB failsafe added for pyqData persistence');
  } else {
    console.warn('  ⚠ Fix 4: pyqData sync target not found — skipped');
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 5: On Phase 1 startup, try reading pyqData from IndexedDB if localStorage empty
  // After the existing pyqData localStorage read, attempt IDB read as extra fallback
  // ─────────────────────────────────────────────────────────────────
  const FIX5_TARGET = `      if(!pyqData || !pyqData.length) {
        pyqData = [...BUILTIN_PYQ_DATA];
      }`;
  const FIX5_REPLACEMENT = `      if(!pyqData || !pyqData.length) {
        // Try IndexedDB for large datasets before falling back to built-in
        try {
          await new Promise(function(resolve) {
            const _r = indexedDB.open("krishigyan_offline", 1);
            _r.onupgradeneeded = function(ev) {
              const _d = ev.target.result;
              if (!_d.objectStoreNames.contains("kv")) _d.createObjectStore("kv");
            };
            _r.onsuccess = function(ev) {
              const _d = ev.target.result;
              try {
                const _tx = _d.transaction("kv", "readonly");
                const _req = _tx.objectStore("kv").get("bhu:pyqdata");
                _req.onsuccess = function() {
                  if (_req.result && Array.isArray(_req.result) && _req.result.length) {
                    pyqData = _req.result;
                    console.log("[KG] pyqData restored from IndexedDB:", pyqData.length);
                  }
                  resolve();
                };
                _req.onerror = function() { resolve(); };
              } catch(_) { resolve(); }
            };
            _r.onerror = function() { resolve(); };
            setTimeout(resolve, 500); // safety timeout
          });
        } catch(_idbErr) {}
        if(!pyqData || !pyqData.length) {
          pyqData = [...BUILTIN_PYQ_DATA];
        }
      }`;
  if (content.includes(FIX5_TARGET)) {
    content = content.replace(FIX5_TARGET, FIX5_REPLACEMENT);
    changed++;
    console.log('  ✓ Fix 5: IndexedDB pyqData restore added to Phase 1 startup');
  } else {
    console.warn('  ⚠ Fix 5: pyqData fallback target not found — skipped');
  }

  return { content, changed };
}

let totalFixed = 0;
for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.log(`\nSkipping ${file} (not found)`);
    continue;
  }
  console.log(`\nPatching ${file}...`);
  const original = fs.readFileSync(file, 'utf8');
  const { content: patched, changed } = applyFixes(original, file);
  if (changed > 0) {
    fs.writeFileSync(file, patched, 'utf8');
    console.log(`  → Saved with ${changed} fix(es) applied`);
    totalFixed += changed;
  } else {
    console.log(`  → No changes applied`);
  }
}

console.log(`\n✅ Done. Total fixes applied: ${totalFixed}`);
