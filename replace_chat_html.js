const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// 1. Replace tab button
c = c.replace('<button id="aiTabBtn" class="btn btn-light" onclick="setChatTab(\'ai\')">🤖 AI Professor</button>', 
              '<button id="aiTabBtn" class="btn btn-light" onclick="setChatTab(\'ai\')">💬 Live Chat</button>');

// 2. Replace inline button in community section
c = c.replace('<button class="btn btn-light" style="font-size:13px;border:1.5px solid #00B050;color:#00B050;" onclick="openCommunityAI()">🤖 Ask AI Professor</button>',
              '<button class="btn btn-light" style="font-size:13px;border:1.5px solid #1565C0;color:#1565C0;" onclick="setChatTab(\'ai\')">💬 Live Chat</button>');

// 3. We no longer need the inline community AI box if we just redirect them to the Live Chat tab.
// So let's remove communityAIBox entirely to keep it clean.
const aiBoxStart = c.indexOf('<!-- AI Professor in Community -->');
const aiBoxEnd = c.indexOf('<!-- Ask doubt form -->');
if (aiBoxStart > -1 && aiBoxEnd > -1) {
    c = c.substring(0, aiBoxStart) + c.substring(aiBoxEnd);
}

// 4. Update the #aiChat UI to be a Group Chat UI
const chatAreaRegex = /<div id="aiChat" class="chat-layout"[\s\S]*?<!-- Community Doubts -->/;
const oldChatArea = c.match(chatAreaRegex);

if (oldChatArea) {
    const newChatArea = `<div id="aiChat" class="chat-layout" style="display:none;background:#F8FBF8;border-radius:12px;overflow:hidden;border:1px solid #E0EAE0;">
      <div style="background:#fff;padding:12px 16px;border-bottom:1px solid #E0EAE0;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#1565C0,#42A5F5);display:flex;align-items:center;justify-content:center;font-size:20px;">💬</div>
          <div>
            <div style="font-weight:800;font-size:15px;color:#0F3D23;">Student Live Chat</div>
            <div style="font-size:11px;color:#00B050;font-weight:700;">● Online now</div>
          </div>
        </div>
      </div>
      
      <div id="groupChatMessages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:#F8FBF8;">
        <div style="text-align:center;font-size:11px;color:#777;margin-bottom:10px;">Welcome to the Live Chat! Ask your doubts here.</div>
      </div>
      
      <div style="background:#fff;padding:12px;border-top:1px solid #E0EAE0;">
        <div style="display:flex;gap:8px;align-items:flex-end;">
          <textarea id="groupChatInput" class="inp" rows="1" placeholder="Type a message..." style="resize:none;flex:1;border-radius:20px;padding:12px 16px;font-size:13px;max-height:100px;background:#F0F5F0;border:none;" oninput="this.style.height='';this.style.height=this.scrollHeight+'px'" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendGroupChat();}"></textarea>
          <button class="btn btn-primary" style="width:44px;height:44px;padding:0;border-radius:50%;flex-shrink:0;font-size:18px;background:#1565C0;box-shadow:0 4px 10px rgba(21,101,192,0.3);" onclick="sendGroupChat()">➤</button>
        </div>
      </div>
    </div>

    <!-- Community Doubts -->`;
    
    c = c.replace(chatAreaRegex, newChatArea);
}

fs.writeFileSync('index.html', c);
console.log('HTML updated.');
