import React, { useState, useEffect, useCallback } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedContactDetail, setSelectedContactDetail] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [userPage, setUserPage] = useState(1);
  const [donationPage, setDonationPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [contactPage, setContactPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [donationSearch, setDonationSearch] = useState('');
  const [donationStatus, setDonationStatus] = useState('');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');

  const token = localStorage.getItem('authToken');
  const API_BASE = 'http://localhost:8000/api';

  const formatTimestamp = (obj) => {
    // prefer unix ms, then iso, then legacy timestamp string
    const maybe = obj?.timestamp_ms || obj?.login_time_ms || obj?.login_ms || obj?.timestamp_iso || obj?.login_time_iso || obj?.timestamp || obj?.login_time || null;
    const ms = parseToMillis(maybe);
    return ms ? formatDateTime(ms) : '';
  };

  // normalize different timestamp formats (seconds, ms, numeric strings, ISO strings)
  const parseToMillis = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') {
      // if looks like seconds (10 digits), convert to ms
      return value < 1e11 ? value * 1000 : value;
    }
    const asNum = Number(value);
    if (!Number.isNaN(asNum)) {
      return asNum < 1e11 ? asNum * 1000 : asNum;
    }
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
    return null;
  };

  const formatDate = (val) => {
    const ms = typeof val === 'number' ? val : parseToMillis(val);
    if (!ms) return '';
    try {
      return new Date(ms).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    } catch (e) {
      return new Date(ms).toLocaleDateString();
    }
  };

  const formatDateTime = (val) => {
    const ms = typeof val === 'number' ? val : parseToMillis(val);
    if (!ms) return '';
    try {
      return new Date(ms).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    } catch (e) {
      return new Date(ms).toLocaleString();
    }
  };

  const formatRelativeTime = (obj) => {
    const ms = obj?.timestamp_ms || obj?.login_time_ms || obj?.login_ms || null;
    let t = null;
    if (ms) t = ms;
    else if (obj?.timestamp_iso) t = Date.parse(obj.timestamp_iso);
    else if (obj?.login_time_iso) t = Date.parse(obj.login_time_iso);
    else if (obj?.timestamp) t = Date.parse(obj.timestamp);
    else if (obj?.login_time) t = Date.parse(obj.login_time);
    if (!t || Number.isNaN(t)) return '';

    const diffMs = Date.now() - t;
    if (diffMs < 5000) return 'just now';
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/stats/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  const fetchUsers = useCallback(async (page, search) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, search });
      const response = await fetch(`${API_BASE}/admin/users/?${params}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  const fetchDonations = useCallback(async (page, search, statusFilter) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, search, status: statusFilter });
      const response = await fetch(`${API_BASE}/admin/donations/?${params}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch donations');
      const data = await response.json();
      setDonations(data);
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  const fetchActivities = useCallback(async (page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page });
      const response = await fetch(`${API_BASE}/admin/activities/?${params}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/analytics/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  const fetchFeedbacks = useCallback(async (page, search) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, search });
      const response = await fetch(`${API_BASE}/admin/feedback/?${params}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch feedbacks');
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  const fetchContacts = useCallback(async (page, search) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, search });
      const response = await fetch(`${API_BASE}/admin/contact/?${params}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  useEffect(() => {
    if (!token) {
      setError('Please log in as admin to access this dashboard');
      return;
    }
    fetchStats();
  }, [token, fetchStats]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers(userPage, userSearch);
  }, [activeTab, userPage, userSearch, fetchUsers]);

  useEffect(() => {
    if (activeTab === 'donations') fetchDonations(donationPage, donationSearch, donationStatus);
  }, [activeTab, donationPage, donationSearch, donationStatus, fetchDonations]);

  useEffect(() => {
    if (activeTab === 'activities') fetchActivities(activityPage);
  }, [activeTab, activityPage, fetchActivities]);

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab, fetchAnalytics]);

  useEffect(() => {
    if (activeTab === 'feedback') fetchFeedbacks(feedbackPage, feedbackSearch);
  }, [activeTab, feedbackPage, feedbackSearch, fetchFeedbacks]);

  useEffect(() => {
    if (activeTab === 'contact') fetchContacts(contactPage, contactSearch);
  }, [activeTab, contactPage, contactSearch, fetchContacts]);

  const updateDonationStatus = async (donationId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/admin/donations/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: donationId, status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update donation');
      await fetchDonations(donationPage, donationSearch, donationStatus);
    } catch (err) {
      console.error('Error updating donation:', err);
      alert('Failed to update donation status');
    }
  };

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-gray-600 mb-2">Total Users</div>
              <div className="text-3xl font-bold text-blue-500">{stats.total_users}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-gray-600 mb-2">Total Donations</div>
              <div className="text-3xl font-bold text-green-500">{stats.total_donations}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-gray-600 mb-2">Total Amount</div>
              <div className="text-3xl font-bold text-red-500">₹{(stats.total_amount / 100000).toFixed(2)}L</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-gray-600 mb-2">Active NGOs</div>
              <div className="text-3xl font-bold text-purple-500">{stats.unique_ngos}</div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'donations' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
              >
                Donations
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'activities' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
              >
                Activities
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'analytics' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'feedback' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
              >
                Feedback
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'contact' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
              >
                Contact
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'overview' && stats && (
              <div>
                <h3 className="text-xl font-bold mb-4">Dashboard Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Donation Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-semibold text-green-600">{stats.completed_donations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span className="font-semibold text-yellow-600">{stats.pending_donations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Unique Campaigns:</span>
                        <span className="font-semibold">{stats.unique_campaigns}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Recent Activities</h4>
                    <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                      {stats.recent_activities.map((activity) => (
                        <div key={activity.id} className="border-b pb-2 last:border-b-0">
                          <p className="font-semibold">{activity.user}</p>
                          <p className="text-gray-600">{activity.activity_type}</p>
                          <p className="text-xs text-gray-400">
                            {formatRelativeTime(activity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'users' && (
              <div>
                <h3 className="text-xl font-bold mb-4">User Management</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search users by name, email, or username..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : users.users && users.users.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Username</th>
                            <th className="px-4 py-3 text-left font-semibold">Email</th>
                            <th className="px-4 py-3 text-left font-semibold">Name</th>
                            <th className="px-4 py-3 text-left font-semibold">Donations</th>
                            <th className="px-4 py-3 text-left font-semibold">Joined</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3">{user.username}</td>
                              <td className="px-4 py-3">{user.email}</td>
                              <td className="px-4 py-3">{user.name}</td>
                              <td className="px-4 py-3">{user.donation_count}</td>
                              <td className="px-4 py-3">{formatDate(user.date_joined)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-gray-600">Page {users.page} of {Math.ceil(users.total / users.per_page)}</span>
                      <div className="space-x-2">
                        <button
                          onClick={() => setUserPage(Math.max(1, userPage - 1))}
                          disabled={userPage === 1}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setUserPage(userPage + 1)}
                          disabled={userPage >= Math.ceil(users.total / users.per_page)}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-600">No users found</div>
                )}
              </div>
            )}
            
            {activeTab === 'donations' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Donation Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Search donations..."
                    value={donationSearch}
                    onChange={(e) => {
                      setDonationSearch(e.target.value);
                      setDonationPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                  <select
                    value={donationStatus}
                    onChange={(e) => {
                      setDonationStatus(e.target.value);
                      setDonationPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : donations.donations && donations.donations.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Donor</th>
                            <th className="px-4 py-3 text-left font-semibold">NGO</th>
                            <th className="px-4 py-3 text-left font-semibold">Campaign</th>
                            <th className="px-4 py-3 text-left font-semibold">Amount</th>
                            <th className="px-4 py-3 text-left font-semibold">Type</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations.donations.map((donation) => (
                            <tr key={donation.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3">{donation.user}</td>
                              <td className="px-4 py-3">{donation.ngo_name}</td>
                              <td className="px-4 py-3">{donation.campaign_name}</td>
                              <td className="px-4 py-3">₹{donation.amount ? donation.amount.toLocaleString() : 'N/A'}</td>
                              <td className="px-4 py-3">{donation.donation_type}</td>
                              <td className="px-4 py-3">
                                <select
                                  value={donation.status}
                                  onChange={(e) => updateDonationStatus(donation.id, e.target.value)}
                                  className={`px-2 py-1 rounded text-xs font-semibold border-0 cursor-pointer ${
                                    donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => alert(`Transaction ID: ${donation.transaction_id}`)}
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-gray-600">Page {donations.page} of {Math.ceil(donations.total / donations.per_page)}</span>
                      <div className="space-x-2">
                        <button
                          onClick={() => setDonationPage(Math.max(1, donationPage - 1))}
                          disabled={donationPage === 1}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setDonationPage(donationPage + 1)}
                          disabled={donationPage >= Math.ceil(donations.total / donations.per_page)}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-600">No donations found</div>
                )}
              </div>
            )}
            
            {activeTab === 'activities' && (
              <div>
                <h3 className="text-xl font-bold mb-4">User Activities</h3>
                
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : activities.activities && activities.activities.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {activities.activities.map((activity) => (
                        <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-800">{activity.user}</p>
                              <p className="text-sm text-gray-600 capitalize">{activity.activity_type}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatRelativeTime(activity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-gray-600">Page {activities.page} of {Math.ceil(activities.total / activities.per_page)}</span>
                      <div className="space-x-2">
                        <button
                          onClick={() => setActivityPage(Math.max(1, activityPage - 1))}
                          disabled={activityPage === 1}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setActivityPage(activityPage + 1)}
                          disabled={activityPage >= Math.ceil(activities.total / activities.per_page)}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-600">No activities found</div>
                )}
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Analytics & Reports</h3>
                
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : analytics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Top 10 NGOs by Donations</h4>
                      <div className="space-y-3">
                        {analytics.top_ngos.map((ngo, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="truncate">{ngo.ngo}</span>
                              <span className="font-semibold">₹{(ngo.amount / 100000).toFixed(2)}L</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{
                                  width: `${(ngo.amount / Math.max(...analytics.top_ngos.map(n => n.amount))) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Donation Types Distribution</h4>
                      <div className="space-y-3">
                        {analytics.donation_types.map((type, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{type.type}</span>
                              <span className="font-semibold">₹{type.amount.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${(type.amount / Math.max(...analytics.donation_types.map(t => t.amount))) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 md:col-span-2">
                      <h4 className="font-semibold mb-3">User Activity Breakdown</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(analytics.activity_breakdown).map(([activity, count]) => (
                          <div key={activity} className="border rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-red-500">{count}</p>
                            <p className="text-xs text-gray-600 capitalize">{activity.replace('_', ' ')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-600">No analytics available</div>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div>
                <h3 className="text-xl font-bold mb-4">User Feedback</h3>
                
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : feedbacks.feedbacks && feedbacks.feedbacks.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Rating</th>
                            <th className="px-4 py-2 text-left">Category</th>
                            <th className="px-4 py-2 text-left">Message</th>
                            <th className="px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feedbacks.feedbacks.map((feedback) => (
                            <tr
                              key={feedback.id}
                              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                              onClick={() => { setSelectedFeedback(feedback); setFeedbackModalOpen(true); }}
                            >
                              <td className="px-4 py-2">{feedback.user_name}</td>
                              <td className="px-4 py-2">{feedback.user_email}</td>
                              <td className="px-4 py-2">
                                <span className="text-yellow-500">{'⭐'.repeat(feedback.rating)}</span>
                              </td>
                              <td className="px-4 py-2 capitalize">{feedback.category}</td>
                              <td className="px-4 py-2 max-w-xs truncate">{feedback.message}</td>
                              <td className="px-4 py-2 text-xs text-gray-600">
                                {formatDate(feedback.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {feedbacks.total_pages > 1 && (
                      <div className="mt-4 flex justify-center gap-2">
                        <button
                          onClick={() => setFeedbackPage(Math.max(1, feedbackPage - 1))}
                          disabled={feedbackPage === 1}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2">
                          Page {feedbackPage} of {feedbacks.total_pages}
                        </span>
                        <button
                          onClick={() => setFeedbackPage(feedbackPage + 1)}
                          disabled={feedbackPage >= feedbacks.total_pages}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-600">No feedback found</div>
                )}
              </div>
            )}

            {activeTab === 'contact' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Contact Messages</h3>
                
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : contacts.contacts && contacts.contacts.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {contacts.contacts.map((contact) => (
                        <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{contact.subject}</h4>
                              <p className="text-sm text-gray-600">{contact.name} &lt;{contact.email}&gt;</p>
                            </div>
                                <span className="text-xs text-gray-400">
                                  {formatDate(contact.created_at)}
                                </span>
                          </div>
                          <p className="text-gray-700 mb-3">{contact.message}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedContactDetail(contact); setContactModalOpen(true); }}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg"
                            >
                              Open
                            </button>
                            {contact.response && (
                              <div className="bg-green-50 border border-green-200 rounded p-3">
                                <p className="text-sm font-semibold text-green-800 mb-1">Response:</p>
                                <p className="text-sm text-green-700">{contact.response}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {contacts.total_pages > 1 && (
                      <div className="mt-4 flex justify-center gap-2">
                        <button
                          onClick={() => setContactPage(Math.max(1, contactPage - 1))}
                          disabled={contactPage === 1}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2">
                          Page {contactPage} of {contacts.total_pages}
                        </span>
                        <button
                          onClick={() => setContactPage(contactPage + 1)}
                          disabled={contactPage >= contacts.total_pages}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-600">No contact messages found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Feedback Modal */}
      {feedbackModalOpen && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-11/12 md:w-2/3 lg:w-1/2 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Feedback from {selectedFeedback.user_name || 'Anonymous'}</h3>
                <p className="text-sm text-gray-600">{selectedFeedback.user_email}</p>
              </div>
              <button onClick={() => setFeedbackModalOpen(false)} className="text-gray-500">Close</button>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-700 mb-3"><strong>Category:</strong> {selectedFeedback.category}</div>
              <div className="text-sm text-gray-700 mb-3"><strong>Rating:</strong> {'⭐'.repeat(selectedFeedback.rating)}</div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap border p-4 rounded bg-gray-50">{selectedFeedback.message}</div>
              <div className="mt-4 text-xs text-gray-500">Submitted at: {formatDateTime(selectedFeedback.created_at)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactModalOpen && selectedContactDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-11/12 md:w-2/3 lg:w-1/2 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Contact from {selectedContactDetail.name}</h3>
                <p className="text-sm text-gray-600">{selectedContactDetail.email}</p>
              </div>
              <button onClick={() => setContactModalOpen(false)} className="text-gray-500">Close</button>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-700 mb-3"><strong>Subject:</strong> {selectedContactDetail.subject}</div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap border p-4 rounded bg-gray-50">{selectedContactDetail.message}</div>
              {selectedContactDetail.response && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm font-semibold text-green-800 mb-1">Response:</p>
                  <p className="text-sm text-green-700">{selectedContactDetail.response}</p>
                </div>
              )}
              <div className="mt-4 text-xs text-gray-500">Submitted at: {formatDateTime(selectedContactDetail.created_at)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
