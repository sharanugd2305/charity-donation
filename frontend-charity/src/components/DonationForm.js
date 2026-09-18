import React, { useState, useEffect } from 'react';
import {
  Heart,
  CreditCard,
  Package,
  Utensils,
  CheckCircle,
  Download,
  Share2,
  Receipt,
  QrCode,
  Shield,
  Smartphone,
  ArrowLeft
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import jsPDF from 'jspdf';

function DonationReceipt({ receipt, setCurrentPage, user }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>

          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Thank You for Your Generosity!
          </h2>
          <p className="text-gray-600 mb-2">
            Your donation has been received successfully
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Together, we're making a difference in the world
          </p>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-8 text-left border border-gray-100">
            <div className="flex items-center mb-4">
              <Receipt className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="font-bold text-gray-800 text-lg">
                Donation Receipt
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">
                    Transaction ID:
                  </span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {receipt.transaction_id}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">
                    Campaign ID:
                  </span>
                  <span className="font-semibold">{receipt.campaign_id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">
                    Donation Type:
                  </span>
                  <span className="font-semibold capitalize bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {receipt.donation_type}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {receipt.amount && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Amount:</span>
                    <span className="font-bold text-2xl text-red-500">
                      ₹{receipt.amount}
                    </span>
                  </div>
                )}
                {receipt.itemType && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">
                      Item Type:
                    </span>
                    <span className="font-semibold">{receipt.itemType}</span>
                  </div>
                )}
                {receipt.quantity && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Quantity:</span>
                    <span className="font-semibold">{receipt.quantity}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Date:</span>
                  <span className="font-semibold text-sm">
                    {new Date(receipt.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Download PDF */}
            <button
              onClick={() => {
                const doc = new jsPDF();

                doc.setFontSize(20);
                doc.text('Donation Receipt', 105, 20, { align: 'center' });

                doc.setFontSize(12);
                doc.text('Thank you for your generous donation!', 105, 35, {
                  align: 'center'
                });

                let yPosition = 60;
                doc.setFontSize(10);

                doc.text(`Transaction ID: ${receipt.transaction_id}`, 20, yPosition);
                yPosition += 10;
                doc.text(`Campaign ID: ${receipt.campaign_id}`, 20, yPosition);
                yPosition += 10;
                doc.text(`Donation Type: ${receipt.donation_type}`, 20, yPosition);
                yPosition += 10;

                if (receipt.amount) {
                  doc.text(`Amount: Rs. ${receipt.amount}`, 20, yPosition);
                  yPosition += 10;
                }

                if (receipt.itemType) {
                  doc.text(`Item Type: ${receipt.itemType}`, 20, yPosition);
                  yPosition += 10;
                }

                if (receipt.quantity) {
                  doc.text(`Quantity: ${receipt.quantity}`, 20, yPosition);
                  yPosition += 10;
                }

                doc.text(
                  `Date: ${new Date(receipt.timestamp).toLocaleDateString()}`,
                  20,
                  yPosition
                );
                yPosition += 20;

                let userName = 'Anonymous Donor';
                const isAnonymous =
                  receipt.anonymous === true ||
                  receipt.anonymous === 'true' ||
                  receipt.anonymous === 1;

                if (!isAnonymous) {
                  if (receipt.userName) {
                    userName = receipt.userName;
                  } else if (receipt.user?.name) {
                    userName = receipt.user.name;
                  } else if (
                    receipt.user?.first_name &&
                    receipt.user?.last_name
                  ) {
                    userName = `${receipt.user.first_name} ${receipt.user.last_name}`;
                  } else if (receipt.user?.first_name) {
                    userName = receipt.user.first_name;
                  } else if (receipt.user?.last_name) {
                    userName = receipt.user.last_name;
                  } else if (receipt.user?.username) {
                    userName = receipt.user.username;
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
                  } else {
                    userName = 'Anonymous Donor';
                  }
                }

                doc.text(`Donor: ${userName}`, 20, yPosition);
                yPosition += 10;
                doc.text(`Campaign: ${receipt.campaign_name}`, 20, yPosition);
                yPosition += 10;
                doc.text(`NGO: ${receipt.ngo_name}`, 20, yPosition);

                yPosition += 30;
                doc.setFontSize(8);
                doc.text(
                  "Together, we're making a difference in the world",
                  105,
                  yPosition,
                  { align: 'center' }
                );
                yPosition += 5;
                doc.text('#Charity #Donation', 105, yPosition, {
                  align: 'center'
                });

                doc.save('donation-receipt.pdf');
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </button>

            {/* Share Certificate */}
            <button
              onClick={async () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 800;
                canvas.height = 600;

                const gradient = ctx.createLinearGradient(0, 0, 800, 600);
                gradient.addColorStop(0, '#10b981');
                gradient.addColorStop(1, '#3b82f6');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 800, 600);

                ctx.fillStyle = 'white';
                ctx.fillRect(50, 50, 700, 500);
                ctx.strokeStyle = '#e5e7eb';
                ctx.lineWidth = 2;
                ctx.strokeRect(50, 50, 700, 500);

                ctx.fillStyle = '#1f2937';
                ctx.font = 'bold 32px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Donation Certificate', 400, 120);

                ctx.fillStyle = '#6b7280';
                ctx.font = '20px Arial';
                ctx.fillText(
                  'Thank you for your generous donation!',
                  400,
                  160
                );

                ctx.fillStyle = '#374151';
                ctx.font = '18px Arial';
                ctx.textAlign = 'left';

                let y = 220;

                let userName = 'Anonymous Donor';
                const isAnonymous =
                  receipt.anonymous === true ||
                  receipt.anonymous === 'true' ||
                  receipt.anonymous === 1;

                if (!isAnonymous) {
                  if (receipt.userName) {
                    userName = receipt.userName;
                  } else if (receipt.user?.name) {
                    userName = receipt.user.name;
                  } else if (
                    receipt.user?.first_name &&
                    receipt.user?.last_name
                  ) {
                    userName = `${receipt.user.first_name} ${receipt.user.last_name}`;
                  } else if (receipt.user?.first_name) {
                    userName = receipt.user.first_name;
                  } else if (receipt.user?.last_name) {
                    userName = receipt.user.last_name;
                  } else if (receipt.user?.username) {
                    userName = receipt.user.username;
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
                  } else {
                    userName = 'Anonymous Donor';
                  }
                }

                ctx.fillText(`Donor: ${userName}`, 100, y);
                y += 40;
                ctx.fillText(`Campaign: ${receipt.campaign_name}`, 100, y);
                y += 40;
                ctx.fillText(`NGO: ${receipt.ngo_name}`, 100, y);
                y += 40;
                ctx.fillText(`Donation Type: ${receipt.donation_type}`, 100, y);
                y += 40;
                if (receipt.amount) {
                  ctx.fillText(`Amount: ₹${receipt.amount}`, 100, y);
                } else {
                  ctx.fillText(
                    `Item: ${receipt.quantity} ${receipt.itemType}`,
                    100,
                    y
                  );
                }
                y += 40;
                ctx.fillText(
                  `Date: ${new Date(
                    receipt.timestamp
                  ).toLocaleDateString()}`,
                  100,
                  y
                );

                ctx.fillStyle = '#6b7280';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(
                  "Together, we're making a difference in the world",
                  400,
                  520
                );
                ctx.fillText('#Charity #Donation', 400, 550);

                canvas.toBlob(async (blob) => {
                  const file = new File([blob], 'donation-certificate.png', {
                    type: 'image/png'
                  });

                  const shareText = `I just made a donation to ${receipt.ngo_name}! Check out my donation certificate. #Charity #Donation`;

                  if (
                    navigator.share &&
                    navigator.canShare &&
                    navigator.canShare({ files: [file] })
                  ) {
                    try {
                      await navigator.share({
                        title: 'My Donation Certificate',
                        text: shareText,
                        files: [file]
                      });
                    } catch (error) {
                      console.error('Error sharing:', error);
                      navigator
                        .share({
                          title: 'My Donation Impact',
                          text: shareText,
                          url: window.location.origin
                        })
                        .catch(console.error);
                    }
                  } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'donation-certificate.png';
                    a.click();
                    URL.revokeObjectURL(url);
                    alert(
                      'Certificate downloaded! Share the image manually.'
                    );
                  }
                });
              }}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200"
            >
              <Share2 className="w-5 h-5" />
              Share Your Impact
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                window.dispatchEvent(new Event('dashboard-refresh'));
                setCurrentPage('dashboard');
              }}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('home')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= PAYMENT PAGE (with app-specific UI + new QR) ================= */

function PaymentPage({ formData, campaign, ngo, processDonation, setShowPayment }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [paymentData, setPaymentData] = useState({
    upiId: '',
    paymentMethod: 'upi'
  });
  const [upiError, setUpiError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [selectedApp, setSelectedApp] = useState('gpay'); // default app

  const handlePayment = async (e) => {
    e.preventDefault();
    // Validate UPI when using UPI payment
    if (paymentData.paymentMethod === 'upi') {
      const isValid = validateUpiId(paymentData.upiId);
      if (!isValid) {
        setUpiError('Please enter a valid UPI ID (e.g. yourname@ybl or @axis)');
        return;
      }
      setUpiError('');
    }

    await processDonation();
  };

  const upiApps = [
    { id: 'gpay', name: 'Google Pay', image: '/images/gpay.jpg' },
    { id: 'phonepe', name: 'PhonePe', image: '/images/phonepe.webp' },
    { id: 'paytm', name: 'Paytm', image: '/images/paytm.webp' }
  ];

  const selectedAppData = upiApps.find((app) => app.id === selectedApp);

  const getUpiPlaceholder = () => {
    if (selectedApp === 'gpay') return 'yourmobile@okaxis / @oksbi';
    if (selectedApp === 'phonepe') return 'yourname@ybl';
    if (selectedApp === 'paytm') return 'yourmobile@paytm';
    return 'yourname@upi';
  };

  const validateUpiId = (upi) => {
    if (!upi) return false;
    const v = upi.trim();
    // Accept formats like 'name@bank' or '@bank' (some apps use shorthand)
    const fullRegex = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9._-]{2,}$/;
    const bankOnlyRegex = /^@[a-zA-Z0-9._-]{2,}$/;
    return fullRegex.test(v) || bankOnlyRegex.test(v);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 py-12">
      <div className="max-w-md mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowPayment(false)}
            className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Donation Form</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Secure Payment</h1>
          <p className="text-blue-100 text-sm">
            Complete your donation safely using your favourite UPI app
          </p>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {campaign?.name}
                </h3>
                <p className="text-sm text-gray-600">{ngo?.name}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount to pay</span>
              <span className="text-3xl font-bold text-red-500">
                ₹{formData.amount}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Smartphone className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Pay using UPI
            </h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Choose your preferred UPI app and follow the instructions.
          </p>

          {/* UPI Apps Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {upiApps.map((app) => (
              <button
                type="button"
                key={app.id}
                onClick={() => setSelectedApp(app.id)}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                  selectedApp === app.id
                    ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <img
                  src={app.image}
                  alt={app.name}
                  className="w-10 h-10 rounded-full mb-2 object-contain"
                />
                <span className="text-xs font-medium text-gray-700 text-center">
                  {app.name}
                </span>
              </button>
            ))}
          </div>

          {/* App-specific interface */}
          {selectedApp === 'gpay' && (
            <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4 flex gap-3 items-start">
              <img
                src="/images/gpay.jpg"
                alt="Google Pay"
                className="w-10 h-10 rounded-full object-contain"
              />
              <div className="text-sm">
                <p className="font-semibold text-gray-800">
                  Pay using Google Pay
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Enter your UPI ID linked with Google Pay or scan the QR code
                  using the Google Pay app.
                </p>
              </div>
            </div>
          )}

          {selectedApp === 'phonepe' && (
            <div className="mb-5 rounded-xl border border-purple-100 bg-purple-50/70 p-4 flex gap-3 items-start">
              <img
                src="/images/phonepe.webp"
                alt="PhonePe"
                className="w-10 h-10 rounded-full object-contain"
              />
              <div className="text-sm">
                <p className="font-semibold text-gray-800">
                  Pay using PhonePe
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Use your PhonePe UPI ID or open the PhonePe app and scan the
                  QR code to complete the payment.
                </p>
              </div>
            </div>
          )}

          {selectedApp === 'paytm' && (
            <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50/70 p-4 flex gap-3 items-start">
              <img
                src="/images/paytm.webp"
                alt="Paytm"
                className="w-10 h-10 rounded-full object-contain"
              />
              <div className="text-sm">
                <p className="font-semibold text-gray-800">
                  Pay using Paytm
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Enter your Paytm-linked UPI ID or scan the QR code using
                  Paytm to proceed.
                </p>
              </div>
            </div>
          )}

          {/* QR Code Toggle */}
          <div className="text-center mb-6">
            <button
              onClick={() => setShowQR(!showQR)}
              type="button"
              className="flex items-center justify-center w-full p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <QrCode className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-blue-600 font-medium">
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </span>
            </button>
          </div>

          {/* NEW QR Code Design */}
          {showQR && (
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500 p-[1px] rounded-2xl shadow-lg">
                <div className="bg-white rounded-2xl p-5 w-72">
                  {/* App header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {selectedAppData && (
                        <img
                          src={selectedAppData.image}
                          alt={selectedAppData.name}
                          className="w-8 h-8 rounded-full object-contain border border-gray-200"
                        />
                      )}
                      <div className="text-left">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          UPI QR
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {selectedAppData ? selectedAppData.name : 'UPI App'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-green-50 text-[10px] font-semibold text-green-600 border border-green-200">
                      SECURE
                    </span>
                  </div>

                  {/* QR placeholder */}
                  <div className="w-full flex justify-center mb-4">
                  <div className="w-44 h-44 rounded-xl bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-3 rounded-xl border border-dashed border-gray-300" />
                    <img src="/images/qr-code.png" alt="QR Code" className="w-40 h-40 object-contain relative z-10" />
                  </div>
                  </div>

                  {/* Amount & info */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{formData.amount}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
                    <span>
                      UPI ID:{' '}
                      <span className="font-mono">demo@upi</span>
                    </span>
                    <span>
                      Ref:{' '}
                      <span className="font-mono">
                        DON{String(formData.amount || 0).slice(0, 4)}
                      </span>
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500">
                    Scan this QR code with{' '}
                    <span className="font-semibold">
                      {selectedAppData ? selectedAppData.name : 'your UPI app'}
                    </span>{' '}
                    to complete the payment.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    *This is a demo interface for your mini project.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* UPI ID Input */}
          <form onSubmit={handlePayment}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Enter UPI ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-800 font-medium"
                  placeholder={getUpiPlaceholder()}
                  value={paymentData.upiId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaymentData({ ...paymentData, upiId: val });
                    // live-validate and clear/set error
                    if (val.trim() === '') {
                      setUpiError('');
                    } else if (!validateUpiId(val)) {
                      setUpiError('Invalid UPI ID format');
                    } else {
                      setUpiError('');
                    }
                  }}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedAppData
                  ? `You are paying via ${selectedAppData.name}.`
                  : 'Enter your UPI ID or choose from popular apps above.'}
              </p>
              {upiError && (
                <p className="text-sm text-red-600 mt-2">{upiError}</p>
              )}
            </div>

            {/* Security Note */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  100% Secure Payment
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Your payment information is encrypted and secure.
              </p>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={paymentData.paymentMethod === 'upi' && !validateUpiId(paymentData.upiId)}
              className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl hover:from-blue-600 hover:to-purple-600 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                paymentData.paymentMethod === 'upi' && !validateUpiId(paymentData.upiId)
                  ? 'opacity-60 cursor-not-allowed'
                  : ''
              }`}
            >
              Pay ₹{formData.amount}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Powered by{' '}
              <span className="font-semibold text-blue-600">Razorpay</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN DONATION FORM (backend logic unchanged) ================= */

export default function DonationForm({ campaign, ngo, user, setCurrentPage }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [donationType, setDonationType] = useState('money');
  const [formData, setFormData] = useState({
    amount: '',
    itemType: '',
    quantity: '',
    description: '',
    anonymous: false,
    address: ''
  });
  const [showPayment, setShowPayment] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (donationType === 'money') {
      setShowPayment(true);
    } else {
      await processDonation();
    }
  };

  const processDonation = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please login to make a donation');
        return;
      }

      const donationData = {
        ngo_name: ngo?.name || '',
        campaign_name: campaign?.name || '',
        campaign_id: campaign?.id,
        ngo_id: ngo?.id,
        donation_type: donationType,
        amount:
          donationType === 'money'
            ? formData.amount
              ? parseFloat(formData.amount)
              : null
            : null,
        item_type: donationType !== 'money' ? formData.itemType : null,
        quantity: donationType !== 'money' ? formData.quantity : null,
        description: formData.description || '',
        address: donationType !== 'money' ? formData.address : null,
        anonymous: formData.anonymous || false,
        transaction_id: `TXN${Date.now()}`,
        itemType: donationType !== 'money' ? formData.itemType : null
      };

      const response = await fetch(API_ENDPOINTS.donations, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`
        },
        body: JSON.stringify(donationData)
      });

      const data = await response.json();

      if (response.ok) {
        donationData.timestamp = new Date().toISOString();

        let userName = null;
        try {
          const profileResponse = await fetch(API_ENDPOINTS.userProfile, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`
            }
          });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            userName =
              profileData.name ||
              (profileData.first_name && profileData.last_name
                ? `${profileData.first_name} ${profileData.last_name}`
                : profileData.first_name ||
                  profileData.last_name ||
                  profileData.username ||
                  null);

            if (user) {
              user.name = userName;
              user.first_name = profileData.first_name;
              user.last_name = profileData.last_name;
            }
          }
        } catch (profileError) {
          console.error('Error fetching profile for receipt:', profileError);
        }

        if (!userName && user) {
          userName =
            user.name ||
            (user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.first_name || user.last_name || user.username || null);
        }

        const isAnonymous =
          donationData.anonymous === true ||
          donationData.anonymous === 'true' ||
          donationData.anonymous === 1;

        if (!isAnonymous && userName) {
          donationData.userName = userName;
        }

        donationData.user = user;

        setReceipt(donationData);
        window.dispatchEvent(new Event('dashboard-refresh'));
        window.dispatchEvent(new Event('ngo-list-refresh'));
      } else {
        alert(data.error || 'Failed to process donation. Please try again.');
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  if (receipt) {
    return (
      <DonationReceipt
        receipt={receipt}
        setCurrentPage={setCurrentPage}
        user={user}
      />
    );
  }

  if (showPayment && donationType === 'money') {
    return (
      <PaymentPage
        formData={formData}
        campaign={campaign}
        ngo={ngo}
        processDonation={processDonation}
        setShowPayment={setShowPayment}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Make a Donation
          </h1>
          <p className="text-xl text-gray-600">
            Your generosity can change lives. Choose how you'd like to
            contribute.
          </p>
        </div>

        {/* Campaign Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {campaign?.name}
              </h2>
              <p className="text-gray-600">{ngo?.name}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Impact Preview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  ₹{campaign?.raised?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Raised</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  ₹{campaign?.target?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {Math.round(
                    (campaign?.raised / campaign?.target) * 100
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div
                className="bg-gradient-to-r from-red-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (campaign?.raised / campaign?.target) * 100,
                    100
                  )}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Donation Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8">
            <label className="block text-gray-700 font-bold text-xl mb-6">
              Choose Your Donation Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setDonationType('money')}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  donationType === 'money'
                    ? 'border-red-500 bg-red-50 shadow-lg'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-25'
                }`}
              >
                <CreditCard
                  className={`w-8 h-8 mx-auto mb-3 ${
                    donationType === 'money' ? 'text-red-500' : 'text-gray-400'
                  }`}
                />
                <div
                  className={`font-bold text-lg ${
                    donationType === 'money'
                      ? 'text-red-600'
                      : 'text-gray-700'
                  }`}
                >
                  Money
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Direct financial support
                </div>
              </button>
              <button
                onClick={() => setDonationType('clothes')}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  donationType === 'clothes'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                }`}
              >
                <Package
                  className={`w-8 h-8 mx-auto mb-3 ${
                    donationType === 'clothes'
                      ? 'text-blue-500'
                      : 'text-gray-400'
                  }`}
                />
                <div
                  className={`font-bold text-lg ${
                    donationType === 'clothes'
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  Clothes
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Donate clothing items
                </div>
              </button>
              <button
                onClick={() => setDonationType('food')}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  donationType === 'food'
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                }`}
              >
                <Utensils
                  className={`w-8 h-8 mx-auto mb-3 ${
                    donationType === 'food'
                      ? 'text-green-500'
                      : 'text-gray-400'
                  }`}
                />
                <div
                  className={`font-bold text-lg ${
                    donationType === 'food'
                      ? 'text-green-600'
                      : 'text-gray-700'
                  }`}
                >
                  Food
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Contribute food supplies
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Money Donation */}
            {donationType === 'money' && (
              <div className="bg-gray-50 rounded-xl p-6">
                <label className="block text-gray-700 font-semibold mb-3 text-lg">
                  Donation Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-red-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    className="w-full pl-12 pr-4 py-4 text-xl border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all duration-200"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                    required
                    min="1"
                  />
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {[100, 500, 1000, 5000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          amount: amount.toString()
                        })
                      }
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clothes / Food Donation */}
            {(donationType === 'clothes' || donationType === 'food') && (
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">
                    Item Type
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                    value={formData.itemType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        itemType: e.target.value
                      })
                    }
                    placeholder={
                      donationType === 'clothes'
                        ? 'e.g., T-shirts, Pants, Blankets'
                        : 'e.g., Rice, Wheat, Canned Food'
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">
                    Quantity
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: e.target.value
                      })
                    }
                    placeholder="e.g., 10 items, 5 kg, 20 pieces"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">
                    Pickup Address
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                    rows="3"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: e.target.value
                      })
                    }
                    placeholder="Enter your full address for pickup (street, city, state, pincode)"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    NGO representatives will contact you to arrange pickup
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-gray-700 font-semibold mb-3 text-lg">
                Additional Notes (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
                rows="4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value
                  })
                }
                placeholder="Any special instructions or messages..."
              />
            </div>

            {/* Anonymous toggle */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 mr-3"
                  checked={formData.anonymous}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      anonymous: e.target.checked
                    })
                  }
                />
                <span className="text-gray-700 font-medium">
                  Make this donation anonymous
                </span>
              </label>
              <p className="text-sm text-gray-600 mt-2">
                Your name won't be displayed publicly, but we'll still send you
                a receipt.
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl hover:from-red-600 hover:to-red-700 font-bold text-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {donationType === 'money'
                ? 'Proceed to Payment'
                : 'Submit Donation'}
              <Heart className="w-6 h-6 inline ml-2" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
