import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaClock } from 'react-icons/fa';
import { 
  useGetMyAuctionsQuery, 
  useDeleteAuctionMutation,
  useEndAuctionMutation
} from '../slices/auctionsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const MyAuctionsScreen = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: auctions, isLoading, error, refetch } = useGetMyAuctionsQuery();
  const [deleteAuction, { isLoading: isDeleting }] = useDeleteAuctionMutation();
  const [endAuction, { isLoading: isEnding }] = useEndAuctionMutation();
  
  // Delete auction handler
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirmModal(true);
  };
  
  const handleDelete = async () => {
    try {
      await deleteAuction(deleteId).unwrap();
      setShowConfirmModal(false);
      setDeleteId(null);
      toast.success('Auction deleted');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to delete auction');
    }
  };
  
  // End auction handler
  const handleEndAuction = async (id) => {
    try {
      await endAuction(id).unwrap();
      toast.success('Auction ended successfully');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to end auction');
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
  
  // Calculate time remaining
  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeRemaining = end - now;
    
    if (timeRemaining <= 0) {
      return 'Ended';
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m remaining`;
    }
  };
  
  if (isLoading) return <Loader />;
  
  if (!userInfo) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Auctions</h1>
        <Link to="/create-auction" className="btn btn-primary flex items-center">
          <FaPlus className="mr-2" /> Create New Auction
        </Link>
      </div>
      
      {error ? (
        <Message variant="error">
          {error?.data?.message || error.error || 'Failed to load auctions'}
        </Message>
      ) : auctions?.length === 0 ? (
        <Message variant="info">
          You haven't created any auctions yet.{' '}
          <Link to="/create-auction" className="text-primary hover:underline">
            Create your first auction
          </Link>
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
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auctions.map((auction) => (
                  <tr key={auction._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={auction.imageUrl}
                            alt={auction.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/auction/${auction._id}`} className="hover:text-primary">
                              {auction.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500">{auction.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${auction.currentPrice.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Started: ${auction.startingPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(auction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="mr-1" />
                        {auction.status === 'closed'
                          ? 'Auction ended'
                          : getTimeRemaining(auction.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/auction/${auction._id}`}
                        className="text-primary hover:text-blue-700"
                      >
                        View
                      </Link>
                      
                      {auction.status === 'pending' && (
                        <>
                          <Link
                            to={`/edit-auction/${auction._id}`}
                            className="text-primary hover:text-blue-700"
                          >
                            <FaEdit className="inline mr-1" /> Edit
                          </Link>
                          
                          <button
                            onClick={() => confirmDelete(auction._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="inline mr-1" /> Delete
                          </button>
                        </>
                      )}
                      
                      {auction.status === 'active' && (
                        <button
                          onClick={() => handleEndAuction(auction._id)}
                          className="text-orange-600 hover:text-orange-800"
                          disabled={isEnding}
                        >
                          {isEnding ? <Loader /> : <><FaTimes className="inline mr-1" /> End</>}
                        </button>
                      )}
                      
                      {auction.status === 'closed' && auction.winner && (
                        <span className="text-green-600">
                          <FaCheck className="inline mr-1" /> Sold
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this auction? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                className="btn btn-outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAuctionsScreen; 