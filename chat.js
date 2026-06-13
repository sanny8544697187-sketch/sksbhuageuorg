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

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if(!GEMINI_API_KEY){
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: { message: "API key not set in Netlify environment variables." } })
      };
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          system_instruction: {
            parts: [{ text:
              "You are an expert AI Agriculture Professor at Banaras Hindu University (BHU). "+
              "You have deep knowledge of all agriculture subjects: Agronomy, Horticulture, Soil Science, "+
              "Plant Physiology, Genetics & Plant Breeding, Plant Pathology, Entomology, Agricultural Meteorology, "+
              "Agricultural Economics, Extension Education, Farm Management, Ecology & Environment, and Agriculture Engineering. "+
              "Answer student questions clearly and concisely. Use simple language with relevant examples from Indian "+
              "agriculture, and keep answers exam-focused. Format answers in plain text without markdown symbols."
            }]
          },
          contents,
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
        })
      }
    );

    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch(err){
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: { message: err.message } })
    };
  }
};
