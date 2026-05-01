const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomCode: { type: String }, // Pre-assigned or generated on start
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isReminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
