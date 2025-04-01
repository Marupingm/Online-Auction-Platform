import { io } from 'socket.io-client';

// Create socket instance
const URL = process.env.NODE_ENV === 'production' 
  ? undefined  // Use relative URL in production
  : 'http://localhost:5000';

const socket = io(URL, {
  autoConnect: false,  // Prevent auto-connection, we'll connect when needed
});

// Debug events in development
if (process.env.NODE_ENV !== 'production') {
  socket.onAny((event, ...args) => {
    console.log('Socket event:', event, args);
  });
}

export const initiateSocket = () => {
  socket.connect();
  console.log('Connecting to socket');
  
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const joinAuction = (auctionId) => {
  if (socket && auctionId) {
    socket.emit('joinAuction', auctionId);
  }
};

export const leaveAuction = (auctionId) => {
  if (socket && auctionId) {
    socket.emit('leaveAuction', auctionId);
  }
};

export const subscribeToBidUpdates = (callback) => {
  if (socket) {
    socket.on('bidUpdate', (data) => {
      callback(data);
    });
  }
};

export const unsubscribeFromBidUpdates = () => {
  if (socket) {
    socket.off('bidUpdate');
  }
};

export const placeBid = (auctionId, amount) => {
  if (socket) {
    socket.emit('newBid', { auctionId, amount });
  }
};

export default socket; 