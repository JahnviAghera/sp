const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a room title'],
    trim: true,
  },
  topic: {
    type: String,
    required: [true, 'Please provide a discussion topic'],
  },
  description: String,
  isPrivate: {
    type: Boolean,
    default: false,
  },
  accessCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  maxParticipants: {
    type: Number,
    default: 10,
    min: 2,
    max: 20,
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished'],
    default: 'waiting',
  },
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  aiModeratorEnabled: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Room', roomSchema);
