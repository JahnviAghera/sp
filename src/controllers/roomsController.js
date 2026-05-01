const Room = require('../models/Room');
const User = require('../models/User');
const { nanoid } = require('nanoid');

exports.createRoom = async (req, res) => {
  try {
    const { title, isPrivate, maxParticipants, aiModerator } = req.body;
    const code = nanoid(8);
    const room = await Room.create({ title, code, isPrivate: !!isPrivate, maxParticipants: maxParticipants || 8, moderator: req.user.id, aiModerator: aiModerator !== false });
    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { code } = req.body;
    const room = await Room.findOne({ code });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.participants.length >= room.maxParticipants) return res.status(403).json({ message: 'Room full' });
    if (!room.participants.includes(req.user.id)) {
      room.participants.push(req.user.id);
      await room.save();
    }
    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listRooms = async (req, res) => {
  try {
    const rooms = await Room.find({}).limit(50).lean();
    res.json({ rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
