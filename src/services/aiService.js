const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ACTIVE_KEY = GEMINI_API_KEY || 'AIzaSyCX4ZciI_YY1llTjHBWwqkiuHM96O-D2GY';
const defaultGenAI = new GoogleGenerativeAI(ACTIVE_KEY);

function getGenAI(customKey) {
  return customKey ? new GoogleGenerativeAI(customKey) : defaultGenAI;
}

async function generateTopic({ seed, userApiKey }) {
  if (!ACTIVE_KEY && !userApiKey) return { topic: seed || 'General Communication' };
  try {
    const genAI = getGenAI(userApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a thought-provoking Group Discussion topic related to: ${seed || 'Professional Skills'}. Return only the topic title.`;
    const result = await model.generateContent(prompt);
    return { topic: result.response.text().trim() };
  } catch (err) {
    console.error('generateTopic error:', err);
    return { topic: seed || 'General Communication (Fallback)' };
  }
}

async function analyzeSpeech({ transcript, userName, userApiKey }) {
  if (!ACTIVE_KEY && !userApiKey) return { summary: 'No AI key configured', fluency: 0, confidence: 0 };
  try {
    const genAI = getGenAI(userApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    Analyze this speech segment by ${userName}. 
    Return strictly JSON with:
    {
      "summary": "one short constructive sentence",
      "fluency": 0.0-1.0,
      "confidence": 0.0-1.0
    }
    Speech: "${transcript}"
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    // Strip markdown formatting if Gemini included it
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('analyzeSpeech error:', err);
    return { summary: 'Analysis paused', fluency: 0.5, confidence: 0.5 };
  }
}

async function generateSessionReview(transcripts, userApiKey) {
  if (!ACTIVE_KEY && !userApiKey) return { error: 'Gemini API key missing' };
  try {
    const genAI = getGenAI(userApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const script = transcripts.map(t => `[${t.userName}]: ${t.text}`).join('\n');
    const prompt = `Review this transcript and return strictly a JSON summary including sessionSummary, overallVibe, and an array of participants with scores and feedback. Transcript: ${script}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Most robust way to extract JSON: find the first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini generateSessionReview error:', err);
    return { error: 'Failed to generate review' };
  }
}

module.exports = { generateTopic, analyzeSpeech, generateSessionReview };
