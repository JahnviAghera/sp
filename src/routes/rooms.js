const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/roomsController');
const authController = require('../controllers/authController');

router.post('/create', authController.requireAuth, roomsController.createRoom);
router.post('/join', authController.requireAuth, roomsController.joinRoom);
router.get('/', authController.requireAuth, roomsController.listRooms);

module.exports = router;
