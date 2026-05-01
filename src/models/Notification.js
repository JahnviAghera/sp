const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['reminder', 'feedback', 'invite', 'system'], default: 'system' },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // e.g., /room/CODE
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
