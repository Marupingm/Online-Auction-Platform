import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUser, FaClock, FaGavel, FaInfoCircle, FaHistory } from 'react-icons/fa';
import { useGetAuctionDetailsQuery } from '../slices/auctionsApiSlice';
import { useCreateBidMutation, useGetAuctionBidsQuery } from '../slices/bidsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { joinAuction, leaveAuction, subscribeToBidUpdates, unsubscribeFromBidUpdates } from '../services/socketService';

const AuctionDetailScreen = () => {
  const { id: auctionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [countdown, setCountdown] = useState('');
  const [currentBid, setCurrentBid] = useState(0);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [liveBids, setLiveBids] = useState([]);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data, isLoading, error, refetch } = useGetAuctionDetailsQuery(auctionId);
  const { 
    data: bidsData, 
    isLoading: bidsLoading, 
    refetch: refetchBids 
  } = useGetAuctionBidsQuery(auctionId);
  
  const [createBid, { isLoading: isCreatingBid }] = useCreateBidMutation();
  
  useEffect(() => {
    if (data?.auction) {
      setCurrentBid(data.auction.currentPrice);
      const intervalId = startCountdown(data.auction.endDate);
      
      // Join auction room via WebSocket
      joinAuction(auctionId);
      
      // Subscribe to bid updates
      subscribeToBidUpdates((data) => {
        if (data.auctionId === auctionId) {
          setCurrentBid(data.amount);
          setLiveBids((prev) => [data, ...prev].slice(0, 10));
          toast.info(`New bid: $${data.amount} by ${data.bidder?.name || 'Anonymous'}`);
          refetch();
          refetchBids();
        }
      });
      
      // Cleanup on unmount
      return () => {
        clearInterval(intervalId);
        leaveAuction(auctionId);
        unsubscribeFromBidUpdates();
      };
    }
  }, [auctionId, data]);
  
  // Initialize liveBids when bidsData is loaded
  useEffect(() => {
    if (bidsData) {
      setLiveBids(bidsData.slice(0, 10));
    }
  }, [bidsData]);
  
  // Countdown timer function
  const startCountdown = (endDate) => {
    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(endDate);
      const timeRemaining = end - now;
      
      if (timeRemaining <= 0) {
        setCountdown('Auction ended');
        clearInterval(intervalId);
        refetch(); // Refresh auction data to get final status
        return;
      }
      
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      
      setCountdown(
        `${days > 0 ? days + 'd ' : ''}${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };
    
    // Run immediately and then every second
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return intervalId;
  };
  
  // Submit bid handler
  const onSubmitBid = async (formData) => {
    if (!userInfo) {
      navigate('/login?redirect=/auction/' + auctionId);
      return;
    }
    
    if (formData.bidAmount <= currentBid) {
      toast.error(`Bid must be higher than current bid ($${currentBid})`);
      return;
    }
    
    try {
      await createBid({
        auctionId,
        amount: Number(formData.bidAmount),
      }).unwrap();
      
      toast.success('Bid placed successfully!');
      setBidSuccess(true);
      setTimeout(() => setBidSuccess(false), 3000);
      reset();
      setValue('bidAmount', '');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to place bid');
    }
  };
  
  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'closed':
        return <span className="badge badge-danger">Closed</span>;
      default:
        return null;
    }
  };
  
  if (isLoading) return <Loader />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Message variant="error">
          {error?.data?.message || error.error || 'Failed to load auction details'}
        </Message>
        <Link to="/auctions" className="btn btn-primary mt-4">
          Go Back
        </Link>
      </div>
    );
  }
  
  const { auction, bids } = data;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/auctions" className="flex items-center text-primary hover:underline mb-6">
        <FaArrowLeft className="mr-2" /> Back to Auctions
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="p-6">
            <img
              src={auction.imageUrl}
              alt={auction.title}
              className="w-full h-auto rounded-lg"
            />
          </div>
          
          {/* Right Column - Info and Bidding */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{auction.title}</h1>
              {getStatusBadge(auction.status)}
            </div>
            
            <div className="flex items-center text-gray-600 mb-4">
              <FaUser className="mr-2" />
              <span>Seller: {auction.seller?.name || 'Unknown'}</span>
            </div>
            
            <div className="mb-6">
              <div className="text-gray-600 mb-2">Current Bid:</div>
              <div className="text-3xl font-bold text-primary">${currentBid.toFixed(2)}</div>
            </div>
            
            {auction.status === 'active' && (
              <div className="mb-6">
                <div className="flex items-center text-gray-600 mb-2">
                  <FaClock className="mr-2" />
                  <span>Time Remaining:</span>
                </div>
                <div className="bg-dark text-white p-3 rounded-lg text-xl text-center font-mono">
                  {countdown}
                </div>
              </div>
            )}
            
            {/* Bidding Form - only show if auction is active */}
            {auction.status === 'active' ? (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaGavel className="mr-2" /> Place Your Bid
                </h2>
                
                {bidSuccess && (
                  <Message variant="success">
                    Bid placed successfully! You are the highest bidder.
                  </Message>
                )}
                
                {userInfo ? (
                  auction.seller?._id === userInfo._id ? (
                    <Message variant="info">
                      You cannot bid on your own auction.
                    </Message>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmitBid)}>
                      <div className="flex items-end gap-4">
                        <div className="flex-grow">
                          <label htmlFor="bidAmount" className="block text-gray-700 mb-2">
                            Your Bid (min. ${(currentBid + 1).toFixed(2)})
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">$</span>
                            <input
                              type="number"
                              id="bidAmount"
                              step="0.01"
                              min={currentBid + 1}
                              className="input w-full pl-8"
                              placeholder="Enter bid amount"
                              {...register('bidAmount', {
                                required: 'Please enter a bid amount',
                                min: {
                                  value: currentBid + 1,
                                  message: `Bid must be at least $${(currentBid + 1).toFixed(2)}`,
                                },
                              })}
                            />
                          </div>
                          {errors.bidAmount && (
                            <p className="text-red-500 text-sm mt-1">{errors.bidAmount.message}</p>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isCreatingBid}
                        >
                          {isCreatingBid ? <Loader /> : 'Place Bid'}
                        </button>
                      </div>
                    </form>
                  )
                ) : (
                  <div className="text-center py-4">
                    <p className="mb-3">Please sign in to place a bid</p>
                    <Link
                      to={`/login?redirect=/auction/${auctionId}`}
                      className="btn btn-primary"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-6">
                <Message variant={auction.status === 'pending' ? 'warning' : 'info'}>
                  {auction.status === 'pending'
                    ? 'This auction has not started yet'
                    : 'This auction has ended'}
                </Message>
                {auction.status === 'closed' && auction.winner && (
                  <div className="mt-4 bg-success bg-opacity-10 p-4 rounded-lg">
                    <p className="font-semibold text-success">
                      Winner: {auction.winner._id === userInfo?._id
                        ? 'You'
                        : auction.winner.name || 'Anonymous'}
                    </p>
                    <p className="text-success">
                      Winning Bid: ${auction.currentPrice.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Tabs for Details and Bid History */}
        <div className="border-t border-gray-200">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 text-lg font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('details')}
            >
              <FaInfoCircle className="inline mr-2" /> Details
            </button>
            <button
              className={`px-6 py-3 text-lg font-medium ${
                activeTab === 'bidHistory'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('bidHistory')}
            >
              <FaHistory className="inline mr-2" /> Bid History
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'details' ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="mb-6">{auction.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Auction Details</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span>{auction.category}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Starting Price:</span>
                        <span>${auction.startingPrice.toFixed(2)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Current Price:</span>
                        <span>${auction.currentPrice.toFixed(2)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span>{auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Timing</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span>{new Date(auction.startDate).toLocaleString()}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span>{new Date(auction.endDate).toLocaleString()}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Created At:</span>
                        <span>{new Date(auction.createdAt).toLocaleString()}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Bid History</h2>
                {bidsLoading ? (
                  <Loader />
                ) : liveBids.length === 0 ? (
                  <Message variant="info">No bids have been placed yet</Message>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bidder
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {liveBids.map((bid, index) => (
                          <tr key={bid._id || index} className={bid.isNew ? 'bg-green-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {userInfo && bid.bidder?._id === userInfo._id
                                      ? 'You'
                                      : bid.bidder?.name || 'Anonymous'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                ${bid.amount?.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {bid.createdAt
                                  ? new Date(bid.createdAt).toLocaleString()
                                  : 'Just now'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  bid.status === 'winning'
                                    ? 'bg-green-100 text-green-800'
                                    : bid.status === 'outbid'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {bid.status || 'active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailScreen; 