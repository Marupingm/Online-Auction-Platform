import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaClock, FaSort } from 'react-icons/fa';
import { useGetAuctionsQuery } from '../slices/auctionsApiSlice';
import AuctionCard from '../components/AuctionCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';

const AuctionListScreen = () => {
  const navigate = useNavigate();
  const { pageNumber = 1 } = useParams();
  
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  
  const { data, isLoading, error, refetch } = useGetAuctionsQuery({
    keyword,
    category,
    status,
    pageNumber: Number(pageNumber),
  });
  
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
  
  // Status options for filter dropdown
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'closed', label: 'Closed' },
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'endDate', label: 'Ending Soon' },
    { value: 'currentPrice', label: 'Price: Low to High' },
    { value: '-currentPrice', label: 'Price: High to Low' },
  ];
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Update URL with search params
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (sortBy) params.append('sortBy', sortBy);
    
    navigate(`/auctions${params.toString() ? '?' + params.toString() : ''}`);
    refetch();
  };
  
  // Handle sorting locally since our API doesn't support it directly
  const getSortedAuctions = () => {
    if (!data || !data.auctions) return [];
    
    let sorted = [...data.auctions];
    
    switch (sortBy) {
      case 'endDate':
        sorted.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        break;
      case 'currentPrice':
        sorted.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case '-currentPrice':
        sorted.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'createdAt':
      default:
        // Already sorted by createdAt from the API
        break;
    }
    
    return sorted;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Auctions</h1>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Keyword Search */}
            <div className="md:col-span-2">
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
            
            {/* Category Filter */}
            <div>
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
            
            {/* Status Filter */}
            <div>
              <div className="relative">
                <select
                  className="input w-full pl-10 appearance-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statusOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FaClock className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            {/* Sort Options */}
            <div className="flex items-center">
              <FaSort className="mr-2 text-gray-400" />
              <select
                className="input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary">
              Apply Filters
            </button>
          </div>
        </form>
      </div>
      
      {/* Results Count */}
      {data && (
        <div className="mb-4 text-gray-600">
          Showing {data.auctions.length} of {data.total} results
        </div>
      )}
      
      {/* Auctions Grid */}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">
          {error?.data?.message || error.error || 'An error occurred'}
        </Message>
      ) : data?.auctions?.length === 0 ? (
        <Message variant="info">No auctions found matching your criteria</Message>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {getSortedAuctions().map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {data && data.pages > 1 && (
        <Paginate pages={data.pages} page={data.page} keyword={keyword ? keyword : ''} />
      )}
    </div>
  );
};

export default AuctionListScreen; 