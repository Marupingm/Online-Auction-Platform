const express = require('express');
const router = express.Router();
const { 
  createBid,
  getAuctionBids,
  getMyBids,
  getMyWinningBids
} = require('../controllers/bidController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.get('/auction/:id', getAuctionBids);

// Protected routes
router.post('/', protect, createBid);
router.get('/mybids', protect, getMyBids);
router.get('/mywins', protect, getMyWinningBids);

module.exports = router; 