const aiService = require('../services/aiService');
const Room = require('../models/Room');
const Session = require('../models/Session');

module.exports = (io, socket) => {
  const joinRoom = async ({ roomCode, user }) => {
    socket.join(roomCode);
    socket.user_data = user; // Store for directory
    
    if (!io.rooms_data) io.rooms_data = {};
    if (!io.rooms_data[roomCode]) {
      const room = await Room.findOne({ code: roomCode }).populate('moderator');
      const moderatorKey = room?.moderator?.geminiApiKey;
      const { topic } = await aiService.generateTopic({ seed: room?.topic || 'Professional Skills', userApiKey: moderatorKey });
      
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
        sessionId,
        muteStates: {} // Track mute status per socketId
      };
    }
    
    const roomState = io.rooms_data[roomCode];

    // Record this user as a session participant (even if they never speak)
    if (roomState.sessionId && user && user.id) {
      try {
        await Session.updateOne(
          { _id: roomState.sessionId },
          { $addToSet: { participants: { userId: user.id, name: user.name } } }
        );
      } catch (err) {
        console.error('Failed to record session participant:', err);
      }
    }
    
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
      activeSpeaker: roomState.activeSpeaker,
      muteStates: roomState.muteStates
    });
  };

  const leaveRoom = ({ roomCode, user }) => {
    socket.leave(roomCode);
    
    // Cleanup mute state for this socket
    const roomState = io.rooms_data?.[roomCode];
    if (roomState && roomState.muteStates) {
      delete roomState.muteStates[socket.id];
    }

    io.to(roomCode).emit('user_left', { user, socketId: socket.id });
  };

  const muteUser = ({ roomCode, targetSocketId }) => {
    io.to(targetSocketId).emit('force_mute');
    
    // Update server state
    const roomState = io.rooms_data[roomCode];
    if (roomState) {
      roomState.muteStates[targetSocketId] = true;
    }

    // Broadcast mute state to everyone so all cards update
    io.to(roomCode).emit('mute_state_changed', { socketId: targetSocketId, isMuted: true });
    io.to(roomCode).emit('moderator_action', { action: 'mute', target: targetSocketId });
  };

  const kickUser = ({ roomCode, targetSocketId }) => {
    io.to(targetSocketId).emit('force_kick');
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) targetSocket.leave(roomCode);
    io.to(roomCode).emit('user_left', { socketId: targetSocketId, kicked: true });
  };

  const onOffer = ({ roomCode, offer, toSocketId }) => {
    io.to(toSocketId).emit('webrtc_offer', { from: socket.id, offer });
  };

  const onAnswer = ({ roomCode, answer, toSocketId }) => {
    io.to(toSocketId).emit('webrtc_answer', { from: socket.id, answer });
  };

  const onIce = ({ roomCode, candidate, toSocketId }) => {
    io.to(toSocketId).emit('webrtc_ice', { from: socket.id, candidate });
  };

  const onSpeakingTurn = async ({ roomCode, transcript, userId }) => {
    const roomState = io.rooms_data[roomCode];
    if (!roomState) return;

    const user = socket.user_data || { name: 'Anonymous' };

    // 1. Broadcast captions to others
    socket.to(roomCode).emit('speaking_turn', { 
      userId, 
      userName: user.name, 
      transcript 
    });

    // 2. Perform AI Analysis (Real-time Insights)
    let userApiKey = null;
    if (user && user.id) {
      const User = require('../models/User');
      const dbUser = await User.findById(user.id);
      userApiKey = dbUser?.geminiApiKey;
    }

    const feedback = await aiService.analyzeSpeech({ 
      transcript, 
      userName: user.name,
      userApiKey
    });
    
    // 3. Send feedback back to the speaker only
    socket.emit('ai_feedback', { userId, feedback });

    // 4. Persistence for final report
    const Transcript = require('../models/Transcript');
    try {
      await Transcript.create({
        session: roomState.sessionId,
        userId: user.id || userId,
        userName: user.name,
        text: transcript
      });
    } catch (err) {
      console.error('Failed to save transcript:', err);
    }
  };

  // Handle abrupt disconnects (tab close)
  socket.on('disconnecting', () => {
    for (const roomCode of socket.rooms) {
      if (roomCode !== socket.id) {
        const roomState = io.rooms_data?.[roomCode];
        if (roomState) {
          // Remove from queue
          roomState.queue = roomState.queue.filter(q => q.socketId !== socket.id);
          // Remove from mute states
          if (roomState.muteStates) delete roomState.muteStates[socket.id];
          // Clear active speaker if it was them
          if (roomState.activeSpeaker?.socketId === socket.id) {
            roomState.activeSpeaker = null;
          }
          
          io.to(roomCode).emit('user_left', { socketId: socket.id });
          io.to(roomCode).emit('queue_updated', roomState.queue);
          io.to(roomCode).emit('speaking_turn_start', null);
        }
      }
    }
  });

  // User self-toggled their own mute — broadcast state to room
  const onToggleMute = ({ roomCode, isMuted }) => {
    const roomState = io.rooms_data[roomCode];
    if (roomState) {
      roomState.muteStates[socket.id] = isMuted;
    }
    io.to(roomCode).emit('mute_state_changed', { socketId: socket.id, isMuted });
  };

  socket.on('join_room', joinRoom);
  socket.on('leave_room', leaveRoom);
  socket.on('mute_user', muteUser);
  socket.on('kick_user', kickUser);
  socket.on('toggle_mute', onToggleMute);
  socket.on('webrtc_offer', onOffer);
  socket.on('webrtc_answer', onAnswer);
  socket.on('webrtc_ice', onIce);
  socket.on('speaking_turn', onSpeakingTurn);
};
