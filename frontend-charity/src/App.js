import React, { useState, useEffect } from 'react';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import NGOList from './components/NGOList';
import DonationForm from './components/DonationForm';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import FeedbackPage from './components/FeedbackPage';
import Footer from './components/Footer';

// Import API config
// eslint-disable-next-line no-unused-vars
import { API_ENDPOINTS } from './config/api';

function CharityDonationApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Load user data from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setCurrentPage('dashboard');

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowSignupModal(false);
    setCurrentPage('dashboard');

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleAdminLogin = (adminData) => {
    setIsAdminAuthenticated(true);
    // Admin login logic usually doesn't affect main user session, 
    // but here we update state to show dashboard
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setIsAdminAuthenticated(false);
    setCurrentPage('home');

    // Clear user data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage isLoggedIn={isLoggedIn} setCurrentPage={setCurrentPage} setShowLoginModal={setShowLoginModal} />;
      case 'ngos':
        return <NGOList setSelectedNGO={setSelectedNGO} setSelectedCampaign={setSelectedCampaign} setCurrentPage={setCurrentPage} />;
      case 'donate':
        return <DonationForm campaign={selectedCampaign} ngo={selectedNGO} user={user} setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return <UserDashboard user={user} setCurrentPage={setCurrentPage} />;
      case 'admin':
        return isAdminAuthenticated ? <AdminDashboard /> : <AdminLogin onLogin={handleAdminLogin} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'feedback':
        return <FeedbackPage user={user} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} setShowLoginModal={setShowLoginModal} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        setCurrentPage={setCurrentPage}
        setShowLoginModal={setShowLoginModal}
        setShowSignupModal={setShowSignupModal}
        handleLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <main>
        {renderCurrentPage()}
      </main>
      
      <Footer setCurrentPage={setCurrentPage} />
      
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          openSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
        />
      )}
      
      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onSignup={handleSignup}
          openLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
}

export default CharityDonationApp;
