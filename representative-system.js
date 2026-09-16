/**
 * ═══════════════════════════════════════════════════════════════════
 * KRISHIGYAN — REPRESENTATIVE SYSTEM v1.0
 * Role-based access control for Students, Representatives, and Admins
 * ═══════════════════════════════════════════════════════════════════
 */

// ── GLOBAL STATE ──────────────────────────────────────────────────
let currentUser = null;
let userRole = 'student'; // Default role
let representativeData = null;

// ── INITIALIZATION ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (window._fbConfigured) {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        await loadUserRole(user.uid);
        await updateUIByRole();
      }
    });
  }
});

/**
 * Load user role from Firestore
 */
async function loadUserRole(uid) {
  try {
    const userDoc = await window._db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      userRole = userDoc.data().role || 'student';
      if (userRole === 'representative') {
        representativeData = userDoc.data();
      }
    } else {
      // Create default user document with student role
      await window._db.collection('users').doc(uid).set({
        uid: uid,
        email: currentUser.email,
        name: currentUser.displayName || 'User',
        role: 'student',
        createdAt: new Date(),
        isPremium: false,
      });
      userRole = 'student';
    }
  } catch (error) {
    console.error('Error loading user role:', error);
  }
}

/**
 * Update UI based on user role
 */
async function updateUIByRole() {
  // Show/hide representative tab in drawer
  const repTab = document.getElementById('representativeDrawerTab');
  const adminTab = document.getElementById('adminDrawerTab');
  const repSection = document.getElementById('representative-section');
  const adminSection = document.getElementById('admin-section');
  
  if (userRole === 'representative') {
    if (repTab) repTab.style.display = 'flex';
    if (repSection) repSection.style.display = 'block';
    await loadRepresentativeProfile();
  } else if (repTab) {
    repTab.style.display = 'none';
  }
  
  if (userRole === 'admin') {
    if (adminTab) adminTab.style.display = 'flex';
    if (adminSection) adminSection.style.display = 'block';
    await loadAdminDashboard();
  } else if (adminTab) {
    adminTab.style.display = 'none';
  }
  
  // Show "Become Representative" option only for students
  const repApplyCard = document.getElementById('representativeApplyCard');
  if (userRole === 'student' && repApplyCard) {
    repApplyCard.style.display = 'block';
  } else if (repApplyCard) {
    repApplyCard.style.display = 'none';
  }
}

// ── REPRESENTATIVE APPLICATION ────────────────────────────────────

/**
 * Open representative application modal
 */
function openRepresentativeForm() {
  const modal = document.getElementById('representativeModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

/**
 * Close representative application modal
 */
function closeRepresentativeModal() {
  const modal = document.getElementById('representativeModal');
  if (modal) {
    modal.classList.add('hidden');
  }
  // Clear form
  document.getElementById('repForm').reset();
}

/**
 * Submit representative application
 */
async function submitRepresentativeApplication(e) {
  e.preventDefault();
  
  if (!currentUser) {
    showToast('Please login first', 'error');
    return;
  }
  
  const formData = {
    uid: currentUser.uid,
    email: currentUser.email,
    name: document.getElementById('repName').value,
    college: document.getElementById('repCollege').value,
    course: document.getElementById('repCourse').value,
    year: document.getElementById('repYear').value,
    cityState: document.getElementById('repCity').value,
    reason: document.getElementById('repReason').value,
    contribution: document.getElementById('repContribution').value,
    phone: document.getElementById('repPhone').value || '',
    status: 'pending',
    submittedAt: new Date(),
    applicationId: 'APP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
  };
  
  try {
    // Check if already applied
    const existingApp = await window._db
      .collection('representativeApplications')
      .where('uid', '==', currentUser.uid)
      .where('status', '==', 'pending')
      .get();
    
    if (!existingApp.empty) {
      showToast('You already have a pending application', 'error');
      return;
    }
    
    // Save application
    await window._db
      .collection('representativeApplications')
      .doc(formData.applicationId)
      .set(formData);
    
    showToast('Application submitted successfully! ✨', 'success');
    closeRepresentativeModal();
    await checkApplicationStatus();
  } catch (error) {
    console.error('Error submitting application:', error);
    showToast('Failed to submit application', 'error');
  }
}

/**
 * Check application status
 */
async function checkApplicationStatus() {
  if (!currentUser) return;
  
  try {
    const appQuery = await window._db
      .collection('representativeApplications')
      .where('uid', '==', currentUser.uid)
      .orderBy('submittedAt', 'desc')
      .limit(1)
      .get();
    
    const statusDiv = document.getElementById('repApplicationStatus');
    if (!statusDiv) return;
    
    if (appQuery.empty) {
      statusDiv.innerHTML = '';
      return;
    }
    
    const app = appQuery.docs[0].data();
    let statusIcon = '🟡';
    let statusColor = '#FF9800';
    
    if (app.status === 'approved') {
      statusIcon = '🟢';
      statusColor = '#00B050';
    } else if (app.status === 'rejected') {
      statusIcon = '🔴';
      statusColor = '#E53935';
    }
    
    statusDiv.innerHTML = `
      <div style="background:#F8FBF8;border-radius:12px;padding:16px;border-left:4px solid ${statusColor};">
        <div style="font-weight:700;margin-bottom:4px;">${statusIcon} Application Status</div>
        <div style="font-size:13px;color:#777;">Status: <strong>${app.status.toUpperCase()}</strong></div>
        <div style="font-size:12px;color:#999;margin-top:6px;">
          Submitted: ${new Date(app.submittedAt.toDate()).toLocaleDateString()}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error checking application status:', error);
  }
}

// ── REPRESENTATIVE PROFILE ────────────────────────────────────────

/**
 * Load representative profile
 */
async function loadRepresentativeProfile() {
  if (userRole !== 'representative' || !currentUser) return;
  
  try {
    const userDoc = await window._db.collection('users').doc(currentUser.uid).get();
    const data = userDoc.data();
    
    const profileDiv = document.getElementById('repProfileInfo');
    if (!profileDiv) return;
    
    const repId = data.representativeId || 'N/A';
    const recLevel = data.recognitionLevel || 'Member';
    
    profileDiv.innerHTML = `
      <div style="background:#E8F5E9;border-radius:16px;padding:18px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
          <div style="font-size:32px;">🌱</div>
          <div>
            <div style="font-weight:800;font-size:16px;">KrishiGyan Representative</div>
            <div style="font-size:12px;color:#0F3D23;opacity:.8;margin-top:2px;">Active Member</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,.8);border-radius:12px;padding:12px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;">
            <span style="color:#666;">Representative ID:</span>
            <strong>${repId}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;">
            <span style="color:#666;">Name:</span>
            <strong>${data.name}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;">
            <span style="color:#666;">College:</span>
            <strong>${data.college || 'N/A'}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <span style="color:#666;">Recognition:</span>
            <strong style="color:#f59e0b;">⭐ ${recLevel}</strong>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading representative profile:', error);
  }
}

// ── REPRESENTATIVE CONTRIBUTIONS ──────────────────────────────────

/**
 * Submit contribution (feedback, suggestion, report, etc.)
 */
async function submitRepresentativeContribution(type) {
  if (userRole !== 'representative' || !currentUser) {
    showToast('Only representatives can submit contributions', 'error');
    return;
  }
  
  const titleInput = document.getElementById('contribTitle');
  const descInput = document.getElementById('contribDesc');
  
  if (!titleInput || !titleInput.value.trim()) {
    showToast('Please enter a title', 'error');
    return;
  }
  
  try {
    const contribData = {
      uid: currentUser.uid,
      representativeId: representativeData?.representativeId || 'N/A',
      type: type, // 'feedback', 'resource_suggestion', 'error_report', 'community_idea'
      title: titleInput.value,
      description: descInput.value,
      status: 'submitted',
      createdAt: new Date(),
      contribId: 'CONTRIB-' + Date.now(),
    };
    
    await window._db
      .collection('representativeContributions')
      .doc(contribData.contribId)
      .set(contribData);
    
    showToast('Thank you! Your contribution has been submitted', 'success');
    titleInput.value = '';
    descInput.value = '';
    await loadRepresentativeContributions();
  } catch (error) {
    console.error('Error submitting contribution:', error);
    showToast('Failed to submit contribution', 'error');
  }
}

/**
 * Load representative contributions
 */
async function loadRepresentativeContributions() {
  if (userRole !== 'representative' || !currentUser) return;
  
  try {
    const contribQuery = await window._db
      .collection('representativeContributions')
      .where('uid', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
    
    const contribDiv = document.getElementById('repContributionsList');
    if (!contribDiv) return;
    
    if (contribQuery.empty) {
      contribDiv.innerHTML = '<div style="padding:16px;color:#999;text-align:center;">No contributions yet</div>';
      return;
    }
    
    let html = '';
    contribQuery.forEach((doc) => {
      const c = doc.data();
      const typeEmoji = {
        'feedback': '💬',
        'resource_suggestion': '📚',
        'error_report': '🐛',
        'community_idea': '💡',
      };
      
      html += `
        <div class="card" style="padding:14px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
            <div style="flex:1;">
              <div style="font-weight:700;font-size:14px;margin-bottom:2px;">
                ${typeEmoji[c.type] || '📝'} ${c.title}
              </div>
              <div style="font-size:12px;color:#777;">${c.description}</div>
            </div>
            <span style="font-size:11px;background:#E8F5E9;color:#0F3D23;padding:2px 8px;border-radius:50px;white-space:nowrap;">
              ${c.status}
            </span>
          </div>
          <div style="font-size:11px;color:#999;">
            ${new Date(c.createdAt.toDate()).toLocaleDateString()}
          </div>
        </div>
      `;
    });
    
    contribDiv.innerHTML = html;
  } catch (error) {
    console.error('Error loading contributions:', error);
  }
}

// ── ADMIN FUNCTIONS ───────────────────────────────────────────────

/**
 * Load admin dashboard
 */
async function loadAdminDashboard() {
  if (userRole !== 'admin') return;
  
  try {
    // Load pending applications
    const pendingApps = await window._db
      .collection('representativeApplications')
      .where('status', '==', 'pending')
      .orderBy('submittedAt', 'desc')
      .get();
    
    const adminDiv = document.getElementById('adminApplicationsList');
    if (!adminDiv) return;
    
    if (pendingApps.empty) {
      adminDiv.innerHTML = '<div style="padding:20px;text-align:center;color:#999;">No pending applications</div>';
      return;
    }
    
    let html = '<h3 style="font-weight:800;margin-bottom:12px;">⏳ Pending Applications</h3>';
    pendingApps.forEach((doc) => {
      const app = doc.data();
      html += `
        <div class="card" style="padding:16px;margin-bottom:12px;">
          <div style="margin-bottom:12px;">
            <div style="font-weight:800;font-size:15px;">${app.name}</div>
            <div style="font-size:12px;color:#777;">
              <div>${app.email}</div>
              <div>${app.college} • ${app.course} - Year ${app.year}</div>
              <div style="margin-top:6px;font-size:11px;color:#999;">${app.cityState}</div>
            </div>
          </div>
          <div style="background:#F8FBF8;border-radius:10px;padding:10px;margin-bottom:12px;font-size:12px;">
            <div style="margin-bottom:6px;"><strong>Why:</strong> ${app.reason}</div>
            <div><strong>How:</strong> ${app.contribution}</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary" onclick="approveRepresentativeApplication('${doc.id}', '${app.uid}', '${app.email}')">✓ Approve</button>
            <button class="btn btn-light" onclick="rejectRepresentativeApplication('${doc.id}')">✗ Reject</button>
          </div>
        </div>
      `;
    });
    
    adminDiv.innerHTML = html;
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
  }
}

/**
 * Approve representative application
 */
async function approveRepresentativeApplication(appId, uid, email) {
  try {
    // Update application status
    await window._db
      .collection('representativeApplications')
      .doc(appId)
      .update({ status: 'approved' });
    
    // Generate representative ID
    const repId = 'KG-' + Date.now().toString(36).toUpperCase();
    
    // Update user role to representative
    await window._db.collection('users').doc(uid).update({
      role: 'representative',
      representativeId: repId,
      recognitionLevel: 'member',
      representativeApprovedAt: new Date(),
    });
    
    showToast(`✓ Representative ${email} approved!`, 'success');
    await loadAdminDashboard();
  } catch (error) {
    console.error('Error approving application:', error);
    showToast('Failed to approve application', 'error');
  }
}

/**
 * Reject representative application
 */
async function rejectRepresentativeApplication(appId) {
  try {
    await window._db
      .collection('representativeApplications')
      .doc(appId)
      .update({ status: 'rejected' });
    
    showToast('Application rejected', 'error');
    await loadAdminDashboard();
  } catch (error) {
    console.error('Error rejecting application:', error);
    showToast('Failed to reject application', 'error');
  }
}

/**
 * View approved representatives
 */
async function loadApprovedRepresentatives() {
  try {
    const repsQuery = await window._db
      .collection('users')
      .where('role', '==', 'representative')
      .orderBy('representativeApprovedAt', 'desc')
      .get();
    
    const div = document.getElementById('adminApprovedRepsList');
    if (!div) return;
    
    if (repsQuery.empty) {
      div.innerHTML = '<div style="padding:20px;color:#999;text-align:center;">No approved representatives yet</div>';
      return;
    }
    
    let html = '<h3 style="font-weight:800;margin-bottom:12px;">🟢 Approved Representatives</h3>';
    repsQuery.forEach((doc) => {
      const rep = doc.data();
      html += `
        <div class="card" style="padding:14px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <div style="font-weight:700;font-size:14px;">${rep.name}</div>
              <div style="font-size:12px;color:#777;margin-top:2px;">
                ${rep.email}<br/>
                College: ${rep.college || 'N/A'}<br/>
                Rep ID: <strong>${rep.representativeId || 'N/A'}</strong>
              </div>
            </div>
            <div style="text-align:right;font-size:12px;color:#0F3D23;background:#E8F5E9;padding:6px 10px;border-radius:6px;">
              ⭐ ${rep.recognitionLevel || 'member'}
            </div>
          </div>
        </div>
      `;
    });
    
    div.innerHTML = html;
  } catch (error) {
    console.error('Error loading approved representatives:', error);
  }
}

/**
 * View all contributions
 */
async function loadAdminContributions() {
  try {
    const contribQuery = await window._db
      .collection('representativeContributions')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const div = document.getElementById('adminContributionsList');
    if (!div) return;
    
    if (contribQuery.empty) {
      div.innerHTML = '<div style="padding:20px;color:#999;text-align:center;">No contributions yet</div>';
      return;
    }
    
    let html = '<h3 style="font-weight:800;margin-bottom:12px;">📝 All Contributions</h3>';
    contribQuery.forEach((doc) => {
      const c = doc.data();
      const typeEmoji = {
        'feedback': '💬',
        'resource_suggestion': '📚',
        'error_report': '🐛',
        'community_idea': '💡',
      };
      
      html += `
        <div class="card" style="padding:12px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div style="flex:1;">
              <div style="font-weight:700;font-size:13px;">
                ${typeEmoji[c.type] || '📝'} ${c.title}
              </div>
              <div style="font-size:12px;color:#777;margin-top:2px;">${c.description}</div>
              <div style="font-size:11px;color:#999;margin-top:4px;">By: ${c.representativeId}</div>
            </div>
            <span style="font-size:10px;background:#F8FBF8;padding:2px 6px;border-radius:4px;white-space:nowrap;">
              ${c.type.replace('_', ' ')}
            </span>
          </div>
        </div>
      `;
    });
    
    div.innerHTML = html;
  } catch (error) {
    console.error('Error loading admin contributions:', error);
  }
}

// ── TOAST NOTIFICATION ────────────────────────────────────────────

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = 'toast';
  if (type === 'error') {
    toast.classList.add('error');
  }
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// ── ON LOGIN/LOGOUT ───────────────────────────────────────────────

// Hook into existing logout if it exists
const originalLogout = window.doLogout || (() => {});
window.doLogout = async function() {
  currentUser = null;
  userRole = 'student';
  representativeData = null;
  await originalLogout();
};

// Initialize on page load
window.addEventListener('load', async () => {
  await checkApplicationStatus();
});
