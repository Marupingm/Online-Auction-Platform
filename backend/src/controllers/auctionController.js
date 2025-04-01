const Auction = require('../models/auctionModel');
const Bid = require('../models/bidModel');

/**
 * @desc    Get all auctions
 * @route   GET /api/auctions
 * @access  Public
 */
const getAuctions = async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  
  // Build query based on filters
  const query = {};
  
  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Filter by search term
  if (req.query.keyword) {
    query.title = {
      $regex: req.query.keyword,
      $options: 'i'
    };
  }

  const count = await Auction.countDocuments(query);
  const auctions = await Auction.find(query)
    .populate('seller', 'id name')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    auctions,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
};

/**
 * @desc    Get auction by ID
 * @route   GET /api/auctions/:id
 * @access  Public
 */
const getAuctionById = async (req, res) => {
  const auction = await Auction.findById(req.params.id)
    .populate('seller', 'name email')
    .populate('winner', 'name email');

  if (auction) {
    // Get the most recent bids
    const bids = await Bid.find({ auction: auction._id })
      .populate('bidder', 'name')
      .sort({ amount: -1 })
      .limit(10);

    res.json({ auction, bids });
  } else {
    res.status(404);
    throw new Error('Auction not found');
  }
};

/**
 * @desc    Create a new auction
 * @route   POST /api/auctions
 * @access  Private
 */
const createAuction = async (req, res) => {
  const { 
    title, 
    description, 
    startingPrice, 
    imageUrl, 
    category, 
    endDate 
  } = req.body;

  const auction = new Auction({
    title,
    description,
    startingPrice,
    currentPrice: startingPrice,
    imageUrl: imageUrl || '/uploads/default.jpg',
    category,
    endDate,
    seller: req.user._id
  });

  const createdAuction = await auction.save();
  res.status(201).json(createdAuction);
};

/**
 * @desc    Update an auction
 * @route   PUT /api/auctions/:id
 * @access  Private
 */
const updateAuction = async (req, res) => {
  const {
    title,
    description,
    startingPrice,
    imageUrl,
    category,
    endDate
  } = req.body;

  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  // Check if user is the seller
  if (auction.seller.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this auction');
  }

  // Only allow updates if the auction hasn't started
  if (auction.status !== 'pending') {
    res.status(400);
    throw new Error('Cannot update an active or closed auction');
  }

  auction.title = title || auction.title;
  auction.description = description || auction.description;
  auction.startingPrice = startingPrice || auction.startingPrice;
  auction.currentPrice = startingPrice || auction.currentPrice;
  auction.imageUrl = imageUrl || auction.imageUrl;
  auction.category = category || auction.category;
  auction.endDate = endDate || auction.endDate;

  const updatedAuction = await auction.save();
  res.json(updatedAuction);
};

/**
 * @desc    Delete an auction
 * @route   DELETE /api/auctions/:id
 * @access  Private
 */
const deleteAuction = async (req, res) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  // Check if user is the seller or admin
  if (auction.seller.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to delete this auction');
  }

  // Only allow deletion if the auction hasn't started
  if (auction.status !== 'pending') {
    res.status(400);
    throw new Error('Cannot delete an active or closed auction');
  }

  await Auction.deleteOne({ _id: auction._id });
  res.json({ message: 'Auction removed' });
};

/**
 * @desc    Get auctions created by the logged in user
 * @route   GET /api/auctions/myauctions
 * @access  Private
 */
const getMyAuctions = async (req, res) => {
  const auctions = await Auction.find({ seller: req.user._id });
  res.json(auctions);
};

/**
 * @desc    End an auction manually
 * @route   PUT /api/auctions/:id/end
 * @access  Private
 */
const endAuction = async (req, res) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  // Check if user is the seller or admin
  if (auction.seller.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to end this auction');
  }

  // Only allow ending if the auction is active
  if (auction.status !== 'active') {
    res.status(400);
    throw new Error('Cannot end an auction that is not active');
  }

  // Find the highest bid
  const highestBid = await Bid.findOne({ auction: auction._id })
    .sort({ amount: -1 })
    .populate('bidder');

  if (highestBid) {
    // Set the winner
    auction.winner = highestBid.bidder;
    // Update bid status
    await Bid.findByIdAndUpdate(highestBid._id, { status: 'winning' });
  }

  auction.status = 'closed';
  const endedAuction = await auction.save();

  res.json(endedAuction);
};

module.exports = {
  getAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  deleteAuction,
  getMyAuctions,
  endAuction
}; 