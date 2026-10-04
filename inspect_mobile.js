const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');

// Check viewport meta
const headEnd = c.indexOf('</head>');
const head = c.substring(0, headEnd);
const vpMatch = head.match(/meta[^>]*viewport[^>]*/g);
console.log('Viewport tags:');
console.log(vpMatch);

// Check mobile media queries
const mq = [...c.matchAll(/@media[^{]*\{/g)];
console.log('\nMedia queries found:', mq.length);
mq.slice(0, 10).forEach(m => console.log(' ', m[0]));
