const Room = require('../models/Room');
const User = require('../models/User');
const Session = require('../models/Session');
const Transcript = require('../models/Transcript');
const { nanoid } = require('nanoid');
const aiService = require('../services/aiService');

exports.createRoom = async (req, res) => {
  try {
    const { title, isPrivate, maxParticipants, aiModerator } = req.body;
    const code = nanoid(8);
    const room = await Room.create({ title, code, isPrivate: !!isPrivate, maxParticipants: maxParticipants || 8, moderator: req.user.id, aiModerator: aiModerator !== false });
    res.json(room);
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
    const { getIO } = require('../socket');
    const io = getIO();

    const rooms = await Room.find({ isPrivate: false })
                            .sort({ createdAt: -1 })
                            .limit(50)
                            .lean();
    
    // Add real-time active count for each room
    const roomsWithCount = rooms.map(room => {
      const socketRoom = io?.sockets.adapter.rooms.get(room.code);
      return {
        ...room,
        activeCount: socketRoom ? socketRoom.size : 0
      };
    });

    res.json(roomsWithCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMySessions = async (req, res) => {
  try {
    // Find all sessions where this user was recorded as a participant on join
    const sessions = await Session.find({
      'participants.userId': req.user.id
    })
      .populate('room', 'title code')
      .sort({ startedAt: -1 })
      .limit(50)
      .lean();

    res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getRoomReview = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Find latest session for this room
    const room = await Room.findOne({ code });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    const session = await Session.findOne({ room: room._id }).sort({ startedAt: -1 });
    if (!session) return res.status(404).json({ message: 'No session found for this room' });
    
    const transcripts = await Transcript.find({ session: session._id }).sort({ createdAt: 1 });
    if (!transcripts || transcripts.length === 0) {
      return res.status(400).json({ message: 'No transcripts found to review' });
    }
    
    // Check if session already has a valid review cached
    let review = session.review;
    const isBadCachedReview = !review || review.error || !review.sessionSummary;
    if (isBadCachedReview) {
      await room.populate('moderator');
      const moderatorKey = room.moderator?.geminiApiKey;
      review = await aiService.generateSessionReview(transcripts, moderatorKey);
      if (review.error) return res.status(500).json({ message: review.error });
      
      // Permanently store the review in the session
      session.review = review;
      await session.save();
    }
    
    res.json({ review, session });
  } catch (err) {
    console.error('getRoomReview error:', err);
    res.status(500).json({ message: 'Server error generating review' });
  }
};
