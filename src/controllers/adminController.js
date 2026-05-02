const User = require('../models/User');
const Room = require('../models/Room');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password').lean();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    await User.findByIdAndUpdate(userId, { role });
    res.json({ message: 'User role updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeRooms = await Room.countDocuments();
    res.json({ totalUsers, activeRooms });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
