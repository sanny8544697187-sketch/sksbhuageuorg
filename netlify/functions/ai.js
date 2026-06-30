// netlify/functions/ai.js
// Anthropic Claude - AI Agriculture Professor
// Set ANTHROPIC_API_KEY in Netlify → Site Configuration → Environment Variables

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

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { messages } = JSON.parse(event.body || "{}");

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No messages provided" }),
      };
    }

    // Validate alternating roles (Anthropic requirement)
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
    // Must start with user
    while (cleaned.length && cleaned[0].role === "assistant") cleaned.shift();

    if (!cleaned.length) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No valid user message found" }),
      };
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
      };
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: AI_SYS,
        messages: cleaned,
      }),
    });

    const response = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      const message = response.error?.message || "Anthropic API request failed";
      return {
        statusCode: anthropicResponse.status,
        headers,
        body: JSON.stringify({ error: message }),
      };
    }

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: text }),
    };
  } catch (err) {
    console.error("AI function error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "AI error" }),
    };
  }
};
