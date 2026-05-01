const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['text', 'system', 'feedback'], default: 'text' }
});

module.exports = mongoose.model('Message', MessageSchema);
