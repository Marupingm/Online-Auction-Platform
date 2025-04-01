import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { initiateSocket } from './services/socketService';
import Header from './components/Header';
import Footer from './components/Footer';

// Socket initialization
let socket;

function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Initialize socket connection
    socket = initiateSocket();
    
    // Clean up socket on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <Routes>
          {/* Add routes here */}
          <Route path="/" element={<div className="p-8 text-center">Home page coming soon!</div>} />
          <Route path="*" element={<div className="p-8 text-center">Page not found!</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
