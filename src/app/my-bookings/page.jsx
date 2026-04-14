'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Trash2, CheckCircle2, Ticket, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MyBookings() {
  const [userId, setUserId] = useState('');
  const [allocation, setAllocation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelStatus, setCancelStatus] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('userId') || '1';
    setUserId(id);
    fetchAllocation(id);
  }, []);

  const fetchAllocation = async (uid) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/allocation?userId=${uid}`);
      const data = await res.json();
      setAllocation(data.allocation || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you certain you want to release this seat? It will be immediately available to others.')) return;
    
    setCancelStatus('Releasing seat...');
    try {
      const res = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bookingId })
      });
      const data = await res.json();
      if (data.error) {
        setCancelStatus(`Error: ${data.error}`);
      } else {
        setCancelStatus('Seat released successfully.');
        setAllocation(prev => prev.map(day => 
          day.booking?.id === bookingId ? { ...day, status: day.isDesignated ? 'DESIGNATED' : 'NOT_BOOKED', booking: null } : day
        ));
      }
    } catch (error) {
      setCancelStatus('Failed to release seat.');
    }
    setTimeout(() => setCancelStatus(''), 4000);
  };

  const activeBookings = allocation.filter(d => d.status === 'BOOKED');

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header Panel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 sm:p-10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-indigo-600/10 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Ticket className="w-8 h-8 text-emerald-400" />
            Active Reservations
          </h1>
          <p className="text-zinc-400 text-sm max-w-lg">
            Manage your currently booked seats. Releasing a seat early helps maximize office space availability for your team.
          </p>
        </div>
      </motion.div>

      {/* Notifications */}
      <AnimatePresence>
        {cancelStatus && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "p-4 rounded-xl font-medium flex items-center justify-center gap-3 shadow-lg border backdrop-blur-md mb-4",
              cancelStatus.includes('Error') || cancelStatus.includes('Failed') ? "bg-red-500/10 text-red-400 border-red-500/20" :
              cancelStatus.includes('Releasing') ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            )}>
              {cancelStatus.includes('Releasing') ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {cancelStatus}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings List */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-20 text-zinc-500">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500/50" />
            <p>Fetching your itinerary...</p>
          </div>
        ) : activeBookings.length > 0 ? (
          <motion.div 
            className="space-y-4"
            initial="hidden" animate="show"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          >
            <AnimatePresence>
              {activeBookings.map((day, idx) => {
                const dateObj = new Date(day.date);
                return (
                  <motion.div 
                    key={day.booking.id}
                    layout
                    variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="glass border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center space-x-5 mb-4 sm:mb-0">
                      {/* Date Icon Badge */}
                      <div className="bg-zinc-900 border border-white/10 shadow-inner w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1/3 bg-indigo-500/20 border-b border-indigo-500/20" />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase leading-none mt-1 z-10 relative">
                          {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-white leading-none mt-1 z-10 relative">
                          {dateObj.getDate()}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-lg tracking-tight">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-sm text-zinc-400">Seat <strong className="text-indigo-400 font-semibold">{day.booking.seatName}</strong></span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-zinc-300 border border-white/10 uppercase tracking-wider">
                            {day.booking.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCancel(day.booking.id)}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Release Seat</span>
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass border-white/5 rounded-3xl p-12 text-center text-zinc-500 flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
               <CalendarIcon className="w-10 h-10 text-zinc-600" />
               <div className="absolute right-0 bottom-0 w-6 h-6 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/30">
                 <CheckCircle2 className="w-3 h-3" />
               </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight mb-2">You're all clear.</p>
            <p className="max-w-sm mx-auto text-sm">You don't have any active seat reservations right now.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
