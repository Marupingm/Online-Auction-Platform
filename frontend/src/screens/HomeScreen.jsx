import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaGavel } from 'react-icons/fa';
import { useGetAuctionsQuery } from '../slices/auctionsApiSlice';
import AuctionCard from '../components/AuctionCard';
import Loader from '../components/Loader';
import Message from '../components/Message';

const HomeScreen = () => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('active');
  
  const { data, isLoading, error, refetch } = useGetAuctionsQuery({
    keyword,
    category,
    status,
    pageNumber: 1,
  });
  
  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };
  
  // Categories for filter dropdown
  const categories = [
    'All Categories',
    'Electronics',
    'Fashion',
    'Home',
    'Vehicles',
    'Art',
    'Collectibles',
    'Other',
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-primary text-white rounded-lg p-8 mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Find and Win Unique Items</h1>
          <p className="text-xl mb-6">
            Discover exclusive auctions from sellers around the world
          </p>
          <Link to="/auctions" className="btn bg-white text-primary hover:bg-gray-100">
            Explore All Auctions
          </Link>
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search auctions..."
                className="input w-full pl-10"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <div className="relative">
              <select
                className="input w-full pl-10 appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat, index) => (
                  <option key={index} value={index === 0 ? '' : cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>
      
      {/* Featured Auctions Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <FaGavel className="mr-2" /> Featured Auctions
          </h2>
          <Link to="/auctions" className="text-primary hover:underline">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="error">
            {error?.data?.message || error.error || 'An error occurred'}
          </Message>
        ) : data?.auctions?.length === 0 ? (
          <Message variant="info">No auctions found</Message>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.auctions.slice(0, 8).map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}
      </div>
      
      {/* Categories Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.slice(1).map((cat, index) => (
            <Link
              key={index}
              to={`/auctions?category=${cat}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-center"
            >
              <div className="text-primary text-4xl mb-2">
                {getCategoryIcon(cat)}
              </div>
              <h3 className="font-semibold">{cat}</h3>
            </Link>
          ))}
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="bg-light rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">Browse Auctions</h3>
            <p className="text-gray-600">
              Find items you're interested in from various categories
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">Place Your Bid</h3>
            <p className="text-gray-600">
              Bid on items you want to purchase in real-time
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">Win & Pay</h3>
            <p className="text-gray-600">
              If you win, complete the payment and receive your item
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get category icons
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Electronics':
      return '💻';
    case 'Fashion':
      return '👕';
    case 'Home':
      return '🏠';
    case 'Vehicles':
      return '🚗';
    case 'Art':
      return '🎨';
    case 'Collectibles':
      return '🏆';
    default:
      return '📦';
  }
};

export default HomeScreen; 