const Room = require('../models/Room');

const createRoom = async (roomData, userId) => {
  const room = await Room.create({
    ...roomData,
    moderator: userId,
    participants: [userId],
  });
  return room;
};

const getRooms = async () => {
  return await Room.find({ isPrivate: false }).populate('moderator', 'name avatar');
};

const getRoomById = async (roomId) => {
  return await Room.findById(roomId).populate('moderator', 'name avatar').populate('participants', 'name avatar');
};

const joinRoom = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  
  if (!room) {
    const error = new Error('Room not found');
    error.statusCode = 404;
    throw error;
  }

  if (room.participants.length >= room.maxParticipants) {
    const error = new Error('Room is full');
    error.statusCode = 400;
    throw error;
  }

  if (!room.participants.includes(userId)) {
    room.participants.push(userId);
    await room.save();
  }

  return room;
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
};
