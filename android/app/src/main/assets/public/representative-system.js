// ==========================================
// REPRESENTATIVE SYSTEM (REWRITTEN FOR OFFLINE + FIREBASE SYNC)
// ==========================================

async function submitRepresentativeApplication(e) {
  e.preventDefault();
  
  if (!window.currentUser) {
    showToast("Please login first", "error");
    return;
  }
  
  const uid = window.currentUser.id || window.currentUser.uid;
  
  // Check if already applied
  if (window.repApps && window.repApps.find(a => a.uid === uid)) {
    showToast("You have already submitted an application", "error");
    return;
  }
  
  const formData = {
    uid: uid,
    email: window.currentUser.email,
    name: document.getElementById("repName").value,
    college: document.getElementById("repCollege").value,
    course: document.getElementById("repCourse").value,
    year: document.getElementById("repYear").value,
    cityState: document.getElementById("repCity").value,
    reason: document.getElementById("repReason").value,
    contribution: document.getElementById("repContribution").value,
    phone: document.getElementById("repPhone").value || "",
    status: "pending",
    submittedAt: new Date().toISOString(),
    applicationId: "APP-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
  };
  
  window.repApps = window.repApps || [];
  window.repApps = [formData, ...window.repApps];
  await window.sSet("bhu:repapps", window.repApps);
  
  showToast("Application submitted successfully!", "success");
  document.getElementById("representativeModal").classList.add("hidden");
  document.getElementById("repForm").reset();
  
  // Update UI if pending tab is open
  if (document.getElementById("adminApplicationsList")?.style.display === "block") {
    loadAdminDashboard();
  }
}

async function loadAdminDashboard() {
  if (!(window.currentUser && window.currentUser.isAdmin)) return;
  
  const adminDiv = document.getElementById("adminApplicationsList");
  const l2 = document.getElementById("adminApprovedRepsList"); if(l2) l2.style.display="none";
  const l3 = document.getElementById("adminContributionsList"); if(l3) l3.style.display="none";
  if(adminDiv) adminDiv.style.display="block";
  if (!adminDiv) return;
  
  window.repApps = window.repApps || [];
  const pendingApps = window.repApps.filter(a => a.status === "pending");
  
  if (pendingApps.length === 0) {
    adminDiv.innerHTML = "<div style=\"padding:20px;text-align:center;color:#999;\">No pending applications</div>";
    return;
  }
  
  let html = "<h3 style=\"font-weight:800;margin-bottom:12px;\"> Pending Applications</h3>";
  pendingApps.forEach((app) => {
    html += `
      <div class="card" style="padding:16px;margin-bottom:12px;">
        <div style="margin-bottom:12px;">
          <div style="font-weight:800;font-size:15px;">${app.name}</div>
          <div style="font-size:12px;color:#777;">
            <div>${app.email}</div>
            <div>${app.college} - ${app.course} - Year ${app.year}</div>
            <div style="margin-top:6px;font-size:11px;color:#999;">${app.cityState}</div>
          </div>
        </div>
        <div style="background:#F8FBF8;border-radius:10px;padding:10px;margin-bottom:12px;font-size:12px;">
          <div style="margin-bottom:6px;"><strong>Why:</strong> ${app.reason}</div>
          <div><strong>How:</strong> ${app.contribution}</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" onclick="approveRepresentativeApplication('${app.applicationId}', '${app.uid}', '${app.email}')"> Approve</button>
          <button class="btn btn-light" onclick="rejectRepresentativeApplication('${app.applicationId}')"> Reject</button>
        </div>
      </div>
    `;
  });
  
  adminDiv.innerHTML = html;
}

async function approveRepresentativeApplication(appId, uid, email) {
  // Generate representative ID
  const repId = "KG-" + Date.now().toString(36).toUpperCase();
  
  // 1. Update Application status
  window.repApps = window.repApps || [];
  let app = window.repApps.find(a => a.applicationId === appId);
  if (app) app.status = "approved";
  await window.sSet("bhu:repapps", window.repApps);
  
  // 2. Update user role
  window.usersDB = window.usersDB || [];
  let lu = window.usersDB.find(u => (u.id === uid || u.uid === uid));
  if (lu) {
    lu.role = "representative";
    lu.representativeId = repId;
    lu.recognitionLevel = "member";
    await window.sSet("bhu:users", window.usersDB);
  }
  
  showToast(`Representative ${email} approved! ID: ${repId}`, "success");
  loadAdminDashboard();
}

async function rejectRepresentativeApplication(appId) {
  window.repApps = window.repApps || [];
  let app = window.repApps.find(a => a.applicationId === appId);
  if (app) app.status = "rejected";
  await window.sSet("bhu:repapps", window.repApps);
  
  showToast("Application rejected", "error");
  loadAdminDashboard();
}

async function loadApprovedRepresentatives() {
  if (!(window.currentUser && window.currentUser.isAdmin)) return;
  
  const div = document.getElementById("adminApprovedRepsList");
  const l1 = document.getElementById("adminApplicationsList"); if(l1) l1.style.display="none";
  const l3 = document.getElementById("adminContributionsList"); if(l3) l3.style.display="none";
  if(div) div.style.display="block";
  if (!div) return;
  
  window.usersDB = window.usersDB || [];
  const approvedReps = window.usersDB.filter(u => u.role === "representative");
  
  if (approvedReps.length === 0) {
    div.innerHTML = "<div style=\"padding:20px;color:#999;text-align:center;\">No approved representatives yet</div>";
    return;
  }
  
  let html = "<h3 style=\"font-weight:800;margin-bottom:12px;\"> Approved Representatives</h3>";
  approvedReps.forEach((rep) => {
    html += `
      <div class="card" style="padding:14px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <div style="font-weight:700;font-size:14px;">${rep.name}</div>
            <div style="font-size:12px;color:#777;margin-top:2px;">
              ${rep.email}<br/>
              Rep ID: <strong>${rep.representativeId || "N/A"}</strong>
            </div>
          </div>
          <div style="text-align:right;font-size:12px;color:#0F3D23;background:#E8F5E9;padding:6px 10px;border-radius:6px;">
             ${rep.recognitionLevel || "member"}
          </div>
        </div>
        <div style="margin-top:12px;">
          <button class="btn btn-light" style="padding:4px 8px;font-size:11px;" onclick="revokeRep('${rep.id}')">Revoke</button>
        </div>
      </div>
    `;
  });
  
  div.innerHTML = html;
}

async function revokeRep(uid) {
  if(!confirm("Revoke this representative's status?")) return;
  
  window.usersDB = window.usersDB || [];
  let lu = window.usersDB.find(u => u.id === uid);
  if (lu) {
    delete lu.role;
    delete lu.representativeId;
    delete lu.recognitionLevel;
    await window.sSet("bhu:users", window.usersDB);
  }
  
  showToast("Representative status revoked.", "success");
  loadApprovedRepresentatives();
}

async function loadAdminContributions() {
  if (!(window.currentUser && window.currentUser.isAdmin)) return;
  
  const div = document.getElementById("adminContributionsList");
  const l1 = document.getElementById("adminApplicationsList"); if(l1) l1.style.display="none";
  const l2 = document.getElementById("adminApprovedRepsList"); if(l2) l2.style.display="none";
  if(div) div.style.display="block";
  if (!div) return;
  
  div.innerHTML = "<div style=\"padding:20px;color:#999;text-align:center;\">Contributions coming soon.</div>";
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast";
  if (type === "error") toast.classList.add("error");
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}
