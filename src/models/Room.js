const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true, index: true },
  isPrivate: { type: Boolean, default: false },
  maxParticipants: { type: Number, default: 8 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  moderator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiModerator: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', RoomSchema);
