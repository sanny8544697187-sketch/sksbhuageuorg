const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const oldMenuAttrStr2 = `const menuAttr = canEditDelete ? \`oncontextmenu="gcOpenMenu('\${m.id}',event)" ontouchstart="gcTouchStart('\${m.id}',event)" ontouchend="gcTouchEnd()" style="cursor:pointer;"\` : "";`;

const newMenuAttrStr2 = `const menuAttr = canEditDelete ? \`onclick="gcOpenMenu('\${m.id}',event)" oncontextmenu="gcOpenMenu('\${m.id}',event)" ontouchstart="gcTouchStart('\${m.id}',event)" ontouchend="gcTouchEnd()" style="cursor:pointer;" title="Click to edit or delete"\` : "";`;

c = c.replace(oldMenuAttrStr2, newMenuAttrStr2);

fs.writeFileSync('index.html', c);
console.log('Fixed menu attr click');
