
const fs = require("fs");
const content = fs.readFileSync("index.html", "utf8");

// Validate doRegister is calling Firebase Auth
const hasFirebaseAuth = /await firebase\.auth\(\)\.createUserWithEmailAndPassword\(em, pass\)/.test(content);
console.log("doRegister uses Firebase Auth:", hasFirebaseAuth);

// Validate processGoogleUser has 4-way lookup for Scenario C
const hasEmailLookup = /found = usersDB\.find\(u => u\.email && u\.email\.toLowerCase\(\) === em\)/.test(content);
console.log("processGoogleUser has email lookup:", hasEmailLookup);

