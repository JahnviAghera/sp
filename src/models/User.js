const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  avatarUrl: { type: String },
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  stats: {
    totalSpeakingTime: { type: Number, default: 0 },
    sessionsParticipated: { type: Number, default: 0 }
  },
  geminiApiKey: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
