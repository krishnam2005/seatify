'use client';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Hexagon, CalendarClock, Zap, Users, ShieldCheck, ChevronRight, CheckCircle2, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useState, useEffect } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function LandingPage() {
  const router = useRouter();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGetStarted = async () => {
    setIsModalOpen(true);
    setLoading(true);
    try {
      const uid = localStorage.getItem('userId') || '1';
      const res = await fetch(`/api/user?id=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    setIsRedirecting(true);
    // Smooth delay for animation
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="w-full flex-col flex bg-[#09090b] relative mt-[-2rem] overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 inset-x-0 h-[800px] pointer-events-none select-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* --- HERO SECTION --- */}
      <motion.section 
        ref={targetRef}
        style={{ opacity, scale }}
        className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-32"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          Seatify v2.0 is now live
        </motion.div>

        <motion.h1 
          variants={fadeInUp} initial="hidden" animate="visible"
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-zinc-500 max-w-5xl leading-[1.1]"
        >
          Reimagine Workplace Seating.
        </motion.h1>
        
        <motion.p 
          variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
          className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          Smart seat allocation powered by automated batch scheduling and highly responsive real-time floating reservations.
        </motion.p>
        
        <motion.div 
          variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button 
            onClick={handleGetStarted}
            className="w-full sm:w-auto group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 px-8 font-medium text-white transition-all hover:bg-indigo-500 hover:scale-[1.02] active:scale-95"
          >
            <span className="absolute inset-0 border border-white/20 rounded-xl" />
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
               <div className="relative h-full w-8 bg-white/20" />
            </div>
            Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <Link href="/book" className="w-full sm:w-auto group inline-flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-8 font-medium text-white transition-all hover:bg-white/10 backdrop-blur-md hover:scale-[1.02] active:scale-95">
            View Live Demo
          </Link>
        </motion.div>

        {/* HERO IMAGE / PREVIEW */}
        <motion.div
           initial={{ opacity: 0, y: 100 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4, duration: 1, type: "spring", stiffness: 50 }}
           className="mt-20 w-full max-w-5xl rounded-2xl border border-white/10 bg-zinc-950/50 p-2 shadow-2xl backdrop-blur-2xl relative"
        >
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none z-10 rounded-2xl h-full w-full" />
           <div className="rounded-xl border border-white/5 bg-zinc-900/50 overflow-hidden relative">
              {/* Fake UI Header */}
              <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2">
                 <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/50"/><div className="w-3 h-3 rounded-full bg-yellow-500/50"/><div className="w-3 h-3 rounded-full bg-green-500/50"/></div>
                 <div className="ml-4 h-6 w-48 bg-zinc-800 rounded-md" />
              </div>
              {/* Fake UI Grid interaction */}
              <div className="p-8 grid grid-cols-4 md:grid-cols-8 gap-3 opacity-60">
                 {[...Array(24)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(99,102,241,0.2)', borderColor: 'rgba(99,102,241,0.5)' }}
                      className={cn(
                        "aspect-square rounded-lg border border-white/5 flex items-center justify-center transition-colors shadow-inner",
                        i === 12 ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" :
                        i % 7 === 0 ? "bg-red-500/10 border-red-500/20 text-red-500/40" : "bg-white/5 text-zinc-600"
                      )}
                    >
                       <Hexagon className="w-4 h-4" />
                    </motion.div>
                 ))}
              </div>
           </div>
           
           {/* Interactive Tag */}
           <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] rotate-12 flex items-center gap-2">
                 Live React Grid
              </motion.div>
           </div>
        </motion.div>
      </motion.section>


      {/* --- FEATURES SECTION --- */}
      <section className="relative z-10 py-24 px-4 bg-zinc-950 border-y border-white/5">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
               <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Engineered for Scale.</h2>
               <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Everything you need to orchestrate hybrid seating natively via the cloud.</p>
            </div>
            
            <motion.div 
              variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
               {[
                 { title: "Smart Allocation", icon: ShieldCheck, desc: "Systematically assigns designated batches to dedicated seats via automated background cron jobs eliminating manual overhead.", color: "from-blue-500/20 to-cyan-500/20", text: "text-cyan-400" },
                 { title: "Real-Time Booking", icon: Zap, desc: "A lightning fast highly responsive floating-seat reservation system with robust 3 PM strict locking mechanisms.", color: "from-purple-500/20 to-pink-500/20", text: "text-purple-400" },
                 { title: "Batch-Based Scheduling", icon: CalendarClock, desc: "Architected around native 2-week dual batch rotation cycles flawlessly mirroring real enterprise structures.", color: "from-emerald-500/20 to-teal-500/20", text: "text-emerald-400" },
                 { title: "Utilization Insights", icon: Users, desc: "Track exact seat saturation and floating reservation metrics dynamically displayed on command center dashboards.", color: "from-indigo-500/20 to-blue-500/20", text: "text-indigo-400" }
               ].map((feat, i) => (
                 <motion.div 
                   key={i} variants={fadeInUp} whileHover={{ y: -8 }}
                   className="glass rounded-2xl p-8 border border-white/5 hover:bg-white/[0.03] transition-all group relative overflow-hidden"
                 >
                   <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feat.color} rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`} />
                   <div className={`w-14 h-14 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 shadow-inner ${feat.text}`}>
                     <feat.icon className="w-7 h-7" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                   <p className="text-zinc-400 leading-relaxed">{feat.desc}</p>
                 </motion.div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="relative z-10 py-32 px-4 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent -translate-y-1/2 -z-10 hidden md:block" />
         
        <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-20">The Deployment Flow</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Join Squad", text: "You are seamlessly mapped to your dedicated business squad and batch." },
                { step: "02", title: "Automated Routine", text: "The system allocates your structural designated days passively." },
                { step: "03", title: "Book Floaters", text: "Secure dynamically released or floating spaces precisely at 3 PM." },
                { step: "04", title: "Optimize Space", text: "Analytics resolve overlaps allowing maximal 100% building capacity." }
              ].map((item, idx) => (
                 <motion.div 
                   key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.15 }}
                   className="relative flex flex-col items-center"
                 >
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.2)] mb-6 z-10 backdrop-blur-md">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-zinc-500 max-w-[200px]">{item.text}</p>
                 </motion.div>
              ))}
            </div>
        </div>
      </section>

      {/* --- PROBLEM VS SOLUTION --- */}
      <section className="relative z-10 py-24 px-4 bg-zinc-950 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
              
              {/* Problem Left */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
                 <div className="text-red-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> The Old Way
                 </div>
                 <h2 className="text-3xl font-bold text-white">Wasted Seats & Ambiguity.</h2>
                 <div className="space-y-4 pt-4">
                    {[
                      "Employees arriving to no physical desk space.",
                      "Empty designated seats completely unutilized during holidays.",
                      "First-come-first-serve chaos across squads."
                    ].map((issue, i) => (
                       <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-zinc-400">
                          <XCircle className="w-5 h-5 text-red-500/50 shrink-0 mt-0.5" />
                          <p>{issue}</p>
                       </div>
                    ))}
                 </div>
              </motion.div>

              {/* Solution Right */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
                 <div className="text-emerald-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> The Seatify Way
                 </div>
                 <h2 className="text-3xl font-bold text-white">Algorithmic Harmony.</h2>
                 <div className="space-y-4 pt-4">
                    {[
                      "Strict 2-week batch layouts natively automated.",
                      "Dynamic floating seats released exactly at 3 PM daily.",
                      "Aesthetic visual grid granting total spatial transparency."
                    ].map((solution, i) => (
                       <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-zinc-300">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] shrink-0 mt-0.5 rounded-full" />
                          <p>{solution}</p>
                       </div>
                    ))}
                 </div>
              </motion.div>

           </div>
        </div>
      </section>

      {/* --- CALL TO ACTION FOOTER --- */}
      <section className="relative z-10 py-32 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/10 to-transparent -z-10 pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
           <Hexagon className="w-16 h-16 text-indigo-500 mx-auto mb-8 opacity-80 shadow-[0_0_30px_rgba(79,70,229,0.4)]" />
           <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-6">Start optimizing your workspace today.</h2>
           <p className="text-xl text-zinc-400 mb-10">Stop guessing. Deploy systematic space utilization.</p>
           
           <button onClick={handleGetStarted} className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 font-bold text-zinc-950 transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Enter Dashboard Command Center
           </button>
        </motion.div>

        {/* Real Minimal Footer lines */}
        <div className="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-4 text-zinc-500 text-sm">
           <div className="flex items-center gap-2">
             <Hexagon className="w-4 h-4 fill-zinc-800 text-zinc-500" />
             <span className="font-semibold text-zinc-400">Seatify v2.0</span>
             <span>© 2026. All rights reserved.</span>
           </div>
           <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">System Status</a>
           </div>
        </div>
      </section>

      {/* --- ONBOARDING MODAL FLOW --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: isRedirecting ? 0.9 : 1, opacity: isRedirecting ? 0 : 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0 }}
              className="bg-zinc-950/80 border border-white/10 p-8 sm:p-10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 pointer-events-none" />
              
              <div className="relative z-10 text-center">
                 <div className="w-16 h-16 bg-white/5 text-white rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
                    <User className="w-8 h-8" />
                 </div>
                 
                 <h2 className="text-2xl font-bold text-white mb-2">Welcome to Seatify</h2>
                 <p className="text-zinc-400 text-sm mb-8">We've identified your unique structural placement within the enterprise matrix.</p>
                 
                 {loading ? (
                    <div className="flex flex-col items-center justify-center h-24">
                       <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                       <span className="text-xs text-zinc-500 animate-pulse">Syncing permissions...</span>
                    </div>
                 ) : userData ? (
                    <div className="flex justify-center gap-4 mb-8">
                       <div className="bg-indigo-500/10 border border-indigo-500/20 px-5 py-3 rounded-2xl flex flex-col items-center">
                         <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Squad</span>
                         <span className="text-3xl font-black text-indigo-400 font-mono">{userData.squadId}</span>
                       </div>
                       <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-2xl flex flex-col items-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                         <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider mb-1">Batch</span>
                         <span className="text-3xl font-black text-emerald-400 font-mono">{userData.batchId}</span>
                       </div>
                    </div>
                 ) : (
                    <div className="text-red-400 text-sm mb-8">Failed to map user data.</div>
                 )}

                 <button
                   onClick={handleGoToDashboard}
                   disabled={loading || isRedirecting}
                   className="w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isRedirecting ? (
                     <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Entering Gateway...
                     </>
                   ) : (
                     <>
                        Go to Dashboard <ArrowRight className="w-5 h-5 ml-1" />
                     </>
                   )}
                 </button>
                 
                 {!isRedirecting && (
                    <button onClick={() => setIsModalOpen(false)} className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                      Cancel & Return
                    </button>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function XCircle({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>
  );
}
