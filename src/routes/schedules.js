const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authController = require('../controllers/authController');

router.post('/', authController.requireAuth, scheduleController.createSchedule);
router.get('/upcoming', authController.requireAuth, scheduleController.getUpcomingSchedules);
router.post('/join', authController.requireAuth, scheduleController.joinSchedule);

module.exports = router;
