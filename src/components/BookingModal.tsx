import React, { useState } from 'react';
import { Venue, Booking } from '../types';
import { X, Calendar, Clock, Phone, User, Check, ShieldCheck, DollarSign, Wallet, CreditCard, Banknote, ClipboardCheck, ArrowUpRight } from 'lucide-react';

interface BookingModalProps {
  venue: Venue;
  onClose: () => void;
  onAddBooking: (booking: Booking) => void;
  existingBookings: Booking[];
  currentUser?: { name: string; email: string; phone: string; locationPreference?: string } | null;
}

export default function BookingModal({ venue, onClose, onAddBooking, existingBookings, currentUser }: BookingModalProps) {
  // Generate next 7 days for the date selector
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const slots = [
    '06:00 AM - 07:00 AM',
    '08:00 AM - 09:00 AM',
    '10:00 AM - 11:00 AM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '04:00 PM - 05:00 PM',
    '06:00 PM - 07:00 PM',
    '08:00 PM - 09:00 PM',
    '10:00 PM - 11:00 PM',
  ];

  const formattedDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const [checkoutFlowState, setCheckoutFlowState] = useState<'form' | 'loading_redirect' | 'waiting_confirm'>('form');
  const [redirectCountdown, setRedirectCountdown] = useState(4);

  const [selectedDate, setSelectedDate] = useState<string>(formattedDateString(dates[0]));
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  
  // Equip extras state
  const [extras, setExtras] = useState({
    bibs: false,
    ballHire: false,
    referee: false
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'gopay' | 'card' | 'cash'>('gopay');
  const [gopayNumber, setGopayNumber] = useState(currentUser?.phone || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState('');

  // Cost items (USD based)
  const basePrice = venue.price; // Already formatted as USD integer (e.g. 20, 25)
  const bibsPrice = extras.bibs ? 5 : 0;
  const ballPrice = extras.ballHire ? 3 : 0;
  const refPrice = extras.referee ? 12 : 0;
  const totalPrice = basePrice + bibsPrice + ballPrice + refPrice;

  // Determine which slots are already booked on the selected date
  const bookedSlotsOnDate = existingBookings
    .filter(b => b.venueId === venue.id && b.date === selectedDate)
    .map(b => b.slot);

  const performLocalBooking = (bookingId: string, customCreatedAt?: string) => {
    const newBooking: Booking = {
      id: bookingId,
      venueId: venue.id,
      venueName: venue.name,
      venueLocation: venue.location,
      venueSize: venue.size,
      venueImage: venue.image,
      date: selectedDate,
      slot: selectedSlot,
      playerName: name,
      playerPhone: phone,
      extras,
      totalPrice,
      paymentMethod,
      createdAt: customCreatedAt || new Date().toISOString()
    };
    onAddBooking(newBooking);
    setCurrentBookingId(bookingId);
    setShowPaymentSuccess(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please select an available booking hour slot.');
      return;
    }
    if (!name.trim()) {
      alert('Please fill in your primary contact name.');
      return;
    }
    if (!phone.trim()) {
      alert('Please provide a phone number for booking updates.');
      return;
    }
    if (paymentMethod === 'gopay' && !gopayNumber.trim()) {
      alert('Please enter your EVC Plus / eDahab mobile number.');
      return;
    }

    // First initiate redirection & delay before endpoint submission
    setCheckoutFlowState('loading_redirect');
    const delaySeconds = 4;
    setRedirectCountdown(delaySeconds);

    const checkoutUrl = `https://gopay01.vercel.app/?merchant=Morla Cafe&amount=${totalPrice}`;
    window.open(checkoutUrl, '_blank');

    const intervalId = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setCheckoutFlowState('waiting_confirm');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const bookingId = `bk-${Math.floor(Math.random() * 900000) + 100000}`;
    const createdAt = new Date().toISOString();

    const selectedExtrasList: string[] = [];
    if (extras.bibs) selectedExtrasList.push('Training Bibs ($5)');
    if (extras.ballHire) selectedExtrasList.push('Pro Footballs ($3)');
    if (extras.referee) selectedExtrasList.push('Match Referee ($12)');

    const payload = {
      access_key: "0eb6b94a-af57-402a-b1d3-676acf30de07",
      bookingId,
      venueId: venue.id,
      venueName: venue.name,
      venueLocation: venue.location,
      venueSize: venue.size,
      date: selectedDate,
      slot: selectedSlot,
      playerName: name,
      playerPhone: phone,
      playerEmail: currentUser?.email || 'N/A',
      extras: selectedExtrasList.join(', ') || 'None',
      paymentMethod,
      paymentDetails: paymentMethod === 'gopay' ? `GoPay Mobile (${gopayNumber})` : paymentMethod,
      totalAmount: `$${totalPrice}`,
      createdAt
    };

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          performLocalBooking(bookingId, createdAt);
        } else {
          const systemMsg = data.message || 'Booking server error.';
          setSubmitError(`Web3Forms submission error: ${systemMsg}. Please check details and try again.`);
        }
      })
      .catch((err) => {
        console.error('Web3Forms connection error:', err);
        setSubmitError('Failed to save booking. Please check your network connection and try again.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleGoPayRedirect = () => {
    const paymentUrl = `https://gopay01.vercel.app/?merchant=Morla Cafe&amount=${totalPrice}`;
    window.open(paymentUrl, '_blank');
  };

  if (showPaymentSuccess) {
    const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 text-center relative">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <ClipboardCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black font-display">Booking Registered!</h2>
            <p className="text-emerald-50 text-xs mt-1">Ticket Reference: #{currentBookingId}</p>
          </div>

          {/* Ticket Information */}
          <div className="p-6 space-y-6 text-sm text-gray-700">
            <div className="bg-gray-50 border border-gray-150 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>Pass Schedule</span>
                <span className="text-emerald-600">Pending Secure Payment</span>
              </div>
              <div className="border-t border-gray-250/55 my-1" />
              <div>
                <p className="font-semibold text-gray-400 text-xs">Stadium Venue</p>
                <p className="font-bold text-gray-900 text-base">{venue.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <p className="font-semibold text-gray-400 text-[11px]">Match Date</p>
                  <p className="font-bold text-gray-900 text-xs">{displayDate}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-400 text-[11px]">Reserved Hour</p>
                  <p className="font-bold text-gray-900 text-xs">{selectedSlot}</p>
                </div>
              </div>
              <div className="pt-1">
                <p className="font-semibold text-gray-400 text-[11px]">Client Captain</p>
                <p className="font-bold text-gray-900 text-xs">{name} ({phone})</p>
              </div>
              <div className="border-t border-gray-250/55 my-1" />
              <div className="flex justify-between items-center bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-800 text-xs uppercase">Total Payable</span>
                <span className="font-black text-gray-900 text-base">${totalPrice} USD</span>
              </div>
            </div>

            {/* Somalia GoPay Specific Instructions */}
            {paymentMethod === 'gopay' ? (
              <div className="space-y-3.5">
                <div className="bg-purple-50 border border-purple-150 rounded-2xl p-4 text-xs text-purple-950 flex gap-2.5">
                  <Wallet className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-purple-900">Somalia GoPay System Checkout</p>
                    <p className="leading-relaxed">
                      Your reservation slot has been registered. Please click the GoPay button below to launch the secure checkout portal to pay <strong>${totalPrice} USD</strong> via <strong>Hormuud EVC Plus</strong>, <strong>Somtel eDahab</strong>, or <strong>Premier Wallet</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoPayRedirect}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <span>Complete GoPay Portal Checkout</span>
                  <ArrowUpRight className="w-4 h-4 text-purple-200" />
                </button>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-150 rounded-2xl p-4 text-xs text-amber-950 flex gap-2.5">
                <Banknote className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-900">Pay At Arena Booking Confirmed</p>
                  <p className="leading-relaxed">
                    Please prepare <strong>${totalPrice} USD</strong> in cash or Hormuud transfer when you arrive at the {venue.name} counter in Mogadishu before kick-off.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded-xl transition cursor-pointer text-xs text-center"
            >
              Done / Close Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header banner */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer"
            id="close-booking-modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="text-xs font-bold uppercase tracking-widest text-purple-200 bg-white/10 px-3 py-1 rounded-full inline-block mb-2">
            Secure Booking Checkout
          </span>
          <h2 className="text-2xl font-bold font-display">{venue.name}</h2>
          <p className="text-purple-100 text-sm mt-1">{venue.location} • {venue.size} ground</p>
        </div>

        {/* Conditional Layout for Form vs Redirect Loading vs Final Confirmation */}
        {checkoutFlowState === 'loading_redirect' ? (
          <div className="p-10 text-center space-y-6 max-h-[75vh] overflow-y-auto flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-20"></span>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
              <span className="absolute font-black text-purple-700 text-sm">{redirectCountdown}s</span>
            </div>
            
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-xl font-extrabold text-gray-900">Opening GoPay Secure Door...</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                We are launching the Somalia GoPay terminal to process your payment of <strong className="text-purple-700">${totalPrice} USD</strong> securely via EVC Plus or eDahab.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-left text-xs space-y-2.5 max-w-md">
              <p className="font-bold text-purple-900 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                GoPay Handshake Protocol
              </p>
              <p className="text-purple-800 leading-relaxed font-normal text-[11px]">
                If the GoPay tab did not open automatically, please click below to complete your billing trigger manually. We will wait for synchronization.
              </p>
              <button
                type="button"
                onClick={handleGoPayRedirect}
                className="w-full bg-white hover:bg-purple-100 text-purple-700 font-extrabold py-2 px-4 rounded-xl border border-purple-200 transition text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Launch GoPay Tab Manually
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <p className="text-[10px] text-gray-400 font-medium">Securing connection to Hormuud & Somtel channels...</p>
          </div>
        ) : checkoutFlowState === 'waiting_confirm' ? (
          <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto animate-in fade-in duration-300">
            <div className="text-center space-y-2 max-w-md mx-auto">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Handshake Verified</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Confirm your booking below to permanently schedule your turf match and lock this hour in {venue.name}.
              </p>
            </div>

            {/* Ticket Metadata Recap */}
            <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs space-y-3.5 max-w-md mx-auto">
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span>Pass Details Recapitulation</span>
                <span className="text-purple-700 font-black">Ready for reservation</span>
              </div>
              
              <div className="border-t border-gray-200/55" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-gray-400">Date & Slot</p>
                  <p className="font-extrabold text-gray-800 mt-0.5">
                    {new Date(selectedDate).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="font-medium text-gray-500 text-[11px] mt-0.5">{selectedSlot}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400">Athlete Captain</p>
                  <p className="font-extrabold text-gray-800 mt-0.5">{name}</p>
                  <p className="font-medium text-gray-500 text-[11px] mt-0.5">{phone}</p>
                </div>
              </div>

              <div className="border-t border-gray-200/55" />

              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-600">Total Charged Invoice</span>
                <span className="font-black text-purple-700 text-base">${totalPrice} USD</span>
              </div>
            </div>

            {/* Final Action Button & formspree endpoint transmission */}
            <div className="space-y-3 max-w-md mx-auto">
              {submitError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-[11px] font-medium leading-relaxed">
                  ⚠️ {submitError}
                </div>
              )}

              <button
                type="button"
                id="confirm-booking-btn"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className={`w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Storing booking ticket to Web3Forms...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Confirm Your Booking</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCheckoutFlowState('form')}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-gray-700 py-1 transition cursor-pointer"
              >
                Go Back & Adjust Details
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Step 1: Select Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                1. Choose Match Date
              </label>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
                {dates.map((date, idx) => {
                  const dateStr = formattedDateString(date);
                  const isSelected = selectedDate === dateStr;
                  const isToday = idx === 0;
                  
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedSlot(''); // Reset slot selection
                      }}
                      className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-20 py-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-purple-600 bg-purple-50 text-purple-950 shadow-sm' 
                          : 'border-gray-200 hover:border-purple-300 text-gray-800 bg-gray-50'
                      }`}
                    >
                      <span className="text-xs uppercase font-medium">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-xl font-bold mt-1">
                        {date.getDate()}
                      </span>
                      <span className="text-[10px] font-semibold text-purple-600 mt-0.5">
                        {isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose Slot */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-600" />
                2. Select Hourly Slot
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map((slot) => {
                  const isBooked = bookedSlotsOnDate.includes(slot);
                  const isSelected = selectedSlot === slot;
                  
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                        isBooked
                          ? 'bg-gray-100 border-gray-200 text-gray-400 line-through cursor-not-allowed'
                          : isSelected
                          ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                          : 'bg-white border-gray-200 hover:border-purple-400 text-gray-700'
                      }`}
                    >
                      {slot}
                      {isBooked && (
                        <span className="absolute bottom-0.5 text-[8px] font-bold text-red-500 uppercase tracking-wider">
                          Occupied
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Match Day Extras */}
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <h3 className="text-sm font-semibold text-purple-950 mb-3 flex items-center gap-1.5">
                ⚽ Match Day Extras (Optional Add-ons)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Bibs Toggle */}
                <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all bg-white hover:border-purple-300 ${extras.bibs ? 'border-purple-600 shadow-sm' : 'border-gray-200'}`}>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">Training Bibs</span>
                    <span className="text-[10px] text-gray-500">+$5 / game</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={extras.bibs}
                    onChange={(e) => setExtras({ ...extras, bibs: e.target.checked })}
                    className="w-4 h-4 text-purple-600 accent-purple-600 focus:ring-purple-500 rounded"
                  />
                </label>

                {/* Balls Toggle */}
                <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all bg-white hover:border-purple-300 ${extras.ballHire ? 'border-purple-600 shadow-sm' : 'border-gray-200'}`}>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">Pro Footballs x2</span>
                    <span className="text-[10px] text-gray-500">+$3 / game</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={extras.ballHire}
                    onChange={(e) => setExtras({ ...extras, ballHire: e.target.checked })}
                    className="w-4 h-4 text-purple-600 accent-purple-600 focus:ring-purple-500 rounded"
                  />
                </label>

                {/* Referee Toggle */}
                <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all bg-white hover:border-purple-300 ${extras.referee ? 'border-purple-600 shadow-sm' : 'border-gray-200'}`}>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">Match Referee</span>
                    <span className="text-[10px] text-gray-500">+$12 / game</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={extras.referee}
                    onChange={(e) => setExtras({ ...extras, referee: e.target.checked })}
                    className="w-4 h-4 text-purple-600 accent-purple-600 focus:ring-purple-500 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Step 4: Player Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  Your Primary Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abdirahman Yusuf"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  Phone Number (EVC Plus / eDahab)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0615551111"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition text-sm font-medium"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                Select Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gopay')}
                  className={`py-2.5 px-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'gopay'
                      ? 'border-purple-600 bg-purple-50 text-purple-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                    <span className="font-bold text-[10px]">GoPay Somalia</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-normal">EVC+ / eDahab</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2.5 px-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0 text-indigo-600" />
                  <span className="font-bold text-[10px]">Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2.5 px-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-orange-500 bg-orange-50 text-orange-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Banknote className="w-4 h-4 shrink-0 text-orange-500" />
                  <span className="font-bold text-[10px]">Pay At Pitch</span>
                </button>
              </div>

              {paymentMethod === 'gopay' && (
                <div className="mt-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100 animate-in slide-in-from-top-2 duration-150">
                  <p className="text-xs text-purple-800 mb-2 font-medium">
                    We will register your billing trigger with GoPay Somalia (Hormuud EVC Plus / eDahab). Please enter your Somalian phone number below.
                  </p>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-purple-700">+252</span>
                    <input
                      type="tel"
                      value={gopayNumber}
                      onChange={(e) => setGopayNumber(e.target.value)}
                      placeholder="615551111"
                      className="w-full pl-16 pr-4 py-2 bg-white border border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 text-sm font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Breakdown & Summary */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Cost Breakdown
              </h4>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Standard Pitch Fee (1 hour)</span>
                <span className="font-semibold">${basePrice.toLocaleString()} USD</span>
              </div>
              {extras.bibs && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Training Bibs (Set of 14)</span>
                  <span>+$5</span>
                </div>
              )}
              {extras.ballHire && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Match Footballs Hire</span>
                  <span>+$3</span>
                </div>
              )}
              {extras.referee && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Professional Referee Fee</span>
                  <span>+$12</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                <span>Total Payable</span>
                <span className="text-purple-700 text-lg">${totalPrice.toLocaleString()} USD</span>
              </div>
            </div>

            {/* Submit Button */}
            {submitError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs font-semibold space-y-2 animate-in slide-in-from-top-1">
                <p className="text-amber-850 leading-relaxed font-bold">⚠️ Connection Issue with Web3Forms Endpoint</p>
                <p className="leading-relaxed font-normal text-amber-800">{submitError}</p>
                <div className="flex gap-2.5 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setSubmitError(null)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition cursor-pointer"
                  >
                    Clear & Retry
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              id="confirm-booking-btn"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting Booking slot to Web3Forms...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Process Booking & Lock Slot</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-gray-400">
              By booking, you agree to GobsorArena's 12-hour free match rescheduling and cancellation terms.
            </p>

          </form>
        )}
      </div>
    </div>
  );
}
