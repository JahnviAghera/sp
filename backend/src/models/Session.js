const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: Date,
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    speakingTime: {
      type: Number,
      default: 0, // In seconds
    },
    interruptionCount: {
      type: Number,
      default: 0,
    },
  }],
  transcript: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    sentiment: String,
  }],
  aiSummary: String,
  overallSentiment: String,
});

module.exports = mongoose.model('Session', sessionSchema);
