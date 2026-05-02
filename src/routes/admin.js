const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

// All routes require admin privilege
router.use(authController.requireAuth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
});

router.get('/users', adminController.getAllUsers);
router.post('/user-role', adminController.updateUserRole);
router.get('/stats', adminController.getStats);

module.exports = router;
