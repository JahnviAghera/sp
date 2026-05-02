module.exports = (io, socket) => {
  const handleOffer = ({ roomCode, offer, toSocketId }) => {
    if (toSocketId) io.to(toSocketId).emit('webrtc_offer', { from: socket.id, offer });
    else socket.to(roomCode).emit('webrtc_offer', { from: socket.id, offer });
  };

  const handleAnswer = ({ roomCode, answer, toSocketId }) => {
    if (toSocketId) io.to(toSocketId).emit('webrtc_answer', { from: socket.id, answer });
    else socket.to(roomCode).emit('webrtc_answer', { from: socket.id, answer });
  };

  const handleIce = ({ roomCode, candidate, toSocketId }) => {
    if (toSocketId) io.to(toSocketId).emit('webrtc_ice', { from: socket.id, candidate });
    else socket.to(roomCode).emit('webrtc_ice', { from: socket.id, candidate });
  };

  socket.on('webrtc_offer', handleOffer);
  socket.on('webrtc_answer', handleAnswer);
  socket.on('webrtc_ice', handleIce);
};
