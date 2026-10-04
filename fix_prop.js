const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

c = c.replace(
  '  event.preventDefault();\n}',
  '  event.preventDefault();\n  if(event.stopPropagation) event.stopPropagation();\n}'
);
c = c.replace(
  '  event.preventDefault();\r\n}',
  '  event.preventDefault();\r\n  if(event.stopPropagation) event.stopPropagation();\r\n}'
);

fs.writeFileSync('index.html', c);
console.log('Fixed propagation');
