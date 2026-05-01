const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authController = require('../controllers/authController');

router.get('/user', authController.requireAuth, analyticsController.getUserAnalytics);
router.get('/leaderboard', authController.requireAuth, analyticsController.getLeaderboard);

module.exports = router;
