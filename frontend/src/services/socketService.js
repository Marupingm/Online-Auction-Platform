import { io } from 'socket.io-client';

const URL = 'http://localhost:5000';
let socket;

export const initiateSocket = () => {
  socket = io(URL);
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

export default {
  initiateSocket,
  disconnectSocket,
  joinAuction,
  leaveAuction,
  subscribeToBidUpdates,
  unsubscribeFromBidUpdates,
  placeBid,
}; 