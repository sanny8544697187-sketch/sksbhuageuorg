const fs = require('fs');

const assetLinksPath = '.well-known/assetlinks.json';
let content = fs.readFileSync(assetLinksPath, 'utf8');

try {
  let assetLinks = JSON.parse(content);
  
  // The user provided these two new keys (App Signing keys)
  const newKeys = [
    "4F:46:F8:73:C9:5E:1C:AB:14:A8:CC:C6:AF:93:1E:B9:91:E7:B4:64:5E:0C:BB:0F:D1:20:25:31:52:E1:1B:D2",
    "C0:E8:6E:48:AF:62:55:8B:8D:AC:9B:D9:ED:89:C8:A4:35:0D:0E:A3:81:31:27:31:D3:A2:78:FB:C2:72:0A:BD"
  ];
  
  // The original upload key currently in the file
  const existingKey = "4A:15:A9:30:55:80:6B:09:37:03:E2:C4:FD:77:AB:7F:E5:DD:BF:49:36:E8:B5:21:7D:C7:36:A8:1C:44:3B:F2";
  
  // Combine all keys, avoiding duplicates
  const allKeys = [...new Set([...newKeys, existingKey])];
  
  // Update the array in the JSON object
  assetLinks[0].target.sha256_cert_fingerprints = allKeys;
  
  // Write it back properly formatted
  fs.writeFileSync(assetLinksPath, JSON.stringify(assetLinks, null, 2), 'utf8');
  console.log('Successfully updated assetlinks.json with new fingerprints!');
  
} catch (e) {
  console.error("Error updating assetlinks:", e);
}
