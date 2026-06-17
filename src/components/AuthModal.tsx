import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { locations } from '../data/venues';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; phone: string; locationPreference?: string }) => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationPreference, setLocationPreference] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phone.trim()) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }

    const storedUsersJson = localStorage.getItem('turfoota_users');
    const existingUsers = storedUsersJson ? JSON.parse(storedUsersJson) : [];

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please provide your full playing name.');
        return;
      }

      // Check if user already exists
      const userExists = existingUsers.some((u: any) => u.phone === phone.trim());
      if (userExists) {
        setErrorMsg('An athlete account already exists with this phone number.');
        return;
      }

      const newUser = {
        name: name.trim(),
        phone: phone.trim(),
        email: `${phone.trim()}@gobsorarena.com`,
        locationPreference,
        createdAt: new Date().toISOString()
      };

      existingUsers.push(newUser);
      localStorage.setItem('turfoota_users', JSON.stringify(existingUsers));

      setSuccessMsg('Squad athlete profile created! Logging you in...');
      setTimeout(() => {
        onLoginSuccess({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          locationPreference: newUser.locationPreference
        });
        onClose();
        setName('');
        setPhone('');
        setLocationPreference('');
      }, 1200);

    } else {
      // Login validation
      const user = existingUsers.find(
        (u: any) => u.phone === phone.trim()
      );

      if (!user) {
        if (phone.trim() === '0615551111') {
          const defaultUser = {
            name: 'Ahmed Ali',
            email: '0615551111@gobsorarena.com',
            phone: '0615551111',
            locationPreference: 'wadajir'
          };
          setSuccessMsg('Welcome back, Captain Ahmed! Accessing locker room...');
          setTimeout(() => {
            onLoginSuccess(defaultUser);
            onClose();
            setPhone('');
          }, 1200);
          return;
        }

        setErrorMsg('Invalid phone number. Please try again or create a profile first.');
        return;
      }

      setSuccessMsg(`Welcome back, ${user.name}! Accessing your account...`);
      setTimeout(() => {
        onLoginSuccess({
          name: user.name,
          email: user.email,
          phone: user.phone,
          locationPreference: user.locationPreference
        });
        onClose();
        setPhone('');
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Top bar */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-200">
              GobsorArena Athlete Gate
            </span>
          </div>
          <h2 className="text-2xl font-black font-display">
            {mode === 'login' ? 'Squad Access Login' : 'Create Athlete Profile'}
          </h2>
          <p className="text-purple-100 text-xs mt-1">
            {mode === 'login' 
              ? 'Enter your mobile number to access your athlete profile.' 
              : 'Sign up to lock slots instantly, draft players, and host matches.'}
          </p>
        </div>

        {/* Content form */}
        <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-100 text-xs font-semibold flex items-start gap-2 animate-in slide-in-from-top-1 duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-100 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-1 duration-150">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <span>{successMsg}</span>
            </div>
          )}

          {/* SQUAD FORM FIELDS */}
          {mode === 'signup' ? (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  Full Name / Tag Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abdirahman Yusuf"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm font-medium"
                />
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  Mobile Number (EVC Plus / eDahab)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0615551111"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm font-medium"
                />
              </div>

              {/* Fav Field location option */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  Favorite Playing Zone
                </label>
                <select
                  value={locationPreference}
                  onChange={(e) => setLocationPreference(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm font-semibold appearance-none"
                >
                  <option value="">Select Location</option>
                  {locations.filter(l => l.value !== '').map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            /* Login Form only requires Phone Number */
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                Mobile Number (EVC Plus / eDahab)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0615551111"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm font-medium"
              />
            </div>
          )}

          {/* Submit Trigger */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Sparkles className="w-4 h-4 text-purple-200 animate-spin" />
            {mode === 'login' ? 'Proceed Into Football Gate' : 'Confirm Athlete Account'}
          </button>

          {/* Bottom Switch modes links */}
          <div className="text-center pt-3 text-xs">
            {mode === 'login' ? (
              <p className="text-gray-500">
                New athlete on GobsorArena?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className="text-purple-600 font-bold hover:underline cursor-pointer"
                >
                  Create Profile here
                </button>
              </p>
            ) : (
              <p className="text-gray-500">
                Already registered your squad?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="text-purple-600 font-bold hover:underline cursor-pointer"
                >
                  Sign In here
                </button>
              </p>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
