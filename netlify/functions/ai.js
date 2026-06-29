// netlify/functions/ai.js
// Deploy steps:
//   1. npm install @anthropic-ai/sdk  (in your project root)
//   2. Set ANTHROPIC_API_KEY in Netlify → Site settings → Environment variables
//   3. Deploy — endpoint will be /.netlify/functions/ai

const Anthropic = require("@anthropic-ai/sdk");

const AI_SYS =
  "You are an expert AI Agriculture Professor at Banaras Hindu University (BHU). " +
  "You have deep knowledge of all agriculture subjects: Agronomy, Horticulture, Soil Science, " +
  "Genetics & Plant Breeding, Plant Pathology, Entomology, Agricultural Economics & Statistics, " +
  "Extension Education, Dairy Science & Food Tech, and Agriculture Engineering. " +
  "Answer student questions clearly and concisely. Use simple language with relevant examples from Indian " +
  "agriculture, and keep answers exam-focused. Format answers in plain text without markdown symbols.";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { messages } = JSON.parse(event.body || "{}");
    if (!messages || !messages.length) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "No messages provided" }) };
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: AI_SYS,
      messages, // already in Anthropic format: [{role:"user"|"assistant", content:"..."}]
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return { statusCode: 200, headers, body: JSON.stringify({ content: text }) };
  } catch (err) {
    console.error("AI function error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "AI error" }),
    };
  }
};
