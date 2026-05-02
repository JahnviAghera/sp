const aiService = require('../services/aiService');
const Transcript = require('../models/Transcript');

module.exports = (io, socket) => {
  const raiseHand = ({ roomCode, userId, userName }) => {
    const roomData = io.rooms_data?.[roomCode];
    if (roomData && !roomData.queue.some(u => u.userId === userId)) {
      roomData.queue.push({ userId, userName, socketId: socket.id });
      io.to(roomCode).emit('queue_updated', roomData.queue);
    }
  };

  const nextSpeaker = ({ roomCode }) => {
    const roomData = io.rooms_data?.[roomCode];
    if (roomData && roomData.queue.length > 0) {
      const next = roomData.queue.shift();
      roomData.activeSpeaker = next;
      io.to(roomCode).emit('speaking_turn_start', next);
      io.to(roomCode).emit('queue_updated', roomData.queue);
    }
  };

  const speakingTurn = async ({ roomCode, transcript, userId }) => {
    const roomData = io.rooms_data?.[roomCode];
    const userName = socket.user_data?.name || 'Anonymous';
    
    // Broadcast for immediate UI captions
    io.to(roomCode).emit('speaking_turn', { userId, userName, transcript });

    // AI Analysis and persistence
    aiService.analyzeSpeech({ transcript, userId }).then(async (feedback) => {
      io.to(roomCode).emit('ai_feedback', { userId, feedback });
      
      try {
        await Transcript.create({
          session: roomData?.sessionId,
          roomCode,
          user: userId?.startsWith('anon-') ? null : userId,
          userName: userName,
          text: transcript,
          feedback: feedback
        });
      } catch (err) {
        console.error('Failed to save transcript:', err);
      }
    }).catch((e) => console.error('AI analyze error', e));
  };

  const chatMessage = ({ roomCode, message }) => {
    io.to(roomCode).emit('chat_message', message);
  };

  socket.on('raise_hand', raiseHand);
  socket.on('next_speaker', nextSpeaker);
  socket.on('speaking_turn', speakingTurn);
  socket.on('chat_message', chatMessage);
};
