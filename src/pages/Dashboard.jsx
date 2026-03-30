import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wallet, Copy, Link as LinkIcon, Edit2, CheckCircle, Share2,
  TrendingUp, Eye, Loader2, ExternalLink, PlusCircle,
  Clock, Zap, ArrowUpRight, Lock, Unlock, PlayCircle, ShieldCheck, Globe
} from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import AppLinksManager from '../components/AppLinksManager'; // 🚀 NAYA COMPONENT IMPORT KIYA HAI

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = 'text-[#00ff88]', border = 'border-[#00ff88]/15' }) {
  return (
    <div className={`bg-[#0d1410] border ${border} rounded-2xl p-4 flex flex-col gap-1`}>
      <div className={`${color} mb-1`}>{icon}</div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-gray-500 text-xs">{label}</p>
      {sub && <p className={`text-xs font-semibold ${color}`}>{sub}</p>}
    </div>
  );
}

// ─── Dashboard Component ──────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Social Links State (Bhavishya ke liye rakha hai agar dashboard se update karna ho)
  const [settings, setSettings] = useState({
    youtube_link: '', instagram_link: '', telegram_link: '', whatsapp_link: ''
  });

  // Dynamic Training State
  const [trainingVideos, setTrainingVideos] = useState([]);

  // UI States
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ socials: '' });
  
  // Subdomain Claim States
  const [claimName, setClaimName] = useState('');
  const [whatsappNum, setWhatsappNum] = useState('');
  const [claimStatus, setClaimStatus] = useState(''); // 'checking', 'available', 'taken', 'error'

  useEffect(() => {
    if (authLoading) return;
    
    // Agar user nahi hai, loading false karo taaki login screen dikhe
    if (!user) { 
      setLoading(false); 
      return; 
    }

    const fetchDashboardData = async () => {
      try {
        // Dashboard.jsx ke useEffect fetchDashboardData() function mein:

        // 1. Fetch User Profile
        const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (userData) {
          // Agar subdomain nahi hai (dukan nahi bani) ya rent expire ho gaya hai
          if (!userData.subdomain || new Date(userData.rent_valid_upto) < new Date()) {
            navigate('/setup-shop'); // Sidha Setup Page par bhej do!
            return;
          }
          setProfile(userData);
        } else {
           // Agar user DB mein nahi mila, toh bhi setup par bhejo
           navigate('/setup-shop');
           return;
        }
        // 2. Fetch User Settings (Only Socials now, AppLinksManager handles apps)
        const { data: settingsData } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();
        if (settingsData) {
          setSettings(prev => ({ ...prev, ...settingsData }));
        }

        // 3. Fetch Dynamic Training Videos
        const { data: videoData } = await supabase.from('training_videos').select('*').order('created_at', { ascending: false });
        if (videoData) setTrainingVideos(videoData);

      } catch (error) {
        console.error('Dashboard Error:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading]);

  // ─── Login Logic ───
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: window.location.origin + '/dashboard' } 
    });
  };

  // ─── Subdomain & WhatsApp Logic ───
  const handleClaimSubdomain = async () => {
    const formattedName = claimName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (formattedName.length < 3) return alert("Shop name kam se kam 3 letters ka hona chahiye!");
    if (whatsappNum.length < 10) return alert("Sahi WhatsApp number daalo bhai!");

    const blockedWords = ['admin', 'support', 'help', 'api', 'merikamai', 'official', 'test'];
    if (blockedWords.includes(formattedName)) return alert("Yeh VIP naam allowed nahi hai!");

    setClaimStatus('checking');
    try {
      // Check if taken
      const { data: existingUser } = await supabase.from('users').select('id').eq('subdomain', formattedName).maybeSingle();
      if (existingUser) {
        setClaimStatus('taken');
        return;
      }
      // Save
      const { error } = await supabase.from('users').update({ subdomain: formattedName, phone: whatsappNum }).eq('id', user.id);
      if (error) throw error;
      
      setProfile({ ...profile, subdomain: formattedName, phone: whatsappNum });
      setClaimStatus('available');
    } catch (err) {
      console.error(err);
      setClaimStatus('error');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070a08] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#00ff88] flex items-center justify-center font-black text-[#0a0a0a] text-xl animate-pulse">₹</div>
        <Loader2 className="w-5 h-5 text-[#00ff88] animate-spin" />
      </div>
    );
  }

  // ─── GATE 1: User Not Logged In ───
  if (!user) {
    return (
      <div className="min-h-screen bg-[#070a08] flex items-center justify-center p-4">
        <div className="bg-[#0d1410] border border-[#00ff88]/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,255,136,0.1)] text-center">
          <div className="w-16 h-16 bg-[#00ff88]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#00ff88]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Login to Continue</h2>
          <p className="text-gray-400 text-sm mb-8">Apni dukan banane aur dashboard access karne ke liye secure login karein.</p>
          <button 
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 w-full bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 transition-all shadow-lg hover:scale-105"
          >
            <FaGoogle className="w-5 h-5 text-blue-600" /> Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // ─── GATE 2: Subdomain & WhatsApp Claim Screen ───
  

  // ─── GATE 4: Full Dashboard ───
  const displayName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'User';
  const userShopUrl = `https://${profile.subdomain}.merikamai.in`;
  const walletBalance = profile?.wallet_balance || 0;
  
  const diffTime = new Date(profile.rent_valid_upto) - new Date();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-[#070a08] text-[#e5e5e5] pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-white capitalize">Hi, {displayName}! 🚀</h1>
            <div className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20">
              <Clock className="w-3 h-3" /> Shop Rent: {daysLeft} Days Left
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-gray-500 flex items-center gap-1"><Eye className="w-3 h-3" /> Live Views</span>
            <img src={`https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=${userShopUrl}&count_bg=%2300FF88&title_bg=%23111827&icon=&icon_color=%23E7E7E7&title=Hits&edge_flat=true`} alt="Views" className="rounded" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<Wallet className="w-4 h-4" />} label="Wallet Balance" value={`₹${walletBalance}`} />
          <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Total Earned" value={`₹${profile?.total_earned || 0}`} color="text-blue-400" border="border-blue-500/15" />
          <StatCard icon={<Eye className="w-4 h-4" />} label="Shop Views" value={profile?.total_views || '0'} color="text-yellow-400" border="border-yellow-500/15" />
          <StatCard icon={<Share2 className="w-4 h-4" />} label="Total Referrals" value={profile?.total_referrals || 0} color="text-purple-400" border="border-purple-500/15" />
        </div>

        {/* Refer Box */}
        <div className="bg-[#0d1410] border border-gray-800 rounded-2xl p-5">
          <h2 className="font-black text-white mb-4 text-sm uppercase tracking-wider text-gray-400">Your Earning Links</h2>
          
          <div className="bg-[#070a08] rounded-xl p-3 border border-gray-800 mb-4">
            <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider font-bold">Your Live Shop URL</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-[#00ff88] font-semibold truncate flex-1">{userShopUrl}</span>
              <div className="flex items-center gap-1 border-l border-gray-800 pl-2 shrink-0">
                <a href={userShopUrl} target="_blank" rel="noreferrer" className="p-1.5 text-blue-400 hover:text-white transition-colors rounded-lg hover:bg-blue-900/20"><ExternalLink className="w-4 h-4" /></a>
                <button onClick={() => handleCopy(userShopUrl)} className="p-1.5 text-[#00ff88] hover:text-white transition-colors rounded-lg hover:bg-[#00ff88]/10">
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 NAYA DYNAMIC APP LINKS MANAGER */}
        <div className="bg-[#0d1410] border border-gray-800 rounded-2xl p-5">
          <h2 className="font-black text-white mb-4 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><Edit2 className="w-4 h-4 text-[#00ff88]" /> Add Earning Apps to Shop</span>
          </h2>
          {/* Ye naya component saare apps load, add aur remove handle karega */}
          <AppLinksManager /> 
        </div>

        {/* Dynamic Training Section */}
        <div className="bg-gradient-to-br from-[#0d1410] to-[#0a0f0c] border border-blue-500/20 rounded-2xl p-5">
          <h2 className="font-black text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" /> Exclusive Training Zone
          </h2>
          <p className="text-xs text-gray-500 mb-5">In videos ko dekho aur apne business ko multiply karo.</p>
          
          <div className="space-y-3">
            {trainingVideos.length > 0 ? (
              trainingVideos.map((video) => (
                <a key={video.id} href={video.youtube_link} target="_blank" rel="noreferrer" 
                   className="flex items-center gap-3 p-3 bg-[#0a0f0a] border border-gray-800 hover:border-blue-500/40 rounded-xl transition-all group">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <PlayCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-1">{video.title}</h3>
                    <p className="text-[10px] text-gray-500">Watch full tutorial on YouTube</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400" />
                </a>
              ))
            ) : (
              <div className="text-center py-6 bg-[#0a0f0a] rounded-xl border border-gray-800 border-dashed">
                <p className="text-sm text-gray-500 font-semibold">Training videos coming soon...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}