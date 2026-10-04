const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const s = c.indexOf('</script>\n\n<!-- DESKTOP HEADER -->');
if(s > -1) {
  console.log('Found desktop header comment');
  console.log(c.substring(s, s + 1000));
} else {
  const s2 = c.indexOf('</script>\n<header');
  if(s2 > -1) {
    console.log(c.substring(s2, s2 + 1000));
  } else {
    const s3 = c.indexOf('</script>\r\n<!--');
    console.log(c.substring(s3, s3 + 1000));
  }
}
