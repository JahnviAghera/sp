const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification');

exports.createSchedule = async (req, res) => {
  try {
    const { title, description, startTime } = req.body;
    const schedule = await Schedule.create({
      title,
      description,
      startTime,
      creator: req.user.id
    });
    res.json({ schedule });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUpcomingSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({
      $or: [{ creator: req.user.id }, { participants: req.user.id }],
      startTime: { $gte: new Date() }
    }).sort({ startTime: 1 });
    res.json({ schedules });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
