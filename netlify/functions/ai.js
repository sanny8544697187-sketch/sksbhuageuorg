// netlify/functions/ai.js
// Uses Gemini 2.5 Flash API directly — NO external dependencies, no bundling issues

const AI_SYS =
  "You are an expert AI Agriculture Professor at Banaras Hindu University (BHU). " +
  "You have deep knowledge of all agriculture subjects: Agronomy, Horticulture, Soil Science, " +
  "Genetics & Plant Breeding, Plant Pathology, Entomology, Agricultural Economics & Statistics, " +
  "Extension Education, Dairy Science & Food Tech, and Agriculture Engineering. " +
  "Answer student questions clearly and concisely. Use simple language with relevant examples " +
  "from Indian agriculture, and keep answers exam-focused. Plain text only, no markdown symbols.";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Gemini-Key",
  "Content-Type": "application/json",
};

// API key is configured via Netlify env var: GEMINI_API_KEY

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };

  // Support custom header from client-side config or server env var
  const clientKey = event.headers["x-gemini-key"] || event.headers["X-Gemini-Key"];
  const apiKey = clientKey || process.env.GEMINI_API_KEY || process.env.gemini_key;
  console.log("Gemini API key source:", clientKey ? "client-header" : "server-env");

  if (!apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Server config error: API key missing" }) };
  }

  let messages;
  try {
    const body = JSON.parse(event.body || "{}");
    messages = body.messages || body.contents;
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "No messages provided" }) };
  }

  // Convert incoming messages (Anthropic format or Gemini contents format) to Gemini-compatible structures
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
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "No valid user message" }) };
  }

  console.log("Calling Gemini 2.5 Flash API with", contents.length, "messages");

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: AI_SYS }]
        },
        contents: contents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        }
      }),
    });

    const data = await res.json();
    console.log("Gemini response status:", res.status);

    if (!res.ok) {
      console.error("Gemini API error:", JSON.stringify(data));
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: data?.error?.message || "Gemini API error" }) };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Success! Reply length:", text.length);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ content: text }) };

  } catch (err) {
    console.error("Fetch error:", err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
