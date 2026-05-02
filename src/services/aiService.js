const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'dummy');

async function generateTopic({ seed }) {
  // lightweight example using OpenAI Chat API — replace with robust prompt engineering
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-REPLACE_ME') return { topic: seed || 'General Communication' };
  const prompt = `Generate 5 GD topics around: ${seed || 'current affairs'}`;
  try {
    const resp = await axios.post(OPENAI_URL, {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200
    }, { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } });
    const text = resp.data.choices?.[0]?.message?.content || '';
    return { topic: text };
  } catch (err) {
    console.error('generateTopic error:', err.response?.data || err.message);
    return { topic: seed || 'General Communication (Fallback)' };
  }
}

async function analyzeSpeech({ transcript, userId }) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-REPLACE_ME') return { summary: 'No AI key configured', scores: {} };
  const prompt = `Analyze the following speech for fluency, confidence, relevance, and sentiment. Return JSON with keys: fluency(0-1), confidence(0-1), relevance(0-1), sentiment(str), suggestions(array). Speech: ${transcript}`;
  try {
    const resp = await axios.post(OPENAI_URL, {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300
    }, { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } });
    const text = resp.data.choices?.[0]?.message?.content || '';
    // Best-effort parse JSON from model
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (err) {
      return { raw: text };
    }
  } catch (err) {
    console.error('analyzeSpeech error:', err.response?.data || err.message);
    return { summary: 'AI Analysis Failed', scores: {} };
  }
}

async function generateSessionReview(transcripts) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyDOkXWE-tucx3r-lIBx4ybO0UrQTlIWtMU_dummy') {
    return { error: 'Gemini API key missing' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
    
    // Format transcripts into a script
    const script = transcripts.map(t => `[${new Date(t.createdAt).toLocaleTimeString()}] ${t.userName}: ${t.text}`).join('\n');
    
    const prompt = `
    You are an expert executive communication coach reviewing a group discussion session.
    Below is the chronological transcript of the session.
    Analyze the performance of ALL participants.
    
    Return a strictly valid JSON object with the following structure:
    {
      "sessionSummary": "A concise 2-sentence summary of the overall discussion.",
      "overallVibe": "e.g., Collaborative, Debative, Analytical, etc.",
      "participants": [
        {
          "name": "Participant Name",
          "overallScore": 85, // out of 100
          "strengths": ["Strength 1", "Strength 2"],
          "areasForImprovement": ["Improvement 1"],
          "feedback": "A short personalized paragraph of constructive feedback."
        }
      ]
    }
    
    TRANSCRIPT:
    ${script}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini generateSessionReview error:', err);
    return { error: 'Failed to generate review' };
  }
}

module.exports = { generateTopic, analyzeSpeech, generateSessionReview };
