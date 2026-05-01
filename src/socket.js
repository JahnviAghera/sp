const { Server } = require('socket.io');
const aiService = require('./services/aiService');

let io;

function initSocket(server) {
  io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('join_room', ({ roomCode, user }) => {
      socket.join(roomCode);
      // Initialize room queue if not exists
      if (!io.rooms_data) io.rooms_data = {};
      if (!io.rooms_data[roomCode]) io.rooms_data[roomCode] = { queue: [] };
      
      io.to(roomCode).emit('user_joined', { user, socketId: socket.id, queue: io.rooms_data[roomCode].queue });
    });

    socket.on('leave_room', ({ roomCode, user }) => {
      socket.leave(roomCode);
      io.to(roomCode).emit('user_left', { user, socketId: socket.id });
    });

    socket.on('chat_message', ({ roomCode, message }) => {
      io.to(roomCode).emit('chat_message', message);
    });

    socket.on('raise_hand', ({ roomCode, userId, userName }) => {
      const roomData = io.rooms_data[roomCode];
      if (!roomData.queue.some(u => u.userId === userId)) {
        roomData.queue.push({ userId, userName, socketId: socket.id });
        io.to(roomCode).emit('queue_updated', roomData.queue);
      }
    });

    socket.on('next_speaker', ({ roomCode }) => {
      const roomData = io.rooms_data[roomCode];
      if (roomData.queue.length > 0) {
        const next = roomData.queue.shift();
        io.to(roomCode).emit('speaking_turn_start', next);
        io.to(roomCode).emit('queue_updated', roomData.queue);
      }
    });

    socket.on('speaking_turn', async ({ roomCode, transcript, userId }) => {
      // send transcript to AI for analysis (non-blocking)
      aiService.analyzeSpeech({ transcript, userId }).then((feedback) => {
        io.to(roomCode).emit('ai_feedback', { userId, feedback });
      }).catch((e) => console.error('AI analyze error', e));
      io.to(roomCode).emit('speaking_turn', { userId, transcript });
    });

    // WebRTC signaling relay events
    socket.on('webrtc_offer', ({ roomCode, offer, toSocketId }) => {
      if (toSocketId) {
        io.to(toSocketId).emit('webrtc_offer', { from: socket.id, offer });
      } else {
        socket.to(roomCode).emit('webrtc_offer', { from: socket.id, offer });
      }
    });

    socket.on('webrtc_answer', ({ roomCode, answer, toSocketId }) => {
      if (toSocketId) {
        io.to(toSocketId).emit('webrtc_answer', { from: socket.id, answer });
      } else {
        socket.to(roomCode).emit('webrtc_answer', { from: socket.id, answer });
      }
    });

    socket.on('webrtc_ice', ({ roomCode, candidate, toSocketId }) => {
      if (toSocketId) {
        io.to(toSocketId).emit('webrtc_ice', { from: socket.id, candidate });
      } else {
        socket.to(roomCode).emit('webrtc_ice', { from: socket.id, candidate });
      }
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected', socket.id);
    });
  });
}

module.exports = { initSocket };
