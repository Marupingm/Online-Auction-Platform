import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { FaCreditCard, FaLock, FaPaypal } from 'react-icons/fa';
import { useProcessPaymentMutation } from '../slices/paymentsApiSlice';
import Loader from './Loader';
import Message from './Message';

const PaymentForm = ({ 
  auction, 
  onPaymentSuccess, 
  onPaymentCancel 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const [processPayment, { isLoading, error }] = useProcessPaymentMutation();
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({ ...cardDetails, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (paymentMethod === 'credit-card') {
      if (!cardDetails.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      
      if (!cardDetails.cardName.trim()) {
        newErrors.cardName = 'Name on card is required';
      }
      
      if (!cardDetails.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
        newErrors.expiryDate = 'Please use MM/YY format';
      }
      
      if (!cardDetails.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        newErrors.cvv = 'CVV must be 3 or 4 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const paymentData = {
        auctionId: auction._id,
        paymentMethod,
        amount: auction.currentPrice,
        ...(paymentMethod === 'credit-card' && { cardDetails })
      };
      
      const result = await processPayment(paymentData).unwrap();
      
      toast.success('Payment processed successfully!');
      onPaymentSuccess(result);
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Payment processing failed');
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Complete Your Purchase</h2>
      
      {error && (
        <Message variant="error" className="mb-4">
          {error?.data?.message || error.error || 'Payment processing failed'}
        </Message>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Order Summary</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center mb-4">
            <img 
              src={auction.imageUrl} 
              alt={auction.title} 
              className="w-16 h-16 object-cover rounded-md mr-4"
            />
            <div>
              <h4 className="font-medium">{auction.title}</h4>
              <p className="text-sm text-gray-600">Auction #{auction._id.substring(0, 8)}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span>Winning Bid:</span>
              <span>${auction.currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg">
              <span>Total:</span>
              <span>${auction.currentPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`border rounded-md p-4 flex items-center cursor-pointer ${
                paymentMethod === 'credit-card'
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setPaymentMethod('credit-card')}
            >
              <div className="flex-shrink-0 mr-3">
                <FaCreditCard className="text-2xl text-gray-700" />
              </div>
              <div>
                <h4 className="font-medium">Credit Card</h4>
                <p className="text-sm text-gray-600">Pay with Visa, Mastercard, etc.</p>
              </div>
              <div className="ml-auto">
                <input
                  type="radio"
                  name="payment-method"
                  checked={paymentMethod === 'credit-card'}
                  onChange={() => setPaymentMethod('credit-card')}
                  className="form-radio"
                />
              </div>
            </div>
            
            <div
              className={`border rounded-md p-4 flex items-center cursor-pointer ${
                paymentMethod === 'paypal'
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <div className="flex-shrink-0 mr-3">
                <FaPaypal className="text-2xl text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">PayPal</h4>
                <p className="text-sm text-gray-600">Pay with your PayPal account</p>
              </div>
              <div className="ml-auto">
                <input
                  type="radio"
                  name="payment-method"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                  className="form-radio"
                />
              </div>
            </div>
          </div>
        </div>
        
        {paymentMethod === 'credit-card' && (
          <div className="bg-gray-50 p-6 rounded-md mb-6">
            <div className="mb-4">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                className={`form-input ${errors.cardNumber ? 'border-red-500' : ''}`}
                value={cardDetails.cardNumber}
                onChange={handleInputChange}
                maxLength="19"
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                Name on Card
              </label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                placeholder="John Doe"
                className={`form-input ${errors.cardName ? 'border-red-500' : ''}`}
                value={cardDetails.cardName}
                onChange={handleInputChange}
              />
              {errors.cardName && (
                <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  className={`form-input ${errors.expiryDate ? 'border-red-500' : ''}`}
                  value={cardDetails.expiryDate}
                  onChange={handleInputChange}
                  maxLength="5"
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  placeholder="123"
                  className={`form-input ${errors.cvv ? 'border-red-500' : ''}`}
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  maxLength="4"
                />
                {errors.cvv && (
                  <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <FaLock className="mr-2" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        )}
        
        {paymentMethod === 'paypal' && (
          <div className="bg-gray-50 p-6 rounded-md mb-6 text-center">
            <FaPaypal className="text-4xl text-blue-600 mx-auto mb-2" />
            <p className="mb-4">
              You will be redirected to PayPal to complete your payment.
            </p>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onPaymentCancel}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader />
            ) : paymentMethod === 'paypal' ? (
              <>Pay with PayPal</>
            ) : (
              <>Pay ${auction.currentPrice.toFixed(2)}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

PaymentForm.propTypes = {
  auction: PropTypes.object.isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
  onPaymentCancel: PropTypes.func.isRequired
};

export default PaymentForm; 