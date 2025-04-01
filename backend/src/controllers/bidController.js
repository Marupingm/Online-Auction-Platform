const Bid = require('../models/bidModel');
const Auction = require('../models/auctionModel');

/**
 * @desc    Create a new bid
 * @route   POST /api/bids
 * @access  Private
 */
const createBid = async (req, res) => {
  const { auctionId, amount } = req.body;

  // Validate bid amount
  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Bid amount must be greater than 0');
  }

  // Find the auction
  const auction = await Auction.findById(auctionId);

  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  // Check if auction is active
  if (auction.status !== 'active') {
    res.status(400);
    throw new Error('Cannot bid on an auction that is not active');
  }

  // Check if auction has ended
  if (new Date() > new Date(auction.endDate)) {
    res.status(400);
    throw new Error('Auction has ended');
  }

  // Check if bid amount is higher than current price
  if (amount <= auction.currentPrice) {
    res.status(400);
    throw new Error(`Bid amount must be higher than current price (${auction.currentPrice})`);
  }

  // Check if user is not the seller
  if (auction.seller.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot bid on your own auction');
  }

  try {
    // Create the bid
    const bid = new Bid({
      auction: auctionId,
      bidder: req.user._id,
      amount
    });

    // Update all other bids from this user on this auction to 'outbid'
    await Bid.updateMany(
      {
        auction: auctionId,
        bidder: req.user._id,
        status: 'active'
      },
      { status: 'outbid' }
    );

    const createdBid = await bid.save();

    // Update auction current price
    auction.currentPrice = amount;
    await auction.save();

    // Populate bidder info
    await createdBid.populate('bidder', 'name');

    res.status(201).json(createdBid);
  } catch (error) {
    // Handle duplicate bid error (same amount by same user on same auction)
    if (error.code === 11000) {
      res.status(400);
      throw new Error('You already placed a bid with this amount');
    }
    throw error;
  }
};

/**
 * @desc    Get all bids for an auction
 * @route   GET /api/bids/auction/:id
 * @access  Public
 */
const getAuctionBids = async (req, res) => {
  const auctionId = req.params.id;

  // Check if auction exists
  const auctionExists = await Auction.exists({ _id: auctionId });
  
  if (!auctionExists) {
    res.status(404);
    throw new Error('Auction not found');
  }

  const bids = await Bid.find({ auction: auctionId })
    .populate('bidder', 'name')
    .sort({ amount: -1 });

  res.json(bids);
};

/**
 * @desc    Get bids placed by the logged in user
 * @route   GET /api/bids/mybids
 * @access  Private
 */
const getMyBids = async (req, res) => {
  const bids = await Bid.find({ bidder: req.user._id })
    .populate({
      path: 'auction',
      select: 'title currentPrice endDate status'
    })
    .sort({ createdAt: -1 });

  res.json(bids);
};

/**
 * @desc    Get winning bids for the logged in user
 * @route   GET /api/bids/mywins
 * @access  Private
 */
const getMyWinningBids = async (req, res) => {
  // Find auctions where the user is the winner
  const wonAuctions = await Auction.find({ 
    winner: req.user._id,
    status: 'closed'
  }).select('_id');

  const wonAuctionIds = wonAuctions.map(auction => auction._id);

  // Find the winning bids
  const winningBids = await Bid.find({
    auction: { $in: wonAuctionIds },
    bidder: req.user._id,
    status: 'winning'
  }).populate({
    path: 'auction',
    select: 'title description imageUrl endDate currentPrice',
    populate: {
      path: 'seller',
      select: 'name email'
    }
  });

  res.json(winningBids);
};

module.exports = {
  createBid,
  getAuctionBids,
  getMyBids,
  getMyWinningBids
}; 