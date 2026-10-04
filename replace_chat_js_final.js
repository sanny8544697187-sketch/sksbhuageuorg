const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// The functions we want to replace are:
// setChatTab
// renderChat
// setAiInput
// clearChat
// sendAI
// openCommunityAI
// sendCommunityAI
// AI_SYS ... AI_ENDPOINT

// It's safer to just replace everything from `function setChatTab(t){` to the end of `async function sendCommunityAI(){ ... }`
const startIdx = c.indexOf('function setChatTab(t){');
const endFuncIdx = c.indexOf('function renderDoubts(){'); // Assuming renderDoubts comes after

if (startIdx > -1 && endFuncIdx > -1) {
    const oldJs = c.substring(startIdx, endFuncIdx);
    const newJs = `// ─── LIVE GROUP CHAT ───────────────────────────────────────────────
let gcInterval = null;

function renderGroupChat() {
  const el = document.getElementById("groupChatMessages");
  if(!el) return;
  let chatMsgs = [];
  try { chatMsgs = JSON.parse(localStorage.getItem("bhu:groupchat") || "[]"); } catch{}
  
  const u = currentUser;
  const myEmail = u ? u.email : "";
  
  if(!chatMsgs.length) {
    el.innerHTML = '<div style="text-align:center;font-size:11px;color:#777;margin-top:20px;">Welcome to the Live Chat! Ask your doubts here.</div>';
    return;
  }
  
  el.innerHTML = chatMsgs.map(m => {
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
  
  let chatMsgs = [];
  try { chatMsgs = JSON.parse(localStorage.getItem("bhu:groupchat") || "[]"); } catch{}
  
  chatMsgs.push({
    id: Date.now().toString(),
    email: currentUser.email,
    name: currentUser.name,
    text: text,
    time: typeof fmtTime === "function" ? fmtTime() : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  });
  
  // Keep last 100 messages
  if(chatMsgs.length > 100) chatMsgs = chatMsgs.slice(chatMsgs.length - 100);
  
  localStorage.setItem("bhu:groupchat", JSON.stringify(chatMsgs));
  renderGroupChat();
  
  // Sync to Firebase
  if(typeof sSet === "function") await sSet("bhu:groupchat", chatMsgs);
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

function setChatTab(t) {
  chatTab = t;
  document.getElementById("aiChat").style.display = t==="ai" ? "flex" : "none";
  document.getElementById("communityChat").style.display = t==="community" ? "block" : "none";
  document.getElementById("aiTabBtn").className = "btn " + (t==="ai" ? "btn-primary" : "btn-light");
  document.getElementById("communityTabBtn").className = "btn " + (t==="community" ? "btn-primary" : "btn-light");
  
  if(t === "community") renderDoubts();
  if(t === 'ai') {
    renderGroupChat();
    syncGroupChat();
    if(!gcInterval) gcInterval = setInterval(syncGroupChat, 5000);
  } else {
    if(gcInterval) { clearInterval(gcInterval); gcInterval = null; }
  }
}

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
function setAiInput(){}
async function sendAI(){}

`;
    c = c.replace(oldJs, newJs);
    fs.writeFileSync('index.html', c);
    console.log('JS successfully updated.');
} else {
    console.log('Could not find the script block.');
    console.log('startIdx:', startIdx);
    console.log('endFuncIdx:', endFuncIdx);
}
