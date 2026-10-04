const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const oldCloseMenu = `function gcCloseMenu() {
  const menu = document.getElementById("gcContextMenu");
  if (menu) menu.style.display = "none";
  gcContextMsgId = null;
}`;

const newCloseMenu = `function gcCloseMenu(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const menu = document.getElementById("gcContextMenu");
  if (menu) menu.style.display = "none";
  gcContextMsgId = null;
}`;

c = c.replace(oldCloseMenu, newCloseMenu);
fs.writeFileSync('index.html', c);
console.log('Fixed gcCloseMenu propagation');
