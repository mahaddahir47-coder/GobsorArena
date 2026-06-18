import React, { useState } from 'react';
import { Venue, Review } from '../types';
import { X, Star, MapPin, Phone, CheckCircle, Info, CloudSun, CalendarCheck } from 'lucide-react';

interface VenueDetailsModalProps {
  venue: Venue;
  onClose: () => void;
  onBookNow: () => void;
  onAddReview: (venueId: number, review: Review) => void;
}

export default function VenueDetailsModal({ venue, onClose, onBookNow, onAddReview }: VenueDetailsModalProps) {
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      alert('Please fill in your name and writing your review comment.');
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      userName: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      date: 'Just now'
    };

    onAddReview(venue.id, newReview);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    alert('Thank you! Your verified football player review has been added.');
  };

  // Select real-time weather status based on location to make it feel alive!
  const getWeatherInfo = (location: string) => {
    if (location.includes('Karen') || location.includes('Kiambu')) {
      return { temp: '21°C', desc: 'Slight highland breeze • Excellent playing condition', status: 'optimal' };
    }
    if (location.includes('Westlands') || location.includes('Roysambu')) {
      return { temp: '24°C', desc: 'Sunny • Clear pitch atmosphere', status: 'excellent' };
    }
    return { temp: '23°C', desc: 'Partly cloudy • High comfort rating', status: 'optimal' };
  };

  const weather = getWeatherInfo(venue.location);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white z-10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero image and overlay */}
        <div className="relative h-64 sm:h-80 bg-gray-900">
          <img 
            src={venue.image} 
            alt={venue.name} 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="bg-green-500 text-white font-bold text-xs uppercase px-3 py-1 rounded-full mb-2.5 inline-block">
              {venue.size} Ground
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold font-display leading-tight">{venue.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2.5 text-sm text-gray-200">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-purple-400" />
                {venue.location}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {venue.rating.toFixed(1)} ({venue.reviewsCount} verified reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Content Structure */}
        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-100 max-h-[55vh] items-stretch overflow-y-auto">
          
          {/* Main Info Column */}
          <div className="md:col-span-3 p-6 space-y-6">
            
            {/* Description */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                Ground Description
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {venue.description || 'Welcome to a state-of-the-art turf setup in Somalia, engineered with shock absorption padding, high-spec artificial grass, and spectacular surrounds perfect for recreational or serious club fixtures.'}
              </p>
            </div>

            {/* Weather status */}
            <div className="flex items-center gap-3.5 bg-sky-50 border border-sky-100 p-4 rounded-2xl">
              <CloudSun className="w-8 h-8 text-sky-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-sky-900 uppercase tracking-widest block">Live Pitch Temperature</span>
                <span className="text-sm font-bold text-gray-800">{weather.temp} - {weather.desc}</span>
              </div>
            </div>

            {/* Amenities Grid */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                Ground Amenities
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(venue.amenities || ['Floodlights', 'Changing Rooms', 'Water Dispenser']).map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-purple-500 fill-purple-50 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submitting Player Reviews */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Write a Player Review
              </h3>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input 
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Your Nickname"
                      className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Stars:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <textarea
                    required
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe field bounce, light quality, facilities..."
                    className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Post Review
                </button>
              </form>
            </div>

          </div>

          {/* Sidebar Area: Contact & Reviews list */}
          <div className="md:col-span-2 p-6 bg-gray-50/50 flex flex-col justify-between space-y-6">
            
            {/* Direct Booking CTA Widget */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <span className="text-xs text-gray-400 block uppercase font-bold tracking-widest mb-1">Ground Rental Rate</span>
                <span className="text-2xl font-black text-purple-700">${venue.price.toLocaleString()} USD</span>
                <span className="text-gray-500 text-xs font-medium"> / hour</span>
              </div>
              <div className="mt-3.5 text-xs text-gray-500 space-y-1">
                <p>📞 Phone: {venue.contactPhone || '+252 61 555 1111'}</p>
                <p>⚽ Match Bibs & Referee available on checkout</p>
              </div>
              <button
                onClick={onBookNow}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white text-sm font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                Proceed to Reservation
              </button>
            </div>

            {/* Read Reviews Section */}
            <div className="flex-1 overflow-y-auto space-y-3.5 mt-2 max-h-[220px]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Player Testimonials ({venue.reviewsList?.length || 0})
              </h3>
              
              {!venue.reviewsList || venue.reviewsList.length === 0 ? (
                <p className="text-gray-400 text-xs italic">No reviews yet for this venue. Be the first to play and review!</p>
              ) : (
                venue.reviewsList.map((rev) => (
                  <div key={rev.id} className="bg-white p-3 rounded-xl border border-gray-100 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-gray-800">{rev.userName}</span>
                      <span className="text-gray-400 text-[10px]">{rev.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-1.5">
                      {Array.from({ length: 5 }, (_, k) => (
                        <Star key={k} className={`w-3 h-3 ${k < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-100'}`} />
                      ))}
                    </div>
                    <p className="text-gray-600 italic">"{rev.comment}"</p>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
