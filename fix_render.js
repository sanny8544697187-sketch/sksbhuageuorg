const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const oldRenderChatStr = `  const u = currentUser;
  const myEmail = u ? u.email : "";`;

const newRenderChatStr = `  const u = currentUser;
  const myEmail = u ? u.email : "";
  const currIsAdmin = u && (u.isAdmin || (typeof isManager === "function" && isManager(u)));`;

c = c.replace(oldRenderChatStr, newRenderChatStr);

const oldMenuAttrStr = `const menuAttr = isMe ? \`oncontextmenu="gcOpenMenu('\${m.id}',event)" ontouchstart="gcTouchStart('\${m.id}',event)" ontouchend="gcTouchEnd()" style="cursor:pointer;"\` : "";`;

const newMenuAttrStr = `const canEditDelete = isMe || currIsAdmin;
    const menuAttr = canEditDelete ? \`oncontextmenu="gcOpenMenu('\${m.id}',event)" ontouchstart="gcTouchStart('\${m.id}',event)" ontouchend="gcTouchEnd()" style="cursor:pointer;"\` : "";`;

c = c.replace(oldMenuAttrStr, newMenuAttrStr);

fs.writeFileSync('index.html', c);
console.log('Fixed renderGroupChat privileges');
