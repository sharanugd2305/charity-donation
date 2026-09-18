import React from 'react';
import { Users, TrendingUp, Award } from 'lucide-react';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="text-center p-6 rounded-lg hover:shadow-lg transition">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="text-4xl font-bold text-red-500 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

function StepCard({ step, title, description }) {
  return (
    <div className="text-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
      <div className="flex justify-center mb-4">
        <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
          {step}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function HomePage({ isLoggedIn, setCurrentPage, setShowLoginModal }) {
  const bgImage = '/images/bg.jpg';

  return (
    <div>
      {/* 🔥 HERO SECTION WITH BACKGROUND IMAGE */}
      <div
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`, // 👈 Background image here
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-white opacity-20"></div>

        {/* Text Content */}
        <div className="relative z-10 text-center text-white px-4 animate-pulse">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Make a Difference Today</h1>
          <p className="text-xl md:text-2xl mb-8">
            Your donation can change lives. Join us in making the world a better place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { if (!isLoggedIn) setShowLoginModal(true); else setCurrentPage('ngos'); }}
              className="bg-white text-red-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
            >
              Donate Now
            </button>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-red-500 transition transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-12 w-12 text-red-500" />}
              title="Trusted NGOs"
              description="We partner with verified and trusted NGOs to ensure your donations reach the right people."
            />
            <FeatureCard
              icon={<TrendingUp className="h-12 w-12 text-red-500" />}
              title="Track Impact"
              description="Monitor how your donations are being used and see the real impact you're making."
            />
            <FeatureCard
              icon={<Award className="h-12 w-12 text-red-500" />}
              title="Transparent Process"
              description="Complete transparency in donation tracking and fund distribution."
            />
          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              title="Choose an NGO"
              description="Browse and select from our list of verified NGOs that align with your values."
            />
            <StepCard
              step="2"
              title="Make a Donation"
              description="Contribute securely through our platform with multiple payment options."
            />
            <StepCard
              step="3"
              title="Track Your Impact"
              description="Monitor how your donation is making a difference in real-time."
            />
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <StatCard number="50+" label="NGO Partners" />
            <StatCard number="100+" label="Donors" />
            <StatCard number="₹50L+" label="Donated" />
            <StatCard number="1,000+" label="Lives Changed" />
          </div>
        </div>
      </div>

      {/* CALL TO ACTION SECTION */}
      <div className="py-20 bg-red-500 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8">Join thousands of donors who are changing lives every day.</p>
          <button
            onClick={() => { if (!isLoggedIn) setShowLoginModal(true); else setCurrentPage('ngos'); }}
            className="bg-white text-red-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
          >
            Start Donating Now
          </button>
        </div>
      </div>
    </div>
  );
}
