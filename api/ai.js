// api/ai.js — Vercel Serverless Function (CommonJS)
// Multi-provider AI: tries Google Gemini first, then OpenRouter as fallback.
// Set GEMINI_API_KEY or OPENROUTER_API_KEY in Vercel Environment Variables.

const AI_SYS =
  "You are an expert AI Agriculture Professor at Banaras Hindu University (BHU). " +
  "You have deep knowledge of all agriculture subjects: Agronomy, Horticulture, Soil Science, " +
  "Genetics & Plant Breeding, Plant Pathology, Entomology, Agricultural Economics & Statistics, " +
  "Extension Education, Dairy Science & Food Tech, and Agriculture Engineering. " +
  "Answer student questions clearly and concisely. Use simple language with relevant examples " +
  "from Indian agriculture, and keep answers exam-focused. Plain text only, no markdown symbols.";

// ── helpers ──────────────────────────────────────────────────────────────────

function normaliseMessages(raw) {
  // Accept both Gemini-style {role, parts:[{text}]} and OpenAI-style {role, content}
  const out = [];
  for (const m of raw) {
    let role = "user";
    let text = "";

    if (m.parts && Array.isArray(m.parts)) {
      role = m.role === "model" ? "assistant" : "user";
      text = m.parts[0]?.text || "";
    } else if (typeof m.content === "string") {
      role = m.role === "assistant" ? "assistant" : "user";
      text = m.content;
    }

    if (text) out.push({ role, content: text });
  }
  return out;
}

// ── provider: Google Gemini ───────────────────────────────────────────────────

async function callGemini(apiKey, userMessages) {
  // Build Gemini-style contents (no system role in contents array for Gemini)
  const contents = userMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: { parts: [{ text: AI_SYS }] },
    contents,
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Gemini API error");

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

// ── provider: OpenRouter ──────────────────────────────────────────────────────

async function callOpenRouter(apiKey, userMessages) {
  const messages = [{ role: "system", content: AI_SYS }, ...userMessages];

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://www.krishigyan.online",
      "X-Title": "KrishiGyan AI Professor",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-exp:free",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "OpenRouter API error");

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenRouter");
  return text;
}

// ── main handler ─────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // Parse body – Vercel already parses JSON but guard anyway
  let rawMessages;
  try {
    rawMessages =
      req.body?.messages || req.body?.contents || req.body?.history;
  } catch {
    return res.status(400).json({ error: "Invalid request body" });
  }

  if (!Array.isArray(rawMessages) || rawMessages.length === 0)
    return res.status(400).json({ error: "No messages provided" });

  const userMessages = normaliseMessages(rawMessages);
  if (userMessages.length === 0)
    return res.status(400).json({ error: "Could not parse messages" });

  const geminiKey = process.env.GEMINI_API_KEY;
  const orKey = process.env.OPENROUTER_API_KEY;

  // Try Gemini first, then OpenRouter
  const errors = [];

  if (geminiKey) {
    try {
      const text = await callGemini(geminiKey, userMessages);
      return res.status(200).json({ content: text });
    } catch (e) {
      console.error("Gemini failed:", e.message);
      errors.push("Gemini: " + e.message);
    }
  }

  if (orKey) {
    try {
      const text = await callOpenRouter(orKey, userMessages);
      return res.status(200).json({ content: text });
    } catch (e) {
      console.error("OpenRouter failed:", e.message);
      errors.push("OpenRouter: " + e.message);
    }
  }

  if (!geminiKey && !orKey) {
    return res.status(500).json({
      error: "No API key configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY in Vercel Environment Variables.",
    });
  }

  return res.status(500).json({ error: "All AI providers failed: " + errors.join(" | ") });
};
