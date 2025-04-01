import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCheckCircle, FaBell, FaFilter, FaSearch, FaTrash } from 'react-icons/fa';
import { 
  useGetNotificationsQuery, 
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation
} from '../slices/notificationsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';

const NotificationsScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const { 
    data,
    isLoading, 
    error, 
    refetch 
  } = useGetNotificationsQuery({
    pageNumber,
    keyword: searchTerm,
    notificationType: filterType
  });
  
  const [markAsRead] = useMarkNotificationReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [deleteAllNotifications] = useDeleteAllNotificationsMutation();
  
  // Handle user authentication
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);
  
  // Handle select all checkbox
  useEffect(() => {
    if (selectAll && data?.notifications) {
      setSelectedNotifications(data.notifications.map(n => n._id));
    } else if (!selectAll) {
      setSelectedNotifications([]);
    }
  }, [selectAll, data]);
  
  // Format notification time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark notification as read
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    
    // Navigate to relevant page based on notification type
    if (notification.type === 'bid') {
      navigate(`/auction/${notification.auctionId}`);
    } else if (notification.type === 'auction_end') {
      navigate(`/auction/${notification.auctionId}`);
    } else if (notification.type === 'auction_won') {
      navigate(`/payment/${notification.auctionId}`);
    } else if (notification.type === 'payment') {
      navigate('/dashboard');
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetch();
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };
  
  // Handle delete notification
  const handleDeleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(id).unwrap();
        refetch();
        setSelectedNotifications(selectedNotifications.filter(notifId => notifId !== id));
      } catch (err) {
        console.error('Failed to delete notification:', err);
      }
    }
  };
  
  // Handle delete all notifications
  const handleDeleteAllNotifications = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await deleteAllNotifications().unwrap();
        refetch();
        setSelectedNotifications([]);
        setSelectAll(false);
      } catch (err) {
        console.error('Failed to delete all notifications:', err);
      }
    }
  };
  
  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNumber(1);
    refetch();
  };
  
  // Handle notification selection
  const handleSelectNotification = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(notifId => notifId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };
  
  // Handle delete selected notifications
  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) {
      try {
        // Delete each selected notification
        for (const id of selectedNotifications) {
          await deleteNotification(id).unwrap();
        }
        refetch();
        setSelectedNotifications([]);
        setSelectAll(false);
      } catch (err) {
        console.error('Failed to delete selected notifications:', err);
      }
    }
  };
  
  // Handle filter change
  const handleFilterChange = (type) => {
    setFilterType(type);
    setPageNumber(1);
    refetch();
    setShowFilters(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <FaBell className="mr-2" /> Notifications
      </h1>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notifications..."
              className="w-full p-2 pr-10 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <FaSearch />
            </button>
          </div>
        </form>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
            >
              <FaFilter />
              {filterType ? filterType.charAt(0).toUpperCase() + filterType.slice(1) : 'Filter'}
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <ul>
                  <li 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleFilterChange('')}
                  >
                    All
                  </li>
                  <li 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleFilterChange('bid')}
                  >
                    Bids
                  </li>
                  <li 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleFilterChange('auction_end')}
                  >
                    Auction Ended
                  </li>
                  <li 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleFilterChange('auction_won')}
                  >
                    Auction Won
                  </li>
                  <li 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleFilterChange('payment')}
                  >
                    Payments
                  </li>
                  <li 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleFilterChange('system')}
                  >
                    System
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md"
            disabled={isLoading}
          >
            <FaCheckCircle />
            Mark All Read
          </button>
          
          {selectedNotifications.length > 0 ? (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md"
              disabled={isLoading}
            >
              <FaTrash />
              Delete Selected
            </button>
          ) : (
            <button
              onClick={handleDeleteAllNotifications}
              className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md"
              disabled={isLoading}
            >
              <FaTrash />
              Delete All
            </button>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : data?.notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <FaBell className="mx-auto text-gray-300 text-5xl mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No notifications yet</h2>
          <p className="text-gray-500">
            When you receive notifications, they will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectAll}
                      onChange={() => setSelectAll(!selectAll)}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.notifications.map((notification) => (
                  <tr 
                    key={notification._id} 
                    className={!notification.isRead ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => handleSelectNotification(notification._id)}
                        className="rounded"
                      />
                    </td>
                    <td 
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          notification.type === 'bid' 
                            ? 'bg-blue-100 text-blue-500' 
                            : notification.type === 'auction_end' 
                            ? 'bg-yellow-100 text-yellow-500'
                            : notification.type === 'auction_won'
                            ? 'bg-green-100 text-green-500'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <FaBell className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                            {notification.message}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(notification.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <Paginate 
            pages={data.pages} 
            page={data.page}
            keyword={searchTerm ? searchTerm : ''}
          />
        </>
      )}
    </div>
  );
};

export default NotificationsScreen; 