const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  metrics: {
    fluency: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 }
  },
  speakingTimeSecs: { type: Number, default: 0 },
  interruptions: { type: Number, default: 0 },
  feedbackText: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
