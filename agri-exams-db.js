// agri-exams-db.js
// Comprehensive Agriculture Exam Directory for KrishiGyan
// Maintained manually + auto-updated via cron. Read-only on client.
// Schema: { id, name, shortName, authority, type, level, status,
//           eligibility, syllabus_url, official_url, notification_url,
//           subjects[], lastNotified, nextExpected, tags[] }

window.AGRI_EXAMS_DB = [

  // ─── ICAR EXAMS ──────────────────────────────────────────────────────────
  {
    id: "icar_aieea_ug",
    name: "ICAR All India Entrance Examination for Admission (UG)",
    shortName: "ICAR AIEEA UG",
    authority: "ICAR / NTA",
    type: "entrance",
    level: "UG",
    status: "active",
    eligibility: "12th Pass with PCB/PCM/Agriculture (50% marks)",
    official_url: "https://icar.nta.ac.in",
    syllabus_url: "https://icar.nta.ac.in/syllabus",
    notification_url: "https://icar.nta.ac.in",
    subjects: ["Physics", "Chemistry", "Biology/Agriculture", "Mathematics"],
    tags: ["ICAR", "UG", "BSc Agriculture", "entrance"],
    lastNotified: "2025",
    nextExpected: "2026 (April–May)"
  },
  {
    id: "icar_aieea_pg",
    name: "ICAR All India Entrance Examination for Admission (PG)",
    shortName: "ICAR AIEEA PG / CUET PG",
    authority: "ICAR / NTA",
    type: "entrance",
    level: "PG",
    status: "active",
    eligibility: "BSc Agriculture or equivalent (50% marks)",
    official_url: "https://cuet.nta.nic.in",
    syllabus_url: "https://icar.org.in/content/cuet-pg",
    notification_url: "https://cuet.nta.nic.in",
    subjects: ["Agronomy", "Horticulture", "Soil Science", "Plant Pathology", "Genetics & Plant Breeding", "Entomology", "Agricultural Extension", "Agricultural Economics"],
    tags: ["ICAR", "PG", "MSc Agriculture", "CUET PG", "entrance"],
    lastNotified: "2025",
    nextExpected: "2026 (February–March)"
  },
  {
    id: "icar_jrf_srf",
    name: "ICAR Junior/Senior Research Fellowship Examination",
    shortName: "ICAR JRF/SRF",
    authority: "ICAR",
    type: "fellowship",
    level: "Research",
    status: "active",
    eligibility: "MSc Agriculture or equivalent; 60% marks",
    official_url: "https://icar.org.in/content/jrf-srf",
    syllabus_url: "https://icar.org.in/content/jrf-srf",
    notification_url: "https://icar.org.in",
    subjects: ["Agronomy", "Horticulture", "Soil Science", "Plant Pathology", "Genetics & Plant Breeding", "Entomology", "Agricultural Economics", "Extension"],
    tags: ["ICAR", "JRF", "SRF", "research", "fellowship"],
    lastNotified: "2025",
    nextExpected: "2026"
  },
  {
    id: "icar_ars_net",
    name: "ICAR Agricultural Research Service / National Eligibility Test",
    shortName: "ICAR ARS/NET",
    authority: "ICAR / ASRB",
    type: "recruitment",
    level: "Research Scientist",
    status: "active",
    eligibility: "MSc Agriculture or equivalent; 60% marks",
    official_url: "https://asrb.org.in",
    syllabus_url: "https://asrb.org.in/recruitment",
    notification_url: "https://asrb.org.in",
    subjects: ["Agronomy", "Horticulture", "Soil Science", "Plant Pathology", "Genetics", "Entomology", "Agricultural Economics", "Extension", "Agricultural Engineering"],
    tags: ["ICAR", "ARS", "NET", "scientist", "recruitment"],
    lastNotified: "2024",
    nextExpected: "2026"
  },

  // ─── CUET ────────────────────────────────────────────────────────────────
  {
    id: "cuet_ug",
    name: "Common University Entrance Test (UG) – Agriculture",
    shortName: "CUET UG (Agriculture)",
    authority: "NTA",
    type: "entrance",
    level: "UG",
    status: "active",
    eligibility: "12th Pass with Agriculture subject",
    official_url: "https://cuet.samarth.ac.in",
    syllabus_url: "https://cuet.samarth.ac.in/index.php/site/syllabus",
    notification_url: "https://cuet.samarth.ac.in",
    subjects: ["Agriculture"],
    tags: ["CUET", "UG", "Agriculture", "NTA"],
    lastNotified: "2025",
    nextExpected: "2026 (January–February)"
  },

  // ─── IBPS ────────────────────────────────────────────────────────────────
  {
    id: "ibps_afo",
    name: "IBPS Specialist Officer – Agriculture Field Officer (Scale I)",
    shortName: "IBPS AFO",
    authority: "IBPS",
    type: "banking",
    level: "Officer Scale I",
    status: "active",
    eligibility: "BSc Agriculture / Horticulture / Forestry / Agri. Engineering (60% marks)",
    official_url: "https://www.ibps.in",
    syllabus_url: "https://www.ibps.in/so-syllabus",
    notification_url: "https://www.ibps.in",
    subjects: ["Agriculture", "General Knowledge", "Reasoning", "English", "Quantitative Aptitude"],
    tags: ["IBPS", "AFO", "banking", "agriculture officer", "Scale I"],
    lastNotified: "2025",
    nextExpected: "2026 (August–September)"
  },

  // ─── NABARD ──────────────────────────────────────────────────────────────
  {
    id: "nabard_grade_a",
    name: "NABARD Grade A (Assistant Manager – Agriculture)",
    shortName: "NABARD Grade A",
    authority: "NABARD",
    type: "recruitment",
    level: "Assistant Manager",
    status: "active",
    eligibility: "BSc Agriculture (60% marks) or Post Graduate in relevant subject",
    official_url: "https://nabard.org",
    syllabus_url: "https://nabard.org/content1.aspx?id=591&catid=23&mid=23",
    notification_url: "https://nabard.org/recruitment-notices.aspx",
    subjects: ["Agriculture & Rural Development", "Economic & Social Issues", "Reasoning", "English", "General Knowledge"],
    tags: ["NABARD", "Grade A", "agriculture", "rural development"],
    lastNotified: "2024",
    nextExpected: "2026"
  },
  {
    id: "nabard_grade_b",
    name: "NABARD Grade B (Manager – Agriculture)",
    shortName: "NABARD Grade B",
    authority: "NABARD",
    type: "recruitment",
    level: "Manager",
    status: "active",
    eligibility: "Post Graduate in Agriculture / Economics / Commerce (50% marks); 2 years experience",
    official_url: "https://nabard.org",
    syllabus_url: "https://nabard.org/content1.aspx?id=591",
    notification_url: "https://nabard.org/recruitment-notices.aspx",
    subjects: ["Agriculture", "Economics", "Finance", "Reasoning"],
    tags: ["NABARD", "Grade B", "manager", "agriculture"],
    lastNotified: "2024",
    nextExpected: "2026"
  },

  // ─── STATE PSC AGRICULTURE EXAMS ────────────────────────────────────────
  {
    id: "uppsc_ago",
    name: "UPPSC Agriculture Graduate Officer (AGO)",
    shortName: "UPPSC AGO",
    authority: "UPPSC",
    type: "state_psc",
    level: "State Service",
    status: "active",
    eligibility: "BSc Agriculture from a recognized university",
    official_url: "https://uppsc.up.nic.in",
    syllabus_url: "https://uppsc.up.nic.in",
    notification_url: "https://uppsc.up.nic.in",
    subjects: ["Agronomy", "Horticulture", "Soil Science", "Plant Protection", "Extension Education", "Animal Husbandry", "General Hindi"],
    tags: ["UPPSC", "AGO", "UP", "state", "agriculture officer"],
    lastNotified: "2024",
    nextExpected: "2026"
  },
  {
    id: "bpsc_ado",
    name: "BPSC Agricultural Development Officer (ADO)",
    shortName: "BPSC ADO",
    authority: "BPSC",
    type: "state_psc",
    level: "State Service",
    status: "active",
    eligibility: "BSc Agriculture from a recognized university",
    official_url: "https://bpsc.bih.nic.in",
    syllabus_url: "https://bpsc.bih.nic.in",
    notification_url: "https://bpsc.bih.nic.in",
    subjects: ["Agronomy", "Horticulture", "Soil Science", "Plant Pathology", "Agricultural Economics", "General Hindi", "General Knowledge"],
    tags: ["BPSC", "ADO", "Bihar", "state", "agriculture officer"],
    lastNotified: "2023",
    nextExpected: "2026"
  },
  {
    id: "mpsc_aro",
    name: "MPSC Agriculture Research Officer / Circle Officer",
    shortName: "MPSC ARO",
    authority: "MPSC",
    type: "state_psc",
    level: "State Service",
    status: "active",
    eligibility: "BSc Agriculture from a recognized university",
    official_url: "https://mpsc.gov.in",
    syllabus_url: "https://mpsc.gov.in",
    notification_url: "https://mpsc.gov.in",
    subjects: ["Agronomy", "Horticulture", "Soil Science", "Crop Production", "Extension"],
    tags: ["MPSC", "Maharashtra", "ARO", "state"],
    lastNotified: "2024",
    nextExpected: "2026"
  },
  {
    id: "rpsc_aao",
    name: "RPSC Assistant Agriculture Officer (AAO)",
    shortName: "RPSC AAO",
    authority: "RPSC",
    type: "state_psc",
    level: "State Service",
    status: "active",
    eligibility: "BSc Agriculture from a recognized university",
    official_url: "https://rpsc.rajasthan.gov.in",
    syllabus_url: "https://rpsc.rajasthan.gov.in",
    notification_url: "https://rpsc.rajasthan.gov.in",
    subjects: ["Agronomy", "Horticulture", "Soil Science", "Animal Husbandry", "General Knowledge (Rajasthan)"],
    tags: ["RPSC", "Rajasthan", "AAO", "state"],
    lastNotified: "2024",
    nextExpected: "2026"
  },
  {
    id: "hpsc_hao",
    name: "HPSC Haryana Agriculture Officer (HAO)",
    shortName: "HPSC HAO",
    authority: "HPSC",
    type: "state_psc",
    level: "State Service",
    status: "active",
    eligibility: "BSc Agriculture from a recognized university",
    official_url: "https://hpsc.gov.in",
    syllabus_url: "https://hpsc.gov.in",
    notification_url: "https://hpsc.gov.in",
    subjects: ["Agronomy", "Horticulture", "Soil Science", "Extension", "General Knowledge"],
    tags: ["HPSC", "Haryana", "HAO", "state"],
    lastNotified: "2024",
    nextExpected: "2026"
  },
  {
    id: "mppeb_aho",
    name: "MPPEB/Vyapam Agriculture Horticulture Officer",
    shortName: "Vyapam AHO",
    authority: "MPPEB / Vyapam",
    type: "state_psc",
    level: "State Service",
    status: "active",
    eligibility: "BSc Agriculture / Horticulture from a recognized university",
    official_url: "https://peb.mp.gov.in",
    syllabus_url: "https://peb.mp.gov.in",
    notification_url: "https://peb.mp.gov.in",
    subjects: ["Agronomy", "Horticulture", "General Knowledge"],
    tags: ["Vyapam", "MP", "AHO", "state"],
    lastNotified: "2023",
    nextExpected: "2026"
  },

  // ─── UPSC / SSC ──────────────────────────────────────────────────────────
  {
    id: "upsc_ifs",
    name: "UPSC Indian Forest Service (IFS) Examination",
    shortName: "UPSC IFS",
    authority: "UPSC",
    type: "upsc",
    level: "Class I (Group A Central Service)",
    status: "active",
    eligibility: "BSc Agriculture / Botany / Zoology / Chemistry / Physics (any one) from recognized university",
    official_url: "https://upsc.gov.in",
    syllabus_url: "https://upsc.gov.in/sites/default/files/Syl-IFoS-19.pdf",
    notification_url: "https://upsc.gov.in",
    subjects: ["Agriculture Paper I", "Agriculture Paper II", "General Knowledge", "English"],
    tags: ["UPSC", "IFS", "forest service", "central service"],
    lastNotified: "2025",
    nextExpected: "2026 (February)"
  },
  {
    id: "upsc_cse_optional_agri",
    name: "UPSC Civil Services Examination – Agriculture Optional",
    shortName: "UPSC CSE (Agriculture Optional)",
    authority: "UPSC",
    type: "upsc",
    level: "IAS/IPS",
    status: "active",
    eligibility: "Graduation from any recognized university",
    official_url: "https://upsc.gov.in",
    syllabus_url: "https://upsc.gov.in/sites/default/files/Syl-CSP-2023.pdf",
    notification_url: "https://upsc.gov.in",
    subjects: ["Agriculture Paper I (Ecology, Genetics, Soil, Crops)", "Agriculture Paper II (Agronomy, Extension, Economics)"],
    tags: ["UPSC", "CSE", "IAS", "agriculture optional"],
    lastNotified: "2025",
    nextExpected: "2026 (February)"
  },

  // ─── IARI / BHU / SAU ENTRANCE ──────────────────────────────────────────
  {
    id: "iari_phd",
    name: "IARI PhD Entrance Examination",
    shortName: "IARI PhD",
    authority: "IARI / ICAR",
    type: "entrance",
    level: "PhD",
    status: "active",
    eligibility: "MSc Agriculture (60% marks)",
    official_url: "https://iari.res.in",
    syllabus_url: "https://iari.res.in/index.php/admissions",
    notification_url: "https://iari.res.in/index.php/admissions",
    subjects: ["Agronomy", "Plant Pathology", "Genetics & Plant Breeding", "Entomology", "Soil Science", "Agricultural Economics"],
    tags: ["IARI", "PhD", "research", "New Delhi"],
    lastNotified: "2025",
    nextExpected: "2026"
  },
  {
    id: "bhu_entrance",
    name: "BHU PET/UET Agriculture Entrance",
    shortName: "BHU PET/UET",
    authority: "BHU / NTA",
    type: "entrance",
    level: "UG/PG",
    status: "active",
    eligibility: "12th (for UG) / BSc Agriculture (for PG)",
    official_url: "https://bhuonline.in",
    syllabus_url: "https://bhuonline.in",
    notification_url: "https://bhuonline.in",
    subjects: ["Agriculture", "Biology", "Chemistry"],
    tags: ["BHU", "PET", "UET", "Varanasi", "entrance"],
    lastNotified: "2025",
    nextExpected: "2026 (March–April)"
  },

  // ─── BANKING AGRICULTURE RELATED ────────────────────────────────────────
  {
    id: "rbi_grade_b",
    name: "RBI Grade B Officer (DEPR/DSIM streams useful for Agriculture economists)",
    shortName: "RBI Grade B",
    authority: "RBI",
    type: "banking",
    level: "Grade B",
    status: "active",
    eligibility: "Graduation (60%) or Post Graduation (55%)",
    official_url: "https://www.rbi.org.in",
    syllabus_url: "https://www.rbi.org.in/Scripts/Recruitment.aspx",
    notification_url: "https://www.rbi.org.in/Scripts/Recruitment.aspx",
    subjects: ["Economics", "Finance", "Agriculture (in Economic Analysis)", "General Knowledge"],
    tags: ["RBI", "Grade B", "economics", "agriculture economics"],
    lastNotified: "2025",
    nextExpected: "2026"
  },

  // ─── TEACHING / ASSISTANT PROFESSOR ─────────────────────────────────────
  {
    id: "ugc_net_agriculture",
    name: "UGC NET – Agriculture (Paper Code 62)",
    shortName: "UGC NET Agriculture",
    authority: "UGC / NTA",
    type: "teaching",
    level: "Assistant Professor / JRF",
    status: "active",
    eligibility: "Post-graduation in Agriculture with 55% marks",
    official_url: "https://ugcnet.nta.nic.in",
    syllabus_url: "https://ugcnet.nta.nic.in/images/UGC-NET%20syllabus%202024.pdf",
    notification_url: "https://ugcnet.nta.nic.in",
    subjects: ["Agronomy", "Horticulture", "Genetics & Plant Breeding", "Soil Science", "Plant Protection", "Extension", "Agricultural Economics", "Agricultural Engineering"],
    tags: ["UGC", "NET", "JRF", "teaching", "assistant professor"],
    lastNotified: "2025",
    nextExpected: "2026 (June/December)"
  }
];

// Utility: search exams by keyword, type, or status
window.searchExams = function(query, filters = {}) {
  let results = window.AGRI_EXAMS_DB;
  const q = (query || '').toLowerCase();
  if (q) {
    results = results.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.shortName.toLowerCase().includes(q) ||
      (e.tags || []).some(t => t.toLowerCase().includes(q)) ||
      (e.subjects || []).some(s => s.toLowerCase().includes(q)) ||
      (e.authority || '').toLowerCase().includes(q)
    );
  }
  if (filters.type) results = results.filter(e => e.type === filters.type);
  if (filters.status) results = results.filter(e => e.status === filters.status);
  if (filters.level) results = results.filter(e => e.level === filters.level);
  return results;
};

// Utility: get exam types for filter UI
window.getExamTypes = function() {
  return [...new Set(window.AGRI_EXAMS_DB.map(e => e.type))];
};

console.log('[KrishiGyan] Agri Exams DB loaded:', window.AGRI_EXAMS_DB.length, 'exams');
