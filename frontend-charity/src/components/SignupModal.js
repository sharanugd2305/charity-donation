import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import './SignupModal.css';
import { API_ENDPOINTS } from '../config/api';

export default function SignupModal({ onClose, onSignup, openLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.endsWith('@gmail.com')) {
      setError('Please use a Gmail address (e.g., example@gmail.com).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.name, // Use name as username
          name: formData.name, // Full name
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error('Failed to parse JSON response:', jsonErr);
        setError(`Server error: ${response.status} ${response.statusText}`);
        return;
      }

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        onSignup(data.user);
      } else {
        console.error('Signup error:', data);
        setError(data.error || data.message || `Signup failed: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Network or other error:', err);
      setError(`Signup failed: ${err.message || 'Network error. Please check if the server is running.'}`);
    }
  };

  return (
    <div className="signup-modal-overlay">
      <div className="signup-modal-content">
        <button onClick={onClose} className="signup-modal-close">
          <X className="h-6 w-6" />
        </button>

        <h2 className="signup-modal-title">Create Your Account</h2>

        {error && <div className="signup-modal-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="signup-modal-form-group">
            <label className="signup-modal-label">Full Name</label>
            <input
              type="text"
              className="signup-modal-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="signup-modal-form-group">
            <label className="signup-modal-label">Email</label>
            <input
              type="email"
              className="signup-modal-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="signup-modal-form-group">
            <label className="signup-modal-label">Phone</label>
            <input
              type="tel"
              className="signup-modal-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="signup-modal-form-group">
            <label className="signup-modal-label">Password</label>
            <div className="signup-modal-password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                className="signup-modal-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="signup-modal-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="signup-modal-form-group">
            <label className="signup-modal-label">Confirm Password</label>
            <div className="signup-modal-password-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="signup-modal-input"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
              <button
                type="button"
                className="signup-modal-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button type="submit" className="signup-modal-submit">
            Sign Up
          </button>
        </form>

        <p className="signup-modal-footer">
          Already have an account?{' '}
          <button onClick={openLogin} className="signup-modal-link">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
