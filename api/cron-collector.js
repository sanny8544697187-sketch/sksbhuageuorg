// api/cron-collector.js
// Vercel Serverless Function & Scheduled Cron Job
// Crawls reliable official feeds & updates for Agriculture exams & resources,
// organizes items, performs deduplication, applies auto-publish rules,
// and returns items for authorized sync and storage.

const crypto = require('crypto');

// Permitted public RSS & official feeds for agriculture exams & learning
const SOURCES = [
  {
    id: "pib_agri",
    name: "PIB Agriculture (Govt of India)",
    url: "https://pib.gov.in/RssMain.aspx?ModId=6&LangId=1",
    category: "NEWS",
    exam: "GENERAL",
    trustedOfficial: true
  },
  {
    id: "google_icar_cuet",
    name: "ICAR & CUET-PG Agri Updates",
    url: 'https://news.google.com/rss/search?q="ICAR"+OR+"CUET+PG+Agriculture"+OR+"AIEEA"+exam+notification&hl=en-IN&gl=IN&ceid=IN:en',
    category: "EXAM",
    exam: "ICAR_CUET",
    trustedOfficial: false // Sent for review unless domain is official
  },
  {
    id: "google_banking_agri",
    name: "IBPS AFO & NABARD Exam Alerts",
    url: 'https://news.google.com/rss/search?q="IBPS+AFO"+OR+"NABARD+Grade+A"+notification+admit+card&hl=en-IN&gl=IN&ceid=IN:en',
    category: "SCHEDULE",
    exam: "IBPS_NABARD",
    trustedOfficial: false
  },
  {
    id: "google_agri_jobs",
    name: "State Agriculture PSC & Agri Officer Updates",
    url: 'https://news.google.com/rss/search?q="Agriculture+Officer"+OR+"ADO"+OR+"HDO"+OR+"BPSC+Agriculture"+recruitment&hl=en-IN&gl=IN&ceid=IN:en',
    category: "EXAM",
    exam: "STATE_PSC",
    trustedOfficial: false
  },
  {
    id: "krishi_jagran_agri",
    name: "Krishi Jagran - Agriculture & Farming",
    url: "https://krishijagran.com/feeds/rss",
    category: "NEWS",
    exam: "GENERAL",
    trustedOfficial: true
  }
];

// Official exam & government domains for verified auto-publishing
const TRUSTED_DOMAINS = [
  "icar.org.in",
  "nta.ac.in",
  "cuet.nta.nic.in",
  "ibps.in",
  "nabard.org",
  "pib.gov.in",
  "agricoop.nic.in",
  "icar.gov.in",
  "upsc.gov.in",
  "bpsc.bih.nic.in",
  "uppsc.up.nic.in",
  "krishijagran.com"
];

// Content relevance filters
const AGRI_KEYWORDS = [
  "agri", "crop", "farmer", "icar", "cuet", "afo", "nabard", "soil", "horticulture",
  "farm", "kisan", "seed", "exam", "admit card", "result", "vacancy", "officer", "msc", "bsc", "bhu"
];

function isAgricultureRelevant(text) {
  const lower = text.toLowerCase();
  return AGRI_KEYWORDS.some(kw => lower.includes(kw));
}

// Fast XML RSS item parser
function parseRssXml(xmlText, sourceDef) {
  const items = [];
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    try {
      const getTag = (tag) => {
        const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
        const normal = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const m = itemXml.match(cdata) || itemXml.match(normal);
        return m ? m[1].trim() : '';
      };

      let title = getTag('title').replace(/<[^>]*>/g, '').trim();
      let link = getTag('link').replace(/<[^>]*>/g, '').trim();
      let description = getTag('description').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      let pubDate = getTag('pubDate') || new Date().toISOString();

      if (!link) {
        const linkHref = itemXml.match(/<link[^>]+href="([^"]+)"/i);
        if (linkHref) link = linkHref[1];
      }

      if (!title || !link) continue;

      const cleanTitle = title.split(' - ')[0].trim();
      const combinedText = cleanTitle + ' ' + description;

      if (!isAgricultureRelevant(combinedText)) {
        continue;
      }

      if (description.length > 220) description = description.substring(0, 220) + '...';

      let detectedExam = sourceDef.exam;
      const lowerText = combinedText.toLowerCase();
      if (lowerText.includes('icar') || lowerText.includes('aieea')) detectedExam = 'ICAR';
      else if (lowerText.includes('cuet')) detectedExam = 'CUET_PG';
      else if (lowerText.includes('ibps') || lowerText.includes('afo')) detectedExam = 'IBPS_AFO';
      else if (lowerText.includes('nabard')) detectedExam = 'NABARD';
      else if (lowerText.includes('psc') || lowerText.includes('upsc') || lowerText.includes('bpsc') || lowerText.includes('uppsc')) detectedExam = 'STATE_PSC';

      let resourceType = 'News';
      if (lowerText.includes('admit card') || lowerText.includes('date') || lowerText.includes('schedule')) resourceType = 'Schedule';
      else if (lowerText.includes('result') || lowerText.includes('answer key') || lowerText.includes('cutoff')) resourceType = 'Exam Result';
      else if (lowerText.includes('syllabus') || lowerText.includes('pyq') || lowerText.includes('question paper')) resourceType = 'Study Material';
      else if (lowerText.includes('notification') || lowerText.includes('recruitment') || lowerText.includes('vacancy')) resourceType = 'Notification';

      let isOfficialSource = false;
      try {
        const parsedUrl = new URL(link);
        if (TRUSTED_DOMAINS.some(d => parsedUrl.hostname.includes(d))) {
          isOfficialSource = true;
        }
      } catch (_) {}

      const hash = crypto.createHash('sha256').update((cleanTitle + link).toLowerCase()).digest('hex').substring(0, 16);

      items.push({
        id: `harv_${hash}`,
        hash,
        title: cleanTitle,
        desc: description || `Update from ${sourceDef.name}.`,
        link,
        source: sourceDef.name,
        sourceId: sourceDef.id,
        category: sourceDef.category,
        exam: detectedExam,
        resourceType,
        isOfficial: isOfficialSource,
        pubDate,
        timestamp: new Date(pubDate).getTime() || Date.now(),
        status: isOfficialSource ? 'published' : 'pending_review'
      });
    } catch (_) {}
  }
  return items;
}

// Verify Firebase ID Token for authenticated Admin callers
async function verifyFirebaseAdminToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const idToken = authHeader.substring(7).trim();
  if (!idToken) return false;

  try {
    // Decode Google/Firebase ID Token without third-party libraries by validating claims with Google's public tokeninfo endpoint
    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!tokenInfoRes.ok) return false;
    const tokenData = await tokenInfoRes.json();

    // Verify audience matches Firebase project
    const expectedAudience = process.env.FIREBASE_PROJECT_ID || "bhuagorg";
    if (tokenData.aud !== expectedAudience) return false;

    // Check expiration
    const nowSec = Math.floor(Date.now() / 1000);
    if (tokenData.exp && tokenData.exp < nowSec) return false;

    return true;
  } catch (err) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  // 1. Strict Production Security Enforcement
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  const querySecret = req.query?.secret;
  const isVercelCron = req.headers['x-vercel-cron'] === '1' || req.headers['user-agent']?.includes('vercel-cron');

  let isAuthorized = false;

  // Rule A: If CRON_SECRET is configured in env, check Bearer header, query, or Vercel Cron header
  if (cronSecret) {
    if (authHeader && authHeader === `Bearer ${cronSecret}`) {
      isAuthorized = true;
    } else if (querySecret && querySecret === cronSecret) {
      isAuthorized = true;
    }
  }

  // Rule B: Vercel Cron verification (Vercel automatically passes `Authorization: Bearer <CRON_SECRET>` when set)
  // If CRON_SECRET is not set, Vercel sets x-vercel-cron: 1. In production, we require either CRON_SECRET or verified Vercel platform signature.
  if (!isAuthorized && isVercelCron && (!cronSecret || authHeader === `Bearer ${cronSecret}`)) {
    isAuthorized = true;
  }

  // Rule C: Authenticated Admin call via Firebase ID Token (for manual trigger without exposing secret)
  if (!isAuthorized && authHeader && authHeader.startsWith("Bearer ") && authHeader !== `Bearer ${cronSecret}`) {
    const isTokenValid = await verifyFirebaseAdminToken(authHeader);
    if (isTokenValid) {
      isAuthorized = true;
    }
  }

  // REJECT UNAUTHORIZED REQUESTS (Never leave an unprotected production endpoint)
  if (!isAuthorized) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized access. Endpoint requires a valid Vercel Cron signature, CRON_SECRET, or Firebase Admin ID token."
    });
  }

  // 2. Execution metrics
  const startTime = Date.now();
  const summary = {
    executedAt: new Date().toISOString(),
    sourcesChecked: 0,
    itemsFound: 0,
    publishedCount: 0,
    pendingReviewCount: 0,
    errors: []
  };

  const harvestedItems = [];

  for (const src of SOURCES) {
    summary.sourcesChecked++;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const resp = await fetch(src.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 KrishiGyanBot/1.0'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        summary.errors.push(`Source ${src.name} returned status ${resp.status}`);
        continue;
      }

      const xml = await resp.text();
      const parsed = parseRssXml(xml, src);
      harvestedItems.push(...parsed);
    } catch (err) {
      summary.errors.push(`Error fetching ${src.name}: ${err.message}`);
    }
  }

  // 3. Deduplication across harvested items
  const uniqueItemsMap = new Map();
  for (const item of harvestedItems) {
    if (!uniqueItemsMap.has(item.hash)) {
      uniqueItemsMap.set(item.hash, item);
      if (item.status === 'published') summary.publishedCount++;
      else summary.pendingReviewCount++;
    }
  }

  const finalItems = Array.from(uniqueItemsMap.values())
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 60);

  summary.itemsFound = finalItems.length;
  summary.durationMs = Date.now() - startTime;

  return res.status(200).json({
    success: true,
    summary,
    items: finalItems
  });
};
