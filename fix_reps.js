const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Add repApps=[] to globals
content = content.replace('let noticesList=[],currentUser=null,adminPass=ADMIN_PASS_DEFAULT;', 'let noticesList=[],currentUser=null,adminPass=ADMIN_PASS_DEFAULT,repApps=[];');

// 2. Add sGet('bhu:repapps') to DOMContentLoaded Promise.all
content = content.replace(
  /sGet\("bhu:subjects"\),sGet\("bhu:notices"\)\s*\]\);/,
  'sGet("bhu:subjects"),sGet("bhu:notices"),sGet("bhu:repapps")\\n  ]);'
);
content = content.replace(
  /const \[n,p,u,sess,saved_ap,theme,q,pyq,subjData,ntc\] = await Promise\.all/,
  'const [n,p,u,sess,saved_ap,theme,q,pyq,subjData,ntc,ra] = await Promise.all'
);
content = content.replace(
  /if\(ntc && ntc\.length\) \{ noticesList=ntc; \} else \{/,
  'if(ra) repApps=ra;\\n  if(ntc && ntc.length) { noticesList=ntc; } else {'
);

// 3. Add to sync force
content = content.replace(
  /sSet\("bhu:subjects", activeSubjects\)\s*\]\)/,
  'sSet("bhu:subjects", activeSubjects),\\n      sSet("bhu:repapps", repApps)\\n    ])'
);
content = content.replace(
  /const \[nn,np,nu,nq,nae\]=await Promise\.all\(\[([^\]]+)\]\);/,
  'const [nn,np,nu,nq,nae,nra]=await Promise.all([,sGet("bhu:repapps")]);'
);
content = content.replace(
  /if\(nae\) adminEbooks=nae;/,
  'if(nae) adminEbooks=nae; if(nra) repApps=nra;'
);

const repFuncs = fs.readFileSync('repFuncs.js', 'utf8');
content = content.replace('</script>', repFuncs + '\\n</script>');

fs.writeFileSync('index.html', content);
console.log('Done updating index.html');
