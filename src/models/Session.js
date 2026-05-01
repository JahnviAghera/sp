const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  recordings: [{ url: String, uploadedAt: Date }],
  analytics: { type: mongoose.Schema.Types.Mixed },
  participantsSummary: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    speakingTime: Number,
    score: Number
  }]
});

module.exports = mongoose.model('Session', SessionSchema);
