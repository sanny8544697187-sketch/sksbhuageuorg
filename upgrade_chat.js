const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// ── 1. REPLACE THE ENTIRE #aiChat HTML with a WhatsApp-style layout ──
const oldChatHtml = c.substring(
  c.indexOf('<div id="aiChat" class="chat-layout"'),
  c.indexOf('<!-- Community Doubts -->')
);

const newChatHtml = `<div id="aiChat" style="display:none;flex-direction:column;height:calc(100vh - 240px);min-height:500px;background:#ECE5DD;border-radius:16px;overflow:hidden;border:1px solid #D0D0D0;position:relative;">

      <!-- Chat Header (WhatsApp-style) -->
      <div style="background:#128C7E;padding:10px 14px;display:flex;align-items:center;gap:12px;flex-shrink:0;position:relative;z-index:2;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
        <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">👥</div>
        <div style="flex:1;">
          <div style="font-weight:800;font-size:14px;color:#fff;">KrishiGyan Students</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.8);">Live Group Chat</div>
        </div>
      </div>

      <!-- Context Menu (hidden by default) -->
      <div id="gcContextMenu" style="display:none;position:fixed;background:#fff;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:9999;overflow:hidden;min-width:140px;">
        <div onclick="gcEditMessage()" style="padding:12px 16px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;border-bottom:1px solid #f0f0f0;" onmouseenter="this.style.background='#f5f5f5'" onmouseleave="this.style.background='#fff'">✏️ Edit</div>
        <div onclick="gcDeleteMessage()" style="padding:12px 16px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;color:#E53935;" onmouseenter="this.style.background='#fff5f5'" onmouseleave="this.style.background='#fff'">🗑️ Delete</div>
        <div onclick="gcCloseMenu()" style="padding:10px 16px;font-size:12px;cursor:pointer;color:#777;text-align:center;" onmouseenter="this.style.background='#f5f5f5'" onmouseleave="this.style.background='#fff'">Cancel</div>
      </div>

      <!-- Messages Area -->
      <div id="groupChatMessages" style="flex:1;overflow-y:auto;padding:12px 10px;display:flex;flex-direction:column;gap:2px;background:#ECE5DD;"></div>

      <!-- Edit Mode Banner -->
      <div id="gcEditBanner" style="display:none;background:#E8F5E9;padding:8px 14px;border-top:2px solid #128C7E;font-size:12px;color:#0F3D23;flex-shrink:0;align-items:center;justify-content:space-between;">
        <span>✏️ Editing message</span>
        <button onclick="gcCancelEdit()" style="background:none;border:none;cursor:pointer;font-size:18px;color:#777;line-height:1;">✕</button>
      </div>

      <!-- Input Bar (WhatsApp-style, pinned at bottom) -->
      <div style="background:#F0F0F0;padding:8px 10px;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;border-top:1px solid #D0D0D0;">
        <div style="flex:1;background:#fff;border-radius:24px;padding:8px 14px;display:flex;align-items:flex-end;box-shadow:0 1px 2px rgba(0,0,0,0.1);">
          <textarea id="groupChatInput" rows="1" placeholder="Type a message..." style="resize:none;flex:1;border:none;outline:none;font-size:14px;font-family:inherit;background:transparent;max-height:100px;line-height:1.4;" oninput="this.style.height='';this.style.height=this.scrollHeight+'px'" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendGroupChat();}"></textarea>
        </div>
        <button onclick="sendGroupChat()" style="width:48px;height:48px;border-radius:50%;background:#128C7E;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:0 2px 8px rgba(18,140,126,0.4);">➤</button>
      </div>
    </div>

    `;

c = c.replace(oldChatHtml, newChatHtml);

// ── 2. REPLACE THE renderGroupChat & sendGroupChat JS ──
const oldRenderFn = c.indexOf('function renderGroupChat() {');
const oldRenderEnd = c.indexOf('function openCommunityAI(){}');

if (oldRenderFn > -1 && oldRenderEnd > -1) {
  const oldJs = c.substring(oldRenderFn, oldRenderEnd);
  const newJs = `let gcContextMsgId = null;

function gcOpenMenu(msgId, event) {
  gcContextMsgId = msgId;
  const menu = document.getElementById("gcContextMenu");
  if (!menu) return;
  menu.style.display = "block";
  const x = Math.min(event.clientX, window.innerWidth - 160);
  const y = Math.min(event.clientY, window.innerHeight - 130);
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  event.preventDefault();
}

function gcCloseMenu() {
  const menu = document.getElementById("gcContextMenu");
  if (menu) menu.style.display = "none";
  gcContextMsgId = null;
}

function gcEditMessage() {
  gcCloseMenu();
  let chatMsgs = [];
  try { chatMsgs = JSON.parse(localStorage.getItem("bhu:groupchat") || "[]"); } catch {}
  const msg = chatMsgs.find(m => m.id === gcContextMsgId);
  if (!msg || !currentUser || msg.email !== currentUser.email) { toast("You can only edit your own messages"); return; }
  const inp = document.getElementById("groupChatInput");
  if (inp) {
    inp.value = msg.text;
    inp.dataset.editingId = msg.id;
    inp.focus();
    inp.style.height = "";
    inp.style.height = inp.scrollHeight + "px";
  }
  const banner = document.getElementById("gcEditBanner");
  if (banner) banner.style.display = "flex";
}

function gcCancelEdit() {
  const inp = document.getElementById("groupChatInput");
  if (inp) { inp.value = ""; inp.dataset.editingId = ""; inp.style.height = ""; }
  const banner = document.getElementById("gcEditBanner");
  if (banner) banner.style.display = "none";
}

async function gcDeleteMessage() {
  gcCloseMenu();
  if (!currentUser) return;
  let chatMsgs = [];
  try { chatMsgs = JSON.parse(localStorage.getItem("bhu:groupchat") || "[]"); } catch {}
  const msg = chatMsgs.find(m => m.id === gcContextMsgId);
  const isAdmin = currentUser.isAdmin || (typeof isManager === "function" && isManager(currentUser));
  if (!msg || (msg.email !== currentUser.email && !isAdmin)) { toast("You can only delete your own messages"); return; }
  chatMsgs = chatMsgs.filter(m => m.id !== gcContextMsgId);
  localStorage.setItem("bhu:groupchat", JSON.stringify(chatMsgs));
  renderGroupChat();
  if (typeof sSet === "function") await sSet("bhu:groupchat", chatMsgs);
  toast("Message deleted");
}

// Close context menu on outside click
document.addEventListener("click", (e) => {
  const menu = document.getElementById("gcContextMenu");
  if (menu && menu.style.display === "block" && !menu.contains(e.target)) gcCloseMenu();
});

function renderGroupChat() {
  const el = document.getElementById("groupChatMessages");
  if (!el) return;
  let chatMsgs = [];
  try { chatMsgs = JSON.parse(localStorage.getItem("bhu:groupchat") || "[]"); } catch {}

  const u = currentUser;
  const myEmail = u ? u.email : "";

  if (!chatMsgs.length) {
    el.innerHTML = \`<div style="text-align:center;padding:24px;">
      <div style="font-size:36px;margin-bottom:8px;">💬</div>
      <div style="font-size:12px;color:#888;background:rgba(255,255,255,0.7);border-radius:20px;padding:6px 14px;display:inline-block;">Welcome to KrishiGyan Student Chat!<br>Ask doubts, discuss topics, help each other 🌱</div>
    </div>\`;
    return;
  }

  // Group messages by day
  let lastDate = "";
  el.innerHTML = chatMsgs.map(m => {
    const isMe = m.email === myEmail;
    const isAdmin = m.isAdmin;
    const msgDate = m.date || "";
    let dateDivider = "";
    if (msgDate && msgDate !== lastDate) {
      lastDate = msgDate;
      dateDivider = \`<div style="text-align:center;margin:10px 0;"><span style="background:rgba(255,255,255,0.8);padding:4px 12px;border-radius:12px;font-size:11px;color:#666;">\${escapeHTML(msgDate)}</span></div>\`;
    }

    const bubbleBg = isMe ? "#DCF8C6" : "#FFFFFF";
    const bubbleAlign = isMe ? "flex-end" : "flex-start";
    const bubbleRadius = isMe ? "12px 2px 12px 12px" : "2px 12px 12px 12px";
    const edited = m.edited ? \` <span style="font-size:9px;color:#888;font-style:italic;">edited</span>\` : "";
    const menuAttr = isMe ? \`oncontextmenu="gcOpenMenu('\${m.id}',event)" ontouchstart="gcTouchStart('\${m.id}',event)" ontouchend="gcTouchEnd()" style="cursor:pointer;"\` : "";

    return dateDivider + \`
      <div style="display:flex;justify-content:\${bubbleAlign};margin-bottom:2px;">
        <div \${menuAttr} style="max-width:78%;min-width:80px;">
          \${!isMe ? \`<div style="font-size:10px;color:\${isAdmin?"#128C7E":"#9C27B0"};font-weight:700;padding:0 10px;margin-bottom:2px;">\${escapeHTML(m.name || "Student")}\${isAdmin ? " 👑" : ""}</div>\` : ""}
          <div style="background:\${bubbleBg};padding:8px 10px 6px;border-radius:\${bubbleRadius};box-shadow:0 1px 2px rgba(0,0,0,0.1);word-wrap:break-word;">
            <div style="font-size:13px;line-height:1.5;color:#111;">\${escapeHTML(m.text)}\${edited}</div>
            <div style="font-size:10px;color:#888;text-align:right;margin-top:2px;">\${escapeHTML(m.time || "")}\${isMe ? " ✓✓" : ""}</div>
          </div>
        </div>
      </div>\`;
  }).join("");
  el.scrollTop = el.scrollHeight;
}

// Long-press for touch devices
let gcTouchTimer = null;
function gcTouchStart(msgId, event) {
  gcTouchTimer = setTimeout(() => gcOpenMenu(msgId, event.touches[0]), 500);
}
function gcTouchEnd() {
  if (gcTouchTimer) clearTimeout(gcTouchTimer);
}

async function sendGroupChat() {
  if (!currentUser) { toast("Please login to chat!"); return; }
  const inp = document.getElementById("groupChatInput");
  const text = inp.value.trim();
  if (!text) return;

  let chatMsgs = [];
  try { chatMsgs = JSON.parse(localStorage.getItem("bhu:groupchat") || "[]"); } catch {}

  const editingId = inp.dataset.editingId;
  if (editingId) {
    // Edit mode
    chatMsgs = chatMsgs.map(m => m.id === editingId ? { ...m, text, edited: true } : m);
    gcCancelEdit();
  } else {
    // New message
    const now = new Date();
    chatMsgs.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      email: currentUser.email,
      name: currentUser.name,
      isAdmin: !!(currentUser.isAdmin),
      text,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    });
    inp.value = "";
    inp.style.height = "";
  }

  if (chatMsgs.length > 200) chatMsgs = chatMsgs.slice(chatMsgs.length - 200);
  localStorage.setItem("bhu:groupchat", JSON.stringify(chatMsgs));
  renderGroupChat();
  if (typeof sSet === "function") await sSet("bhu:groupchat", chatMsgs);
}

async function syncGroupChat() {
  if (typeof sGet === "function") {
    const data = await sGet("bhu:groupchat");
    if (data) {
      localStorage.setItem("bhu:groupchat", JSON.stringify(data));
      renderGroupChat();
    }
  }
}

let gcInterval = null;

function setChatTab(t) {
  chatTab = t;
  document.getElementById("aiChat").style.display = t === "ai" ? "flex" : "none";
  document.getElementById("communityChat").style.display = t === "community" ? "block" : "none";
  document.getElementById("aiTabBtn").className = "btn " + (t === "ai" ? "btn-primary" : "btn-light");
  document.getElementById("communityTabBtn").className = "btn " + (t === "community" ? "btn-primary" : "btn-light");

  if (t === "community") renderDoubts();
  if (t === "ai") {
    renderGroupChat();
    syncGroupChat();
    if (!gcInterval) gcInterval = setInterval(syncGroupChat, 5000);
  } else {
    if (gcInterval) { clearInterval(gcInterval); gcInterval = null; }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("aiChat") && document.getElementById("aiChat").style.display !== "none") {
    syncGroupChat();
    if (!gcInterval) gcInterval = setInterval(syncGroupChat, 5000);
  }
});

`;
  c = c.replace(oldJs, newJs);
}

fs.writeFileSync('index.html', c);
console.log('Done! Chat updated with edit/delete + WhatsApp UI.');
