const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Direct byte-offset replacement using line content
// Replace lines 3084-3097 using exact surrounding context
const OLD = `  const qql=document.getElementById("quickQList");\r\n  QUICK_QS.forEach(q=>{`;
const NEW = `  const qql=document.getElementById("quickQList");\r\n  if(qql) QUICK_QS.forEach(q=>{`;

if(c.includes(OLD)) {
  c = c.replace(OLD, NEW);
  console.log('quickQList guard applied');
} else {
  // Try LF only
  const OLD2 = `  const qql=document.getElementById("quickQList");\n  QUICK_QS.forEach(q=>{`;
  const NEW2 = `  const qql=document.getElementById("quickQList");\n  if(qql) QUICK_QS.forEach(q=>{`;
  if(c.includes(OLD2)) {
    c = c.replace(OLD2, NEW2);
    console.log('quickQList guard applied (LF)');
  } else {
    // Find by indexOf and splice
    const idx = c.indexOf('const qql=document.getElementById("quickQList")');
    const forIdx = c.indexOf('QUICK_QS.forEach', idx);
    if(idx > -1 && forIdx > -1) {
      c = c.substring(0, forIdx) + 'if(qql) ' + c.substring(forIdx);
      console.log('quickQList guard applied (splice)');
    } else {
      console.log('ERROR: Could not find quickQList forEach');
    }
  }
}

// Now fix catFilters forEach
const cfIdx = c.indexOf('const cf=document.getElementById("catFilters")');
const cfForIdx = c.indexOf('CATS.forEach', cfIdx);
if(cfIdx > -1 && cfForIdx > -1) {
  // Check if already guarded
  const before = c.substring(cfForIdx - 10, cfForIdx);
  if(!before.includes('if(cf)')) {
    c = c.substring(0, cfForIdx) + 'if(cf) ' + c.substring(cfForIdx);
    console.log('catFilters guard applied');
  } else {
    console.log('catFilters already guarded');
  }
}

// Now fix typeFilters forEach
const tfIdx = c.indexOf('const tf=document.getElementById("typeFilters")');
const tfForIdx = c.indexOf('RES_TYPES.forEach', tfIdx);
if(tfIdx > -1 && tfForIdx > -1) {
  const before = c.substring(tfForIdx - 10, tfForIdx);
  if(!before.includes('if(tf)')) {
    c = c.substring(0, tfForIdx) + 'if(tf) ' + c.substring(tfForIdx);
    console.log('typeFilters guard applied');
  } else {
    console.log('typeFilters already guarded');
  }
}

fs.writeFileSync('index.html', c);
console.log('All done.');
