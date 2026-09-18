import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-blue-200 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">About CharityConnect</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">Our Mission</h2>
          <p className="text-[#2c3e50] mb-4">
            CharityConnect is dedicated to bridging the gap between generous donors and trustworthy NGOs.
            We believe that every act of kindness, no matter how small, can create ripples of positive change
            in our communities.
          </p>
          <p className="text-[#2c3e50]">
            Our platform ensures transparency, accountability, and ease of donation, making it simple for
            people to support causes they care about while tracking the real impact of their contributions.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-[#3498db] mb-4">What We Do</h2>
          <ul className="space-y-3 text-[#3498db]">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Connect donors with verified and trusted NGOs across India</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Provide complete transparency in fund distribution and usage</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Enable multiple donation types including money, clothes, and food</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Track and showcase the real impact of every donation</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Support various causes including education, healthcare, and hunger relief</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-[#e67e22] mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-2">💯</div>
              <h3 className="font-semibold mb-2">Transparency</h3>
              <p className="text-sm text-gray-600">Complete visibility into where your donations go</p>
            </div>
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-2">🤝</div>
              <h3 className="font-semibold mb-2">Trust</h3>
              <p className="text-sm text-gray-600">Working only with verified NGOs</p>
            </div>
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-2">💪</div>
              <h3 className="font-semibold mb-2">Impact</h3>
              <p className="text-sm text-gray-600">Making measurable difference in lives</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
