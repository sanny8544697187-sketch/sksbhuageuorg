exports.handler = async (event) => {

  const headers = {
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type"                : "application/json",
  };

  if(event.httpMethod === "OPTIONS"){
    return { statusCode: 200, headers, body: "" };
  }

  if(event.httpMethod !== "POST"){
    return { statusCode: 405, headers, body: JSON.stringify({error:"Method not allowed"}) };
  }

  try{
    const { contents } = JSON.parse(event.body);

    const OPENROUTER_API_KEY = "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";
    if(!OPENROUTER_API_KEY){
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: { message: "API key not set in Netlify environment variables." } })
      };
    }

    // Convert Gemini-style contents to OpenAI-style messages
    const messages = [
      {
        role: "system",
        content:
          "You are an expert AI Agriculture Professor at Banaras Hindu University (BHU). "+
          "You have deep knowledge of all agriculture subjects: Agronomy, Horticulture, Soil Science, "+
          "Plant Physiology, Genetics & Plant Breeding, Plant Pathology, Entomology, Agricultural Meteorology, "+
          "Agricultural Economics, Extension Education, Farm Management, Ecology & Environment, and Agriculture Engineering. "+
          "Answer student questions clearly and concisely. Use simple language with relevant examples from Indian "+
          "agriculture, and keep answers exam-focused. Format answers in plain text without markdown symbols."
      },
      ...contents.map(c => ({
        role   : c.role === "model" ? "assistant" : "user",
        content: c.parts[0].text
      }))
    ];

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method : "POST",
      headers: {
        "Content-Type" : "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer" : "https://bhu-agriculture.netlify.app",
        "X-Title"      : "BHU Agriculture Portal"
      },
      body: JSON.stringify({
        model      : "google/gemini-2.0-flash-exp:free",
        messages,
        max_tokens : 1000,
        temperature: 0.7
      })
    });

    const data = await res.json();

    if(data.error){
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ error: data.error })
      };
    }

    // Convert OpenRouter response back to Gemini-style so index.html works without changes
    const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        candidates: [{ content: { parts: [{ text: reply }] } }]
      })
    };

  } catch(err){
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: { message: err.message } })
    };
  }
};


