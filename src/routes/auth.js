const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authController.requireAuth, authController.getProfile);
router.put('/profile', authController.requireAuth, authController.updateProfile);
router.put('/password', authController.requireAuth, authController.updatePassword);
router.post('/test-key', authController.requireAuth, authController.testApiKey);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' }), authController.googleCallback);

module.exports = router;
