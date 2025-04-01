import { Link } from 'react-router-dom';
import { FaClock, FaGavel, FaUser } from 'react-icons/fa';

const AuctionCard = ({ auction }) => {
  const {
    _id,
    title,
    imageUrl,
    currentPrice,
    endDate,
    status,
    category,
    seller,
  } = auction;

  // Format end date
  const formattedEndDate = new Date(endDate).toLocaleString();
  
  // Calculate time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(endDate);
    const timeRemaining = end - now;
    
    if (timeRemaining <= 0 || status === 'closed') {
      return 'Auction ended';
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };
  
  // Get status badge
  const getStatusBadge = () => {
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

  return (
    <div className="card h-full flex flex-col transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {getStatusBadge()}
          <span className="badge bg-dark text-white">{category}</span>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        
        <div className="flex items-center text-gray-600 mb-2 text-sm">
          <FaUser className="mr-1" />
          <span>{seller?.name || 'Unknown Seller'}</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2 text-sm">
          <FaClock className="mr-1" />
          <span>{getTimeRemaining()}</span>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center font-bold text-xl text-primary mb-2">
            <FaGavel className="mr-2" />
            ${currentPrice.toFixed(2)}
          </div>
          
          <Link
            to={`/auction/${_id}`}
            className="btn btn-primary w-full"
          >
            {status === 'active' ? 'Place Bid' : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard; 