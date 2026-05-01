const { Server } = require('socket.io');
const logger = require('../config/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Register handlers
    require('./roomHandler')(io, socket);

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });

    // Placeholder for other events
    // socket.on('join_room', (data) => require('./roomHandler')(io, socket, data));
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
