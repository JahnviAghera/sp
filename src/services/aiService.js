const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function generateTopic({ seed }) {
  // lightweight example using OpenAI Chat API — replace with robust prompt engineering
  if (!OPENAI_API_KEY) return { topic: seed || 'General Communication' };
  const prompt = `Generate 5 GD topics around: ${seed || 'current affairs'}`;
  const resp = await axios.post(OPENAI_URL, {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200
  }, { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } });
  const text = resp.data.choices?.[0]?.message?.content || '';
  return { topic: text };
}

async function analyzeSpeech({ transcript, userId }) {
  if (!OPENAI_API_KEY) return { summary: 'No AI key configured', scores: {} };
  const prompt = `Analyze the following speech for fluency, confidence, relevance, and sentiment. Return JSON with keys: fluency(0-1), confidence(0-1), relevance(0-1), sentiment(str), suggestions(array). Speech: ${transcript}`;
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
}

module.exports = { generateTopic, analyzeSpeech };
