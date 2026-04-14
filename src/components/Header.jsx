'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const [userId, setUserId] = useState('1');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('userId');
    if (saved) setUserId(saved);
  }, []);

  const handleUserChange = (e) => {
    setUserId(e.target.value);
    localStorage.setItem('userId', e.target.value);
    window.dispatchEvent(new Event('userChange'));
    window.location.reload();
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Book Seat', path: '/book' },
    { name: 'My Bookings', path: '/my-bookings' },
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:shadow-[0_0_25px_rgba(79,70,229,0.7)] transition-shadow">
              <Hexagon className="w-5 h-5 fill-white/20" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Seatify
            </span>
          </Link>

          {/* Desktop Nav */}
          {pathname !== '/' && (
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative",
                    pathname === link.path 
                      ? "text-white" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {pathname === link.path && (
                    <motion.div
                      layoutId="desktop-active-nav"
                      className="absolute inset-0 bg-white/10 rounded-md -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Sim User & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {pathname !== '/' ? (
              <div className="hidden sm:flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <span className="text-xs text-zinc-400 font-medium">Test User:</span>
                <select 
                  value={userId} 
                  onChange={handleUserChange}
                  className="bg-transparent text-white outline-none text-sm font-semibold cursor-pointer"
                >
                  {[...Array(80)].map((_, i) => (
                    <option key={i} value={i + 1} className="bg-zinc-900">User {i + 1}</option>
                  ))}
                </select>
              </div>
            ) : (
               <Link href="/dashboard" className="hidden sm:inline-flex items-center justify-center text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-full px-5 py-2 transition-all">
                  Sign In
               </Link>
            )}

            {/* Hamburger */}
            <button
              className="md:hidden p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-white/5 bg-zinc-950/90 backdrop-blur-xl"
          >
            <div className="px-4 py-4 md:px-8 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-base font-medium transition-all",
                    pathname === link.path 
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="mt-4 pt-4 border-t border-white/5 sm:hidden">
                 <label className="text-xs text-zinc-500 font-medium block mb-2 px-4">Simulate Test User</label>
                 <select 
                  value={userId} 
                  onChange={(e) => { handleUserChange(e); setIsMobileOpen(false); }}
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-4 py-3 outline-none text-sm"
                >
                  {[...Array(80)].map((_, i) => (
                    <option key={i} value={i + 1}>Epmloyee {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
