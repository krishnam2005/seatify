'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle2, CircleDashed, CalendarOff, ChevronLeft, ChevronRight, Info, Clock, AlertCircle, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [allocation, setAllocation] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());

  useEffect(() => {
    fetchData(currentWeekDate);
  }, [currentWeekDate]);

  const fetchData = async (dateObj) => {
    setLoading(true);
    const uid = localStorage.getItem('userId') || '1';
    try {
      const res = await fetch(`/api/allocation?userId=${uid}&date=${dateObj.toISOString()}`);
      const data = await res.json();
      setAllocation(data.allocation || []);
      setUserInfo(data.user || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekDate(newDate);
  };

  const handleThisWeek = () => {
    setCurrentWeekDate(new Date());
  };

  const now = new Date();
  const isBookingOpen = now.getHours() >= 15;

  // Deriving summaries
  const assignedDays = allocation.filter(d => d.isDesignated && d.status !== 'HOLIDAY' && d.status !== 'WEEKEND').length;
  const bookedDays = allocation.filter(d => d.status === 'BOOKED').length;
  // Floating implies not designated and not booked and not weekend/holiday
  const floatingDays = allocation.filter(d => !d.isDesignated && d.status !== 'BOOKED' && d.status !== 'HOLIDAY' && d.status !== 'WEEKEND').length;

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header Panel with Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden glow-border flex flex-col xl:flex-row xl:items-center justify-between gap-6"
      >
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Weekly Command Center
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Track your batch designations, reserve your floating spaces, and stay informed on daily constraints.
          </p>
        </div>

        {userInfo && (
          <div className="flex gap-3 relative z-10">
            <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="text-xs text-indigo-300 font-medium tracking-wider uppercase">Squad</span>
              <span className="text-lg font-bold text-indigo-400">{userInfo.squadId}</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="text-xs text-emerald-300 font-medium tracking-wider uppercase">Batch</span>
              <span className="text-lg font-bold text-emerald-400">{userInfo.batchId}</span>
            </div>
          </div>
        )}
        
        {/* Decorative flair */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      </motion.div>

      {/* Constraints Banner */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className={cn(
          "p-4 rounded-xl flex items-center gap-4 border backdrop-blur-md",
          isBookingOpen ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
        )}
      >
         {isBookingOpen ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" /> : <Clock className="w-6 h-6 flex-shrink-0" />}
         <div>
            <h4 className="font-semibold">{isBookingOpen ? "Booking is currently OPEN" : "Booking is currently CLOSED"}</h4>
            <p className="text-sm opacity-80 mt-0.5">Booking explicitly opens at 3:00 PM for the immediate next working day.</p>
         </div>
      </motion.div>

      {/* Week Navigation & Summary Grid */}
      <div className="flex flex-col md:flex-row gap-6">
        
        <div className="flex bg-zinc-900/50 rounded-xl p-1.5 border border-white/5 shadow-inner w-full md:w-auto h-fit">
           <button onClick={handlePrevWeek} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"><ChevronLeft className="w-5 h-5"/></button>
           <button onClick={handleThisWeek} className="flex-1 px-4 text-sm font-medium text-white hover:text-indigo-400 transition-colors flex items-center justify-center">
             Week of {currentWeekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
           </button>
           <button onClick={handleNextWeek} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"><ChevronRight className="w-5 h-5"/></button>
        </div>

        {!loading && (
          <div className="flex-grow flex flex-wrap gap-3">
             <div className="bg-emerald-500/5 border border-emerald-500/20 px-4 py-2.5 rounded-xl flex-1 min-w-[120px]">
               <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">Assigned</span>
               <span className="text-2xl text-emerald-300 font-mono font-bold leading-none">{assignedDays} <span className="text-xs text-emerald-500/50 font-sans tracking-tight ml-1">Days</span></span>
             </div>
             <div className="bg-purple-500/5 border border-purple-500/20 px-4 py-2.5 rounded-xl flex-1 min-w-[120px]">
               <span className="text-xs text-purple-400 font-bold uppercase tracking-wider block mb-1">Floating</span>
               <span className="text-2xl text-purple-300 font-mono font-bold leading-none">{floatingDays} <span className="text-xs text-purple-500/50 font-sans tracking-tight ml-1">Days</span></span>
             </div>
             <div className="bg-blue-500/5 border border-blue-500/20 px-4 py-2.5 rounded-xl flex-1 min-w-[120px]">
               <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block mb-1">Booked</span>
               <span className="text-2xl text-blue-300 font-mono font-bold leading-none">{bookedDays} <span className="text-xs text-blue-500/50 font-sans tracking-tight ml-1">Days</span></span>
             </div>
          </div>
        )}
      </div>

      {/* Main Grid View */}
      {loading ? (
         <div className="glass rounded-2xl min-h-[300px] flex flex-col items-center justify-center space-y-4 text-zinc-500">
            <Clock className="w-10 h-10 animate-spin text-indigo-500/50" />
            <p className="font-medium animate-pulse">Syncing timeline constraints...</p>
         </div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <AnimatePresence>
          {allocation.map((day, idx) => {
            const dateObj = new Date(day.date);
            const isBooked = day.status === 'BOOKED';
            const isDesignated = day.isDesignated;
            const isHoliday = day.status === 'HOLIDAY';
            const isWeekend = day.status === 'WEEKEND';

            return (
              <motion.div 
                key={dateObj.toISOString()} 
                variants={itemAnim}
                layoutId={`card-${dateObj.toISOString()}`}
                className={cn(
                  "relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group min-h-[220px]",
                  isBooked ? "bg-blue-950/20 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]" :
                  isDesignated ? "bg-emerald-950/20 border-emerald-500/20" :
                  (isHoliday || isWeekend) ? "bg-zinc-900/40 border-white/5 opacity-70" :
                  "bg-purple-900/10 border-purple-500/20"
                )}
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">
                        {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                      </span>
                      <span className="text-2xl font-bold text-white tracking-tight">
                        {dateObj.getDate()} <span className="text-sm font-medium text-zinc-600">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                      </span>
                    </div>
                    
                    {/* Icon */}
                    <div className={cn(
                      "p-2 rounded-xl backdrop-blur-md shadow-inner",
                      isBooked ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                      isDesignated ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                      isHoliday ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                      isWeekend ? "bg-zinc-800 text-zinc-500" :
                      "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    )}>
                      {isBooked ? <CheckCircle2 className="w-5 h-5" /> : 
                       isDesignated ? <CalendarIcon className="w-5 h-5" /> : 
                       isHoliday ? <PartyPopper className="w-5 h-5" /> :
                       isWeekend ? <CalendarOff className="w-5 h-5" /> :
                       <CircleDashed className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Status Flags */}
                  <div className="mb-4">
                     <span className={cn(
                       "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                       isBooked ? "bg-blue-500/10 text-blue-300 border-blue-500/20" :
                       isDesignated ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                       isHoliday ? "bg-orange-500/10 text-orange-300 border-orange-500/20" :
                       isWeekend ? "bg-zinc-800 text-zinc-400 border-zinc-700" :
                       "bg-purple-500/10 text-purple-300 border-purple-500/20"
                     )}>
                       {isBooked ? 'Reserved' : 
                        isDesignated ? 'Designated Batch' : 
                        isHoliday ? 'Holiday' : 
                        isWeekend ? 'Weekend' : 
                        'Floating Day'}
                     </span>
                  </div>
                </div>

                {/* Intelligent Dynamic Feedback & Call to Actions */}
                <div className="mt-auto pt-4 border-t border-white/5 relative z-10 w-full">
                  {(isHoliday || isWeekend) ? (
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0"/>
                      No bookings allowed.
                    </div>
                  ) : isBooked ? (
                    <div className="flex flex-col">
                      <p className="text-zinc-400 text-xs mb-1">Secured Seat</p>
                      <p className="text-lg font-bold text-white flex items-center gap-2">
                        {day.booking.seatName}
                        <span className="text-[10px] font-medium text-blue-300 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded">
                          {day.booking.type}
                        </span>
                      </p>
                    </div>
                  ) : isDesignated ? (
                    <div className="flex flex-col space-y-1 text-emerald-400/80">
                      <p className="text-xs uppercase tracking-wider font-semibold">Seat auto-assigned</p>
                      <p className="text-[11px] text-zinc-500 leading-tight">Your specific seat is mapped by the system at 3 PM prior to this date.</p>
                    </div>
                  ) : (
                     <div className="flex flex-col space-y-3">
                        <p className="text-[11px] text-zinc-400 leading-tight">
                           You can reserve an available floating seat or released designated seat for this day.
                        </p>
                        <Link 
                          href={`/book?date=${dateObj.toISOString().split('T')[0]}`}
                          className="w-full text-center px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/30 rounded-lg text-sm font-bold transition-colors"
                        >
                          Book Workspace
                        </Link>
                     </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
