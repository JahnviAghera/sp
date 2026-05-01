const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

// In production, add isAdmin middleware
router.get('/users', authController.requireAuth, adminController.getAllUsers);
router.post('/users/:id/ban', authController.requireAuth, adminController.banUser);
router.get('/rooms', authController.requireAuth, adminController.getActiveRooms);

module.exports = router;
