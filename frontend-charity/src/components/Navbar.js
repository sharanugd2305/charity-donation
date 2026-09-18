import React from 'react';
import { Menu, Heart, User, LogOut } from 'lucide-react';

export default function Navbar({ isLoggedIn, user, setCurrentPage, setShowLoginModal, setShowSignupModal, handleLogout, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => setCurrentPage('home')}>
            <div className="p-2 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <span className="ml-3 text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              CharityConnect
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'NGO Organizations', 'About', 'Contact', 'Feedback'].map((item) => (
              <button 
                key={item}
                onClick={() => {
                  if (item === 'NGO Organizations') {
                    if (!isLoggedIn) setShowLoginModal(true);
                    else setCurrentPage('ngos');
                  } else {
                    setCurrentPage(item.toLowerCase().split(' ')[0]);
                  }
                }}
                className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors relative group"
              >
                {item}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </button>
            ))}
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                <button 
                  onClick={() => setCurrentPage('dashboard')} 
                  className="flex items-center px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  Dashboard
                </button>
                {user?.role === 'admin' && (
                  <button onClick={() => setCurrentPage('admin')} className="text-gray-600 hover:text-red-600 font-bold text-sm">Admin</button>
                )}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                <button onClick={() => setShowLoginModal(true)} className="text-sm font-bold text-gray-700 hover:text-gray-900">Login</button>
                <button 
                  onClick={() => setShowSignupModal(true)} 
                  className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
          
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 bg-white border-t border-gray-100 animate-fadeIn">
            <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 hover:text-red-600 rounded-lg">Home</button>
            <button onClick={() => { if (!isLoggedIn) { setShowLoginModal(true); setMobileMenuOpen(false); } else { setCurrentPage('ngos'); setMobileMenuOpen(false); } }} className="block w-full text-left px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 hover:text-red-600 rounded-lg">NGO Organizations</button>
            <button onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 hover:text-red-600 rounded-lg">About</button>
            <button onClick={() => { setCurrentPage('contact'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 hover:text-red-600 rounded-lg">Contact</button>
            <button onClick={() => { setCurrentPage('feedback'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 hover:text-red-600 rounded-lg">Feedback</button>
            {isLoggedIn ? (
              <div className="pt-2 mt-2 border-t border-gray-100 space-y-2">
                <button onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-lg flex items-center">
                  <User className="h-4 w-4 mr-2" /> Dashboard
                </button>
                {user?.role === 'admin' && (
                  <button onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">Admin</button>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg flex items-center">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 mt-2 border-t border-gray-100 px-4 space-y-3">
                <button onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }} className="block w-full text-center px-4 py-3 text-gray-700 font-bold border border-gray-200 rounded-xl hover:bg-gray-50">Login</button>
                <button onClick={() => { setShowSignupModal(true); setMobileMenuOpen(false); }} className="block w-full text-center px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg">Sign Up</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
