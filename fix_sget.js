
const fs = require("fs");
let content = fs.readFileSync("index.html", "utf8");

const oldSGet = `async function sGet(key) {
  try {
    if (LOCAL_KEYS.includes(key)) { const v=localStorage.getItem(key); return v?JSON.parse(v):null; }
    if (key.startsWith("bhu:file:")) {
      if(fbOK) {
        try {
          return await st.ref("files/"+key.slice(9)).getDownloadURL();
        } catch(corsErr) {
          const localFile = await idbGet(key);
          if (localFile) {
            setTimeout(() => sSet(key, localFile).catch(console.warn), 1000);
            return localFile;
          }
          const filePath = encodeURIComponent("files/"+key.slice(9));
          return \`https://firebasestorage.googleapis.com/v0/b/bhuagorg.firebasestorage.app/o/\${filePath}?alt=media\`;
        }
      }
      return await idbGet(key);
    }
    if (!fbOK) { const v=localStorage.getItem(key); return v?JSON.parse(v):null; }
    const snap = await db.collection("bhu_store").doc(key.replace(/:/g,"_")).get();
    if (snap.exists) return JSON.parse(snap.data().value);
    
    // Fallback: try localStorage backup written by sSet, or legacy localStorage key before Firebase
    const backup = localStorage.getItem(key+"__backup");
    if (backup) return JSON.parse(backup);
    const legacy = localStorage.getItem(key);
    if (legacy) {
      // Auto-migrate legacy data up to Firebase
      setTimeout(() => sSet(key, JSON.parse(legacy)).catch(console.warn), 1000);
      return JSON.parse(legacy);
    }
    return null;
  } catch { return null; }
}`;

const newSGet = `async function sGet(key) {
  try {
    if (LOCAL_KEYS.includes(key)) { const v=localStorage.getItem(key); return v?JSON.parse(v):null; }
    if (key.startsWith("bhu:file:")) {
      if(fbOK) {
        try {
          return await st.ref("files/"+key.slice(9)).getDownloadURL();
        } catch(corsErr) {
          const localFile = await idbGet(key);
          if (localFile) {
            setTimeout(() => sSet(key, localFile).catch(console.warn), 1000);
            return localFile;
          }
          const filePath = encodeURIComponent("files/"+key.slice(9));
          return \`https://firebasestorage.googleapis.com/v0/b/bhuagorg.firebasestorage.app/o/\${filePath}?alt=media\`;
        }
      }
      return await idbGet(key);
    }
    
    let fbData = null;
    let fbSuccess = false;
    if (fbOK) {
      try {
        const snap = await db.collection("bhu_store").doc(key.replace(/:/g,"_")).get();
        if (snap.exists) fbData = JSON.parse(snap.data().value);
        fbSuccess = true;
      } catch (err) {
        console.warn("Firestore get failed (possibly expired Test Mode rules):", err);
      }
    }
    
    if (fbSuccess && fbData !== null) return fbData;
    if (!fbOK) { const v=localStorage.getItem(key); if (v) return JSON.parse(v); }
    
    // Fallback: try localStorage backup written by sSet, or legacy localStorage key before Firebase
    const backup = localStorage.getItem(key+"__backup");
    if (backup) return JSON.parse(backup);
    const legacy = localStorage.getItem(key);
    if (legacy) {
      // Auto-migrate legacy data up to Firebase
      setTimeout(() => sSet(key, JSON.parse(legacy)).catch(console.warn), 1000);
      return JSON.parse(legacy);
    }
    return null;
  } catch { return null; }
}`;

const fixedOld = oldSGet.replace(/\r\n/g, "\n");
let normalizedContent = content.replace(/\r\n/g, "\n");

if (normalizedContent.includes(fixedOld)) {
  normalizedContent = normalizedContent.replace(fixedOld, newSGet);
  fs.writeFileSync("index.html", normalizedContent, "utf8");
  console.log("Fix applied successfully!");
} else {
  console.log("Failed to find sGet function string");
}

