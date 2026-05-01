const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authController = require('../controllers/authController');

router.post('/create', authController.requireAuth, scheduleController.createSchedule);
router.get('/upcoming', authController.requireAuth, scheduleController.getUpcomingSchedules);
router.get('/notifications', authController.requireAuth, scheduleController.getNotifications);
router.put('/notifications/read', authController.requireAuth, scheduleController.markAsRead);

module.exports = router;
