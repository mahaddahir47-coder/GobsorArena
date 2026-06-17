import React, { useState } from 'react';
import { Venue } from '../types';
import { PlusCircle, Image, Sparkles, Phone, Shield, ArrowRight, DollarSign, CloudSun } from 'lucide-react';

interface RegisterPitchProps {
  onAddVenue: (venue: Venue) => void;
  currentUser?: { name: string; email: string; phone: string; locationPreference?: string } | null;
}

const DEFAULT_PITCH_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80', label: 'Premium Stadium Turf' },
  { url: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&q=80', label: 'Modern Urban Cage Pitch' },
  { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', label: 'Lush Grass Ground view' },
  { url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80', label: 'Night Illuminated Pitch' }
];

export default function RegisterPitch({ onAddVenue, currentUser }: RegisterPitchProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('2000');
  const [size, setSize] = useState<'5-aside' | '7-aside' | '11-aside'>('7-aside');
  const [location, setLocation] = useState('Hodan, Mogadishu');
  const [selectedImage, setSelectedImage] = useState(DEFAULT_PITCH_IMAGES[0].url);
  const [customImage, setCustomImage] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');

  React.useEffect(() => {
    if (currentUser?.phone) {
      setContactPhone(currentUser.phone);
    }
  }, [currentUser]);
  
  // Amenities list state
  const [amenities, setAmenities] = useState({
    floodlights: true,
    changingRooms: true,
    hotShowers: false,
    freeParking: true,
    waterDispenser: true,
    wifi: false,
    cafeteria: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please fill in the official ground or arena name.');
      return;
    }
    if (!contactPhone.trim()) {
      alert('Please provide an official contact phone number for bookings validation.');
      return;
    }

    const compiledAmenitiesList: string[] = [];
    if (amenities.floodlights) compiledAmenitiesList.push('Floodlights');
    if (amenities.changingRooms) compiledAmenitiesList.push('Changing Rooms');
    if (amenities.hotShowers) compiledAmenitiesList.push('Hot Showers');
    if (amenities.freeParking) compiledAmenitiesList.push('Free Parking');
    if (amenities.waterDispenser) compiledAmenitiesList.push('Water Dispenser');
    if (amenities.wifi) compiledAmenitiesList.push('WiFi');
    if (amenities.cafeteria) compiledAmenitiesList.push('Cafeteria');

    const newVenue: Venue = {
      id: Date.now(),
      name: name,
      price: Number(price) || 2000,
      size: size,
      location: location,
      nextSlot: 'Today at 6:00 PM', // Default starter slot
      image: customImage.trim() ? customImage.trim() : selectedImage,
      rating: 5.0, // Brand new pitch gets great starting score
      reviewsCount: 0,
      reviewsList: [],
      amenities: compiledAmenitiesList,
      contactPhone: contactPhone,
      description: description || `Welcome to ${name} football ground located in ${location}. Our premium artificial turf is fully equipped, offering an outstanding matchday play experience for Mogadishu players.`
    };

    onAddVenue(newVenue);

    // Reset fields
    setName('');
    setPrice('25');
    setSize('7-aside');
    setLocation('Wadajir, Mogadishu');
    setSelectedImage(DEFAULT_PITCH_IMAGES[0].url);
    setCustomImage('');
    setDescription('');
    setContactPhone('');
    alert('Pitch Registered Successfully! Your turf grounds are now live, searchable, and accepting reservations on GobsorArena.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start animate-in fade-in duration-200" id="register-pitch-form-block">
      
      {/* Monetization tips column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gradient-to-br from-purple-800 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-lg space-y-5">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-300 bg-white/15 px-3 py-1 rounded-full">
            Turf Management Suite
          </span>
          <h2 className="text-3xl font-black font-display leading-tight">Partner with GobsorArena</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Own or operate a football ground in Somalia? List your property with us today to coordinate empty slots, receive instant GoPay payments, and reach over 1,500 matches looking for turf layouts weekly.
          </p>

          <div className="border-t border-white/10 pt-5 space-y-4">
            <div className="flex gap-3 text-xs leading-relaxed">
              <span className="text-lg grow-0">🚀</span>
              <div>
                <p className="font-bold text-white">Instant Slots Updates</p>
                <p className="text-gray-300">Set slots online; players matches automatically fill open spots on verification.</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs leading-relaxed">
              <span className="text-lg grow-0">💳</span>
              <div>
                <p className="font-bold text-white">Secured Transactions</p>
                <p className="text-gray-300">Payments route straight via verified Safaricom MPesa API. No double-bookings.</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs leading-relaxed">
              <span className="text-lg grow-0">🔐</span>
              <div>
                <p className="font-bold text-white">Full Occupancy Management</p>
                <p className="text-gray-300">Optionally catalog multiple layouts, bibs rentals, balls, and local referrers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 flex items-center gap-4">
          <Shield className="w-10 h-10 text-purple-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-purple-900">Operator Safety & Direct Inquiries</p>
            <p className="text-purple-700 mt-1">Our field success crew manually cross-checks ground locations with satellite imagery to grant the "Verified Pitch" organic badge.</p>
          </div>
        </div>
      </div>

      {/* Registration form column */}
      <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-display">🏟️ Register Your Football Arena</h3>
          <p className="text-xs text-gray-500 mt-0.5">Please provide accurate description parameters. Field parameters will show instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ground Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Official Arena / Ground Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Parklands Golden Turf"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm"
              id="new-pitch-name"
            />
          </div>

          {/* Pricing & Layout Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Ground Location (Mogadishu / District Zone)
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hodan, Mogadishu"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Layout Match-Size
              </label>
              <select
                required
                value={size}
                onChange={(e) => setSize(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm"
              >
                <option value="5-aside">5-aside (fenced)</option>
                <option value="7-aside">7-aside (midfield)</option>
                <option value="11-aside">11-aside (pro stadium)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                Hourly Pitch Rate (USD $)
              </label>
              <input
                type="number"
                required
                min={5}
                max={500}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                Inquiry Mobile Hotline
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +254 712 345 678"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Arena Description / Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline pitch material breed, security state, parking volume, nearby milestones..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm resize-none"
            ></textarea>
          </div>

          {/* Preset Images Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1">
              <Image className="w-3.5 h-3.5 text-purple-600" />
              Select Visual Asset Showcase
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEFAULT_PITCH_IMAGES.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => {
                    setSelectedImage(img.url);
                    setCustomImage('');
                  }}
                  className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === img.url && !customImage
                      ? 'border-purple-600 ring-2 ring-purple-400'
                      : 'border-transparent hover:scale-95'
                  }`}
                  title={img.label}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="mt-3.5">
              <input
                type="url"
                value={customImage}
                onChange={(e) => setCustomImage(e.target.value)}
                placeholder="Or paste a custom image URL..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-purple-600"
              />
            </div>
          </div>

          {/* Amenities checklist */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Feature Amenities Included
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={amenities.floodlights}
                  onChange={(e) => setAmenities({ ...amenities, floodlights: e.target.checked })}
                  className="rounded text-purple-600 accent-purple-600 focus:ring-purple-500"
                />
                Floodlights
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={amenities.changingRooms}
                  onChange={(e) => setAmenities({ ...amenities, changingRooms: e.target.checked })}
                  className="rounded text-purple-600 accent-purple-600 focus:ring-purple-500"
                />
                Changing Rooms
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={amenities.hotShowers}
                  onChange={(e) => setAmenities({ ...amenities, hotShowers: e.target.checked })}
                  className="rounded text-purple-600 accent-purple-600 focus:ring-purple-500"
                />
                Hot Showers
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={amenities.freeParking}
                  onChange={(e) => setAmenities({ ...amenities, freeParking: e.target.checked })}
                  className="rounded text-purple-600 accent-purple-600 focus:ring-purple-500"
                />
                Free Parking
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={amenities.waterDispenser}
                  onChange={(e) => setAmenities({ ...amenities, waterDispenser: e.target.checked })}
                  className="rounded text-purple-600 accent-purple-600 focus:ring-purple-500"
                />
                Water Dispenser
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={amenities.wifi}
                  onChange={(e) => setAmenities({ ...amenities, wifi: e.target.checked })}
                  className="rounded text-purple-600 accent-purple-600 focus:ring-purple-500"
                />
                Free Wi-Fi
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={amenities.cafeteria}
                  onChange={(e) => setAmenities({ ...amenities, cafeteria: e.target.checked })}
                  className="rounded text-purple-600 accent-purple-600 focus:ring-purple-500"
                />
                Food/Cafeteria
              </label>
            </div>
          </div>

          {/* Submit registration */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-5 h-5 text-purple-200" />
            Launch Digital Ground
          </button>
        </form>
      </div>

    </div>
  );
}
