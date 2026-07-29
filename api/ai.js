// api/ai.js — Vercel Serverless Function (converted from Netlify)
// Uses Gemini 2.5 Flash API — set GEMINI_API_KEY in Vercel Environment Variables

const AI_SYS =
  "You are an expert AI Agriculture Professor at Banaras Hindu University (BHU). " +
  "You have deep knowledge of all agriculture subjects: Agronomy, Horticulture, Soil Science, " +
  "Genetics & Plant Breeding, Plant Pathology, Entomology, Agricultural Economics & Statistics, " +
  "Extension Education, Dairy Science & Food Tech, and Agriculture Engineering. " +
  "Answer student questions clearly and concisely. Use simple language with relevant examples " +
  "from Indian agriculture, and keep answers exam-focused. Plain text only, no markdown symbols.";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Gemini-Key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export default async function handler(req, res) {
  // Set CORS headers on every response
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // API key: from client header (optional) or Vercel env var
  const clientKey = req.headers["x-gemini-key"];
  const apiKey = clientKey || process.env.GEMINI_API_KEY;
  console.log("Gemini API key source:", clientKey ? "client-header" : "server-env");

  if (!apiKey) {
    return res.status(500).json({ error: "Server config error: GEMINI_API_KEY not set" });
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

  // Convert messages to Gemini contents format
  const contents = [];
  for (const m of messages) {
    let role = "user";
    let text = "";

    if (m.parts && Array.isArray(m.parts)) {
      role = m.role === "model" ? "model" : "user";
      text = m.parts[0]?.text || "";
    } else if (m.content) {
      role = m.role === "assistant" ? "model" : "user";
      text = m.content;
    }

    if (!text) continue;

    // Merge consecutive messages of the same role
    if (contents.length && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += "\n" + text;
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }

  // Ensure conversation starts with a user message
  while (contents.length && contents[0].role === "model") contents.shift();

  if (!contents.length) {
    return res.status(400).json({ error: "No valid user message" });
  }

  console.log("Calling Gemini 2.5 Flash with", contents.length, "messages");

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: AI_SYS }] },
          contents,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      }
    );

    const data = await geminiRes.json();
    console.log("Gemini response status:", geminiRes.status);

    if (!geminiRes.ok) {
      console.error("Gemini API error:", JSON.stringify(data));
      return res.status(500).json({ error: data?.error?.message || "Gemini API error" });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Success! Reply length:", text.length);
    return res.status(200).json({ content: text });

  } catch (err) {
    console.error("Fetch error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
