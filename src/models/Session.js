const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  review: { type: mongoose.Schema.Types.Mixed }, // Store Gemini output permanently
  recordings: [{ url: String, uploadedAt: Date }],
  analytics: { type: mongoose.Schema.Types.Mixed },
  // All users who joined the session (recorded on socket join_room)
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String }
  }],
  participantsSummary: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    speakingTime: Number,
    score: Number
  }]
});

module.exports = mongoose.model('Session', SessionSchema);
