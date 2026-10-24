// api/cron-collector.js
// Vercel Serverless Function & Daily Cron
// Collects: Exam notifications, Agriculture news, Open-access resource metadata
// Runs: 06:00 UTC / 11:30 AM IST daily via Vercel Cron

const crypto = require('crypto');

// ─── FEED SOURCES ────────────────────────────────────────────────────────────
const NEWS_SOURCES = [
  {
    id: "pib_agri",
    name: "PIB Agriculture (Govt of India)",
    url: "https://pib.gov.in/RssMain.aspx?ModId=6&LangId=1",
    category: "NEWS",
    exam: "GENERAL",
    trustedOfficial: true
  },
  {
    id: "krishi_jagran",
    name: "Krishi Jagran – Agriculture",
    url: "https://krishijagran.com/feeds/rss",
    category: "NEWS",
    exam: "GENERAL",
    trustedOfficial: true
  },
  {
    id: "google_icar",
    name: "ICAR / CUET PG Exam Alerts",
    url: "https://news.google.com/rss/search?q=%22ICAR%22+OR+%22CUET+PG+Agriculture%22+OR+%22AIEEA%22+exam+notification&hl=en-IN&gl=IN&ceid=IN:en",
    category: "EXAM",
    exam: "ICAR_CUET",
    trustedOfficial: false
  },
  {
    id: "google_ibps_nabard",
    name: "IBPS AFO / NABARD Alerts",
    url: "https://news.google.com/rss/search?q=%22IBPS+AFO%22+OR+%22NABARD+Grade+A%22+notification+admit+card&hl=en-IN&gl=IN&ceid=IN:en",
    category: "SCHEDULE",
    exam: "IBPS_NABARD",
    trustedOfficial: false
  },
  {
    id: "google_state_agri",
    name: "State Agri PSC / ADO / AGO Alerts",
    url: "https://news.google.com/rss/search?q=%22Agriculture+Officer%22+OR+%22ADO%22+OR+%22AGO%22+OR+%22UPPSC+Agriculture%22+recruitment&hl=en-IN&gl=IN&ceid=IN:en",
    category: "EXAM",
    exam: "STATE_PSC",
    trustedOfficial: false
  },
  {
    id: "google_ugc_net_agri",
    name: "UGC NET Agriculture Alerts",
    url: "https://news.google.com/rss/search?q=%22UGC+NET%22+%22Agriculture%22+notification+OR+%22ICAR+ARS%22&hl=en-IN&gl=IN&ceid=IN:en",
    category: "EXAM",
    exam: "UGC_NET",
    trustedOfficial: false
  }
];

// Open-access study resource metadata sources (only metadata / link collection, no redistribution)
const RESOURCE_SOURCES = [
  {
    id: "icar_ecourse",
    name: "ICAR e-Courses Portal",
    metadataUrl: "https://ecourses.icar.gov.in/",
    type: "resource_index",
    resourceType: "Study Material",
    copyright: "ICAR Open Access",
    trustedOfficial: true,
    noteOnly: true // Only store metadata + official link, never re-host
  },
  {
    id: "nptel_agri",
    name: "NPTEL Agriculture Courses",
    metadataUrl: "https://nptel.ac.in/courses/agriculture",
    type: "resource_index",
    resourceType: "Video Course",
    copyright: "CC BY-SA (NPTEL)",
    trustedOfficial: true,
    noteOnly: true
  },
  {
    id: "e_krishi_shiksha",
    name: "e-Krishi Shiksha (ICAR)",
    metadataUrl: "https://ekrishishiksha.icar.gov.in/",
    type: "resource_index",
    resourceType: "Study Material",
    copyright: "ICAR Government Publication",
    trustedOfficial: true,
    noteOnly: true
  },
  {
    id: "tnau_agritech",
    name: "TNAU Agritech Portal",
    metadataUrl: "https://agritech.tnau.ac.in/",
    type: "resource_index",
    resourceType: "Study Material & Guides",
    copyright: "TNAU Open Resource",
    trustedOfficial: true,
    noteOnly: true
  },
  {
    id: "agmoocs",
    name: "AgMOOCs Agriculture Online Courses",
    metadataUrl: "https://www.agmoocs.in/",
    type: "resource_index",
    resourceType: "Online Course",
    copyright: "IIT Kanpur / COL",
    trustedOfficial: true,
    noteOnly: true
  }
];

// Trusted official domains for auto-verification
const TRUSTED_DOMAINS = [
  "icar.org.in", "icar.gov.in", "icar.nta.ac.in",
  "nta.ac.in", "cuet.nta.nic.in", "cuet.samarth.ac.in",
  "ibps.in", "nabard.org",
  "pib.gov.in", "agricoop.nic.in",
  "upsc.gov.in", "ugcnet.nta.nic.in",
  "asrb.org.in", "iari.res.in", "bhuonline.in",
  "krishijagran.com"
];

// Agriculture content relevance keywords
const AGRI_KEYWORDS = [
  "agri", "crop", "farmer", "kisan", "icar", "cuet", "afo", "nabard",
  "soil", "horticulture", "farm", "seed", "exam", "admit card", "result",
  "vacancy", "officer", "msc agri", "bsc agri", "bhu", "ado", "ago",
  "syllabus", "question paper", "pyq", "previous year", "agronomy",
  "entomology", "plant pathology", "genetics", "extension", "forestry",
  "ifs", "ugc net", "ars net", "jrf", "srf"
];

function isRelevant(text) {
  const lower = (text || '').toLowerCase();
  return AGRI_KEYWORDS.some(kw => lower.includes(kw));
}

function makeHash(str) {
  return crypto.createHash('sha256').update(str.toLowerCase().trim()).digest('hex').substring(0, 16);
}

function isOfficialDomain(link) {
  try {
    const host = new URL(link).hostname;
    return TRUSTED_DOMAINS.some(d => host.includes(d));
  } catch (_) { return false; }
}

function detectExamTag(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('icar') || t.includes('aieea')) return 'ICAR';
  if (t.includes('cuet')) return 'CUET_PG';
  if (t.includes('ibps') || t.includes('afo')) return 'IBPS_AFO';
  if (t.includes('nabard')) return 'NABARD';
  if (t.includes('ugc') || t.includes('net')) return 'UGC_NET';
  if (t.includes('ifs') || t.includes('forest service')) return 'UPSC_IFS';
  if (t.includes('upsc') || t.includes('ias') || t.includes('civil')) return 'UPSC';
  if (t.includes('psc') || t.includes('ado') || t.includes('ago') || t.includes('aao')) return 'STATE_PSC';
  if (t.includes('ars') || t.includes('net') || t.includes('jrf') || t.includes('srf')) return 'ICAR_ARS';
  if (t.includes('bhu')) return 'BHU';
  return 'GENERAL';
}

function detectResourceType(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('admit card') || t.includes('hall ticket')) return 'Admit Card';
  if (t.includes('result') || t.includes('merit list') || t.includes('cutoff')) return 'Exam Result';
  if (t.includes('answer key') || t.includes('official key')) return 'Answer Key';
  if (t.includes('syllabus')) return 'Syllabus';
  if (t.includes('notification') || t.includes('recruitment') || t.includes('vacancy')) return 'Notification';
  if (t.includes('schedule') || t.includes('date') || t.includes('calendar')) return 'Schedule';
  if (t.includes('question paper') || t.includes('pyq') || t.includes('previous year')) return 'PYQ';
  if (t.includes('notes') || t.includes('study material') || t.includes('e-book')) return 'Study Material';
  return 'News';
}

function parseRssXml(xmlText, src) {
  const items = [];
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    try {
      const getTag = (tag) => {
        const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
        const normal = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const m = itemXml.match(cdata) || itemXml.match(normal);
        return m ? m[1].replace(/<[^>]*>/g, '').trim() : '';
      };

      let title = getTag('title');
      let link = getTag('link') || (itemXml.match(/<link[^>]+href="([^"]+)"/i) || [])[1] || '';
      let desc = getTag('description').replace(/&nbsp;/g, ' ');
      let pubDate = getTag('pubDate') || new Date().toISOString();

      if (!title || !link) continue;
      const cleanTitle = title.split(' - ')[0].trim();
      const combined = cleanTitle + ' ' + desc;

      if (!isRelevant(combined)) continue;
      if (desc.length > 250) desc = desc.substring(0, 250) + '...';

      const hash = makeHash(cleanTitle + link);
      const official = isOfficialDomain(link);
      const exam = detectExamTag(combined);
      const resourceType = detectResourceType(combined);

      items.push({
        id: 'harv_' + hash,
        hash,
        title: cleanTitle,
        desc: desc || `Update from ${src.name}.`,
        link,
        source: src.name,
        sourceId: src.id,
        category: src.category,
        exam,
        resourceType,
        isOfficial: official,
        pubDate,
        timestamp: new Date(pubDate).getTime() || Date.now(),
        status: official ? 'published' : 'pending_review',
        collectedAt: new Date().toISOString()
      });
    } catch (_) {}
  }
  return items;
}

async function verifyFirebaseToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7).trim();
  if (!token) return false;
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (!res.ok) return false;
    const data = await res.json();
    const projectId = process.env.FIREBASE_PROJECT_ID || 'bhuagorg';
    if (data.aud !== projectId) return false;
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch (_) { return false; }
}

module.exports = async function handler(req, res) {
  // ── Authorization ──────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  const querySecret = req.query && req.query.secret;
  const isVercelCron = req.headers['x-vercel-cron'] === '1';

  let authorized = false;
  if (cronSecret) {
    if (authHeader === `Bearer ${cronSecret}`) authorized = true;
    if (querySecret && querySecret === cronSecret) authorized = true;
  }
  if (!authorized && isVercelCron && (!cronSecret || authHeader === `Bearer ${cronSecret}`)) {
    authorized = true;
  }
  if (!authorized && authHeader && authHeader.startsWith('Bearer ') && authHeader !== `Bearer ${cronSecret}`) {
    authorized = await verifyFirebaseToken(authHeader);
  }
  if (!authorized) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Requires Vercel Cron signature, CRON_SECRET, or Firebase Admin token.'
    });
  }

  // ── Action: Check link status & detect dead links ──────────────────────
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  const action = (req.query && req.query.action) || (body && body.action);
  if (action === 'check_links') {
    const urlsToCheck = Array.isArray(body && body.urls)
      ? body.urls.slice(0, 30)
      : (req.query && req.query.urls ? req.query.urls.split(',').slice(0, 30) : []);

    const results = {};
    for (const rawUrl of urlsToCheck) {
      if (!rawUrl || typeof rawUrl !== 'string') continue;
      const url = rawUrl.trim();
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        let resp = await fetch(url, {
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0 (KrishiGyanBot/2.0)' },
          signal: ctrl.signal
        });
        clearTimeout(t);
        if (resp.status === 405 || resp.status === 403) {
          const ctrl2 = new AbortController();
          const t2 = setTimeout(() => ctrl2.abort(), 3500);
          resp = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0 (KrishiGyanBot/2.0)' },
            signal: ctrl2.signal
          });
          clearTimeout(t2);
        }
        results[url] = {
          ok: resp.status < 400,
          status: resp.status
        };
      } catch (err) {
        results[url] = {
          ok: false,
          status: 0,
          error: err.name === 'AbortError' ? 'Timeout' : err.message
        };
      }
    }

    return res.status(200).json({
      success: true,
      action: 'check_links',
      checkedCount: Object.keys(results).length,
      results
    });
  }

  // ── Collect news feeds ─────────────────────────────────────────────────
  const startTime = Date.now();
  const summary = {
    executedAt: new Date().toISOString(),
    sourcesChecked: 0,
    itemsFound: 0,
    publishedCount: 0,
    pendingReviewCount: 0,
    errors: []
  };

  const allItems = [];

  for (const src of NEWS_SOURCES) {
    summary.sourcesChecked++;
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 7000);
      const resp = await fetch(src.url, {
        headers: { 'User-Agent': 'KrishiGyanBot/2.0 (+https://krishigyan.online)' },
        signal: ctrl.signal
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        summary.errors.push(`${src.name}: HTTP ${resp.status}`);
        continue;
      }
      const xml = await resp.text();
      const parsed = parseRssXml(xml, src);
      allItems.push(...parsed);
    } catch (err) {
      summary.errors.push(`${src.name}: ${err.message}`);
    }
  }

  // ── Deduplicate ────────────────────────────────────────────────────────
  const seen = new Map();
  for (const item of allItems) {
    if (!seen.has(item.hash)) {
      seen.set(item.hash, item);
      if (item.status === 'published') summary.publishedCount++;
      else summary.pendingReviewCount++;
    }
  }

  const finalItems = Array.from(seen.values())
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 80);

  summary.itemsFound = finalItems.length;
  summary.durationMs = Date.now() - startTime;

  // ── Also return static resource source metadata ─────────────────────────
  const resourceSources = RESOURCE_SOURCES.map(s => ({
    id: s.id,
    name: s.name,
    url: s.metadataUrl,
    resourceType: s.resourceType,
    copyright: s.copyright,
    trustedOfficial: s.trustedOfficial,
    noteOnly: s.noteOnly
  }));

  return res.status(200).json({
    success: true,
    summary,
    items: finalItems,
    resourceSources
  });
};
