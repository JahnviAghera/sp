const mongoose = require('mongoose');

const TranscriptSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true },
  roomCode: { type: String, index: true }, // Backup lookup
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  text: { type: String, required: true },
  feedback: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24 hours
});

module.exports = mongoose.model('Transcript', TranscriptSchema);
