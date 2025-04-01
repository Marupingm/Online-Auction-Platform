import { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { initiateSocket } from './services/socketService';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import PrivateRoute from './components/PrivateRoute';

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
    <Router>
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/profile" element={<PrivateRoute><ProfileScreen /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><NotificationsScreen /></PrivateRoute>} />
            <Route path="*" element={<div className="p-8 text-center">Page not found!</div>} />
          </Routes>
        </Container>
      </main>
      <Footer />
      <ToastContainer />
    </Router>
  );
}

export default App;
