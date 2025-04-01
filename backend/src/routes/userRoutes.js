const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  authUser, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/', registerUser);
router.post('/login', authUser);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router; 