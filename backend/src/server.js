const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const { initAuctionScheduler } = require('./utils/auctionScheduler');

// Import routes
const userRoutes = require('./routes/userRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes');

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create HTTP server and Socket.io instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  // Handle auction updates
  socket.on('joinAuction', (auctionId) => {
    socket.join(auctionId);
    console.log(`User joined auction: ${auctionId}`);
  });
  
  // Handle new bids
  socket.on('newBid', (data) => {
    io.to(data.auctionId).emit('bidUpdate', data);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Define routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Use route files
app.use('/api/users', userRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Define port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  
  // Initialize auction scheduler to run every minute
  initAuctionScheduler();
  console.log('Auction scheduler initialized');
}); 