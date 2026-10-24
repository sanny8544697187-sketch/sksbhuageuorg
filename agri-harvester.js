// agri-harvester.js — Client-side Harvester, Admin Review Dashboard & Sync Engine
// Seamlessly connects with Vercel Cron endpoint /api/cron-collector,
// handles deduplication, Firestore bhu_store persistence, and admin controls.

window.AgriHarvester = (function() {
  const STORAGE_KEY = "bhu:harvested_updates";
  const SETTINGS_KEY = "bhu:harvester_settings";
  const LOGS_KEY = "bhu:harvester_logs";

  let settings = {
    autoPublishOfficial: true,
    requireReviewNews: true,
    autoSyncNoticeBoard: true,
    filterKeywords: "icar, cuet, afo, nabard, agri, exam, date, admit, result, vacancy",
    lastRun: null
  };

  let harvestedItems = [];
  let executionLogs = [];

  // Safe getter for Firestore / LocalStorage
  async function safeGet(key) {
    if (typeof sGet === "function") {
      return await sGet(key);
    }
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch (_) {
      return null;
    }
  }

  // Safe setter for Firestore / LocalStorage
  async function safeSet(key, val) {
    if (typeof sSet === "function") {
      return await sSet(key, val);
    }
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (_) {}
  }

  // Load from database / local storage
  async function init() {
    try {
      const s = await safeGet(SETTINGS_KEY);
      if (s) settings = { ...settings, ...s };
      
      const items = await safeGet(STORAGE_KEY);
      if (Array.isArray(items)) harvestedItems = items;

      const logs = await safeGet(LOGS_KEY);
      if (Array.isArray(logs)) executionLogs = logs;
    } catch (e) {
      console.warn("AgriHarvester init error:", e);
    }
  }

  // Deduplicate and merge incoming items
  function mergeItems(newItems) {
    let addedCount = 0;
    const existingMap = new Map();
    harvestedItems.forEach(item => existingMap.set(item.hash || item.id, item));

    newItems.forEach(item => {
      const key = item.hash || item.id;
      if (!existingMap.has(key)) {
        if (item.isOfficial && settings.autoPublishOfficial) {
          item.status = 'published';
        } else {
          item.status = 'pending_review';
        }
        harvestedItems.unshift(item);
        existingMap.set(key, item);
        addedCount++;
      }
    });

    return addedCount;
  }

  // Secure Manual Trigger using current logged-in Firebase Admin credentials
  async function triggerHarvest() {
    const triggerBtn = document.getElementById("btnTriggerHarvest");
    if (triggerBtn) {
      triggerBtn.disabled = true;
      triggerBtn.textContent = "⏳ Harvesting Feeds...";
    }

    try {
      const headers = {};

      if (window.firebase && firebase.auth && firebase.auth().currentUser) {
        try {
          const idToken = await firebase.auth().currentUser.getIdToken(true);
          if (idToken) headers["Authorization"] = `Bearer ${idToken}`;
        } catch (authErr) {
          console.warn("Could not retrieve Firebase ID token:", authErr);
        }
      }

      const res = await fetch("/api/cron-collector", {
        headers
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `HTTP error ${res.status}`);
      }

      const added = mergeItems(data.items || []);
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        itemsFound: data.summary?.itemsFound || 0,
        newItemsAdded: added,
        errors: data.summary?.errors || [],
        durationMs: data.summary?.durationMs || 0
      };
      executionLogs.unshift(logEntry);
      if (executionLogs.length > 20) executionLogs = executionLogs.slice(0, 20);

      settings.lastRun = logEntry.timestamp;

      await safeSet(STORAGE_KEY, harvestedItems);
      await safeSet(SETTINGS_KEY, settings);
      await safeSet(LOGS_KEY, executionLogs);

      if (settings.autoSyncNoticeBoard) {
        syncToNoticesBoard();
      }

      if (typeof toast === "function") {
        toast(`✅ Harvester finished! ${added} new updates added.`);
      }

      if (typeof renderAdmin === "function" && adminTab === "harvester") {
        renderAdmin();
      }

      return { success: true, added, log: logEntry };
    } catch (err) {
      console.error("Harvester failed:", err);
      if (typeof toast === "function") {
        toast(`⚠️ Harvester error: ${err.message}`);
      }
      return { success: false, error: err.message };
    } finally {
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.textContent = "🚀 Fetch & Harvest Now";
      }
    }
  }

  // Sync published harvested items with KrishiGyan notices list
  function syncToNoticesBoard() {
    if (!Array.isArray(window.noticesList)) return;
    
    let noticeAdded = false;
    const existingLinks = new Set(window.noticesList.map(n => n.link || n.title));

    harvestedItems.filter(item => item.status === 'published').slice(0, 15).forEach(item => {
      const key = item.link || item.title;
      if (!existingLinks.has(key)) {
        const d = new Date(item.pubDate || item.timestamp);
        const fDate = !isNaN(d) ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}` : "Recent";
        
        window.noticesList.unshift({
          id: item.id,
          title: item.title,
          category: item.category || "EXAM",
          examTag: item.exam || "GENERAL",
          desc: item.desc || "",
          date: fDate,
          link: item.link,
          source: item.source,
          timestamp: item.timestamp || Date.now()
        });
        existingLinks.add(key);
        noticeAdded = true;
      }
    });

    if (noticeAdded && typeof sSet === "function") {
      sSet("bhu:notices", window.noticesList);
      if (typeof renderNotices === "function") renderNotices();
    }
  }

  // Update Item Status (Approve / Reject / Delete)
  async function setItemStatus(id, newStatus) {
    const item = harvestedItems.find(i => i.id === id);
    if (!item) return;

    if (newStatus === 'delete') {
      harvestedItems = harvestedItems.filter(i => i.id !== id);
    } else {
      item.status = newStatus;
      if (newStatus === 'published' && settings.autoSyncNoticeBoard) {
        syncToNoticesBoard();
      }
    }

    await safeSet(STORAGE_KEY, harvestedItems);
    if (typeof renderAdmin === "function") renderAdmin();
    if (typeof toast === "function") toast(`Item ${newStatus}`);
  }

  // Save Settings from Admin Panel
  async function saveSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    await safeSet(SETTINGS_KEY, settings);
    if (typeof toast === "function") toast("Harvester settings updated!");
  }

  // Render Admin Harvester Tab Content
  function renderAdminView() {
    const pendingCount = harvestedItems.filter(i => i.status === 'pending_review').length;
    const publishedCount = harvestedItems.filter(i => i.status === 'published').length;
    const lastRunFormatted = settings.lastRun ? new Date(settings.lastRun).toLocaleString('en-IN') : "Never";

    return `
      <div style="background:#fff; border-radius:12px; padding:20px; border:1px solid #E0EAE0; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <div>
            <h3 style="margin:0 0 4px 0; color:#0F3D23; font-size:18px;">🤖 Automated Agriculture Harvester</h3>
            <div style="font-size:12px; color:#666;">
              Vercel Daily Cron (06:00 UTC / 11:30 AM IST) &bull; Last run: <strong>${lastRunFormatted}</strong>
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button id="btnTriggerHarvest" class="btn btn-primary" onclick="AgriHarvester.triggerHarvest()" style="font-size:13px; padding:8px 16px;">
              🚀 Fetch & Harvest Now
            </button>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin-bottom:20px;">
          <div style="background:#F4FBF4; padding:12px; border-radius:8px; border:1px solid #D0EBD0;">
            <div style="font-size:11px; color:#555; text-transform:uppercase; font-weight:700;">Published Updates</div>
            <div style="font-size:24px; font-weight:800; color:#00B050;">${publishedCount}</div>
          </div>
          <div style="background:#FFF9E6; padding:12px; border-radius:8px; border:1px solid #FFE082;">
            <div style="font-size:11px; color:#555; text-transform:uppercase; font-weight:700;">Pending Review</div>
            <div style="font-size:24px; font-weight:800; color:#F57C00;">${pendingCount}</div>
          </div>
          <div style="background:#E3F2FD; padding:12px; border-radius:8px; border:1px solid #BBDEFB;">
            <div style="font-size:11px; color:#555; text-transform:uppercase; font-weight:700;">Total Discovered</div>
            <div style="font-size:24px; font-weight:800; color:#1976D2;">${harvestedItems.length}</div>
          </div>
        </div>

        <!-- Automation Settings -->
        <details style="background:#F8FBF8; border-radius:8px; padding:12px; border:1px solid #E0EAE0; margin-bottom:20px;">
          <summary style="font-weight:700; color:#0F3D23; cursor:pointer;">⚙️ Harvester Settings &amp; Security</summary>
          <div style="margin-top:12px; display:flex; flex-direction:column; gap:10px;">
            <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
              <input type="checkbox" id="harvAutoPub" ${settings.autoPublishOfficial ? 'checked' : ''} onchange="AgriHarvester.saveSettings({autoPublishOfficial: this.checked})">
              Auto-publish verified official notices (ICAR, NTA, IBPS, NABARD, PIB)
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
              <input type="checkbox" id="harvSyncNotice" ${settings.autoSyncNoticeBoard ? 'checked' : ''} onchange="AgriHarvester.saveSettings({autoSyncNoticeBoard: this.checked})">
              Automatically display published updates in Student Notice Board
            </label>
            <div style="font-size:12px; color:#666; margin-top:4px;">
              🔒 <em>Secured with Firebase Admin ID tokens and Vercel Cron signatures.</em>
            </div>
          </div>
        </details>

        <!-- Discovered Items List -->
        <h4 style="margin:0 0 12px 0; font-size:15px; color:#333;">Discovered Exam Updates &amp; Agriculture News</h4>
        <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-primary" onclick="window.harvFilter = 'all'; renderAdmin();">All (${harvestedItems.length})</button>
          <button class="btn btn-sm btn-light" onclick="window.harvFilter = 'pending'; renderAdmin();">Pending Review (${pendingCount})</button>
          <button class="btn btn-sm btn-light" onclick="window.harvFilter = 'published'; renderAdmin();">Published (${publishedCount})</button>
        </div>

        <div style="max-height:500px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
          ${renderItemsList()}
        </div>
      </div>
    `;
  }

  function renderItemsList() {
    const filter = window.harvFilter || 'all';
    let filtered = harvestedItems;
    if (filter === 'pending') filtered = harvestedItems.filter(i => i.status === 'pending_review');
    else if (filter === 'published') filtered = harvestedItems.filter(i => i.status === 'published');

    if (filtered.length === 0) {
      return `<div style="text-align:center; padding:30px; color:#888; font-size:13px;">No items in this category. Click 'Fetch &amp; Harvest Now' to collect fresh updates.</div>`;
    }

    return filtered.map(item => `
      <div style="border:1px solid #EBEBEB; border-radius:8px; padding:12px; background:${item.status === 'pending_review' ? '#FFFDF5' : '#FAFCFA'}; display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">
        <div style="flex:1; min-width:240px;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px; flex-wrap:wrap;">
            <span style="background:${item.isOfficial ? '#E8F5E9' : '#EDE7F6'}; color:${item.isOfficial ? '#2E7D32' : '#512DA8'}; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px;">
              ${item.exam || 'GENERAL'}
            </span>
            <span style="background:#EEEEEE; color:#444; font-size:10px; padding:2px 6px; border-radius:4px;">
              ${item.resourceType || item.category}
            </span>
            <span style="font-size:11px; color:#888;">
              ${item.source} &bull; ${item.pubDate ? new Date(item.pubDate).toLocaleDateString() : ''}
            </span>
          </div>
          <div style="font-weight:700; font-size:13px; color:#111; margin-bottom:4px;">
            <a href="${item.link}" target="_blank" rel="noopener" style="color:inherit; text-decoration:none;">
              ${item.title} ↗
            </a>
          </div>
          <div style="font-size:12px; color:#555; line-height:1.4;">
            ${item.desc}
          </div>
        </div>

        <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
          ${item.status === 'pending_review' ? `
            <button class="btn btn-sm btn-primary" onclick="AgriHarvester.setItemStatus('${item.id}', 'published')" style="padding:4px 10px; font-size:11px;">
              Approve ✅
            </button>
          ` : `
            <span style="color:#2E7D32; font-size:11px; font-weight:700; padding:4px 8px; background:#E8F5E9; border-radius:4px;">
              Active
            </span>
          `}
          <button class="btn btn-sm btn-light" onclick="AgriHarvester.setItemStatus('${item.id}', 'delete')" style="padding:4px 8px; font-size:11px; color:#D32F2F;">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }

  return {
    init,
    triggerHarvest,
    saveSettings,
    setItemStatus,
    renderAdminView,
    syncToNoticesBoard,
    getHarvestedItems: () => harvestedItems,
    getSettings: () => settings
  };
})();

// Auto initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => AgriHarvester.init(), 100);
  });
} else {
  setTimeout(() => AgriHarvester.init(), 100);
}
