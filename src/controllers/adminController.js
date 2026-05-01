const User = require('../models/User');
const Room = require('../models/Room');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Mock ban - in real app add 'isBanned' field to User schema
    res.json({ message: `User ${id} has been banned.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getActiveRooms = async (req, res) => {
  try {
    const rooms = await Room.find({}).populate('moderator', 'name');
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
