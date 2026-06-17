import React, { useState } from 'react';
import { Venue, Booking } from '../types';
import RegisterPitch from './RegisterPitch';
import { 
  Building2, 
  CalendarDays, 
  DollarSign, 
  Trash2, 
  PlusCircle, 
  LayoutList, 
  UserSquare2, 
  Search, 
  ShieldCheck, 
  PhoneCall, 
  MapPin, 
  Sparkles,
  CalendarRange,
  Lock,
  User
} from 'lucide-react';

interface AdminPanelProps {
  venues: Venue[];
  bookings: Booking[];
  onAddVenue: (venue: Venue) => void;
  onDeleteVenue: (venueId: number) => void;
  onCancelBooking: (bookingId: string) => void;
  currentUser?: { name: string; email: string; phone: string; locationPreference?: string } | null;
}

export default function AdminPanel({ 
  venues, 
  bookings, 
  onAddVenue, 
  onDeleteVenue, 
  onCancelBooking,
  currentUser 
}: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'overview' | 'register' | 'bookings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const [deletingVenueId, setDeletingVenueId] = useState<number | string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('gobsor_admin_logged_in') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Calculate statistics
  const totalPitches = venues.length;
  const totalBookingsCount = bookings.length;
  const projectedRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Filtered lists
  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b =>
    b.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.playerPhone.includes(searchQuery)
  );

  if (!isAuthenticated) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (usernameInput === 'admin' && passwordInput === 'admin226') {
        localStorage.setItem('gobsor_admin_logged_in', 'true');
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError('Invalid Administrator credentials. Please try again.');
      }
    };

    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-gray-200 rounded-3xl shadow-xl space-y-6 animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <div className="bg-purple-100 hover:bg-purple-200 h-16 w-16 rounded-2xl flex items-center justify-center text-purple-700 font-extrabold mx-auto transition-transform duration-300 hover:scale-105 shadow-sm">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 font-display">Administrator Access Control</h2>
          <p className="text-xs text-gray-500 font-medium">Please enter your verified credentials to manage pitches, schedule listings, and track transaction values.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {loginError && (
            <div className="bg-red-50 border border-red-150 text-red-900 text-xs py-2.5 px-3.5 rounded-xl font-bold flex items-center gap-1.5 animate-bounce">
              <span>⚠️</span>
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-black text-gray-500 tracking-wider block">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-purple-500" />
              <input
                type="text"
                placeholder="Enter admin username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-semibold text-gray-800 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-black text-gray-500 tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-purple-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-semibold text-gray-800 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Operator Login</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-[#031c0e] via-[#0b331c] to-purple-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-purple-500/10 rounded-full blur-2xl"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="bg-white/10 text-purple-300 border border-white/10 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              GobsorArena Central Operator Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight mt-2.5">
              Arena Admin Management Panel
            </h2>
            <p className="text-purple-100/80 text-xs sm:text-sm mt-1 max-w-xl">
              Add new artificial turf grounds, monitor real-time Safaricom/GoPay transaction values, and audit schedule lists securely.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-purple-650 flex items-center justify-center font-bold">
                👑
              </div>
              <div className="text-xs">
                <p className="font-bold">Logged as Controller</p>
                <p className="text-purple-300 font-mono mt-0.5">{currentUser?.name || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('gobsor_admin_logged_in');
                setIsAuthenticated(false);
              }}
              className="text-[10px] uppercase font-black tracking-wider bg-red-650 hover:bg-red-700 px-2.5 py-1.5 rounded-lg text-white border border-transparent hover:border-red-500 cursor-pointer transition-all self-center shadow-md active:scale-95"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Admin Business Intelligence Dashboard Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Pitches Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-purple-50 text-purple-700 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Registered Arenas</span>
            <span className="text-2xl font-black leading-none text-gray-900 font-mono">{totalPitches} Pitches</span>
          </div>
        </div>

        {/* Total Scheduled slots */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-indigo-50 text-indigo-700 rounded-xl">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Active Matches</span>
            <span className="text-2xl font-black leading-none text-indigo-950 font-mono">{totalBookingsCount} Reservations</span>
          </div>
        </div>

        {/* Projected Value */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Projected Turf Revenue</span>
            <span className="text-2xl font-black leading-none text-emerald-700 font-mono">${projectedRevenue.toLocaleString()} USD</span>
          </div>
        </div>

      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-gray-200 gap-1.5 pb-px overflow-x-auto">
        <button
          onClick={() => { setAdminTab('overview'); setSearchQuery(''); }}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            adminTab === 'overview'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <LayoutList className="w-4 h-4 shrink-0" />
          Manage Grounds ({venues.length})
        </button>

        <button
          onClick={() => { setAdminTab('register'); setSearchQuery(''); }}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            adminTab === 'register'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          Add New Football Ground
        </button>

        <button
          onClick={() => { setAdminTab('bookings'); setSearchQuery(''); }}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            adminTab === 'bookings'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CalendarDays className="w-4 h-4 shrink-0" />
          Squad Schedule Records ({bookings.length})
        </button>
      </div>

      {/* Main Admin Working Component Block */}
      <div className="bg-transparent">
        
        {/* TAB 1: OVERVIEW OF PREVIOUS VENUES */}
        {adminTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Search filter panel */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter registered venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <p className="text-xs text-gray-500 self-end sm:self-center">
                Clicking on delete will remove the pitch instantly from customers directory.
              </p>
            </div>

            {/* Venues management log */}
            {filteredVenues.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-200">
                <p className="text-gray-500 text-sm">No registered venues match the filter query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map((venue) => (
                  <div key={venue.id} className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="relative h-40 bg-gray-100">
                      <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 right-3 bg-indigo-900/95 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-md">
                        {venue.size}
                      </span>
                      <div className="absolute top-3 left-3 bg-white/95 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-md border border-gray-100 flex items-center gap-1">
                        ⭐ {venue.rating.toFixed(1)}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base leading-tight">{venue.name}</h4>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="truncate">{venue.location}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-2 font-mono bg-gray-50 p-1.5 rounded-md truncate">
                          📞 Contact: {venue.contactPhone || 'No direct contact info'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-purple-700 font-extrabold text-base">${venue.price}/hr</span>
                        </div>
                        
                        {deletingVenueId === venue.id ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                            <button
                              onClick={() => {
                                onDeleteVenue(venue.id);
                                setDeletingVenueId(null);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1.5 rounded-xl text-xs cursor-pointer shadow-sm active:scale-95"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeletingVenueId(null)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-2 py-1.5 rounded-xl text-xs cursor-pointer active:scale-95 border border-gray-200"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingVenueId(venue.id)}
                            className="text-red-600 hover:text-white hover:bg-red-600 p-2 border border-red-155 hover:border-transparent rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5"
                            title="Remove Turf Ground"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD NEW GROUND */}
        {adminTab === 'register' && (
          <div className="bg-transparent">
            <RegisterPitch 
              onAddVenue={(newVenue) => {
                onAddVenue(newVenue);
                setAdminTab('overview');
              }} 
              currentUser={currentUser} 
            />
          </div>
        )}

        {/* TAB 3: REAL TIME BOOKINGS LOG */}
        {adminTab === 'bookings' && (
          <div className="space-y-6">
            
            {/* Search filtering logs and headers */}
            <div className="bg-white p-4 rounded-2xl border border-gray-150 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter by match team name, pitch, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <p className="text-xs text-indigo-800 font-semibold bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 block">
                💳 Direct revenue payments listed beneath represent confirmed billing value.
              </p>
            </div>

            {/* List of squad schedules */}
            {filteredBookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 space-y-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <p className="text-gray-500 font-semibold text-sm">No confirmed schedules booked on the platform yet.</p>
                <p className="text-gray-400 text-xs text-center max-w-sm mx-auto">Bookings are generated dynamically when a user clicks 'Book Now' on any active stadium pitch and checks out.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b331c] text-purple-100 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Booking Receipt</th>
                        <th className="px-6 py-4">Ground Details</th>
                        <th className="px-6 py-4">Date & Hour</th>
                        <th className="px-6 py-4">Player / Captain</th>
                        <th className="px-6 py-4">Invoice / Extra</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-gray-700 font-medium font-sans">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-purple-50/20 transition-all">
                          <td className="px-6 py-4 font-mono font-bold text-gray-950">
                            #{b.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={b.venueImage} alt={b.venueName} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-100" />
                              <div className="text-xs">
                                <span className="font-bold text-gray-900 block leading-tight">{b.venueName}</span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                  <MapPin className="w-3 h-3 uppercase" /> {b.venueLocation}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold block text-gray-900">{b.date}</span>
                            <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded font-black mt-1 inline-block uppercase">
                              {b.slot}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900 block capitalize">{b.playerName}</span>
                            <a href={`tel:${b.playerPhone}`} className="text-purple-600 hover:underline flex items-center gap-0.5 mt-0.5 leading-none">
                              <PhoneCall className="w-3 h-3 shrink-0" />
                              <span>{b.playerPhone}</span>
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[11px]">
                              <span className="text-emerald-700 font-black block text-sm">${b.totalPrice} USD</span>
                              <div className="flex gap-1.5 mt-1 text-[9px] text-gray-400 uppercase font-black">
                                {b.extras.bibs && <span className="bg-gray-100 px-1 rounded">Bibs</span>}
                                {b.extras.ballHire && <span className="bg-gray-100 px-1 rounded">Ball</span>}
                                {b.extras.referee && <span className="bg-gray-100 px-1 rounded">Referee</span>}
                                {!b.extras.bibs && !b.extras.ballHire && !b.extras.referee && <span className="text-gray-300">No Extras</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {cancellingBookingId === b.id ? (
                              <div className="flex items-center justify-end gap-1.5 animate-in fade-in duration-100">
                                <span className="text-[10px] text-red-600 font-bold block">Cancel booking?</span>
                                <button
                                  onClick={() => {
                                    onCancelBooking(b.id);
                                    setCancellingBookingId(null);
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer shadow-sm active:scale-95"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setCancellingBookingId(null)}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded-lg text-[10px] cursor-pointer active:scale-95 border border-gray-200"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCancellingBookingId(b.id)}
                                className="text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg border border-red-150 hover:border-transparent cursor-pointer font-bold transition-all text-[10px]"
                              >
                                Refund / Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
