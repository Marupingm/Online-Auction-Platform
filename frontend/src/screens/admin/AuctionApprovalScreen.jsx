import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaSearch, FaExternalLinkAlt } from 'react-icons/fa';
import { 
  useGetPendingAuctionsQuery,
  useApproveAuctionMutation,
  useRejectAuctionMutation
} from '../../slices/adminApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Paginate from '../../components/Paginate';

const AuctionApprovalScreen = () => {
  const [keyword, setKeyword] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState({ type: '', auctionId: '', reason: '' });
  const [rejectReason, setRejectReason] = useState('');
  
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetPendingAuctionsQuery({ keyword });
  
  const [approveAuction, { isLoading: isApproving }] = useApproveAuctionMutation();
  const [rejectAuction, { isLoading: isRejecting }] = useRejectAuctionMutation();
  
  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
    }
  }, [userInfo, navigate]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };
  
  // Open confirmation modal
  const openConfirmModal = (type, auctionId) => {
    setModalAction({ type, auctionId, reason: '' });
    setRejectReason('');
    setShowConfirmModal(true);
  };
  
  // Close confirmation modal
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setModalAction({ type: '', auctionId: '', reason: '' });
    setRejectReason('');
  };
  
  // Handle approve auction
  const handleApproveAuction = async () => {
    try {
      await approveAuction(modalAction.auctionId).unwrap();
      toast.success('Auction approved successfully');
      closeConfirmModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to approve auction');
    }
  };
  
  // Handle reject auction
  const handleRejectAuction = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      await rejectAuction({
        auctionId: modalAction.auctionId,
        reason: rejectReason
      }).unwrap();
      toast.success('Auction rejected successfully');
      closeConfirmModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to reject auction');
    }
  };
  
  // Submit modal action
  const submitAction = () => {
    if (modalAction.type === 'approve') {
      handleApproveAuction();
    } else if (modalAction.type === 'reject') {
      handleRejectAuction();
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Auction Approvals</h1>
        <Link to="/admin/dashboard" className="text-primary hover:underline">
          Back to Dashboard
        </Link>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative flex-grow mr-4">
            <input
              type="text"
              placeholder="Search by title or seller name"
              className="input pl-10 w-full"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">
          {error?.data?.message || error.error || 'Failed to load pending auctions'}
        </Message>
      ) : data?.auctions?.length === 0 ? (
        <Message variant="info">No pending auctions found</Message>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Starting Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.auctions.map((auction) => (
                    <tr key={auction._id} className="hover:bg-gray-50">
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
                              {auction.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {auction.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {auction.seller.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {auction.seller.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${auction.startingPrice.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Duration: {auction.duration} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(auction.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/auction/${auction._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-blue-700 flex items-center"
                        >
                          View <FaExternalLinkAlt className="ml-1 text-xs" />
                        </Link>
                        
                        <button
                          onClick={() => openConfirmModal('approve', auction._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaCheck className="inline mr-1" /> Approve
                        </button>
                        
                        <button
                          onClick={() => openConfirmModal('reject', auction._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTimes className="inline mr-1" /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {data.pages > 1 && (
            <Paginate
              pages={data.pages}
              page={data.page}
              keyword={keyword ? keyword : ''}
            />
          )}
        </>
      )}
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">
              {modalAction.type === 'approve' ? 'Approve Auction' : 'Reject Auction'}
            </h2>
            
            {modalAction.type === 'approve' ? (
              <p className="mb-6">
                Are you sure you want to approve this auction? It will become active and visible to all users.
              </p>
            ) : (
              <div className="mb-6">
                <p className="mb-2">
                  Please provide a reason for rejecting this auction. This will be shared with the seller.
                </p>
                <textarea
                  className="form-textarea w-full"
                  rows="3"
                  placeholder="Reason for rejection"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                ></textarea>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <button
                className="btn btn-outline"
                onClick={closeConfirmModal}
              >
                Cancel
              </button>
              <button
                className={`btn ${modalAction.type === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={submitAction}
                disabled={isApproving || isRejecting || (modalAction.type === 'reject' && !rejectReason.trim())}
              >
                {isApproving || isRejecting ? (
                  <Loader />
                ) : modalAction.type === 'approve' ? (
                  'Approve'
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionApprovalScreen; 