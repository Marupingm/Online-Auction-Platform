const express = require('express');
const router = express.Router();
const { 
  getAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  deleteAuction,
  getMyAuctions,
  endAuction
} = require('../controllers/auctionController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getAuctions);
router.get('/:id', getAuctionById);

// Protected routes
router.post('/', protect, createAuction);
router.route('/:id')
  .put(protect, updateAuction)
  .delete(protect, deleteAuction);

router.get('/user/myauctions', protect, getMyAuctions);
router.put('/:id/end', protect, endAuction);

module.exports = router; 