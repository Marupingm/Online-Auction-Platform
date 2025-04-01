const mongoose = require('mongoose');

const auctionSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    startingPrice: {
      type: Number,
      required: [true, 'Please add a starting price'],
      min: 0
    },
    currentPrice: {
      type: Number,
      default: function() {
        return this.startingPrice;
      }
    },
    imageUrl: {
      type: String,
      default: '/uploads/default.jpg'
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['Electronics', 'Fashion', 'Home', 'Vehicles', 'Art', 'Collectibles', 'Other']
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date']
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'closed'],
      default: 'pending'
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for tracking if auction is active
auctionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate && this.status === 'active';
});

// Middleware to update status when auction ends
auctionSchema.pre('save', async function(next) {
  if (this.isModified('endDate') || this.isModified('startDate')) {
    const now = new Date();
    if (now > this.endDate) {
      this.status = 'closed';
    } else if (now >= this.startDate) {
      this.status = 'active';
    } else {
      this.status = 'pending';
    }
  }
  next();
});

// Method to end auction
auctionSchema.methods.endAuction = async function() {
  this.status = 'closed';
  return this.save();
};

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction; 