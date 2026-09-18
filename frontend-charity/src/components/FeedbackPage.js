import React, { useState } from 'react';

const API_BASE = 'http://localhost:8000/api';

export default function FeedbackPage({ user }) {
  const [feedback, setFeedback] = useState({
    rating: 5,
    category: 'general',
    message: '',
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      // Send name/email along with feedback so admin can identify submitter
      const payload = {
        rating: feedback.rating,
        category: feedback.category,
        message: feedback.message,
        name: feedback.name,
        email: feedback.email
      };

      const response = await fetch(`${API_BASE}/admin/feedback/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      setFeedback({ rating: 5, category: 'general', message: '', name: '', email: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Error submitting feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-100 to-orange-200 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Share Your Feedback</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 mb-6">
            We value your opinion! Please share your experience with CharityConnect to help us improve.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Thank you for your feedback! We appreciate your input.
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-semibold">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedback({ ...feedback, rating: star })}
                    className="text-3xl focus:outline-none"
                  >
                    {star <= feedback.rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-semibold">Category</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={feedback.category}
                onChange={(e) => setFeedback({ ...feedback, category: e.target.value })}
              >
                <option value="general">General Feedback</option>
                <option value="donation">Donation Process</option>
                <option value="ngo">NGO Experience</option>
                <option value="website">Website Usability</option>
                <option value="support">Customer Support</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-semibold">Your Feedback</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="6"
                value={feedback.message}
                onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                placeholder="Tell us about your experience..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-semibold">Your Name (optional)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={feedback.name}
                onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-semibold">Your Email (optional)</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={feedback.email}
                onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
