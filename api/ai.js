// api/ai.js — Vercel Serverless Function (CommonJS)
// Uses OpenRouter API — set OPENROUTER_API_KEY in Vercel Environment Variables

const AI_SYS =
  "You are an expert AI Agriculture Professor at Banaras Hindu University (BHU). " +
  "You have deep knowledge of all agriculture subjects: Agronomy, Horticulture, Soil Science, " +
  "Genetics & Plant Breeding, Plant Pathology, Entomology, Agricultural Economics & Statistics, " +
  "Extension Education, Dairy Science & Food Tech, and Agriculture Engineering. " +
  "Answer student questions clearly and concisely. Use simple language with relevant examples " +
  "from Indian agriculture, and keep answers exam-focused. Plain text only, no markdown symbols.";

const MODEL = "google/gemini-2.0-flash-exp:free";

module.exports = async function handler(req, res) {
  // CORS headers on every response
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENROUTER_API_KEY not set in Vercel env vars" });
  }

  let messages;
  try {
    messages = req.body?.messages || req.body?.contents;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "No messages provided" });
  }

  // Build OpenAI-compatible messages for OpenRouter
  const openaiMessages = [{ role: "system", content: AI_SYS }];

  for (const m of messages) {
    let role = "user";
    let text = "";

    if (m.parts && Array.isArray(m.parts)) {
      role = m.role === "model" ? "assistant" : "user";
      text = m.parts[0]?.text || "";
    } else if (m.content) {
      role = m.role === "assistant" ? "assistant" : "user";
      text = m.content;
    }

    if (text) openaiMessages.push({ role, content: text });
  }

  try {
    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://krishigyan.vercel.app",
        "X-Title": "KrishiGyan AI Professor",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: openaiMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const data = await orRes.json();

    if (!orRes.ok) {
      console.error("OpenRouter error:", JSON.stringify(data));
      return res.status(500).json({ error: data?.error?.message || "OpenRouter API error" });
    }

    const text = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ content: text });

  } catch (err) {
    console.error("Fetch error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
