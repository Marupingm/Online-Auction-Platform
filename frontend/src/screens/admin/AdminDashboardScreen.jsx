import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaUsers, 
  FaGavel, 
  FaCreditCard, 
  FaChartLine, 
  FaTasks, 
  FaExclamationTriangle,
  FaCheck,
  FaUserCog
} from 'react-icons/fa';
import { useGetAdminStatsQuery } from '../../slices/adminApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const AdminDashboardScreen = () => {
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { 
    data: stats, 
    isLoading, 
    error 
  } = useGetAdminStatsQuery();
  
  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
    }
  }, [userInfo, navigate]);
  
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
  };
  
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const StatCard = ({ title, value, icon, bgColor, linkTo }) => (
    <Link 
      to={linkTo} 
      className={`${bgColor} text-white p-6 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white text-opacity-90 mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className="text-white text-opacity-80 text-4xl">
          {icon}
        </div>
      </div>
    </Link>
  );
  
  if (isLoading) return <Loader />;
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Message variant="error">
          {error?.data?.message || error.error || 'Failed to load admin statistics'}
        </Message>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={formatNumber(stats?.userCount)} 
          icon={<FaUsers />} 
          bgColor="bg-blue-600" 
          linkTo="/admin/users"
        />
        <StatCard 
          title="Total Auctions" 
          value={formatNumber(stats?.auctionCount)} 
          icon={<FaGavel />} 
          bgColor="bg-green-600" 
          linkTo="/admin/auctions"
        />
        <StatCard 
          title="Revenue" 
          value={formatCurrency(stats?.totalRevenue)} 
          icon={<FaCreditCard />} 
          bgColor="bg-purple-600" 
          linkTo="/admin/transactions"
        />
        <StatCard 
          title="Pending Approvals" 
          value={formatNumber(stats?.pendingApprovals)} 
          icon={<FaTasks />} 
          bgColor="bg-orange-600" 
          linkTo="/admin/approvals"
        />
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link to="/admin/users" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
            <FaUsers className="mx-auto text-2xl text-gray-700 mb-2" />
            <span className="text-sm font-medium">Manage Users</span>
          </Link>
          <Link to="/admin/auctions" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
            <FaGavel className="mx-auto text-2xl text-gray-700 mb-2" />
            <span className="text-sm font-medium">Manage Auctions</span>
          </Link>
          <Link to="/admin/transactions" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
            <FaCreditCard className="mx-auto text-2xl text-gray-700 mb-2" />
            <span className="text-sm font-medium">View Transactions</span>
          </Link>
          <Link to="/admin/approvals" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
            <FaTasks className="mx-auto text-2xl text-gray-700 mb-2" />
            <span className="text-sm font-medium">Pending Approvals</span>
          </Link>
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Auctions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Auctions</h2>
              <Link to="/admin/auctions" className="text-primary hover:underline">View All</Link>
            </div>
            
            {stats?.recentAuctions?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auction
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seller
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentAuctions.map((auction) => (
                      <tr key={auction._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={auction.imageUrl}
                                alt={auction.title}
                              />
                            </div>
                            <div className="ml-4">
                              <Link to={`/admin/auctions/${auction._id}`} className="text-sm font-medium text-gray-900 hover:text-primary">
                                {auction.title}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{auction.seller.name}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(auction.currentPrice)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            auction.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : auction.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(auction.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No recent auctions available.</p>
            )}
          </div>
        </div>
        
        {/* System Status & Recent Users */}
        <div className="space-y-8">
          {/* System Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCheck className="text-green-500 mr-2" />
                  <span className="text-sm">System operational</span>
                </div>
                <span className="text-green-500 text-sm font-medium">Online</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaUserCog className="text-gray-500 mr-2" />
                  <span className="text-sm">Active admins</span>
                </div>
                <span className="text-gray-700 text-sm font-medium">{stats?.activeAdmins || 1}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-yellow-500 mr-2" />
                  <span className="text-sm">Pending approvals</span>
                </div>
                <span className="text-yellow-500 text-sm font-medium">{stats?.pendingApprovals || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaChartLine className="text-blue-500 mr-2" />
                  <span className="text-sm">Active auctions</span>
                </div>
                <span className="text-blue-500 text-sm font-medium">{stats?.activeAuctions || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Users</h2>
              <Link to="/admin/users" className="text-primary hover:underline">View All</Link>
            </div>
            
            {stats?.recentUsers?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <Link to={`/admin/users/${user._id}`} className="text-sm font-medium text-gray-900 hover:text-primary">
                        {user.name}
                      </Link>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent users available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardScreen; 