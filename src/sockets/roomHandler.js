const aiService = require('../services/aiService');
const Room = require('../models/Room');
const Session = require('../models/Session');

module.exports = (io, socket) => {
  const joinRoom = async ({ roomCode, user }) => {
    socket.join(roomCode);
    socket.user_data = user; // Store for directory
    
    if (!io.rooms_data) io.rooms_data = {};
    if (!io.rooms_data[roomCode]) {
      const room = await Room.findOne({ code: roomCode });
      const { topic } = await aiService.generateTopic({ seed: room?.topic || 'Professional Skills' });
      
      let sessionId = null;
      if (room) {
        try {
          const session = await Session.create({
            room: room._id,
            startedAt: Date.now()
          });
          sessionId = session._id;
        } catch (err) {
          console.error('Failed to create session:', err);
        }
      }

      io.rooms_data[roomCode] = { 
        queue: [], 
        topic, 
        startTime: Date.now(),
        duration: 20 * 60 * 1000, 
        activeSpeaker: null,
        moderatorId: room?.moderator?.toString() || user.id,
        sessionId 
      };
    }
    
    const roomState = io.rooms_data[roomCode];
    
    // Get directory of current users in room
    const directory = {};
    const roomInstance = io.sockets.adapter.rooms.get(roomCode);
    if (roomInstance) {
      for (const sid of roomInstance) {
        const s = io.sockets.sockets.get(sid);
        if (s && s.user_data) directory[sid] = s.user_data;
      }
    }

    io.to(roomCode).emit('user_joined', { 
      user, 
      socketId: socket.id, 
      directory,
      moderatorId: roomState.moderatorId,
      queue: roomState.queue,
      topic: roomState.topic,
      startTime: roomState.startTime,
      duration: roomState.duration,
      activeSpeaker: roomState.activeSpeaker
    });
  };

  const leaveRoom = ({ roomCode, user }) => {
    socket.leave(roomCode);
    io.to(roomCode).emit('user_left', { user, socketId: socket.id });
  };

  const muteUser = ({ roomCode, targetSocketId }) => {
    io.to(targetSocketId).emit('force_mute');
    io.to(roomCode).emit('moderator_action', { action: 'mute', target: targetSocketId });
  };

  const kickUser = ({ roomCode, targetSocketId }) => {
    io.to(targetSocketId).emit('force_kick');
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) targetSocket.leave(roomCode);
    io.to(roomCode).emit('user_left', { socketId: targetSocketId, kicked: true });
  };

  socket.on('join_room', joinRoom);
  socket.on('leave_room', leaveRoom);
  socket.on('mute_user', muteUser);
  socket.on('kick_user', kickUser);
};
