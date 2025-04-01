const mongoose = require('mongoose');

const bidSchema = mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please add a bid amount'],
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'winning', 'outbid', 'rejected', 'expired'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Index to improve query performance and ensure uniqueness
bidSchema.index({ auction: 1, bidder: 1, amount: 1 }, { unique: true });

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid; 