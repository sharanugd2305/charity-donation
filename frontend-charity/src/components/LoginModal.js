import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import './LoginModal.css';
import { API_ENDPOINTS } from '../config/api';

export default function LoginModal({ onClose, onLogin, openSignup }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.endsWith('@gmail.com')) {
      setError('Please use a Gmail address (e.g., example@gmail.com).');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email, // Backend now accepts email
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
        onLogin(data.user);
      } else {
        console.error('Login error:', data);
        setError(data.error || data.message || `Login failed: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Network or other error:', err);
      setError(`Login failed: ${err.message || 'Network error. Please check if the server is running.'}`);
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        <button onClick={onClose} className="login-modal-close">
          <X className="h-6 w-6" />
        </button>

        <h2 className="login-modal-title">Login to Your Account</h2>

        {error && <div className="login-modal-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-modal-form-group">
            <label className="login-modal-label">Email</label>
            <input
              type="email"
              className="login-modal-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="login-modal-form-group">
            <label className="login-modal-label">Password</label>
            <div className="login-modal-password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-modal-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="login-modal-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-modal-submit">
            Login
          </button>
        </form>

        <p className="login-modal-footer">
          Don't have an account?{' '}
          <button onClick={openSignup} className="login-modal-link">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
