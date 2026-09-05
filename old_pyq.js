function renderPYQHierarchy(){
  const el=document.getElementById("pyqHierarchy"); if(!el) return;

  if(!pyqData.length){
    el.innerHTML=`<div class="card" style="padding:44px;text-align:center;">
      <div style="font-size:44px;margin-bottom:10px;">≡ƒôï</div>
      <div style="font-weight:700;font-size:15px;margin-bottom:6px;">No previous papers uploaded yet</div>
      <div style="color:#777;font-size:13px;">Admin is adding questions ΓÇö check back soon!</div>
      ${currentUser?.isAdmin?`<button class="btn btn-primary" style="margin-top:16px;" onclick="setSection('admin');setTimeout(()=>setAdminTab('pyq'),80);">+ Add Questions ΓåÆ</button>`:""}
    </div>`; return;
  }

  // Group: exam ΓåÆ year ΓåÆ subject ΓåÆ [questions]
  const byExam={};
  pyqData.forEach(q=>{
    const exam=q.exam||"Other";
    const year=String(q.year||"Unknown");
    const subj=q.subject||"General";
    if(!byExam[exam]) byExam[exam]={};
    if(!byExam[exam][year]) byExam[exam][year]={};
    if(!byExam[exam][year][subj]) byExam[exam][year][subj]=[];
    byExam[exam][year][subj].push(q);
  });

  const pyqExamIcons = {
    "ICAR JRF": "≡ƒÄô",
    "IARI PG PAPER": "≡ƒÅ½",
    "NABARD": "≡ƒÅ¢∩╕Å",
    "IBPS AFO": "≡ƒÅª",
    "BHU ENTRANCE": "≡ƒÅ¢∩╕Å",
    "OTHER": "≡ƒî╛"
  };

  let html = `<label class="lbl">Select Exam</label>
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:12px; margin-bottom:16px;">`;
  
  Object.entries(byExam).forEach(([exam, years]) => {
    const examOpen = pyqOpenExam === exam;
    const examCount = Object.values(years).reduce((s,ys)=>s+Object.values(ys).reduce((s2,ss)=>s2+ss.length,0),0);
    const icon = pyqExamIcons[exam.toUpperCase()] || "≡ƒôÿ";
    html += `<div class="card hov-card exam-panel" onclick="togglePYQExam('${escapeHTML(exam)}')" style="padding:16px; border:2px solid ${examOpen ? '#00B050' : 'transparent'}; cursor:pointer; text-align:center;">
        <div style="font-size:32px;">${icon}</div>
        <div style="font-weight:800; font-size:13px; margin:6px 0;">${escapeHTML(exam)}</div>
        <div style="font-size:11px; color:#777; margin-bottom:6px;">${examCount} Qs</div>
        <button class="btn ${examOpen ? 'btn-primary' : 'btn-light'}" style="width:100%; font-size:11px;">${examOpen ? 'Selected' : 'Select'}</button>
      </div>`;
  });
  html += `</div>`;

  if(pyqOpenExam && byExam[pyqOpenExam]){
    html += `<div style="padding:12px 14px;background:#F8FBF8;border-radius:12px;margin-bottom:20px;">
        ${Object.entries(byExam[pyqOpenExam]).sort((a,b)=>b[0].localeCompare(a[0])).map(([year,subs])=>{
          const yearKey=pyqOpenExam+"__"+year;
          const yearOpen=pyqOpenYear===yearKey;
          const yearCount=Object.values(subs).reduce((s,ss)=>s+ss.length,0);
          return `<div style="margin-bottom:8px;border:1px solid #E0EAE0;border-radius:12px;overflow:hidden;background:#fff;">
            <div onclick="togglePYQYear('${yearKey}')" style="padding:11px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:${yearOpen?"#E8F5E9":"#fff"};">
              <div style="font-weight:700;font-size:13px;color:#0F3D23;">≡ƒôà ${escapeHTML(year)}</div>
              <div style="font-size:11px;color:#777;">${yearCount} Qs &nbsp;${yearOpen?"Γû▓":"Γû╝"}</div>
            </div>
            ${yearOpen?`<div style="padding:8px 10px;background:#FAFCFA;">
              ${Object.entries(subs).map(([subj,qs])=>{
                const subjKey=yearKey+"__"+subj;
                const subjOpen=pyqOpenSubject===subjKey;
                return `<div style="margin-bottom:6px;border:1px solid #E0EAE0;border-radius:10px;overflow:hidden;background:#fff;">
                  <div onclick="togglePYQSubject('${subjKey}')" style="padding:9px 13px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:${subjOpen?"#F3E5F5":"#F8FBF8"};">
                    <div style="font-weight:700;font-size:12px;color:#7B1FA2;">≡ƒî┐ ${escapeHTML(subj)}</div>
                    <div style="font-size:10px;color:#777;">${qs.length} Qs &nbsp;${subjOpen?"Γû▓":"Γû╝"}</div>
                  </div>
                  ${subjOpen?`<div style="padding:16px;text-align:center;">
                    <button class="btn btn-primary" style="font-size:14px;padding:10px 24px;box-shadow:0 4px 14px rgba(0,176,80,.3);" onclick="launchMockTest('${escapeHTML(pyqOpenExam)}', '${escapeHTML(year)}', '${escapeHTML(subj)}')">Γû╢ Start Mock Test (${qs.length} Qs)</button>
                  </div>`:""}
                </div>`;
              }).join("")}
            </div>`:""}
          </div>`;
        }).join("")}
      </div>`;
  }
  
  el.innerHTML = html;
}

