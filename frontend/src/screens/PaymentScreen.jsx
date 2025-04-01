import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useGetAuctionDetailsQuery } from '../slices/auctionsApiSlice';
import PaymentForm from '../components/PaymentForm';
import Loader from '../components/Loader';
import Message from '../components/Message';

const PaymentScreen = () => {
  const { id: auctionId } = useParams();
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { 
    data: auction, 
    isLoading, 
    error, 
    refetch 
  } = useGetAuctionDetailsQuery(auctionId);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    // Check if auction exists and user is the winner
    if (auction) {
      const isWinner = 
        auction.status === 'closed' && 
        auction.winner && 
        auction.winner._id === userInfo._id;
      
      if (!isWinner) {
        toast.error('You are not authorized to access this payment page');
        navigate('/my-bids');
        return;
      }
      
      // Check if payment is already made
      if (auction.isPaid) {
        setPaymentComplete(true);
        setPaymentDetails({
          paymentId: auction.paymentId,
          paidAt: new Date(auction.paidAt).toLocaleString(),
          method: auction.paymentMethod
        });
      }
    }
  }, [auction, userInfo, navigate]);
  
  // Handle successful payment
  const handlePaymentSuccess = (paymentResult) => {
    setPaymentComplete(true);
    setPaymentDetails({
      paymentId: paymentResult.id,
      paidAt: new Date().toLocaleString(),
      method: paymentResult.payment_method
    });
    refetch(); // Refresh auction data to reflect payment status
  };
  
  // Handle payment cancellation
  const handlePaymentCancel = () => {
    navigate(`/auction/${auctionId}`);
  };
  
  if (isLoading) return <Loader />;
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Message variant="error">
          {error?.data?.message || error.error || 'Failed to load auction details'}
        </Message>
        <div className="mt-4">
          <Link to="/my-bids" className="text-primary hover:underline flex items-center">
            <FaArrowLeft className="mr-2" /> Back to My Bids
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to={`/auction/${auctionId}`} className="text-primary hover:underline flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Auction
          </Link>
        </div>
        
        {paymentComplete ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-green-500 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your payment for "{auction.title}" has been processed successfully.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
              <h3 className="font-medium mb-2">Payment Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Payment ID:</div>
                <div>{paymentDetails.paymentId}</div>
                <div className="text-gray-600">Amount:</div>
                <div>${auction.currentPrice.toFixed(2)}</div>
                <div className="text-gray-600">Date:</div>
                <div>{paymentDetails.paidAt}</div>
                <div className="text-gray-600">Method:</div>
                <div>{paymentDetails.method}</div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Next Steps</h3>
              <p className="text-gray-600 mb-2">
                The seller has been notified of your payment. They will contact you
                regarding shipping or delivery arrangements.
              </p>
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 flex items-start mt-4">
                <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  Please check your email for a payment receipt and further instructions.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Link to="/my-bids" className="btn btn-outline">
                My Bids
              </Link>
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <PaymentForm
            auction={auction}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentCancel={handlePaymentCancel}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentScreen; 