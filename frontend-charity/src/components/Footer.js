import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer({ setCurrentPage }) {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="ml-2 text-xl font-bold">CharityConnect</span>
            </div>
            <p className="text-gray-400">Making a difference, one donation at a time.</p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentPage('home')} className="text-gray-400 hover:text-white">Home</button></li>
              <li><button onClick={() => setCurrentPage('ngos')} className="text-gray-400 hover:text-white">NGOs</button></li>
              <li><button onClick={() => setCurrentPage('about')} className="text-gray-400 hover:text-white">About</button></li>
              <li><button onClick={() => setCurrentPage('contact')} className="text-gray-400 hover:text-white">Contact</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentPage('feedback')} className="text-gray-400 hover:text-white">Feedback</button></li>
              <li><button className="text-gray-400 hover:text-white">FAQ</button></li>
              <li><button className="text-gray-400 hover:text-white">Privacy Policy</button></li>
              <li><button className="text-gray-400 hover:text-white">Terms of Service</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-white" aria-label="Facebook">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button className="text-gray-400 hover:text-white" aria-label="Twitter">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button className="text-gray-400 hover:text-white" aria-label="Instagram">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C8.396 0 7.917.017 6.69.08c-1.23.063-2.067.265-2.8.567a5.44 5.44 0 00-1.96 1.275 5.44 5.44 0 00-1.275 1.96c-.302.733-.504 1.57-.567 2.8C.017 7.917 0 8.396 0 12.017s.017 4.1.08 5.327c.063 1.23.265 2.067.567 2.8a5.44 5.44 0 001.275 1.96 5.44 5.44 0 001.96 1.275c.733.302 1.57.504 2.8.567 1.227.063 1.706.08 5.327.08s4.1-.017 5.327-.08c1.23-.063 2.067-.265 2.8-.567a5.44 5.44 0 001.96-1.275 5.44 5.44 0 001.275-1.96c.302-.733.504-1.57.567-2.8.063-1.227.08-1.706.08-5.327s-.017-4.1-.08-5.327c-.063-1.23-.265-2.067-.567-2.8a5.44 5.44 0 00-1.275-1.96 5.44 5.44 0 00-1.96-1.275c-.733-.302-1.57-.504-2.8-.567C16.117.017 15.638 0 12.017 0zm0 2.25c3.537 0 3.957.013 5.357.073 1.32.058 2.04.28 2.51.467a3.19 3.19 0 011.15.745 3.19 3.19 0 01.745 1.15c.187.47.409 1.19.467 2.51.06 1.4.073 1.82.073 5.357s-.013 3.957-.073 5.357c-.058 1.32-.28 2.04-.467 2.51a3.19 3.19 0 01-.745 1.15 3.19 3.19 0 01-1.15.745c-.47.187-1.19.409-2.51.467-1.4.06-1.82.073-5.357.073s-3.957-.013-5.357-.073c-1.32-.058-2.04-.28-2.51-.467a3.19 3.19 0 01-1.15-.745 3.19 3.19 0 01-.745-1.15c-.187-.47-.409-1.19-.467-2.51-.06-1.4-.073-1.82-.073-5.357s.013-3.957.073-5.357c.058-1.32.28-2.04.467-2.51a3.19 3.19 0 01.745-1.15 3.19 3.19 0 011.15-.745c.47-.187 1.19-.409 2.51-.467 1.4-.06 1.82-.073 5.357-.073zm0 2.25a9.767 9.767 0 100 19.534 9.767 9.767 0 000-19.534zm0 2.25a7.517 7.517 0 110 15.034 7.517 7.517 0 010-15.034zm8.25 1.5a1.75 1.75 0 11-3.5 0 1.75 1.75 0 013.5 0z"/>
                </svg>
              </button>
              <button className="text-gray-400 hover:text-white" aria-label="LinkedIn">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 CharityConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
