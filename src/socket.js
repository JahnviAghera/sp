const { Server } = require('socket.io');
const roomHandler = require('./sockets/roomHandler');
const discussionHandler = require('./sockets/discussionHandler');
const webrtcHandler = require('./sockets/webrtcHandler');

let io;

function initSocket(server) {
  io = new Server(server, { 
    cors: { origin: '*' },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Initialize modular handlers
    roomHandler(io, socket);
    discussionHandler(io, socket);
    webrtcHandler(io, socket);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

module.exports = { initSocket };

module.exports = { initSocket };
