import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070a08]/95 backdrop-blur-md border-b border-[#00ff88]/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-[#070a08] border-b border-[#00ff88]/8'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-15 py-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#00ff88] flex items-center justify-center font-black text-[#0a0a0a] text-base shadow-[0_0_12px_rgba(0,255,136,0.3)] group-hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] transition-all">
                ₹
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Meri<span className="text-[#00ff88]">Kamai</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden sm:flex items-center gap-5">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-gray-400 hover:text-[#00ff88] transition-colors text-sm font-semibold"
              >
                <Wallet className="w-4 h-4" />
                Dashboard
              </Link>

              {user ? (
                <div className="flex items-center gap-3">
                  <img
                    src={user.user_metadata?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'U')}&background=00ff88&color=0a0a0a`}
                    alt="Profile"
                    className="w-8 h-8 rounded-xl border border-[#00ff88]/30 shadow-sm"
                  />
                  <button
                    onClick={signOut}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-red-400 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-2 bg-[#00ff88] text-[#0a0a0a] px-4 py-2 rounded-xl font-black text-sm hover:bg-white transition-all shadow-[0_0_12px_rgba(0,255,136,0.25)] hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Login with Google
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="sm:hidden p-2 text-gray-400 hover:text-[#00ff88] transition-colors"
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-900 bg-[#070a08] px-4 py-4 space-y-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-300 hover:text-[#00ff88] transition-colors text-sm font-semibold py-2"
            >
              <Wallet className="w-4 h-4" /> Dashboard
            </Link>
            {user ? (
              <div className="flex items-center justify-between py-2 border-t border-gray-900">
                <div className="flex items-center gap-2">
                  <img
                    src={user.user_metadata?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'U')}&background=00ff88&color=0a0a0a`}
                    alt="Profile"
                    className="w-7 h-7 rounded-lg border border-[#00ff88]/30"
                  />
                  <span className="text-white text-sm font-semibold">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="text-gray-500 hover:text-red-400 transition-colors text-sm flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-2 bg-[#00ff88] text-[#0a0a0a] py-2.5 rounded-xl font-black text-sm"
              >
                <Zap className="w-4 h-4" /> Login with Google
              </button>
            )}
          </div>
        )}
      </nav>
    </>
  );
}