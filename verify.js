
const fs = require("fs");
const content = fs.readFileSync("index.html", "utf8");

const checks = [
  ["doGoogleLogin signs out first", /signOut.*signInWithRedirect/s],
  ["processGoogleUser exists", /async function processGoogleUser/],
  ["4-way lookup: firebaseUid", /usersDB\.find\(u => u\.id === firebaseUid\)/],
  ["4-way lookup: googleUid", /usersDB\.find\(u => u\.googleUid === googleUid\)/],
  ["4-way lookup: email", /usersDB\.find\(u => u\.email && u\.email\.toLowerCase\(\) === em\)/],
  ["4-way lookup: noemail pattern", /noemail\.com/],
  ["Stores googleUid on new user", /googleUid: googleUid/],
  ["Token claims email fallback", /tok\.claims\.firebase\.identities\.email/],
  ["doRegister uses Firebase Auth", /createUserWithEmailAndPassword/],
  ["doLogin supports Firebase Auth", /signInWithEmailAndPassword/],
  ["Forgot password checks legacy users", /FB_AUTH_USER/],
  ["onAuthStateChanged has google.com guard", /providerId === .google\.com./],
  ["getRedirectResult is primary handler", /getRedirectResult.*then/s],
  ["Register form has Google button", /Sign up with Google/],
  ["Login form has Google button", /doGoogleLogin/],
];

let passed = 0, failed = 0;
checks.forEach(([name, pattern]) => {
  if (pattern.test(content)) { console.log("?", name); passed++; }
  else { console.error("?", name); failed++; }
});
console.log(`\nResult: ${passed} passed, ${failed} failed`);

