import React, { useState } from 'react';
import { MatchPost, Venue } from '../types';
import { Users, UserPlus, MapPin, Calendar, Clock, PlusCircle, CheckCircle, Info, User, Phone } from 'lucide-react';

interface CommunityMatchesProps {
  venues: Venue[];
  matches: MatchPost[];
  onJoinMatch: (matchId: string, playerName: string) => void;
  onAddMatch: (match: MatchPost) => void;
}

export default function CommunityMatches({ venues, matches, onJoinMatch, onAddMatch }: CommunityMatchesProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hostName, setHostName] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [matchTitle, setMatchTitle] = useState('');
  const [selectedVenueName, setSelectedVenueName] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchSlot, setMatchSlot] = useState('');
  const [spotsNeeded, setSpotsNeeded] = useState(10);
  
  // Join player input helper state
  const [joiningNames, setJoiningNames] = useState<{ [matchId: string]: string }>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim() || !matchTitle.trim() || !selectedVenueName || !matchDate || !matchSlot) {
      alert('Please fill in check all required fields to post your football squad match.');
      return;
    }

    const matchedVenue = venues.find(v => v.name === selectedVenueName);
    const location = matchedVenue ? matchedVenue.location : 'Mogadishu';

    const newMatch: MatchPost = {
      id: `match-${Date.now()}`,
      title: matchTitle,
      venueName: selectedVenueName,
      venueLocation: location,
      date: matchDate,
      timeSlot: matchSlot,
      creatorName: hostName,
      creatorPhone: hostPhone,
      spotsNeeded: spotsNeeded,
      spotsFilled: 1,
      playersList: [hostName]
    };

    onAddMatch(newMatch);
    
    // Reset forms
    setHostName('');
    setHostPhone('');
    setMatchTitle('');
    setSelectedVenueName('');
    setMatchDate('');
    setMatchSlot('');
    setSpotsNeeded(10);
    setShowCreateForm(false);
    alert('Match session created successfully! Players can now view and join your team.');
  };

  const handleJoinClick = (matchId: string) => {
    const pName = joiningNames[matchId]?.trim();
    if (!pName) {
      alert('Please enter your nickname or playing name to join this squad.');
      return;
    }

    onJoinMatch(matchId, pName);
    // Clear the input
    setJoiningNames({ ...joiningNames, [matchId]: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="community-matcher-board">
      
      {/* Intro details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-indigo-900 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-lg">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-300 bg-white/10 px-3 py-1 rounded-full">
            No Team? No Problem.
          </span>
          <h2 className="text-3xl font-black font-display mt-3 leading-tight">Players & Squad Matcher</h2>
          <p className="text-gray-300 text-sm mt-1.5 max-w-xl">
            Short of a full team or looking for a casual match to play? Join active public squads in your area or list a match to find the players you need.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1.5 bg-white text-purple-950 font-bold px-6 py-3 rounded-2xl shadow-md cursor-pointer hover:bg-purple-50 transition-all text-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-purple-700" />
          {showCreateForm ? 'View Active Matches' : 'Host a Match'}
        </button>
      </div>

      {/* Host Game Form */}
      {showCreateForm && (
        <form onSubmit={handleCreatePost} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-lg font-bold text-gray-900 font-display">👥 Host a New Match Session</h3>
            <p className="text-xs text-gray-500 mt-0.5">Fill in match details so other players in Mogadishu can join your active squad.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                Host Name / Team Captain
              </label>
              <input
                type="text"
                required
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="e.g. Captain Brian"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                Contact Phone (optional)
              </label>
              <input
                type="tel"
                value={hostPhone}
                onChange={(e) => setHostPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Match Title or Request Notice
              </label>
              <input
                type="text"
                required
                value={matchTitle}
                onChange={(e) => setMatchTitle(e.target.value)}
                placeholder="e.g. Weekly friendly 7v7 - Defenders needed!"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Select Football Arena
              </label>
              <select
                required
                value={selectedVenueName}
                onChange={(e) => setSelectedVenueName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm appearance-none"
              >
                <option value="">-- Choose pitch --</option>
                {venues.map(v => (
                  <option key={v.id} value={v.name}>{v.name} ({v.location})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Kick-off Date
              </label>
              <input
                type="date"
                required
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Kick-off Time Slot
              </label>
              <select
                required
                value={matchSlot}
                onChange={(e) => setMatchSlot(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm"
              >
                <option value="">-- Choose hour slot --</option>
                <option value="06:00 AM - 07:00 AM">06:00 AM - 07:00 AM</option>
                <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                <option value="08:00 PM - 09:00 PM">08:00 PM - 09:00 PM</option>
                <option value="10:00 PM - 11:00 PM">10:00 PM - 11:00 PM</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Squad Max Capacity (Total Players)
              </label>
              <input
                type="number"
                min={2}
                max={30}
                value={spotsNeeded}
                onChange={(e) => setSpotsNeeded(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition duration-200 cursor-pointer"
          >
            Post Public Session
          </button>
        </form>
      )}

      {/* Active Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((post) => {
          const spotsLeft = post.spotsNeeded - post.playersList.length;
          const isFull = spotsLeft <= 0;

          return (
            <div 
              key={post.id} 
              className="bg-white border border-gray-200/95 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
            >
              {/* Badge indicator */}
              <div className={`absolute top-4 right-4 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                isFull 
                  ? 'bg-red-50 text-red-600 border border-red-100' 
                  : 'bg-green-50 text-green-700 border border-green-100'
              }`}>
                {isFull ? 'Squad Full' : `${spotsLeft} Spots Open`}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md inline-block mb-3.5">
                  Host: {post.creatorName}
                </span>
                
                <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 font-display">
                  {post.title}
                </h3>

                <div className="space-y-1.5 text-xs text-gray-600 mb-5">
                  <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{post.venueName} • <span className="text-xs text-gray-500 font-normal">{post.venueLocation}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{new Date(post.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{post.timeSlot}</span>
                  </div>
                </div>

                {/* Squad Members List */}
                <div className="bg-gray-50 border border-gray-100/80 p-3.5 rounded-2xl mb-4.5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">
                    Squad Roster ({post.playersList.length} / {post.spotsNeeded})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-[85vh] overflow-y-auto">
                    {post.playersList.map((player, pIdx) => (
                      <span 
                        key={pIdx}
                        className="bg-white px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-800 border border-gray-200/80 flex items-center gap-1 shadow-sm"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {player}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Trigger */}
              {!isFull ? (
                <div className="flex gap-2 items-center mt-3 border-t border-gray-100 pt-3">
                  <input
                    type="text"
                    value={joiningNames[post.id] || ''}
                    onChange={(e) => setJoiningNames({ ...joiningNames, [post.id]: e.target.value })}
                    placeholder="Enter your playing name/tag..."
                    className="flex-1 text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleJoinClick(post.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1 shadow cursor-pointer transition-all shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Join Squad
                  </button>
                </div>
              ) : (
                <div className="bg-gray-100 text-gray-500 text-xs font-semibold p-2.5 rounded-xl text-center flex items-center justify-center gap-1 mt-3">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  Roster Fully Subscribed!
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
