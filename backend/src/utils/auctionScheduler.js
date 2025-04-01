const Auction = require('../models/auctionModel');
const Bid = require('../models/bidModel');

/**
 * Update auction statuses based on current time
 * - Set pending auctions to active if start date has passed
 * - Close auctions that have reached their end date
 */
const updateAuctionStatuses = async () => {
  const now = new Date();
  
  try {
    // Find pending auctions that should be active
    const pendingToActive = await Auction.find({
      status: 'pending',
      startDate: { $lte: now }
    });
    
    for (const auction of pendingToActive) {
      auction.status = 'active';
      await auction.save();
      console.log(`Auction ${auction._id} activated automatically`);
    }
    
    // Find active auctions that should be closed
    const activeToClose = await Auction.find({
      status: 'active',
      endDate: { $lte: now }
    });
    
    for (const auction of activeToClose) {
      // Find highest bid to determine winner
      const highestBid = await Bid.findOne({ auction: auction._id })
        .sort({ amount: -1 });
      
      if (highestBid) {
        auction.winner = highestBid.bidder;
        // Update bid status to winning
        await Bid.findByIdAndUpdate(highestBid._id, { status: 'winning' });
        // Update all other bids to expired
        await Bid.updateMany(
          { 
            auction: auction._id, 
            _id: { $ne: highestBid._id } 
          },
          { status: 'expired' }
        );
      }
      
      auction.status = 'closed';
      await auction.save();
      console.log(`Auction ${auction._id} closed automatically`);
    }
  } catch (error) {
    console.error('Error updating auction statuses:', error);
  }
};

/**
 * Initialize the auction scheduler to run at regular intervals
 * @param {number} interval - Interval in milliseconds (default: 1 minute)
 */
const initAuctionScheduler = (interval = 60000) => {
  // Run immediately once
  updateAuctionStatuses();
  
  // Then set interval
  return setInterval(updateAuctionStatuses, interval);
};

module.exports = { updateAuctionStatuses, initAuctionScheduler }; 