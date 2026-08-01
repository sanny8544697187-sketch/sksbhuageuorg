// api/ai.js — Vercel Serverless Function (CommonJS)
// Multi-provider AI: Gemini first, then OpenRouter fallback loop.

const AI_SYS =
  "You are an expert AI Agriculture Professor at Banaras Hindu University (BHU). " +
  "You have deep knowledge of all agriculture subjects: Agronomy, Horticulture, Soil Science, " +
  "Genetics & Plant Breeding, Plant Pathology, Entomology, Agricultural Economics & Statistics, " +
  "Extension Education, Dairy Science & Food Tech, and Agriculture Engineering. " +
  "Answer student questions clearly and concisely. Use simple language with relevant examples " +
  "from Indian agriculture, and keep answers exam-focused. Plain text only, no markdown symbols.";

function normaliseMessages(raw) {
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

async function callGemini(apiKey, userMessages) {
  const contents = userMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: AI_SYS }] },
      contents,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Gemini error");
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

const OR_MODELS = [
  "google/gemma-2-9b-it:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "meta-llama/llama-3.2-1b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
];

async function callOpenRouter(apiKey, userMessages) {
  const messages = [{ role: "system", content: AI_SYS }, ...userMessages];
  for (const model of OR_MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://www.krishigyan.online",
          "X-Title": "KrishiGyan AI Professor",
        },
        body: JSON.stringify({ model, messages, max_tokens: 1024, temperature: 0.7 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "error");
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e) {
      console.warn("OR model failed:", model, e.message);
    }
  }
  throw new Error("All OpenRouter models failed");
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Safe body parsing
  let body = req.body;
  if (!body || typeof body === "string") {
    try { body = JSON.parse(body || "{}"); } catch { body = {}; }
  }

  const rawMessages = body?.messages || body?.contents || body?.history;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0)
    return res.status(200).json({ content: "No messages provided." });

  const userMessages = normaliseMessages(rawMessages);
  if (userMessages.length === 0)
    return res.status(200).json({ content: "Could not parse messages." });

  const geminiKey = process.env.GEMINI_API_KEY;
  const orKey = process.env.OPENROUTER_API_KEY;

  // 1. Try Gemini first
  if (geminiKey) {
    try {
      const text = await callGemini(geminiKey, userMessages);
      return res.status(200).json({ content: text });
    } catch (e) {
      console.error("Gemini failed:", e.message);
    }
  }

  // 2. Fallback to OpenRouter loop
  if (orKey) {
    try {
      const text = await callOpenRouter(orKey, userMessages);
      return res.status(200).json({ content: text });
    } catch (e) {
      console.error("OpenRouter failed:", e.message);
    }
  }

  // 3. No keys configured
  if (!geminiKey && !orKey) {
    return res.status(200).json({
      content: "AI Professor is offline. Please add GEMINI_API_KEY in Vercel Environment Variables.",
    });
  }

  // 4. All failed — friendly message
  return res.status(200).json({
    content: "I am experiencing very high traffic right now. Please wait a moment and try again! ⏳",
  });
};
