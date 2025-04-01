import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">AuctionHub</h3>
            <p className="text-gray-300">
              Your trusted platform for online auctions. Bid, win, and discover
              unique items from sellers around the world.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/auctions" className="text-gray-300 hover:text-primary">
                  Auctions
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/auctions?category=Electronics" className="text-gray-300 hover:text-primary">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/auctions?category=Fashion" className="text-gray-300 hover:text-primary">
                  Fashion
                </Link>
              </li>
              <li>
                <Link to="/auctions?category=Home" className="text-gray-300 hover:text-primary">
                  Home & Garden
                </Link>
              </li>
              <li>
                <Link to="/auctions?category=Art" className="text-gray-300 hover:text-primary">
                  Art & Collectibles
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-300 hover:text-primary text-xl">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary text-xl">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary text-xl">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary text-xl">
                <FaLinkedin />
              </a>
            </div>
            <p className="text-gray-300">
              Subscribe to our newsletter for the latest auctions and deals.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} AuctionHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 