
import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

process_google_user_str = """
async function processGoogleUser(fbUser, customName="", customRoll="", customYear="Other") {
  const em = fbUser.email.toLowerCase();
  const name = customName || fbUser.displayName || em.split("@")[0];
  
  if(em === ADMIN_EMAIL.toLowerCase()) {
    const u = { email: em, name: "Admin", isAdmin: true, year: "Administrator", roll: "" };
    currentUser = u; await sSet("bhu:session", u);
    closeLogin(); toast("Welcome, Admin! ???"); renderAll();
    return;
  }
  
  let found = usersDB.find(u => u.email.toLowerCase() === em);
  if(!found) {
    found = { 
      id: fbUser.uid || (Date.now()+""), 
      name: name, 
      roll: customRoll, 
      year: customYear, 
      email: em, 
      password: "FB_AUTH_USER", 
      joinedAt: new Date().toISOString(), 
      subPlan: null, 
      subExpiry: null 
    };
    usersDB = [...usersDB, found];
    await sSet("bhu:users", usersDB);
    if(fbOK) await saveUserToFirebase(found);
  }
  
  const sess = { ...found, isAdmin: false };
  currentUser = sess; await sSet("bhu:session", sess);
  closeLogin(); toast(`Welcome back, ${found.name}! ??`); renderAll();
}
"""

if "async function processGoogleUser" not in content:
    content = content.replace("async function doGoogleLogin", process_google_user_str + "\nasync function doGoogleLogin")

content = content.replace(
    "await firebase.auth().signInWithRedirect(provider);",
    "const res = await firebase.auth().signInWithPopup(provider);\n    await processGoogleUser(res.user);"
)

old_login = """async function doLogin(){
  const em=document.getElementById("authEmail").value.trim().toLowerCase();
  const pass=document.getElementById("authPass").value;
  const errEl=document.getElementById("authErr");
  if(!em||!pass){errEl.textContent="Enter email & password.";return;}
  if(em===ADMIN_EMAIL.toLowerCase()){
    if(pass!==adminPass){errEl.textContent="Wrong admin password.";return;}
    const u={email:em,name:"Admin",isAdmin:true,year:"Administrator",roll:""};
    currentUser=u; await sSet("bhu:session",u);
    closeLogin(); toast("Welcome, Admin! ???"); renderAll();
  } else {
    const found=usersDB.find(u=>u.email.toLowerCase()===em);
    if(!found){errEl.textContent="Account not found. Register first.";return;}
    if(found.password!==pass){errEl.textContent="Wrong password.";return;}
    const u={...found,isAdmin:false};
    currentUser=u; await sSet("bhu:session",u);
    closeLogin(); toast(`Welcome back, ${found.name}! ??`); renderAll();
  }
}"""

new_login = """async function doLogin(){
  const em=document.getElementById("authEmail").value.trim().toLowerCase();
  const pass=document.getElementById("authPass").value;
  const errEl=document.getElementById("authErr");
  if(!em||!pass){errEl.textContent="Enter email & password.";return;}
  if(em===ADMIN_EMAIL.toLowerCase()){
    if(pass!==adminPass){errEl.textContent="Wrong admin password.";return;}
    const u={email:em,name:"Admin",isAdmin:true,year:"Administrator",roll:""};
    currentUser=u; await sSet("bhu:session",u);
    closeLogin(); toast("Welcome, Admin! ???"); renderAll();
    return;
  }
  
  // Try legacy usersDB login first
  const found=usersDB.find(u=>u.email.toLowerCase()===em);
  if(found && found.password !== "FB_AUTH_USER"){
    if(found.password!==pass){errEl.textContent="Wrong password.";return;}
    const u={...found,isAdmin:false};
    currentUser=u; await sSet("bhu:session",u);
    closeLogin(); toast(`Welcome back, ${found.name}! ??`); renderAll();
    return;
  }
  
  // Try Firebase Auth
  try {
    const cred = await firebase.auth().signInWithEmailAndPassword(em, pass);
    await processGoogleUser(cred.user);
  } catch(e) {
    if(found && found.password === "FB_AUTH_USER") {
       errEl.textContent="Please login with Google for this account.";
    } else {
       errEl.textContent="Account not found or wrong password.";
    }
  }
}"""

content = content.replace(old_login, new_login)


old_register = """async function doRegister(){
  const name=document.getElementById("regName").value.trim();
  const em=document.getElementById("regEmail").value.trim().toLowerCase();
  const pass=document.getElementById("regPass").value;
  const roll="";
  const year="Other";
  const errEl=document.getElementById("regErr");
  if(!name||!em||!pass){errEl.textContent="Fill all required fields.";return;}
  if(pass.length<6){errEl.textContent="Password min 6 characters.";return;}
  if(em===ADMIN_EMAIL.toLowerCase()){errEl.textContent="Email reserved.";return;}
  if(usersDB.find(u=>u.email.toLowerCase()===em)){errEl.textContent="Email already registered. Login instead.";return;}
  const newU={id:Date.now()+"",name,roll,year,email:em,password:pass,joinedAt:new Date().toISOString(),subPlan:null,subExpiry:null};
  usersDB=[...usersDB,newU]; await sSet("bhu:users",usersDB); await saveUserToFirebase(newU);
  const sess={...newU,isAdmin:false}; currentUser=sess; await sSet("bhu:session",sess);
  closeLogin(); toast(`Registered! Welcome, ${name}! ??`); renderAll();
}"""

new_register = """async function doRegister(){
  const name=document.getElementById("regName").value.trim();
  const em=document.getElementById("regEmail").value.trim().toLowerCase();
  const pass=document.getElementById("regPass").value;
  const roll="";
  const year="Other";
  const errEl=document.getElementById("regErr");
  if(!name||!em||!pass){errEl.textContent="Fill all required fields.";return;}
  if(pass.length<6){errEl.textContent="Password min 6 characters.";return;}
  if(em===ADMIN_EMAIL.toLowerCase()){errEl.textContent="Email reserved.";return;}
  if(usersDB.find(u=>u.email.toLowerCase()===em)){errEl.textContent="Email already registered. Login instead.";return;}
  
  try {
    const cred = await firebase.auth().createUserWithEmailAndPassword(em, pass);
    await cred.user.updateProfile({ displayName: name });
    await processGoogleUser(cred.user, name, roll, year);
  } catch(e) {
    errEl.textContent = e.message;
  }
}"""

content = content.replace(old_register, new_register)

old_forgot = """  try {
    await firebase.auth().sendPasswordResetEmail(email);"""

new_forgot = """  try {
    const found = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());
    if(found && found.password !== "FB_AUTH_USER") {
       if(msgEl) {
         msgEl.textContent = "This is a manual offline account. Please contact the admin to reset your password, OR sign in with Google using this email.";
         msgEl.style.color = "#c9690a";
       }
       return;
    }
    await firebase.auth().sendPasswordResetEmail(email);"""

content = content.replace(old_forgot, new_forgot)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Auth fixed successfully with Python!")

