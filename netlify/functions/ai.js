// netlify/functions/ai.js
// Uses fetch() directly — NO external dependencies, no bundling issues
// Node 18+ has built-in fetch (Netlify Functions use Node 18)

const AI_SYS =
  "You are an expert AI Agriculture Professor at Banaras Hindu University (BHU). " +
  "You have deep knowledge of all agriculture subjects: Agronomy, Horticulture, Soil Science, " +
  "Genetics & Plant Breeding, Plant Pathology, Entomology, Agricultural Economics & Statistics, " +
  "Extension Education, Dairy Science & Food Tech, and Agriculture Engineering. " +
  "Answer student questions clearly and concisely. Use simple language with relevant examples " +
  "from Indian agriculture, and keep answers exam-focused. Plain text only, no markdown symbols.";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };

  // Support both env var names
  const apiKey = process.env.anthropic_key || process.env.ANTHROPIC_API_KEY || "";
  console.log("API key present:", !!apiKey, "| length:", apiKey.length);

  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    console.error("Invalid or missing API key");
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Server config error: API key missing or invalid" }) };
  }

  let messages;
  try {
    const body = JSON.parse(event.body || "{}");
    messages = body.messages;
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "No messages provided" }) };
  }

  // Clean messages: alternating roles, must start with user
  const cleaned = [];
  for (const m of messages) {
    if (!m.role || !m.content) continue;
    const role = m.role === "user" ? "user" : "assistant";
    if (cleaned.length && cleaned[cleaned.length - 1].role === role) {
      cleaned[cleaned.length - 1].content += "\n" + m.content;
    } else {
      cleaned.push({ role, content: String(m.content) });
    }
  }
  while (cleaned.length && cleaned[0].role === "assistant") cleaned.shift();

  if (!cleaned.length) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "No valid user message" }) };
  }

  console.log("Calling Anthropic REST API with", cleaned.length, "messages");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1024,
        system: AI_SYS,
        messages: cleaned,
      }),
    });

    const data = await res.json();
    console.log("Anthropic response status:", res.status);

    if (!res.ok) {
      console.error("Anthropic API error:", JSON.stringify(data));
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: data?.error?.message || "Anthropic API error" }) };
    }

    const text = (data.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");

    console.log("Success! Reply length:", text.length);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ content: text }) };

  } catch (err) {
    console.error("Fetch error:", err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
