const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Replace the AI JS functions with Group Chat JS functions
const scriptStart = c.indexOf('let msgs=[');
const scriptEnd = c.indexOf('function loadNotices()');

if (scriptStart > -1 && scriptEnd > -1) {
    const oldJs = c.substring(scriptStart, scriptEnd);
    
    const newJs = `// ─── LIVE GROUP CHAT ───────────────────────────────────────────────
let gcInterval = null;

function renderGroupChat() {
  const el = document.getElementById("groupChatMessages");
  if(!el) return;
  let msgs = [];
  try { msgs = JSON.parse(localStorage.getItem("bhu:groupchat") || "[]"); } catch{}
  
  const u = currentUser;
  const myEmail = u ? u.email : "";
  
  if(!msgs.length) {
    el.innerHTML = '<div style="text-align:center;font-size:11px;color:#777;margin-top:20px;">Welcome to the Live Chat! Ask your doubts here.</div>';
    return;
  }
  
  el.innerHTML = msgs.map(m => {
    const isMe = m.email === myEmail;
    return \`
      <div style="display:flex;flex-direction:column;align-items:\${isMe?'flex-end':'flex-start'};margin-bottom:4px;">
        \${!isMe ? \`<div style="font-size:10px;color:#777;margin-bottom:2px;padding-left:4px;font-weight:700;">\${escapeHTML(m.name||'Student')}</div>\` : ''}
        <div style="background:\${isMe?'#1565C0':'#fff'};color:\${isMe?'#fff':'#333'};padding:10px 14px;border-radius:\${isMe?'14px 14px 2px 14px':'14px 14px 14px 2px'};max-width:85%;box-shadow:0 1px 2px rgba(0,0,0,0.05);font-size:13px;line-height:1.4;word-wrap:break-word;border:\${isMe?'none':'1px solid #E0EAE0'};">
          \${escapeHTML(m.text)}
        </div>
        <div style="font-size:9px;color:#999;margin-top:2px;">\${m.time}</div>
      </div>\`;
  }).join("");
  el.scrollTop = el.scrollHeight;
}

async function sendGroupChat() {
  if(!currentUser) { toast("Please login to chat!"); return; }
  const inp = document.getElementById("groupChatInput");
  const text = inp.value.trim();
  if(!text) return;
  inp.value = "";
  inp.style.height = "";
  
  let msgs = [];
  try { msgs = JSON.parse(localStorage.getItem("bhu:groupchat") || "[]"); } catch{}
  
  msgs.push({
    id: Date.now().toString(),
    email: currentUser.email,
    name: currentUser.name,
    text: text,
    time: typeof fmtTime === "function" ? fmtTime() : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  });
  
  // Keep last 100 messages
  if(msgs.length > 100) msgs = msgs.slice(msgs.length - 100);
  
  localStorage.setItem("bhu:groupchat", JSON.stringify(msgs));
  renderGroupChat();
  
  // Sync to Firebase
  if(typeof sSet === "function") await sSet("bhu:groupchat", msgs);
}

async function syncGroupChat() {
  if(typeof sGet === "function") {
    const data = await sGet("bhu:groupchat");
    if(data) {
      localStorage.setItem("bhu:groupchat", JSON.stringify(data));
      renderGroupChat();
    }
  }
}

// Override setChatTab to handle intervals
const _origSetChatTab = window.setChatTab;
window.setChatTab = function(t) {
  _origSetChatTab(t);
  if(t === 'ai') {
    renderGroupChat();
    syncGroupChat();
    if(!gcInterval) gcInterval = setInterval(syncGroupChat, 5000);
  } else {
    if(gcInterval) { clearInterval(gcInterval); gcInterval = null; }
  }
};

// Start sync if already on chat tab
document.addEventListener("DOMContentLoaded", () => {
  if(document.getElementById("aiChat") && document.getElementById("aiChat").style.display !== "none") {
    syncGroupChat();
    if(!gcInterval) gcInterval = setInterval(syncGroupChat, 5000);
  }
});

function openCommunityAI(){}
function sendCommunityAI(){}
function clearChat(){}
function renderChat(){}

`;

    c = c.replace(oldJs, newJs);
    fs.writeFileSync('index.html', c);
    console.log('JS successfully updated.');
} else {
    console.log('Could not find the script block.');
}
