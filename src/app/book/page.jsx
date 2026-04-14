'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, MapPin, Loader2, Info, X, Check, Monitor, LayoutGrid, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BookSeat() {
  const [date, setDate] = useState('');
  const [seatData, setSeatData] = useState({ seats: [], canBook: false, blockReason: '', isAssignedDay: false, userBatch: null, userSquad: null });
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({ message: '', type: '' });
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [userId, setUserId] = useState('1');

  // Set date to next day and grab userId natively from API
  useEffect(() => {
    const uid = localStorage.getItem('userId') || '1';
    setUserId(uid);
    fetchSeats('', uid);
  }, []);

  const fetchSeats = async (selectedDate, uid) => {
    setLoading(true);
    try {
      const url = `/api/seats?userId=${uid}${selectedDate ? `&date=${selectedDate}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data.resolvedDateStr) {
        setDate(data.resolvedDateStr);
      }
      setSeatData(data.error ? { seats: [], canBook: false, blockReason: data.error } : data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    fetchSeats(newDate, userId);
  };

  const handleBook = async () => {
    if (!selectedSeat) return;
    
    setBookingStatus({ message: 'Confirming your booking...', type: 'processing' });
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, seatId: selectedSeat.id, date })
      });
      const data = await res.json();
      if (data.error) {
        setBookingStatus({ message: data.error, type: 'error' });
      } else {
        setBookingStatus({ message: 'Seat reserved successfully!', type: 'success' });
        setSelectedSeat(null);
        fetchSeats(date, userId); // Refresh
      }
    } catch (err) {
      setBookingStatus({ message: 'An unexpected error occurred.', type: 'error' });
    }
    
    setTimeout(() => setBookingStatus({ message: '', type: '' }), 5000);
  };

  const seats = seatData.seats || [];
  const floatingSeats = seats.filter(s => s.type === 'FLOATING');
  const availableFloatingSeats = floatingSeats.filter(s => !s.isBooked).length;
  const bookedFloatingSeats = floatingSeats.filter(s => s.isBooked).length;
  
  const designatedSeats = seats.filter(s => s.type === 'DESIGNATED');

  const openConfirmModal = (seat) => {
    if (!seatData.canBook) return;
    if (seat.isBooked && !seat.isMine) return;
    setSelectedSeat(seat);
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header Panel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 pointer-events-none" />
        <div className="relative z-10 w-full md:w-auto">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-indigo-400" />
            Workspace Grid
          </h1>
          <p className="text-zinc-400 text-sm max-w-md">
            View live seat allocation states and reserve your floating space for unassigned days.
          </p>
        </div>
        
        {/* Date Selector & Batch Info */}
        <div className="relative z-10 flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-3 bg-zinc-950/50 backdrop-blur-md p-3 px-5 rounded-xl border border-white/10 shadow-inner w-full md:w-auto">
            <CalendarIcon className="text-indigo-400 w-5 h-5" />
            <input 
              type="date" 
              value={date}
              min={seatData.resolvedDateStr || date}
              onChange={handleDateChange}
              style={{ colorScheme: 'dark' }}
              className="bg-transparent outline-none text-white font-medium w-full md:w-auto cursor-pointer disabled:opacity-50" 
            />
          </div>
          
          {seatData.userBatch && (
            <div className="flex gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300">
                Squad {seatData.userSquad}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Batch {seatData.userBatch}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Constraints Banner */}
      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "p-4 rounded-xl flex items-center gap-3 border shadow-lg backdrop-blur-md",
              seatData.canBook ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
            )}>
               <Info className="w-5 h-5 flex-shrink-0" />
               <span className="font-medium">
                 {seatData.canBook 
                    ? `Booking open for ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}` 
                    : (seatData.isBefore3PM ? "Booking opens after 3 PM for next working day" : seatData.blockReason)}
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {bookingStatus.message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "p-4 rounded-xl font-medium flex items-center gap-3 shadow-lg border backdrop-blur-md",
              bookingStatus.type === 'error' ? "bg-red-500/10 text-red-400 border-red-500/20" :
              bookingStatus.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
            )}
          >
            {bookingStatus.type === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Info className="w-5 h-5" />}
            {bookingStatus.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Stats & Legend */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Availability</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-center">
                <p className="text-3xl font-bold font-mono text-emerald-400">{availableFloatingSeats}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Available Floats</p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-center">
                <p className="text-3xl font-bold font-mono text-red-400">{bookedFloatingSeats}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Booked Floats</p>
              </div>
            </div>
            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 flex justify-between items-center">
               <span className="text-sm font-medium text-emerald-200">Total Floating Capacity</span>
               <span className="text-xl font-bold font-mono text-emerald-400">10</span>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border-white/5 space-y-3">
             <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">Legend</h3>
             
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/50" />
                <span className="text-sm text-zinc-400">Available Float (Green)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/50" />
                <span className="text-sm text-zinc-400">Booked (Red)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
                <span className="text-sm text-zinc-400">Your Seat (Blue)</span>
              </div>
             <div className="flex items-center gap-3">
               <div className="w-4 h-4 rounded bg-zinc-800/50 border border-zinc-700/50 opacity-50" />
               <span className="text-sm text-zinc-400">Disabled / Not Allowed</span>
             </div>
          </div>
        </div>

        {/* Right Area: Seat Maps */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
             <div className="glass rounded-2xl min-h-[400px] flex flex-col items-center justify-center space-y-4 text-zinc-500">
               <Loader2 className="w-10 h-10 animate-spin text-indigo-500/50" />
               <p>Rendering workspace layout...</p>
             </div>
          ) : (
            <>
              {/* Designated Grid */}
              <div className="glass rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                   <Monitor className="w-5 h-5 text-zinc-400" />
                   <h2 className="text-xl font-bold text-white tracking-tight">Designated Desks</h2>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {designatedSeats.map(seat => <Seat key={seat.id} seat={seat} canBook={seatData.canBook} onClick={() => openConfirmModal(seat)} />)}
                </div>
              </div>

              {/* Floating Grid */}
              <div className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
                <div className="flex items-center gap-2 mb-6 relative z-10">
                   <LayoutGrid className="w-5 h-5 text-purple-400" />
                   <h2 className="text-xl font-bold text-white tracking-tight">Floating Zone</h2>
                   <span className="ml-auto text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded">Shared</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-3 relative z-10">
                  {floatingSeats.map(seat => <Seat key={seat.id} seat={seat} canBook={seatData.canBook} onClick={() => openConfirmModal(seat)} />)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedSeat && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-zinc-950 border border-white/10 p-8 rounded-2xl w-full max-w-sm shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedSeat(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6 text-center">
                 <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                    <MapPin className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-white">Reserve {selectedSeat.name}</h2>
                 <p className="text-zinc-400 text-sm mt-1 uppercase tracking-widest">{selectedSeat.type}</p>
              </div>

              {selectedSeat.isMine ? (
                 <div className="bg-blue-500/10 text-blue-400 p-4 rounded-xl border border-blue-500/20 text-center mb-6 text-sm flex gap-2 items-start">
                   <CircleDashed className="w-5 h-5 shrink-0" />
                   You already own a booking for this seat. Do you want to modify it? (Visit My Bookings to cancel).
                 </div>
              ) : (
                <div className="bg-zinc-900 p-4 rounded-xl border border-white/5 mb-6 space-y-2 text-sm text-zinc-300">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-semibold text-white">{new Date(date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Availability:</span>
                    <span className="font-semibold text-emerald-400">Available</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={selectedSeat.isMine || bookingStatus.type === 'processing'}
                className={cn(
                  "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                  selectedSeat.isMine 
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
                )}
              >
                {bookingStatus.type === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Confirm Booking
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Seat Sub-Component
function Seat({ seat, canBook, onClick }) {
  const isFloating = seat.type === 'FLOATING';
  
  // States
  const isMine = seat.isMine;
  const isBooked = seat.isBooked && !isMine;
  const isAvailable = !seat.isBooked;

  // Determine interactivity
  // Per requirements:
  // 1. "Your Seat" (Preassigned) -> Highlighted Blue, Non-clickable
  // 2. Others Designated -> Disabled Grey, Non-clickable
  // 3. Floating -> Clickable if available
  const disabled = isMine || !isFloating || !canBook || isBooked;

  return (
    <motion.div 
      whileHover={!disabled ? { scale: 1.1, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      title={!isFloating ? (isMine ? "Your auto-assigned designated seat" : (isBooked ? "Occupied designated seat" : "Designated area (Auto-assigned users only)")) : (disabled ? (isBooked ? "Occupied" : "Unavailable") : "Available Floating Seat")}
      className={cn(
        "relative aspect-square flex items-center justify-center rounded-lg border font-mono text-xs font-bold transition-all",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        
        // My Seat
        isMine && "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] z-10 ring-2 ring-blue-500/30",
        
        // Booked (By others)
        isBooked && "bg-red-500/10 text-red-400 border-red-500/30 opacity-80",
        
        // Designated (Not booked, not mine) - Structural/Disabled for manual booking
        (!isFloating && !isBooked && !isMine) && "bg-zinc-800/10 text-zinc-500 border-zinc-700/30 opacity-40",

        // Disabled Floating seats visually due to global constraints
        (isFloating && !canBook && !isBooked && !isMine) && "bg-zinc-800/30 text-emerald-600/30 border-zinc-700/50 opacity-40",
        
        // Available Floating seats map (only visible cleanly if canBook)
        (isFloating && isAvailable && canBook) && "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
      )}
    >
      {isMine ? <Check className="w-4 h-4 text-blue-400 shadow-sm" /> : (isBooked ? <XCircle className="w-4 h-4 opacity-50 shrink-0" /> : seat.name)}
    </motion.div>
  );
}
