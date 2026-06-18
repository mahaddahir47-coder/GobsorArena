import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { locations } from '../data/venues';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; phone: string; locationPreference?: string; role?: 'player' | 'admin' }) => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Custom states for Supabase
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'player' | 'admin'>('player');

  // Existing states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationPreference, setLocationPreference] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      /**
       * SUPABASE REAL AUTHENTICATION FLOW
       */
      try {
        if (!email.trim() || !password.trim()) {
          setErrorMsg('Please specify both your email address and password.');
          setLoading(false);
          return;
        }

        if (mode === 'signup') {
          if (!name.trim()) {
            setErrorMsg('Please provide your full athlete name.');
            setLoading(false);
            return;
          }
          if (!phone.trim()) {
            setErrorMsg('Please enter your mobile phone number.');
            setLoading(false);
            return;
          }

          // Register in Supabase auth
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                name: name.trim(),
                phone: phone.trim(),
                locationPreference: locationPreference,
                role: role // 'player' or 'admin'
              }
            }
          });

          if (error) {
            setErrorMsg(error.message);
            setLoading(false);
            return;
          }

          setSuccessMsg('Profile created! Logging you into GobsorArena...');
          
          // Let's check if the trigger worked or we should do auto login
          setTimeout(() => {
            onLoginSuccess({
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              locationPreference: locationPreference,
              role: role
            });
            onClose();
            // Reset fields
            setName('');
            setEmail('');
            setPassword('');
            setPhone('');
            setLocationPreference('');
            setRole('player');
          }, 1500);

        } else {
          // Supabase SignIn
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
          });

          if (error) {
            setErrorMsg(error.message);
            setLoading(false);
            return;
          }

          // Fetch the associated user profile
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user?.id)
            .single();

          const loadedUser = {
            name: profile?.name || data.user?.user_metadata?.name || 'Verified Athlete',
            email: email.trim(),
            phone: profile?.phone || data.user?.user_metadata?.phone || '+252 61...',
            locationPreference: profile?.location_preference || data.user?.user_metadata?.locationPreference || '',
            role: (profile?.role || data.user?.user_metadata?.role || 'player') as 'player' | 'admin'
          };

          // If they signed in as admin, also sync admin_logged_in in localStorage for legacy controllers
          if (loadedUser.role === 'admin') {
            localStorage.setItem('gobsor_admin_logged_in', 'true');
          }

          setSuccessMsg(`Welcome back, ${loadedUser.name}! Opening Locker Room...`);
          setTimeout(() => {
            onLoginSuccess(loadedUser);
            onClose();
            setEmail('');
            setPassword('');
          }, 1200);
        }
      } catch (err: any) {
        console.error('Supabase Auth error:', err);
        setErrorMsg('Authentication error. Please check credentials or host setup.');
      } finally {
        setLoading(false);
      }
    } else {
      /**
       * BACKWARD-COMPATIBLE LOCAL STORAGE MOCK AUTHENTICATION
       */
      try {
        if (!phone.trim()) {
          setErrorMsg('Please enter your mobile number.');
          setLoading(false);
          return;
        }

        const storedUsersJson = localStorage.getItem('turfoota_users');
        const existingUsers = storedUsersJson ? JSON.parse(storedUsersJson) : [];

        if (mode === 'signup') {
          if (!name.trim()) {
            setErrorMsg('Please provide your full playing name.');
            setLoading(false);
            return;
          }

          // Check if user already exists
          const userExists = existingUsers.some((u: any) => u.phone === phone.trim());
          if (userExists) {
            setErrorMsg('An athlete account already exists with this phone number.');
            setLoading(false);
            return;
          }

          const newUser = {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || `${phone.trim()}@gobsorarena.com`,
            locationPreference,
            role: role,
            createdAt: new Date().toISOString()
          };

          existingUsers.push(newUser);
          localStorage.setItem('turfoota_users', JSON.stringify(existingUsers));

          // If role is admin, let them access admin mode
          if (role === 'admin') {
            localStorage.setItem('gobsor_admin_logged_in', 'true');
          }

          setSuccessMsg('Squad athlete profile created! Logging you in...');
          setTimeout(() => {
            onLoginSuccess({
              name: newUser.name,
              email: newUser.email,
              phone: newUser.phone,
              locationPreference: newUser.locationPreference,
              role: newUser.role
            });
            onClose();
            setName('');
            setPhone('');
            setEmail('');
            setPassword('');
            setLocationPreference('');
            setRole('player');
          }, 1200);

        } else {
          // Login validation
          const user = existingUsers.find(
            (u: any) => u.phone === phone.trim() || (email.trim() && u.email === email.trim())
          );

          if (!user) {
            // Check default hardcoded player
            if (phone.trim() === '0615551111' || phone.trim() === '615551111') {
              const defaultUser = {
                name: 'Ahmed Ali',
                email: '0615551111@gobsorarena.com',
                phone: '0615551111',
                locationPreference: 'wadajir',
                role: 'player' as const
              };
              setSuccessMsg('Welcome back, Captain Ahmed! Accessing locker room...');
              setTimeout(() => {
                onLoginSuccess(defaultUser);
                onClose();
                setPhone('');
              }, 1200);
              return;
            }

            // Check if admin password is input directly as the phone
            if (phone.trim() === 'admin' || phone.trim() === 'admin226') {
              const defaultAdmin = {
                name: 'Gobsor Controller',
                email: 'admin@gobsorarena.com',
                phone: '0615551111',
                role: 'admin' as const
              };
              localStorage.setItem('gobsor_admin_logged_in', 'true');
              setSuccessMsg('Welcome back, Administrator Controller! Accessing master panel...');
              setTimeout(() => {
                onLoginSuccess(defaultAdmin);
                onClose();
                setPhone('');
              }, 1200);
              return;
            }

            setErrorMsg('Invalid phone number or profile search mismatch. Please create an account.');
            setLoading(false);
            return;
          }

          if (user.role === 'admin') {
            localStorage.setItem('gobsor_admin_logged_in', 'true');
          }

          setSuccessMsg(`Welcome back, ${user.name}! Accessing your account...`);
          setTimeout(() => {
            onLoginSuccess({
              name: user.name,
              email: user.email,
              phone: user.phone,
              locationPreference: user.locationPreference,
              role: user.role
            });
            onClose();
            setPhone('');
            setEmail('');
          }, 1200);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Unexpected login failure. Clear local cookies and retry.');
      } finally {
        setLoading(false);
      }
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
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-200">
                GobsorArena Athlete Gate
              </span>
            </div>
            {isSupabaseConfigured ? (
              <span className="bg-emerald-550/30 text-emerald-200 border border-emerald-400/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                🛡️ Supabase Live
              </span>
            ) : (
              <span className="bg-amber-600/30 text-amber-200 border border-amber-400/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                🔌 Local Sandbox
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black font-display">
            {mode === 'login' ? 'Squad Access Login' : 'Create Athlete Profile'}
          </h2>
          <p className="text-purple-100 text-xs mt-1">
            {mode === 'login' 
              ? 'Enter your credentials to manage your bookings and join match squads.' 
              : 'Create a direct player account to book pitches and track matches.'}
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

          {/* S_ROLE TOGGLE - ONLY SHOWN IN SIGNUP, OR WITH ADULT DISCRETION */}
          {mode === 'signup' && (
            <div className="bg-gray-50 border border-gray-150 p-3 rounded-2xl">
              <label className="text-[10px] uppercase font-black tracking-wider text-gray-500 block mb-2">
                Choose Athlete Privilege Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('player')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    role === 'player'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                  }`}
                >
                  ⚽ Player Member
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                    role === 'admin'
                      ? 'bg-indigo-650 text-white shadow-sm'
                      : 'bg-white text-gray-650 hover:text-gray-900 border border-gray-200'
                  }`}
                >
                  🔑 Stadium Admin
                </button>
              </div>
            </div>
          )}

          {/* SUPABASE FORM FIELDS */}
          {isSupabaseConfigured ? (
            <div className="space-y-3.5">
              {mode === 'signup' && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                      Athlete Nickname / Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Abdirahman Yusuf"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-xs font-medium"
                    />
                  </div>

                  {/* Phone number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-purple-600" />
                      Mobile Number (EVC Plus / eDahab)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0615551111"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-xs font-medium"
                    />
                  </div>

                  {/* Fav Field location option */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      Favorite Playing Zone
                    </label>
                    <select
                      value={locationPreference}
                      onChange={(e) => setLocationPreference(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-xs font-semibold"
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
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-xs font-medium"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-xs font-medium"
                />
              </div>
            </div>
          ) : (
            /* LOCAL SANDBOX FIELDS - STAYS AS PHONE SYSTEM TO MATCH ORIGINAL BEHAVIOR */
            <div className="space-y-3.5">
              {mode === 'signup' && (
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

                  {/* Favorite location preference */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      Favorite Playing Zone
                    </label>
                    <select
                      value={locationPreference}
                      onChange={(e) => setLocationPreference(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm font-semibold"
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
              )}

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  Mobile Number (or 'admin' for operator pass)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0615551111"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-sm font-medium"
                />
              </div>
            </div>
          )}

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer mt-2 ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing Credentials...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>{mode === 'login' ? 'Proceed Into Football Gate' : 'Confirm Athlete Account'}</span>
              </>
            )}
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
