import React, { useState, useEffect } from "react";
import {
  HeartHandshake,
  Activity,
  User,
  Gift,
  MapPin,
  Phone,
  Mail,
  Save,
  Download,
  TrendingUp,
  Clock,
  Calendar,
  Shield
} from "lucide-react";
import './UserDashboard.css';
import { API_ENDPOINTS } from '../config/api';
// eslint-disable-next-line no-unused-vars
import jsPDF from 'jspdf';

export default function UserDashboard({ user, setCurrentPage }) {
  const [activeTab, setActiveTab] = useState("donations");
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDonated, setTotalDonated] = useState(0);
  const [impactData, setImpactData] = useState(null);

  const [profile, setProfile] = useState({
    name: user?.name || (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.first_name || user?.last_name || user?.username || ""),
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchDonations();
      await fetchImpact();
      await fetchProfile();
    };
    loadData();
    
    // Listen for refresh events (e.g., after donation)
    const handleRefresh = () => {
      loadData();
    };
    
    // Listen for custom refresh event
    window.addEventListener('dashboard-refresh', handleRefresh);
    
    // Also refresh when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('dashboard-refresh', handleRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]); // Refresh when user changes

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.donations, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      const data = await response.json();
      console.log('Donations API response:', data); // Debug log
      console.log('Response status:', response.status); // Debug log

      if (response.ok) {
        // Handle both array and object response formats
        const donationsList = Array.isArray(data) ? data : (data.donations || data || []);
        console.log('Processed donations list:', donationsList); // Debug log
        console.log('Number of donations:', donationsList.length); // Debug log
        
        setDonations(donationsList);
        
        // Calculate total donated amount - only count money donations with valid amounts
        const total = donationsList.reduce((sum, donation) => {
          if (donation.donation_type === 'money' && donation.amount) {
            const amount = parseFloat(donation.amount);
            if (!isNaN(amount) && amount > 0) {
              return sum + amount;
            }
          }
          return sum;
        }, 0);
        
        setTotalDonated(total);
        console.log('Total donated calculated:', total, 'from', donationsList.length, 'donations'); // Debug log
      } else {
        console.error('Error fetching donations:', data);
        setDonations([]);
        setTotalDonated(0);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImpact = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return;
      }

      const response = await fetch(API_ENDPOINTS.impact, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      const data = await response.json();
      console.log('Impact API response:', data); // Debug log

      if (response.ok) {
        setImpactData(data);
      } else {
        console.error('Error fetching impact data:', data);
        // Keep impactData as null to use fallbacks
      }
    } catch (error) {
      console.error('Error fetching impact data:', error);
      // Keep impactData as null to use fallbacks
    }
  };

  // Calculate personalized fund distribution based on user's donations
  const calculateFundDistribution = () => {
    if (!donations || donations.length === 0) {
      return [
        { category: "Education", percentage: 0, amount: 0 },
        { category: "Food", percentage: 0, amount: 0 },
        { category: "Healthcare", percentage: 0, amount: 0 },
        { category: "Disaster Relief", percentage: 0, amount: 0 },
        { category: "Environment", percentage: 0, amount: 0 },
        { category: "Other", percentage: 0, amount: 0 },
      ];
    }

    // Group donations by category and calculate totals
    const categoryTotals = {};
    let totalAmount = 0;

    donations.forEach(donation => {
      // Only process money donations with valid amounts for fund distribution
      if (donation.donation_type === 'money' && donation.amount && donation.amount > 0) {
        // Extract category from campaign name, NGO name, or donation type
        let category = "Other";
        const campaignName = (donation.campaign || donation.campaign_name || "").toLowerCase();
        const ngoName = (donation.ngo || donation.ngo_name || "").toLowerCase();
        const combinedText = `${campaignName} ${ngoName}`;

        if (combinedText.includes("education") || combinedText.includes("school") || combinedText.includes("student") || combinedText.includes("learn")) {
          category = "Education";
        } else if (combinedText.includes("food") || combinedText.includes("hunger") || combinedText.includes("meal") || combinedText.includes("nutrition")) {
          category = "Food";
        } else if (combinedText.includes("health") || combinedText.includes("medical") || combinedText.includes("hospital") || combinedText.includes("clinic")) {
          category = "Healthcare";
        } else if (combinedText.includes("disaster") || combinedText.includes("relief") || combinedText.includes("flood") || combinedText.includes("earthquake") || combinedText.includes("emergency")) {
          category = "Disaster Relief";
        } else if (combinedText.includes("environment") || combinedText.includes("tree") || combinedText.includes("green") || combinedText.includes("climate") || combinedText.includes("nature")) {
          category = "Environment";
        }

        categoryTotals[category] = (categoryTotals[category] || 0) + donation.amount;
        totalAmount += donation.amount;
      }
    });

    // Convert to percentage distribution
    const distribution = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
      amount
    }));

    // Add categories with 0% if not present
    const allCategories = ["Education", "Food", "Healthcare", "Disaster Relief", "Environment", "Other"];
    allCategories.forEach(cat => {
      if (!distribution.find(d => d.category === cat)) {
        distribution.push({ category: cat, percentage: 0, amount: 0 });
      }
    });

    return distribution.sort((a, b) => b.percentage - a.percentage);
  };

  // Generate personalized recent updates based on user's donations
  const generateRecentUpdates = () => {
    if (!donations || donations.length === 0) {
      return [
        {
          text: "Your donations are making a difference in communities worldwide",
          time: "Ongoing",
          icon: "🌍",
        },
        {
          text: "NGOs are actively using your contributions",
          time: "This week",
          icon: "🤝",
        },
      ];
    }

    const updates = [];
    const now = new Date();

    // Generate updates based on donation categories
    const categoryUpdates = {
      "Education": [
        "New classrooms built with your contribution",
        "Educational materials distributed to students",
        "Scholarships awarded to deserving students"
      ],
      "Food": [
        "Meals served to families in need",
        "Food packages distributed to communities",
        "Nutrition programs expanded"
      ],
      "Healthcare": [
        "Medical treatments provided",
        "Health camps organized",
        "Medical equipment purchased"
      ],
      "Disaster Relief": [
        "Emergency aid distributed to affected families",
        "Relief camps established",
        "Reconstruction efforts underway"
      ],
      "Environment": [
        "Trees planted in deforested areas",
        "Environmental cleanup completed",
        "Conservation programs supported"
      ],
      "Other": [
        "Community development projects completed",
        "Social welfare programs expanded",
        "Various charitable activities supported"
      ]
    };

    // Create updates for each donation
    donations.slice(0, 5).forEach((donation, index) => {
      // Parse date safely
      let donationDate;
      if (donation.date) {
        // Handle YYYY-MM-DD format
        if (typeof donation.date === 'string' && donation.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          donationDate = new Date(donation.date + 'T00:00:00');
        } else {
          donationDate = new Date(donation.date);
        }
      } else if (donation.created_at) {
        donationDate = new Date(donation.created_at);
      } else {
        donationDate = now; // Fallback to current date
      }

      // Check if date is valid
      if (isNaN(donationDate.getTime())) {
        donationDate = now;
      }

      const daysDiff = Math.floor((now - donationDate) / (1000 * 60 * 60 * 24));

      let timeAgo = "Recently";
      if (daysDiff < 0) timeAgo = "Recently";
      else if (daysDiff === 0) timeAgo = "Today";
      else if (daysDiff === 1) timeAgo = "Yesterday";
      else if (daysDiff < 7) timeAgo = `${daysDiff} days ago`;
      else if (daysDiff < 30) timeAgo = `${Math.floor(daysDiff / 7)} weeks ago`;
      else if (daysDiff < 365) timeAgo = `${Math.floor(daysDiff / 30)} months ago`;
      else timeAgo = `${Math.floor(daysDiff / 365)} years ago`;

      // Determine category - check both campaign and NGO names
      let category = "Other";
      const campaignName = (donation.campaign || donation.campaign_name || "").toLowerCase();
      const ngoName = (donation.ngo || donation.ngo_name || "").toLowerCase();
      const combinedText = `${campaignName} ${ngoName}`;

      if (combinedText.includes("education") || combinedText.includes("school") || combinedText.includes("student") || combinedText.includes("learn")) {
        category = "Education";
      } else if (combinedText.includes("food") || combinedText.includes("hunger") || combinedText.includes("meal") || combinedText.includes("nutrition")) {
        category = "Food";
      } else if (combinedText.includes("health") || combinedText.includes("medical") || combinedText.includes("hospital") || combinedText.includes("clinic")) {
        category = "Healthcare";
      } else if (combinedText.includes("disaster") || combinedText.includes("relief") || combinedText.includes("flood") || combinedText.includes("earthquake") || combinedText.includes("emergency")) {
        category = "Disaster Relief";
      } else if (combinedText.includes("environment") || combinedText.includes("tree") || combinedText.includes("green") || combinedText.includes("climate") || combinedText.includes("nature")) {
        category = "Environment";
      }

      const updateTexts = categoryUpdates[category] || categoryUpdates["Other"];
      const randomUpdate = updateTexts[Math.floor(Math.random() * updateTexts.length)];

      // Get campaign name with fallback
      const campaignDisplayName = donation.campaign || donation.campaign_name || "Campaign";

      updates.push({
        text: `${randomUpdate} - ${campaignDisplayName}`,
        time: timeAgo,
        icon: category === "Education" ? "📚" :
              category === "Food" ? "🍽️" :
              category === "Healthcare" ? "🏥" :
              category === "Disaster Relief" ? "🚨" :
              category === "Environment" ? "🌱" : "🤝"
      });
    });

    // Add some general impact updates
    updates.push({
      text: `Your total contribution of ₹${totalDonated.toLocaleString()} has helped ${donations.length} campaigns`,
      time: "Overall Impact",
      icon: "📊"
    });

    return updates.slice(0, 8);
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return;
      }

      const response = await fetch(API_ENDPOINTS.userProfile, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProfile({
          name: data.name || (data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.first_name || data.last_name || data.username || ''),
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      } else {
        console.error('Error fetching profile:', data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return;
      }

      const response = await fetch(API_ENDPOINTS.userProfile, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Profile updated successfully!');
        // Update the user state if needed
      } else {
        console.error('Error updating profile:', data);
        alert('Failed to update profile: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const downloadReceipt = (donation) => {
    const doc = new jsPDF();

    // Set up the PDF
    doc.setFontSize(20);
    doc.text('Donation Receipt', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Thank you for your generous donation!', 105, 35, { align: 'center' });

    // Add receipt details
    let yPosition = 60;
    doc.setFontSize(10);

    doc.text(`Transaction ID: ${donation.transaction_id}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Campaign ID: ${donation.campaign_id || 'N/A'}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Donation Type: ${donation.donation_type}`, 20, yPosition);
    yPosition += 10;

    if (donation.amount) {
      doc.text(`Amount: Rs. ${donation.amount}`, 20, yPosition);
      yPosition += 10;
    }

    if (donation.item_type) {
      doc.text(`Item Type: ${donation.item_type}`, 20, yPosition);
      yPosition += 10;
    }

    if (donation.quantity) {
      doc.text(`Quantity: ${donation.quantity}`, 20, yPosition);
      yPosition += 10;
    }

    doc.text(`Date: ${donation.date || donation.created_at || 'N/A'}`, 20, yPosition);
    yPosition += 20;

    // Add donor information - check if anonymous flag is set
    let userName = 'Anonymous Donor';
    const isAnonymous = donation.anonymous === true || donation.anonymous === 'true' || donation.anonymous === 1;
    
    if (!isAnonymous) {
      // Use profile name first (most reliable), then fallback to user object
      if (profile?.name) {
        userName = profile.name;
      } else if (user?.name) {
        userName = user.name;
      } else if (user?.first_name && user?.last_name) {
        userName = `${user.first_name} ${user.last_name}`;
      } else if (user?.first_name) {
        userName = user.first_name;
      } else if (user?.last_name) {
        userName = user.last_name;
      } else if (user?.username) {
        userName = user.username;
      } else if (profile?.email) {
        // Last resort: use email username part
        userName = profile.email.split('@')[0];
      }
    }
    
    doc.text(`Donor: ${userName}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Campaign: ${donation.campaign || donation.campaign_name || 'N/A'}`, 20, yPosition);
    yPosition += 10;
    doc.text(`NGO: ${donation.ngo || donation.ngo_name || 'N/A'}`, 20, yPosition);

    // Add footer
    yPosition += 30;
    doc.setFontSize(8);
    doc.text('Together, we\'re making a difference in the world', 105, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('#Charity #Donation', 105, yPosition, { align: 'center' });

    // Save the PDF
    doc.save(`donation-receipt-${donation.transaction_id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-50 via-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-200/60">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">{profile.name || "Changemaker"}</span>
            </h1>
            <p className="mt-2 text-lg text-gray-600">Track your impact and manage your contributions.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button 
              onClick={() => setCurrentPage('ngos')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <HeartHandshake className="mr-2 h-5 w-5" />
              New Donation
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Donated",
              value: `₹${totalDonated.toLocaleString()}`,
              icon: Gift,
              color: "text-red-600",
              bgColor: "bg-red-100/50",
              borderColor: "border-red-100",
              shadow: "shadow-red-100"
            },
            {
              label: "Campaigns Supported",
              value: impactData?.unique_campaigns?.toString() || donations.length.toString(),
              icon: Activity,
              color: "text-blue-600",
              bgColor: "bg-blue-100/50",
              borderColor: "border-blue-100",
              shadow: "shadow-blue-100"
            },
            {
              label: "Lives Impacted",
              value: impactData?.estimated_lives_impacted?.toString() || "0",
              icon: HeartHandshake,
              color: "text-green-600",
              bgColor: "bg-green-100/50",
              borderColor: "border-green-100",
              shadow: "shadow-green-100"
            },
            {
              label: "NGOs Helped",
              value: impactData?.unique_ngos?.toString() || new Set(donations.map(d => d.ngo)).size.toString(),
              icon: User,
              color: "text-purple-600",
              bgColor: "bg-purple-100/50",
              borderColor: "border-purple-100",
              shadow: "shadow-purple-100"
            },
          ].map((item, index) => (
            <div key={index} className={`relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl p-6 shadow-lg ${item.shadow} border border-white/50 hover:shadow-xl hover:bg-white/80 transition-all duration-300 group`}>
              <dt>
                <div className={`absolute rounded-xl p-3 ${item.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.label}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </dd>
            </div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="border-b border-gray-200/50">
            <nav className="flex -mb-px" aria-label="Tabs">
              {[
                { id: "donations", name: "My Donations", icon: Gift },
                { id: "impact", name: "Impact Tracking", icon: TrendingUp },
                { id: "profile", name: "Profile Settings", icon: User }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-5 px-8 border-b-2 font-medium text-sm transition-all duration-200
                    ${activeTab === tab.id
                      ? "border-red-500 text-red-600 bg-red-50/30"
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50/50"}
                  `}
                >
                  <tab.icon className={`
                    -ml-0.5 mr-2.5 h-5 w-5 transition-colors duration-200
                    ${activeTab === tab.id ? "text-red-500" : "text-gray-400 group-hover:text-gray-600"}
                  `} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content Area */}
          <div className="p-6 md:p-8 min-h-[400px] bg-white/30">
            {/* Donations Tab */}
            {activeTab === "donations" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    Donation History
                  </h3>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                  </div>
                ) : donations.length === 0 ? (
                  <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-200">
                    <Gift className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No donations yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by supporting a cause close to your heart.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setCurrentPage('ngos')}
                        className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transform transition-all hover:-translate-y-0.5"
                      >
                        Browse NGOs
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {donations.map((donation) => (
                      <div key={donation.id} className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                        {/* Decorative gradient blob behind */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
                        
                        <div className="p-6 flex-1 relative z-10">
                          <div className="flex justify-between items-start mb-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                              ${donation.status === 'completed' ? 'bg-green-100/80 text-green-700 border border-green-200' : 
                                donation.status === 'pending' ? 'bg-yellow-100/80 text-yellow-700 border border-yellow-200' : 
                                'bg-gray-100/80 text-gray-700 border border-gray-200'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                donation.status === 'completed' ? 'bg-green-500' : 
                                donation.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}></div>
                              {donation.status || 'completed'}
                            </span>
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-white/60 shadow-sm">
                              <Calendar className="h-3.5 w-3.5 text-red-400" />
                              {new Date(donation.date || donation.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="mb-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-red-600 transition-colors">
                              {donation.campaign || donation.campaign_name || 'Unnamed Campaign'}
                            </h4>
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                              <div className="p-1 bg-gray-100 rounded-md">
                                <HeartHandshake className="h-3 w-3 text-gray-500" />
                              </div>
                              {donation.ngo || donation.ngo_name || 'Unknown NGO'}
                            </p>
                          </div>
                          
                          <div className="flex items-end gap-2 mt-auto">
                            <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 px-4 py-2.5 rounded-xl border border-red-100/50 w-full">
                              <span className="text-xs text-red-400 font-semibold uppercase tracking-wider block mb-0.5">Donated Amount</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                                  {donation.amount ? `₹${donation.amount.toLocaleString()}` : 'Item Donation'}
                                </span>
                                {donation.donation_type !== 'money' && (
                                  <span className="text-xs font-medium text-gray-500 bg-white/50 px-2 py-0.5 rounded-md border border-gray-100">
                                    {donation.quantity} {donation.item_type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/40 px-6 py-4 border-t border-white/60 flex justify-between items-center backdrop-blur-md group-hover:bg-white/60 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gray-100/80 rounded-full">
                              <Gift className="h-3.5 w-3.5 text-gray-500" />
                            </div>
                            <span className="text-xs font-medium text-gray-500 font-mono tracking-wide">
                              #{donation.transaction_id?.slice(0,8)}
                            </span>
                          </div>
                          <button
                            onClick={() => downloadReceipt(donation)}
                            className="text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                          >
                            <Download className="h-3.5 w-3.5" /> Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Impact Tab */}
            {activeTab === "impact" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Fund Distribution Chart Area */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg p-8">
                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      Fund Distribution
                    </h4>
                    <div className="space-y-5">
                      {calculateFundDistribution().map((cat) => {
                        const colorClasses = {
                          Education: "bg-gradient-to-r from-blue-400 to-blue-600",
                          Food: "bg-gradient-to-r from-green-400 to-green-600",
                          Healthcare: "bg-gradient-to-r from-red-400 to-red-600",
                          Environment: "bg-gradient-to-r from-emerald-400 to-emerald-600",
                          Children: "bg-gradient-to-r from-yellow-400 to-yellow-600",
                          Women: "bg-gradient-to-r from-pink-400 to-pink-600",
                          Animal: "bg-gradient-to-r from-orange-400 to-orange-600",
                          Other: "bg-gradient-to-r from-gray-400 to-gray-600"
                        };
                        
                        return (
                          <div key={cat.category} className="relative group">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">{cat.category}</span>
                              <span className="text-sm font-bold text-gray-900">{cat.percentage}%</span>
                            </div>
                            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-100/80 shadow-inner">
                              <div 
                                style={{ width: `${cat.percentage}%` }} 
                                className={`shadow-md flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${colorClasses[cat.category] || "bg-gray-500"} relative`}
                              >
                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg p-8">
                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      Active Campaigns
                    </h4>
                    <div className="space-y-4">
                      {(impactData?.active_campaigns || []).length > 0 ? (
                        impactData.active_campaigns.map((campaign) => (
                          <div key={campaign.campaign_id} className="border border-gray-100 rounded-xl p-5 hover:bg-white hover:shadow-md transition-all duration-200 bg-white/50">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-bold text-gray-900 text-lg">{campaign.campaign_name}</h5>
                                <p className="text-sm text-gray-500 font-medium">{campaign.ngo_name}</p>
                              </div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                {campaign.category}
                              </span>
                            </div>
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-gray-600 font-medium mb-2">
                                <span>₹{campaign.total_donated.toLocaleString()} raised</span>
                                <span>{campaign.progress_percentage}% of ₹{campaign.goal.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full shadow-sm" style={{ width: `${campaign.progress_percentage}%` }}></div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="inline-block p-4 rounded-full bg-gray-100 mb-3">
                            <TrendingUp className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No active campaigns to track at the moment.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Updates Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg p-6 sticky top-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Activity className="h-5 w-5 text-orange-600" />
                      </div>
                      Impact Updates
                    </h4>
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {generateRecentUpdates().map((update, i) => (
                          <li key={i}>
                            <div className="relative pb-8">
                              {i !== generateRecentUpdates().length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gradient-to-b from-gray-200 to-transparent" aria-hidden="true"></span>
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-50 to-white flex items-center justify-center ring-4 ring-white/80 shadow-sm border border-red-100">
                                  <span className="text-sm">{update.icon}</span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{update.text}</p>
                                  </div>
                                  <div className="text-right text-xs whitespace-nowrap text-gray-400 font-medium">
                                    <time>{update.time}</time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="max-w-5xl mx-auto">
                <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden border border-white/60">
                  {/* Decorative Header */}
                  <div className="bg-gradient-to-r from-red-600 to-pink-600 px-8 py-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-5 rounded-full blur-xl"></div>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <User className="h-8 w-8 text-red-100" />
                        Profile Settings
                      </h3>
                      <p className="text-red-100 mt-2 text-base max-w-xl leading-relaxed">Manage your personal information and contact details to keep your account up to date.</p>
                    </div>
                  </div>
                  
                  <form onSubmit={updateProfile} className="p-8 md:p-10">
                    <div className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
                      {/* Personal Info Section */}
                      <div className="space-y-8">
                        <div className="flex items-center gap-3 pb-3 border-b border-gray-200/60">
                          <div className="p-2 bg-red-50 rounded-lg">
                            <User className="h-5 w-5 text-red-500" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Personal Details</h4>
                        </div>
                        
                        <div>
                          <label htmlFor="name" className="block text-sm font-bold leading-6 text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="relative rounded-xl shadow-sm group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                              className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 transition-all bg-white/50 focus:bg-white shadow-sm"
                              placeholder="Your full name"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-bold leading-6 text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              disabled
                              value={profile.email}
                              className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-500 bg-gray-50/50 ring-1 ring-inset ring-gray-200 sm:text-sm sm:leading-6 cursor-not-allowed"
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block">
                            <Shield className="h-3 w-3" /> Email cannot be changed for security reasons.
                          </p>
                        </div>
                      </div>

                      {/* Contact Info Section */}
                      <div className="space-y-8">
                        <div className="flex items-center gap-3 pb-3 border-b border-gray-200/60">
                          <div className="p-2 bg-red-50 rounded-lg">
                            <Phone className="h-5 w-5 text-red-500" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">Contact Information</h4>
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-bold leading-6 text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative rounded-xl shadow-sm group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <input
                              type="text"
                              name="phone"
                              id="phone"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 transition-all bg-white/50 focus:bg-white shadow-sm"
                              placeholder="+91 98765 43210"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="address" className="block text-sm font-bold leading-6 text-gray-700 mb-2">
                            Address
                          </label>
                          <div className="relative rounded-xl shadow-sm group">
                            <div className="absolute inset-y-0 left-0 pl-4 pt-3.5 pointer-events-none">
                              <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <textarea
                              name="address"
                              id="address"
                              rows={3}
                              value={profile.address}
                              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                              className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 transition-all bg-white/50 focus:bg-white shadow-sm resize-none"
                              placeholder="Your permanent address"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 flex items-center justify-end gap-x-4 pt-8 border-t border-gray-100">
                      <button
                        type="button"
                        className="text-sm font-bold leading-6 text-gray-600 hover:text-red-600 transition-colors px-6 py-3 rounded-xl hover:bg-red-50/50"
                        onClick={() => fetchProfile()}
                      >
                        Cancel Changes
                      </button>
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="rounded-xl bg-gradient-to-r from-red-600 to-pink-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:from-red-500 hover:to-pink-500 hover:shadow-red-200/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center transition-all transform active:scale-95"
                      >
                        {profileLoading ? (
                          <>
                            <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white border-2 border-white border-t-transparent rounded-full"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
