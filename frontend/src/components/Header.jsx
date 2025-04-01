import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaSignOutAlt, FaList, FaGavel, FaTrophy } from 'react-icons/fa';
import { logout } from '../slices/authSlice';
import { useLogoutMutation } from '../slices/usersApiSlice';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [logoutApiCall] = useLogoutMutation();
  
  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <header className="bg-dark shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white">
            AuctionHub
          </Link>
          
          {/* Navigation (desktop) */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-white hover:text-primary">
              Home
            </Link>
            <Link to="/auctions" className="text-white hover:text-primary">
              Auctions
            </Link>
            <Link to="/about" className="text-white hover:text-primary">
              About
            </Link>
          </nav>
          
          {/* User menu (desktop) */}
          {userInfo ? (
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-white hover:text-primary"
              >
                <FaUser />
                <span>{userInfo.name}</span>
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-20">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    <FaUser className="inline mr-2" /> Profile
                  </Link>
                  <Link
                    to="/my-auctions"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    <FaList className="inline mr-2" /> My Auctions
                  </Link>
                  <Link
                    to="/my-bids"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    <FaGavel className="inline mr-2" /> My Bids
                  </Link>
                  <Link
                    to="/my-wins"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    <FaTrophy className="inline mr-2" /> My Wins
                  </Link>
                  <button
                    onClick={logoutHandler}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="inline mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex space-x-4">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-outline">
                Register
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-primary"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-2 border-t border-gray-700">
            <Link
              to="/"
              className="block py-2 text-white hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/auctions"
              className="block py-2 text-white hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Auctions
            </Link>
            <Link
              to="/about"
              className="block py-2 text-white hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {userInfo ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 text-white hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="inline mr-2" /> Profile
                </Link>
                <Link
                  to="/my-auctions"
                  className="block py-2 text-white hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaList className="inline mr-2" /> My Auctions
                </Link>
                <Link
                  to="/my-bids"
                  className="block py-2 text-white hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaGavel className="inline mr-2" /> My Bids
                </Link>
                <Link
                  to="/my-wins"
                  className="block py-2 text-white hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaTrophy className="inline mr-2" /> My Wins
                </Link>
                <button
                  onClick={() => {
                    logoutHandler();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-white hover:text-primary"
                >
                  <FaSignOutAlt className="inline mr-2" /> Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 mt-2">
                <Link
                  to="/login"
                  className="btn btn-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 