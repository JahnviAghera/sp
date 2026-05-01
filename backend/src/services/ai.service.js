const logger = require('../config/logger');

/**
 * Mock AI Service for SpeakSpace
 * In a real production app, this would integrate with OpenAI Whisper and GPT-4.
 */

const analyzeSpeech = async (text) => {
  logger.info(`Analyzing speech: ${text}`);
  
  // Mock analysis logic
  const scores = {
    fluency: Math.floor(Math.random() * 20) + 70, // 70-90
    confidence: Math.floor(Math.random() * 20) + 75, // 75-95
    relevance: Math.floor(Math.random() * 30) + 60, // 60-90
  };

  const suggestions = [
    'Try to use more varied vocabulary.',
    'Maintain a consistent pace.',
    'Good eye contact (simulated).',
  ];

  return { scores, suggestions };
};

const generateTopic = async (category = 'General') => {
  const topics = {
    'Technology': 'Is Artificial Intelligence a threat to creative jobs?',
    'Ethics': 'The role of social media in modern democracy.',
    'Business': 'Remote work vs Office work: The future of productivity.',
    'General': 'The importance of emotional intelligence in leadership.',
  };

  return topics[category] || topics['General'];
};

module.exports = {
  analyzeSpeech,
  generateTopic,
};
