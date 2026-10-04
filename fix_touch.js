const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Update Menu HTML
const oldMenuHtml = `<div id="gcContextMenu" style="display:none;position:fixed;background:#fff;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:9999;overflow:hidden;min-width:140px;">
        <div onclick="gcEditMessage()" style="padding:12px 16px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;border-bottom:1px solid #f0f0f0;" onmouseenter="this.style.background='#f5f5f5'" onmouseleave="this.style.background='#fff'">✏️ Edit</div>
        <div onclick="gcDeleteMessage()" style="padding:12px 16px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;color:#E53935;" onmouseenter="this.style.background='#fff5f5'" onmouseleave="this.style.background='#fff'">🗑️ Delete</div>
        <div onclick="gcCloseMenu()" style="padding:10px 16px;font-size:12px;cursor:pointer;color:#777;text-align:center;" onmouseenter="this.style.background='#f5f5f5'" onmouseleave="this.style.background='#fff'">Cancel</div>
      </div>`;

const newMenuHtml = `<div id="gcContextMenu" style="display:none;position:fixed;background:#fff;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:99999;overflow:hidden;min-width:140px;">
        <div onclick="gcEditMessage(event)" style="padding:14px 16px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;border-bottom:1px solid #f0f0f0;color:#111;">✏️ Edit</div>
        <div onclick="gcDeleteMessage(event)" style="padding:14px 16px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;color:#E53935;border-bottom:1px solid #f0f0f0;">🗑️ Delete</div>
        <div onclick="gcCloseMenu(event)" style="padding:12px 16px;font-size:13px;cursor:pointer;color:#555;text-align:center;">Cancel</div>
      </div>`;

if(c.includes(oldMenuHtml)) {
  c = c.replace(oldMenuHtml, newMenuHtml);
  console.log('Replaced Menu HTML');
} else {
  console.log('Could not find Menu HTML to replace');
}

// Update JS logic for OpenMenu, Edit, Delete
const oldOpenMenu = `function gcOpenMenu(msgId, event) {
  gcContextMsgId = msgId;
  const menu = document.getElementById("gcContextMenu");
  if (!menu) return;
  menu.style.display = "block";
  const x = Math.min(event.clientX, window.innerWidth - 160);
  const y = Math.min(event.clientY, window.innerHeight - 130);
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  event.preventDefault();
  if(event.stopPropagation) event.stopPropagation();
}`;

const newOpenMenu = `function gcOpenMenu(msgId, event) {
  if (event && event.stopPropagation) event.stopPropagation();
  gcContextMsgId = msgId;
  const menu = document.getElementById("gcContextMenu");
  if (!menu) return;
  
  let cx = 100, cy = 100;
  if (event && event.clientX !== undefined) {
    cx = event.clientX; cy = event.clientY;
  } else if (event && event.touches && event.touches.length > 0) {
    cx = event.touches[0].clientX; cy = event.touches[0].clientY;
  }
  
  menu.style.display = "block";
  const x = Math.min(cx, window.innerWidth - 160);
  const y = Math.min(cy, window.innerHeight - 150);
  menu.style.left = Math.max(10, x) + "px";
  menu.style.top = Math.max(10, y) + "px";
  
  if (event && event.preventDefault) {
    try { event.preventDefault(); } catch(e){}
  }
}`;

c = c.replace(oldOpenMenu, newOpenMenu);

const oldEditMsg = `function gcEditMessage() {
  gcCloseMenu();`;

const newEditMsg = `function gcEditMessage(e) {
  if(e && e.stopPropagation) e.stopPropagation();
  gcCloseMenu();`;
c = c.replace(oldEditMsg, newEditMsg);

const oldDeleteMsg = `async function gcDeleteMessage() {
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
}`;

const newDeleteMsg = `async function gcDeleteMessage(e) {
  if(e && e.stopPropagation) e.stopPropagation();
  const idToDelete = gcContextMsgId;
  gcCloseMenu();
  if (!currentUser) return;
  let chatMsgs = [];
  try { chatMsgs = JSON.parse(localStorage.getItem("bhu:groupchat") || "[]"); } catch {}
  const msg = chatMsgs.find(m => m.id === idToDelete);
  const isAdmin = (currentUser && currentUser.isAdmin) || (typeof isManager === "function" && isManager(currentUser));
  if (!msg || (msg.email !== currentUser.email && !isAdmin)) { 
    toast("You can only delete your own messages"); 
    return; 
  }
  
  chatMsgs = chatMsgs.filter(m => m.id !== idToDelete);
  localStorage.setItem("bhu:groupchat", JSON.stringify(chatMsgs));
  renderGroupChat();
  toast("Message deleted"); // show immediately
  if (typeof sSet === "function") await sSet("bhu:groupchat", chatMsgs);
}`;
c = c.replace(oldDeleteMsg, newDeleteMsg);

const oldTouchStart = `let gcTouchTimer = null;
function gcTouchStart(msgId, event) {
  gcTouchTimer = setTimeout(() => gcOpenMenu(msgId, event.touches[0]), 500);
}`;
const newTouchStart = `let gcTouchTimer = null;
function gcTouchStart(msgId, event) {
  gcTouchTimer = setTimeout(() => gcOpenMenu(msgId, event), 500);
}`;
c = c.replace(oldTouchStart, newTouchStart);

fs.writeFileSync('index.html', c);
console.log('Fixed touch mapping and event handling');
