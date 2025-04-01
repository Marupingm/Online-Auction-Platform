import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaBell, FaExclamation } from 'react-icons/fa';
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from '../slices/notificationsApiSlice';
import socket from '../services/socketService';
import Loader from './Loader';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNotification, setNewNotification] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { 
    data: notifications, 
    isLoading, 
    refetch 
  } = useGetNotificationsQuery({ limit: 5 }, {
    skip: !userInfo
  });
  
  const [markAsRead] = useMarkNotificationReadMutation();
  
  // Listen for notifications via WebSocket
  useEffect(() => {
    if (!userInfo) return;
    
    // Connect to WebSocket
    socket.connect();
    
    // Join user's notification room
    socket.emit('joinNotificationRoom', userInfo._id);
    
    // Listen for new notifications
    socket.on('newNotification', (notification) => {
      // Play notification sound
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(err => console.error('Failed to play notification sound:', err));
      
      // Set new notification flag
      setNewNotification(true);
      
      // Refetch notifications
      refetch();
    });
    
    return () => {
      // Remove event listeners and leave rooms on unmount
      socket.off('newNotification');
      socket.emit('leaveNotificationRoom', userInfo._id);
    };
  }, [userInfo, refetch]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle notification dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setNewNotification(false);
    }
  };
  
  // Format notification time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
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
    } else {
      navigate('/notifications');
    }
    
    // Close dropdown
    setIsOpen(false);
  };
  
  // Get unread count
  const getUnreadCount = () => {
    if (!notifications) return 0;
    return notifications.filter(notification => !notification.isRead).length;
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <FaBell className="h-6 w-6" />
        
        {/* Notification Indicator */}
        {(newNotification || getUnreadCount() > 0) && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                {getUnreadCount() > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {getUnreadCount()} new
                  </span>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="px-4 py-6 text-center">
                <Loader />
              </div>
            ) : notifications?.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No notifications yet
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        notification.type === 'bid' 
                          ? 'bg-blue-100 text-blue-500' 
                          : notification.type === 'auction_end' 
                          ? 'bg-yellow-100 text-yellow-500'
                          : notification.type === 'auction_won'
                          ? 'bg-green-100 text-green-500'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {!notification.isRead && <FaExclamation className="h-3 w-3" />}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="px-4 py-2 border-t border-gray-200">
                  <button
                    className="w-full text-center text-xs text-primary hover:text-primary-dark"
                    onClick={() => {
                      navigate('/notifications');
                      setIsOpen(false);
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 