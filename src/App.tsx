import React, { useState, useEffect } from 'react';
import { Venue, Booking, MatchPost, Review } from './types';
import { initialVenues, mockMatchesList, locations } from './data/venues';

import BookingModal from './components/BookingModal';
import VenueDetailsModal from './components/VenueDetailsModal';
import CommunityMatches from './components/CommunityMatches';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';

import { 
  Plus, 
  Search, 
  MapPin, 
  Filter, 
  Compass, 
  Calendar, 
  ChevronRight, 
  Target, 
  Users, 
  ListPlus, 
  Star, 
  Flame, 
  DollarSign, 
  Sparkles,
  Award,
  BookOpen,
  X
} from 'lucide-react';

export default function App() {
  // --- Persistent State Handlers ---
  const [venues, setVenues] = useState<Venue[]>(() => {
    const saved = localStorage.getItem('turfoota_venues');
    return saved ? JSON.parse(saved) : initialVenues;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('turfoota_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [matches, setMatches] = useState<MatchPost[]>(() => {
    const saved = localStorage.getItem('turfoota_matches');
    return saved ? JSON.parse(saved) : mockMatchesList;
  });

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; phone: string; locationPreference?: string } | null>(() => {
    const saved = localStorage.getItem('turfoota_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    localStorage.setItem('turfoota_venues', JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem('turfoota_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('turfoota_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('turfoota_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('turfoota_current_user');
    }
  }, [currentUser]);

  // --- Active Components & Screen States ---
  const [activeTab, setActiveTab] = useState<'all-pitches' | 'how-it-works' | 'community' | 'admin'>('all-pitches');
  const [selectedDetailsVenue, setSelectedDetailsVenue] = useState<Venue | null>(null);
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);

  // --- Filter states ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [minRating, setMinRating] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Dispatch Event Functions ---

  // Placing a Reservation
  const handleAddNewBooking = (newBooking: Booking) => {
    setBookings([newBooking, ...bookings]);
    
    // Also update the nextSlot of the booked venue to make it feel highly alive
    setVenues(prevVenues => 
      prevVenues.map(v => {
        if (v.id === newBooking.venueId) {
          // Generate a newer slot dynamically so that other users see a dynamic change
          return {
            ...v,
            nextSlot: 'Wed, 17 Jun at 4:30 PM' 
          };
        }
        return v;
      })
    );

    setBookingVenue(null);
  };

  // Cancelling an Reservation
  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  // Submitting reviews for a pitch
  const handleAddReview = (venueId: number, newReview: Review) => {
    setVenues(prevVenues => 
      prevVenues.map(v => {
        if (v.id === venueId) {
          const currentReviews = v.reviewsList || [];
          const updatedReviews = [newReview, ...currentReviews];
          const newReviewsCount = v.reviewsCount + 1;
          
          // Calculate running average
          const totalRatingSum = currentReviews.reduce((sum, r) => sum + r.rating, 0) + newReview.rating;
          const newAvgRating = Number((totalRatingSum / updatedReviews.length).toFixed(1));

          return {
            ...v,
            reviewsCount: newReviewsCount,
            reviewsList: updatedReviews,
            rating: newAvgRating
          };
        }
        return v;
      })
    );

    // Sync selected details modal so that ratings load dynamically
    setSelectedDetailsVenue(prev => {
      if (prev && prev.id === venueId) {
        const currentReviews = prev.reviewsList || [];
        const updatedReviews = [newReview, ...currentReviews];
        const newReviewsCount = prev.reviewsCount + 1;
        const totalRatingSum = currentReviews.reduce((sum, r) => sum + r.rating, 0) + newReview.rating;
        const newAvgRating = Number((totalRatingSum / updatedReviews.length).toFixed(1));

        return {
          ...prev,
          reviewsCount: newReviewsCount,
          reviewsList: updatedReviews,
          rating: newAvgRating
        };
      }
      return prev;
    });
  };

  // Operator additions of a new ground
  const handleAddVenue = (newVenue: Venue) => {
    setVenues([newVenue, ...venues]);
    setActiveTab('admin'); // Stay inside the admin suite to show updated list!
  };

  const handleDeleteVenue = (venueId: number) => {
    setVenues(prev => prev.filter(v => String(v.id) !== String(venueId)));
  };

  // Player Finder addition
  const handleAddMatch = (newMatch: MatchPost) => {
    setMatches([newMatch, ...matches]);
  };

  // Player Finder joints squad list
  const handleJoinMatch = (matchId: string, playerName: string) => {
    setMatches(prevMatches => 
      prevMatches.map(m => {
        if (m.id === matchId) {
          if (m.playersList.includes(playerName)) {
            alert('You are already listed in the squad roster for this match!');
            return m;
          }
          return {
            ...m,
            playersList: [...m.playersList, playerName],
            spotsFilled: m.spotsFilled + 1
          };
        }
        return m;
      })
    );
  };

  // Clear filters helper
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedSize('');
    setMaxPrice(100);
    setMinRating(0);
  };

  // Filter application calculation
  const filteredVenues = venues.filter(v => {
    const matchesSearch = !searchTerm || 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !selectedLocation || 
      v.location.toLowerCase().includes(selectedLocation.toLowerCase());
    
    const matchesSize = !selectedSize || v.size === selectedSize;
    const matchesPrice = v.price <= maxPrice;
    const matchesRating = v.rating >= minRating;

    return matchesSearch && matchesLocation && matchesSize && matchesPrice && matchesRating;
  });

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans antialiased selection:bg-purple-100 selection:text-purple-900">
      
      {/* 1. STUNNING FLOATING NAVIGATION BAR */}
      <nav className={`fixed w-full top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md py-4' 
          : 'bg-transparent py-5 text-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <div className="flex items-center">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setActiveTab('all-pitches'); }}
                className="flex items-center space-x-2 shrink-0 cursor-pointer group"
              >
                <div className="p-0.5 group-hover:scale-105 transition-all">
                  <img 
                    src="https://i.postimg.cc/sXFpJ8qV/Logo.png" 
                    alt="GobsorArena Logo" 
                    className="w-10 h-10 object-contain" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <span className={`text-2xl font-black font-display tracking-tight bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent ${!isScrolled && 'text-white'}`}>
                  GobsorArena
                </span>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 bg-gray-100/10 p-1.5 rounded-full backdrop-blur-sm">
              <button
                onClick={() => setActiveTab('all-pitches')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'all-pitches'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-gray-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Find Pitches
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'community'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-gray-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Squad Finder
                <span className="bg-purple-100 text-purple-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">LIVE</span>
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-gray-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <ListPlus className="w-3.5 h-3.5" />
                Admin Panel
              </button>
              <button
                onClick={() => setActiveTab('how-it-works')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'how-it-works'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-gray-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                How It Works
              </button>
            </div>

            {/* Desktop Auth and Bookings Trigger */}
            <div className="hidden md:flex items-center space-x-3.5">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right hidden lg:block">
                    <span className={`text-xs font-bold capitalize leading-3 block ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-purple-400 font-extrabold tracking-tight uppercase">
                      {currentUser.locationPreference ? `${currentUser.locationPreference} Captain` : 'Verified Player'}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 text-white font-black text-xs flex items-center justify-center uppercase shadow-inner border border-white/20">
                    {currentUser.name.slice(0, 2)}
                  </div>
                  <button 
                    onClick={() => setCurrentUser(null)}
                    className="text-[10px] font-extrabold text-red-500 hover:text-red-700 bg-red-50/10 hover:bg-red-50 hover:border-red-200 p-1.5 rounded-lg border border-red-500/20 uppercase tracking-wider transition cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => { setAuthModalInitialMode('login'); setAuthModalOpen(true); }}
                    className={`text-xs font-bold cursor-pointer transition ${isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-gray-200 hover:text-white'}`}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { setAuthModalInitialMode('signup'); setAuthModalOpen(true); }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md cursor-pointer transition"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Actions Drawer Trigger */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-xl transition ${
                  isScrolled ? 'text-gray-800 hover:text-purple-600' : 'text-white'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Flyout Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-100 text-gray-900 shadow-xl overflow-hidden animate-in slide-in-from-top duration-200">
            <div className="px-5 pt-3 pb-6 space-y-2.5">
              <button
                onClick={() => { setActiveTab('all-pitches'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-purple-50 rounded-lg flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-purple-600" />
                Find Pitches
              </button>
              <button
                onClick={() => { setActiveTab('community'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-purple-50 rounded-lg flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Squad Finder
                </span>
                <span className="bg-purple-100 text-purple-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">ACTIVE</span>
              </button>
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-purple-50 rounded-lg flex items-center gap-2"
              >
                <ListPlus className="w-4 h-4 text-purple-600" />
                Admin Panel
              </button>
              <button
                onClick={() => { setActiveTab('how-it-works'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-purple-50 rounded-lg flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-purple-600" />
                How It Works
              </button>
              
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                {currentUser ? (
                  <div className="flex items-center justify-between p-3 bg-purple-50/50 border border-purple-100 rounded-xl mt-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center uppercase">
                        {currentUser.name.slice(0, 2)}
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-gray-800 block capitalize">{currentUser.name}</span>
                        <span className="text-[10px] text-purple-600 font-bold block">Verified Athlete</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setCurrentUser(null); setMobileMenuOpen(false); }}
                      className="text-white bg-red-500 hover:bg-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button 
                      onClick={() => { setAuthModalInitialMode('login'); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                      className="text-gray-700 border border-gray-200 text-xs font-bold py-2 rounded-lg cursor-pointer"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => { setAuthModalInitialMode('signup'); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                      className="bg-purple-600 text-white text-xs font-bold py-2 rounded-lg shadow cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 2. PREMIUM HERO CONTAINER WITH SEARCH INTEGRATION */}
      <header className="relative bg-gradient-to-br from-[#031c0e] via-[#0b331c] to-[#011108] text-white pt-36 pb-32 overflow-hidden">
        
        {/* Subtle glowing backgrounds */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          
          <div className="flex justify-center">
            <span className="bg-white/10 hover:bg-white/15 px-4.5 py-1.5 rounded-full text-xs font-extrabold tracking-wider text-purple-300 uppercase flex items-center gap-1.5 shadow-sm transition">
              <Award className="w-4 h-4 text-yellow-400 shrink-0" />
              Somalia's Ultimate Pitch Coordinator
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white max-w-4xl mx-auto font-display">
            Find checked pitches,<br />Book instantly.
          </h1>

          <p className="text-purple-100/85 text-base sm:text-xl max-w-2xl mx-auto font-medium">
            Connect with verified football arenas, locker rooms, and squads in Mogadishu and surrounding areas. Play under floodlights today!
          </p>

          {/* Interactive Hero Quick-Search form (Only displayed when Find Pitches is selected) */}
          {activeTab === 'all-pitches' && (
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-4 sm:p-5 text-gray-900 border border-gray-150 relative mt-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-center">
                
                {/* Text Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 text-purple-600 w-4.5 h-4.5 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter pitch name, area..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium transition"
                  />
                </div>

                {/* Location Select Menu */}
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 text-purple-600 w-4.5 h-4.5 shrink-0" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold appearance-none cursor-pointer text-gray-800"
                  >
                    {locations.map((loc) => (
                      <option key={loc.value} value={loc.value}>
                        {loc.label || 'All Locations'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Format size layout filter */}
                <div className="flex gap-2">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold cursor-pointer text-gray-800"
                  >
                    <option value="">Layout Size</option>
                    <option value="5-aside">5-aside Grounds</option>
                    <option value="7-aside">7-aside Grounds</option>
                    <option value="11-aside">11-aside Stadiums</option>
                  </select>

                  <button
                    onClick={() => {
                      // Anchor scroll down to listings to satisfy active searches
                      const element = document.getElementById('listings-head');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 rounded-2xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Search
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </header>

      {/* 3. CORE INTERACTIVE DASHBOARD SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">
        
        {/* Render Tab routing switch */}
        {activeTab === 'all-pitches' && (
          <div className="space-y-12">
            
            {/* Header and Filter triggers */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-150 pb-5" id="listings-head">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-gray-900 font-display flex items-center gap-2">
                  🏟️ Featured Football Arenas
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">Showing verified pitches with real-time hourly reservations</p>
              </div>

              {/* Advanced Slider Filters panel */}
              <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-200/90 text-xs">
                
                {/* Max price slider */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-bold">Max Price:</span>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-24 accent-purple-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-bold text-purple-700">${maxPrice}/hr</span>
                </div>

                <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

                {/* Rating filter select */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-bold">Min Rating:</span>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 font-semibold text-gray-800"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4.5}>4.5★ or more</option>
                    <option value={4.8}>4.8★ or more</option>
                    <option value={5.0}>Perfect 5.0★</option>
                  </select>
                </div>

                {(searchTerm || selectedLocation || selectedSize || maxPrice < 100 || minRating > 0) && (
                  <>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <button
                      onClick={handleClearFilters}
                      className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </>
                )}

              </div>
            </div>

            {/* Venues Grid */}
            {filteredVenues.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No matching football arenas found</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                  We elements couldn't find pitches matching your search queries. Try adjusting your price boundaries, location selectors, or size checkboxes.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer shadow"
                >
                  Clear All Search Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVenues.map((venue) => (
                  <div
                    key={venue.id}
                    className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                  >
                    
                    {/* Visual Asset Header and Badge overlay */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-200">
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Ground size badge */}
                      <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-md z-10">
                        {venue.size}
                      </span>
                      {/* Rating bubble */}
                      <div className="absolute top-4 left-4 bg-white/95 text-gray-900 text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 text-xs shrink-0 z-10">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                        <span>{venue.rating.toFixed(1)}</span>
                        {venue.reviewsCount > 0 && (
                          <span className="text-gray-400 font-medium font-mono">({venue.reviewsCount})</span>
                        )}
                      </div>
                    </div>

                    {/* Venue Attributes Body */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-black text-gray-900 leading-tight font-display mb-1.5">
                          {venue.name}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="truncate">{venue.location}</span>
                        </div>
                      </div>

                      {/* Ground next available slot status */}
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <div className="text-xs">
                          <span className="text-emerald-800 font-bold block leading-none mb-0.5">Open Slot Available</span>
                          <span className="text-gray-600 text-[11px]">{venue.nextSlot}</span>
                        </div>
                      </div>

                      {/* Pricing Tag */}
                      <div className="flex items-end justify-between pt-2 border-t border-gray-105">
                        <div>
                          <span className="text-2xl font-black text-purple-700">${venue.price.toLocaleString()}</span>
                          <span className="text-gray-400 text-xs font-semibold">/hour</span>
                        </div>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        <button
                          onClick={() => setSelectedDetailsVenue(venue)}
                          className="border border-purple-200 hover:border-purple-300 text-purple-700 font-bold text-xs py-2.5 rounded-xl hover:bg-purple-50/50 transition cursor-pointer"
                        >
                          View Amenities
                        </button>
                        <button
                          onClick={() => setBookingVenue(venue)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1"
                        >
                          Book Now
                        </button>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {activeTab === 'community' && (
          <CommunityMatches 
            venues={venues} 
            matches={matches} 
            onJoinMatch={handleJoinMatch} 
            onAddMatch={handleAddMatch} 
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel 
            venues={venues} 
            bookings={bookings} 
            onAddVenue={handleAddVenue} 
            onDeleteVenue={handleDeleteVenue} 
            onCancelBooking={handleCancelBooking} 
            currentUser={currentUser} 
          />
        )}

        {activeTab === 'how-it-works' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-200">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-3.5 py-1 rounded-full">
                Simple Coordinated Matchplay
              </span>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 font-display">How GobsorArena Works</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                We make listing, coordination, and booking football pitches across Mogadishu seamless. Start playing in 3 simple steps:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white p-6 rounded-3xl border border-gray-200 p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center text-2xl font-black font-display shadow-inner">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-display">Browse Verified Arenas</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Filter by location, price, and matching size layout. See real-time floodlight, changing-rooms, and shower reviews.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center text-2xl font-black font-display shadow-inner">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-display">Instantly Reserve Slot</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Pick date, hours, add extra bibs or referees, and process payments securely via our embedded Safaricom MPesa channel.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center text-2xl font-black font-display shadow-inner">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-display">Gather Squad & Battle</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Generate beautiful pre-written match passes. Send squad invites to WhatsApp groups instantly. Pitch up and play!
                </p>
              </div>

            </div>

            {/* Large banner call to action info */}
            <div className="bg-purple-900/5 border border-purple-100 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-lg">
                <h4 className="text-lg font-bold text-purple-950 font-display flex items-center gap-1">
                  <Flame className="w-5 h-5 text-purple-600 animate-bounce" />
                  Are you a football ground owner?
                </h4>
                <p className="text-sm text-purple-800 leading-relaxed">
                  List empty night and training hour slots, accept payments directly on your terminal, and boost match attendance today.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('admin')}
                className="bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                Go to Operator Suite
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </main>

      {/* 4. VERIFIED PREMIUM FOOTER LAYOUT */}
      <footer className="bg-[#02110a] text-gray-400 pt-20 pb-12 border-t border-purple-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Brand details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div>
                  <img 
                    src="https://i.postimg.cc/sXFpJ8qV/Logo.png" 
                    alt="GobsorArena Logo" 
                    className="w-8 h-8 object-contain" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <span className="text-xl font-black text-white font-display">GobsorArena</span>
              </div>
              <p className="text-xs leading-relaxed text-gray-400">
                Somalia's premium coordinate dashboard for booking premium astroturf grounds in Mogadishu. Coordinate empty night training slots and host player finders effortlessly.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Find Matches</h4>
              <ul className="text-xs space-y-2.5">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('all-pitches'); }} className="hover:text-purple-400 transition">Browse Arenas</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('community'); }} className="hover:text-purple-400 transition">Squad Finder Feed</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('admin'); }} className="hover:text-purple-400 transition font-bold text-purple-300">Admin Panel</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('how-it-works'); }} className="hover:text-purple-400 transition">Playbook Guide</a></li>
              </ul>
            </div>

            {/* Major Areas */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Locations</h4>
              <ul className="text-xs space-y-2.5">
                <li><span className="text-gray-500">Wadajir, Mogadishu</span></li>
                <li><span className="text-gray-500">Hodan Zone fields</span></li>
                <li><span className="text-gray-500">Dharkenley athletic fields</span></li>
                <li><span className="text-gray-500">Bondhere grassroots</span></li>
                <li><span className="text-gray-500">Shibis premium turf</span></li>
              </ul>
            </div>

            {/* Help desk contacts */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Hotline Help</h4>
              <ul className="text-xs space-y-2 text-gray-400">
                <li>📞 +252 61 555 1111</li>
                <li>✉️ hello@gobsorarena.com</li>
                <li>📍 Mogadishu, Somalia</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-purple-950/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11.5px] text-gray-500">
            <p>&copy; {new Date().getFullYear()} GobsorArena Turf Ltd. All playing rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-purple-400 transition">Privacy Rules</a>
              <a href="#" className="hover:text-purple-400 transition">Cancellation Rescheduling</a>
              <a href="#" className="hover:text-purple-400 transition">System Audit</a>
            </div>
          </div>

        </div>
      </footer>

      {/* --- FLOATING DISPATCH MODALS --- */}

      {/* Booking wizard modal */}
      {bookingVenue && (
        <BookingModal
          venue={bookingVenue}
          onClose={() => setBookingVenue(null)}
          onAddBooking={handleAddNewBooking}
          existingBookings={bookings}
          currentUser={currentUser}
        />
      )}

      {/* Security Gate & Profile Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalInitialMode}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Detailed pitch inspecting modal */}
      {selectedDetailsVenue && (
        <VenueDetailsModal
          venue={selectedDetailsVenue}
          onClose={() => setSelectedDetailsVenue(null)}
          onBookNow={() => {
            // Transfer modal focus straight to the booking wizard!
            const venue = selectedDetailsVenue;
            setSelectedDetailsVenue(null);
            setBookingVenue(venue);
          }}
          onAddReview={handleAddReview}
        />
      )}

    </div>
  );
}
