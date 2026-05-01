const express = require('express');
const { createRoom, getRooms, getRoom, joinRoom } = require('../controllers/room.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

router.route('/')
  .get(getRooms)
  .post(protect, createRoom);

router.route('/:id')
  .get(getRoom);

router.post('/:id/join', protect, joinRoom);

module.exports = router;
