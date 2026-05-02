const Schedule = require('../models/Schedule');

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
    const schedules = await Schedule.find({ startTime: { $gt: new Date() } })
      .sort({ startTime: 1 })
      .populate('creator', 'name')
      .lean();
    res.json({ schedules });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.joinSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.body;
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    
    if (!schedule.participants.includes(req.user.id)) {
      schedule.participants.push(req.user.id);
      await schedule.save();
    }
    res.json({ message: 'Joined schedule successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
