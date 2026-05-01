const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  speakingTime: Number,
  fluencyScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  relevanceScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  sentimentTrend: [String],
  feedbackSuggestions: [String],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Analytics', analyticsSchema);
