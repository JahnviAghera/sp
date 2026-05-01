const roomService = require('../services/room.service');

const createRoom = async (req, res, next) => {
  try {
    const room = await roomService.createRoom(req.body, req.user.id);
    res.status(201).json({
      status: 'success',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

const getRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getRooms();
    res.status(200).json({
      status: 'success',
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

const getRoom = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

const joinRoom = async (req, res, next) => {
  try {
    const room = await roomService.joinRoom(req.params.id, req.user.id);
    res.status(200).json({
      status: 'success',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoom,
  joinRoom,
};
