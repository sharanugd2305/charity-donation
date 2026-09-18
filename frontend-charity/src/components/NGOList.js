import React, { useState, useEffect } from 'react';
import { Search, MapPin, Check } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

function NGOCard({ ngo, setSelectedNGO, setSelectedCampaign, setCurrentPage }) {
  return (
    <div className="group relative bg-white/60 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full">
      {/* Decorative background gradient blob */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-red-400/20 via-pink-400/20 to-purple-400/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-blue-400/20 via-cyan-400/20 to-teal-400/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none"></div>

      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={ngo.image}
          alt={ngo.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500" />
        
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold tracking-wide rounded-xl bg-white/20 text-white shadow-lg backdrop-blur-md border border-white/30 uppercase">
            Est. {ngo.founded}
          </span>
        </div>

        {/* Certified badge - show green badge for all NGOs */}
        <div className="absolute top-4 left-4 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md border border-emerald-700">
            <Check className="w-3.5 h-3.5" />
            <span>Certified</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-5 z-10">
          <h3 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-lg line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-red-100 transition-all">
            {ngo.name}
          </h3>
          <div className="flex items-center gap-2 text-white/90 text-xs font-medium bg-black/20 backdrop-blur-md inline-flex px-3 py-1.5 rounded-lg border border-white/10">
            <MapPin className="h-3.5 w-3.5 text-red-400" />
            <span className="truncate">{ngo.location}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1 relative z-10">
        {/* Impact Badge */}
        <div className="mb-5">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-red-50/80 to-pink-50/80 text-red-700 border border-red-100/50 shadow-sm w-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-red-500 to-pink-600"></span>
            </span>
            <span className="truncate">{ngo.impact}</span>
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed font-medium">
          {ngo.description}
        </p>

        {/* Contact Links */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50 hover:bg-blue-50 hover:border-blue-200 transition-colors group/link">
            <span className="block text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-1">Website</span>
            <a
              href={ngo.website}
              className="text-gray-800 font-bold truncate block flex items-center gap-1 group-hover/link:text-blue-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Site <span className="text-[10px]">↗</span>
            </a>
          </div>
          <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/50 hover:bg-purple-50 hover:border-purple-200 transition-colors">
            <span className="block text-purple-400 font-bold text-[10px] uppercase tracking-wider mb-1">Contact</span>
            <span className="text-gray-800 font-bold truncate block">{ngo.contact}</span>
          </div>
        </div>

        <div className="border-t border-gray-100/80 my-2"></div>

        {/* Campaigns Section */}
        <div className="mt-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 text-sm flex items-center gap-2">
              Featured Campaigns
            </h4>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100/80 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              {ngo.campaigns.length} Active
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {ngo.campaigns.slice(0, 2).map((campaign) => {
              const raised = campaign.raised || 0;
              const target = campaign.target || 0;
              const progress =
                target > 0
                  ? Math.min(100, (raised / target) * 100)
                  : 0;

              return (
                <div
                  key={campaign.id}
                  className="group/campaign relative p-4 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 border border-white/60 hover:border-red-200 hover:shadow-md transition-all duration-300 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <span className="font-bold text-gray-800 text-xs line-clamp-1 group-hover/campaign:text-red-600 transition-colors">
                      {campaign.name}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full whitespace-nowrap border border-emerald-100/50">
                      {progress.toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden border border-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-700 group-hover/campaign:scale-x-105 origin-left"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-[10px] text-gray-500 font-medium">
                      <span className="text-gray-900 font-black">₹{raised.toLocaleString()}</span> raised
                    </div>
                    <button
                      onClick={() => {
                        setSelectedNGO(ngo);
                        setSelectedCampaign(campaign);
                        setCurrentPage('donate');
                      }}
                      className="text-[10px] font-bold text-white bg-gray-900 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      Donate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {ngo.campaigns.length > 2 && (
             <div className="text-center mt-3">
               <span className="text-xs text-gray-400 font-semibold cursor-pointer hover:text-red-500 transition-colors">+{ngo.campaigns.length - 2} more campaigns</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NGOList({
  setSelectedNGO,
  setSelectedCampaign,
  setCurrentPage,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    fetchNGOs();
    
    // Listen for refresh events (e.g., after donation)
    const handleRefresh = () => {
      fetchNGOs();
    };
    
    window.addEventListener('ngo-list-refresh', handleRefresh);
    
    return () => {
      window.removeEventListener('ngo-list-refresh', handleRefresh);
    };
  }, []);

  const fetchNGOs = async () => {
    try {
      // Fetch from API
      const response = await fetch(API_ENDPOINTS.ngos);
      if (response.ok) {
        const data = await response.json();
        setNgos(data);
        return;
      }
      console.error('Failed to fetch NGOs from API, using fallback data');
      
      // Fallback to simulated data if API fails
        setNgos([
        {
          id: 1,
          name: 'Education for All',
          certified: true,
          description:
            'Providing quality education to underprivileged children across India',
          location: 'Mumbai, India',
          founded: 2010,
          website: 'https://educationforall.org',
          contact: 'contact@educationforall.org',
          impact: 'Educated 50,000+ children',
          image:
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
          campaigns: [
            {
              id: 1,
              name: 'Rural School Development',
              description: 'Building schools in rural areas',
              target: 500000,
              raised: 350000,
            },
            {
              id: 2,
              name: 'Digital Learning Initiative',
              description: 'Providing tablets and online resources',
              target: 300000,
              raised: 180000,
            },
          ],
        },
        {
          id: 2,
          name: 'Food for Hunger',
          certified: true,
          description: 'Fighting hunger and malnutrition in rural communities',
          location: 'Delhi, India',
          founded: 2008,
          website: 'https://foodforhunger.org',
          contact: 'info@foodforhunger.org',
          impact: 'Served 100,000+ meals',
          image:
            'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
          campaigns: [
            {
              id: 3,
              name: 'Daily Meal Program',
              description: 'Providing nutritious meals to children',
              target: 400000,
              raised: 280000,
            },
          ],
        },
        {
          id: 3,
          name: 'Healthcare for All',
          certified: true,
          description: 'Bringing healthcare services to remote areas',
          location: 'Bangalore, India',
          founded: 2012,
          website: 'https://healthcareforall.org',
          contact: 'support@healthcareforall.org',
          impact: 'Treated 75,000+ patients',
          image:
            'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=400',
          campaigns: [
            {
              id: 4,
              name: 'Mobile Medical Camps',
              description: 'Setting up camps in underserved areas',
              target: 600000,
              raised: 420000,
            },
          ],
        },
        {
          id: 4,
          name: 'Child Welfare Society',
          certified: true,
          description:
            'Protecting and nurturing children in need across India',
          location: 'Chennai, India',
          founded: 2015,
          website: 'https://childwelfare.org',
          contact: 'help@childwelfare.org',
          impact: 'Helped 25,000+ children',
          image: '/images/child.webp',
          campaigns: [
            {
              id: 5,
              name: 'Orphanage Support',
              description: 'Providing food and education to orphans',
              target: 450000,
              raised: 320000,
            },
            {
              id: 6,
              name: 'Child Health Program',
              description: 'Medical care for underprivileged children',
              target: 350000,
              raised: 250000,
            },
          ],
        },
        {
          id: 5,
          name: 'Rural Education Initiative',
          certified: true,
          description:
            'Bringing quality education to rural and tribal areas',
          location: 'Kolkata, India',
          founded: 2009,
          website: 'https://ruraleducation.org',
          contact: 'learn@ruraleducation.org',
          impact: 'Educated 40,000+ rural children',
          image:
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
          campaigns: [
            {
              id: 7,
              name: 'Mobile Libraries',
              description: 'Bringing books to remote villages',
              target: 550000,
              raised: 400000,
            },
          ],
        },
        {
          id: 6,
          name: 'Animal Welfare Society',
          certified: true,
          description: 'Protecting and caring for stray animals',
          location: 'Pune, India',
          founded: 2011,
          website: 'https://animalwelfare.org',
          contact: 'care@animalwelfare.org',
          impact: 'Rescued 15,000+ animals',
          image:
            'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400',
          campaigns: [
            {
              id: 8,
              name: 'Sterilization Drive',
              description: 'Controlling animal population',
              target: 300000,
              raised: 220000,
            },
            {
              id: 9,
              name: 'Shelter Construction',
              description: 'Building shelters for animals',
              target: 700000,
              raised: 500000,
            },
          ],
        },
        {
          id: 7,
          name: 'Disaster Relief Fund',
          certified: true,
          description: 'Providing immediate aid during natural disasters',
          location: 'Hyderabad, India',
          founded: 2013,
          website: 'https://disasterrelief.org',
          contact: 'relief@disasterrelief.org',
          impact: 'Helped 50,000+ affected people',
          image: '/images/global.jpg',
          campaigns: [
            {
              id: 10,
              name: 'Flood Response',
              description: 'Aid for flood victims',
              target: 800000,
              raised: 600000,
            },
          ],
        },
        {
          id: 8,
          name: 'Elder Care Foundation',
          certified: true,
          description:
            'Supporting elderly citizens with care and companionship',
          location: 'Ahmedabad, India',
          founded: 2007,
          website: 'https://eldercare.org',
          contact: 'support@eldercare.org',
          impact: 'Cared for 20,000+ elders',
          image: '/images/elder.jpg',
          campaigns: [
            {
              id: 11,
              name: 'Home Care Services',
              description: 'Providing in-home care',
              target: 400000,
              raised: 300000,
            },
            {
              id: 12,
              name: 'Senior Centers',
              description: 'Building community centers',
              target: 600000,
              raised: 450000,
            },
          ],
        },
        {
          id: 9,
          name: "Children's Education Trust",
          certified: true,
          description:
            'Focusing on holistic development of underprivileged children',
          location: 'Jaipur, India',
          founded: 2014,
          website: 'https://childreneducation.org',
          contact: 'grow@childreneducation.org',
          impact: 'Nurtured 35,000+ children',
          image:
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
          campaigns: [
            {
              id: 13,
              name: 'After School Programs',
              description: 'Extra-curricular activities for kids',
              target: 250000,
              raised: 180000,
            },
          ],
        },
        {
          id: 10,
          name: 'Old Age Homes Network',
          certified: true,
          description: 'Providing dignified living for senior citizens',
          location: 'Varanasi, India',
          founded: 2006,
          website: 'https://oldagehomes.org',
          contact: 'care@oldagehomes.org',
          impact: 'Sheltered 15,000+ seniors',
          image: '/images/old.jpg',
          campaigns: [
            {
              id: 14,
              name: 'Senior Living Facilities',
              description: 'Building comfortable homes for elders',
              target: 900000,
              raised: 650000,
            },
            {
              id: 15,
              name: 'Medical Care for Elders',
              description: 'Healthcare services for seniors',
              target: 350000,
              raised: 270000,
            },
          ],
        },
      ]);
    } catch (error) {
      console.error('Error fetching NGOs:', error);
    }
  };

  const filteredNGOs = ngos.filter((ngo) =>
    [ngo.name, ngo.description, ngo.location]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-sky-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-red-600 bg-red-50 px-3 py-1 rounded-full mb-3">
              Support verified NGOs
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
              Browse NGO Organizations
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl">
              Discover trusted organizations making real impact across India.
              Choose a cause that matters to you and start changing lives today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/80 border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1" />
            {filteredNGOs.length} of {ngos.length} NGOs matched
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by NGO name, cause, or location..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/70 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        {filteredNGOs.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm bg-white/70 rounded-2xl border border-dashed border-gray-200">
            No NGOs found for "{searchTerm}". Try searching with a
            different name or cause.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredNGOs.map((ngo) => (
              <NGOCard
                key={ngo.id}
                ngo={ngo}
                setSelectedNGO={setSelectedNGO}
                setSelectedCampaign={setSelectedCampaign}
                setCurrentPage={setCurrentPage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
