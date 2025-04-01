import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaExternalLinkAlt, FaFilter, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useGetMyBidsQuery } from '../slices/bidsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const MyBidsScreen = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: bids, isLoading, error, refetch } = useGetMyBidsQuery();
  
  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);
  
  // Get status badge
  const getStatusBadge = (auction) => {
    if (!auction) return null;
    
    // Check if user is the winning bidder
    const isWinner = auction.status === 'closed' && 
                     auction.winner && 
                     auction.winner._id === userInfo._id;
    
    if (isWinner) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="mr-1" /> Won
        </span>
      );
    }
    
    // Check if outbid
    const isOutbid = auction.currentHighestBid && 
                    auction.currentHighestBidder._id !== userInfo._id;
    
    if (auction.status === 'active' && isOutbid) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaTimesCircle className="mr-1" /> Outbid
        </span>
      );
    }
    
    // Check if highest bidder
    const isHighestBidder = auction.currentHighestBidder && 
                          auction.currentHighestBidder._id === userInfo._id;
    
    if (auction.status === 'active' && isHighestBidder) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FaCheckCircle className="mr-1" /> Highest Bid
        </span>
      );
    }
    
    // Auction closed and not won
    if (auction.status === 'closed' && !isWinner) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaTimesCircle className="mr-1" /> Lost
        </span>
      );
    }
    
    // Default status
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <FaClock className="mr-1" /> Pending
      </span>
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Filter bids
  const getFilteredBids = () => {
    if (!bids) return [];
    
    let filteredBids = [...bids];
    
    // Apply filter
    switch (activeFilter) {
      case 'active':
        filteredBids = filteredBids.filter(bid => bid.auction.status === 'active');
        break;
      case 'won':
        filteredBids = filteredBids.filter(
          bid => bid.auction.status === 'closed' && 
                bid.auction.winner && 
                bid.auction.winner._id === userInfo._id
        );
        break;
      case 'lost':
        filteredBids = filteredBids.filter(
          bid => bid.auction.status === 'closed' && 
                (!bid.auction.winner || bid.auction.winner._id !== userInfo._id)
        );
        break;
      case 'highest':
        filteredBids = filteredBids.filter(
          bid => bid.auction.currentHighestBidder && 
                bid.auction.currentHighestBidder._id === userInfo._id
        );
        break;
      case 'outbid':
        filteredBids = filteredBids.filter(
          bid => bid.auction.status === 'active' && 
                bid.auction.currentHighestBidder && 
                bid.auction.currentHighestBidder._id !== userInfo._id
        );
        break;
      default:
        // All bids, no filtering needed
        break;
    }
    
    // Apply sorting
    filteredBids.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOrder === 'highest') {
        return b.amount - a.amount;
      } else if (sortOrder === 'lowest') {
        return a.amount - b.amount;
      }
      return 0;
    });
    
    return filteredBids;
  };
  
  const filteredBids = getFilteredBids();
  
  if (isLoading) return <Loader />;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bids</h1>
      
      {error ? (
        <Message variant="error">
          {error?.data?.message || error.error || 'Failed to load bids'}
        </Message>
      ) : bids?.length === 0 ? (
        <Message variant="info">
          You haven't placed any bids yet.{' '}
          <Link to="/auctions" className="text-primary hover:underline">
            Browse available auctions
          </Link>
        </Message>
      ) : (
        <>
          {/* Filter and Sort Controls */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-2 mb-2 md:mb-0">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activeFilter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('all')}
                >
                  All Bids
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activeFilter === 'active'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activeFilter === 'highest'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('highest')}
                >
                  Highest Bid
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activeFilter === 'outbid'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('outbid')}
                >
                  Outbid
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activeFilter === 'won'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('won')}
                >
                  Won
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activeFilter === 'lost'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('lost')}
                >
                  Lost
                </button>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">Sort:</span>
              <select
                className="form-select text-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>
          </div>
          
          {filteredBids.length === 0 ? (
            <Message variant="info">
              No bids match your current filter. 
              <button 
                className="text-primary hover:underline ml-2"
                onClick={() => setActiveFilter('all')}
              >
                Show all bids
              </button>
            </Message>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Your Bid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bid Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBids.map((bid) => (
                      <tr key={bid._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={bid.auction.imageUrl}
                                alt={bid.auction.title}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {bid.auction.title}
                              </div>
                              <div className="text-xs text-gray-500">{bid.auction.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${bid.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${bid.auction.currentPrice.toFixed(2)}
                          </div>
                          {bid.amount < bid.auction.currentPrice && (
                            <div className="text-xs text-red-500">
                              Outbid by ${(bid.auction.currentPrice - bid.amount).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(bid.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(bid.auction)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/auction/${bid.auction._id}`}
                            className="text-primary hover:text-primary-dark flex items-center"
                          >
                            View <FaExternalLinkAlt className="ml-1" size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBidsScreen; 