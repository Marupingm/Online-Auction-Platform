import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUser, FaGavel, FaBell, FaHeart, FaHistory, FaPlus, FaCreditCard, FaCog } from 'react-icons/fa';
import { 
  useGetUserStatsQuery,
  useGetRecentNotificationsQuery 
} from '../slices/usersApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const DashboardScreen = () => {
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { 
    data: stats, 
    isLoading: isLoadingStats, 
    error: statsError 
  } = useGetUserStatsQuery();
  
  const { 
    data: notifications, 
    isLoading: isLoadingNotifications, 
    error: notificationsError 
  } = useGetRecentNotificationsQuery();
  
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const DashboardCard = ({ title, icon, count, linkTo, bgColor }) => (
    <Link 
      to={linkTo} 
      className={`${bgColor} rounded-lg shadow-md p-6 flex flex-col transition-transform transform hover:scale-105 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <div className="text-white opacity-80 text-xl">
          {icon}
        </div>
      </div>
      <div className="text-white text-3xl font-bold">{count}</div>
    </Link>
  );
  
  if (isLoadingStats) return <Loader />;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {statsError && (
        <Message variant="error">
          {statsError?.data?.message || statsError.error || 'Failed to load user stats'}
        </Message>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          title="Active Bids" 
          icon={<FaGavel />} 
          count={stats?.activeBids || 0} 
          linkTo="/my-bids?filter=active" 
          bgColor="bg-blue-600"
        />
        <DashboardCard 
          title="Active Auctions" 
          icon={<FaHistory />} 
          count={stats?.activeAuctions || 0} 
          linkTo="/my-auctions?filter=active" 
          bgColor="bg-green-600"
        />
        <DashboardCard 
          title="Won Auctions" 
          icon={<FaHeart />} 
          count={stats?.wonAuctions || 0} 
          linkTo="/my-bids?filter=won" 
          bgColor="bg-purple-600"
        />
        <DashboardCard 
          title="Sold Items" 
          icon={<FaCreditCard />} 
          count={stats?.soldItems || 0} 
          linkTo="/my-auctions?filter=sold" 
          bgColor="bg-orange-600"
        />
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/create-auction" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
            <FaPlus className="mx-auto text-2xl text-gray-700 mb-2" />
            <span className="text-sm font-medium">Create Auction</span>
          </Link>
          <Link to="/my-auctions" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
            <FaGavel className="mx-auto text-2xl text-gray-700 mb-2" />
            <span className="text-sm font-medium">My Auctions</span>
          </Link>
          <Link to="/my-bids" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
            <FaHistory className="mx-auto text-2xl text-gray-700 mb-2" />
            <span className="text-sm font-medium">My Bids</span>
          </Link>
          <Link to="/profile" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
            <FaUser className="mx-auto text-2xl text-gray-700 mb-2" />
            <span className="text-sm font-medium">Edit Profile</span>
          </Link>
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            
            {stats?.recentActivity?.length === 0 ? (
              <p className="text-gray-500">No recent activity to display.</p>
            ) : (
              <div className="space-y-4">
                {stats?.recentActivity?.map((activity) => (
                  <div key={activity._id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'bid' 
                          ? 'bg-blue-100 text-blue-500' 
                          : activity.type === 'auction_created' 
                          ? 'bg-green-100 text-green-500'
                          : activity.type === 'auction_won'
                          ? 'bg-purple-100 text-purple-500'
                          : activity.type === 'auction_ended'
                          ? 'bg-red-100 text-red-500'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {activity.type === 'bid' && <FaGavel />}
                        {activity.type === 'auction_created' && <FaPlus />}
                        {activity.type === 'auction_won' && <FaHeart />}
                        {activity.type === 'auction_ended' && <FaHistory />}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-gray-800">{activity.message}</p>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">{formatDate(activity.createdAt)}</span>
                          {activity.auctionId && (
                            <Link to={`/auction/${activity.auctionId}`} className="text-xs text-primary hover:underline">
                              View Auction
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Notifications */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <Link to="/notifications" className="text-xs text-primary hover:underline">View All</Link>
            </div>
            
            {isLoadingNotifications ? (
              <Loader />
            ) : notificationsError ? (
              <Message variant="error">
                {notificationsError?.data?.message || notificationsError.error || 'Failed to load notifications'}
              </Message>
            ) : notifications?.length === 0 ? (
              <p className="text-gray-500">No new notifications.</p>
            ) : (
              <div className="space-y-3">
                {notifications?.map((notification) => (
                  <div key={notification._id} className={`p-3 rounded-lg ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
                    <div className="flex">
                      <FaBell className={`mt-1 ${notification.isRead ? 'text-gray-400' : 'text-blue-500'}`} />
                      <div className="ml-3">
                        <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Account Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">
                  {userInfo?.createdAt 
                    ? new Date(userInfo.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auctions Created</span>
                <span className="font-medium">{stats?.totalAuctions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bids Placed</span>
                <span className="font-medium">{stats?.totalBids || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Successful Sales</span>
                <span className="font-medium">{stats?.soldItems || 0}</span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-gray-100">
                <Link to="/profile" className="flex items-center text-primary hover:text-primary-dark">
                  <FaCog className="mr-2" /> Account Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen; 