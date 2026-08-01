// api/ai.js — Vercel Serverless Function (CommonJS)
// Multi-provider AI: Gemini first, then GROQ fallback.

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

async function callGroq(apiKey, userMessages) {
  const messages = [{ role: "system", content: AI_SYS }, ...userMessages];
  
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192", // Groq's extremely fast and reliable Llama 3 model
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Groq error");
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty Groq response");
  return text;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    return res.status(200).json({
      content: "AI Professor is offline. Please add GEMINI_API_KEY or GROQ_API_KEY in Vercel Environment Variables.",
    });
  }

  // 1. Try Gemini first
  if (geminiKey) {
    try {
      const text = await callGemini(geminiKey, userMessages);
      return res.status(200).json({ content: text });
    } catch (e) {
      console.error("Gemini failed:", e.message);
    }
  }

  // 2. Fallback to Groq
  if (groqKey) {
    try {
      const text = await callGroq(groqKey, userMessages);
      return res.status(200).json({ content: text });
    } catch (e) {
      console.error("Groq failed:", e.message);
    }
  }

  // 3. All failed
  return res.status(200).json({
    content: "I am experiencing very high traffic right now. Please wait a moment and try again! ⏳",
  });
};
