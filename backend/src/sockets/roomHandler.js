const logger = require('../config/logger');

module.exports = (io, socket) => {
  const joinRoom = ({ roomId, user }) => {
    socket.join(roomId);
    logger.info(`User ${user.name} joined room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user_joined', { user });

    // Handle chat messages
    socket.on('send_message', (data) => {
      io.to(roomId).emit('receive_message', {
        ...data,
        timestamp: new Date(),
      });
    });

    // Handle speaking turns (Raise Hand)
    socket.on('raise_hand', () => {
      io.to(roomId).emit('user_raised_hand', { userId: user._id, name: user.name });
    });

    // Handle WebRTC signaling
    socket.on('webrtc_signal', (data) => {
      // Send signal to the specific target user
      socket.to(data.target).emit('webrtc_signal', {
        signal: data.signal,
        from: socket.id,
      });
    });

    socket.on('disconnecting', () => {
      socket.to(roomId).emit('user_left', { userId: user._id });
      logger.info(`User ${user.name} leaving room ${roomId}`);
    });
  };

  socket.on('join_room_request', joinRoom);
};
