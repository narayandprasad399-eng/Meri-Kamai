import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Copy, Link as LinkIcon, Edit2, CheckCircle, Share2,
  TrendingUp, Eye, Loader2, ExternalLink, PlusCircle,
  Bell, ArrowUpRight, Clock, Zap, ShieldCheck, BadgeCheck,
  IndianRupee, BarChart3, ChevronRight
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

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

// ─── Input Field ──────────────────────────────────────────────────────────────
function AppInput({ placeholder, value, onChange }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      className="w-full bg-[#0a0f0a] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-700 focus:border-[#00ff88]/50 focus:outline-none transition-colors"
    />
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({
    youtube_link: '', instagram_link: '', telegram_link: '',
    whatsapp_link: '', app_links: {}
  });
  const [saveStatus, setSaveStatus] = useState({ apps: '', socials: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/'); return; }

    const fetchDashboardData = async () => {
      try {
        const { data: userData } = await supabase
          .from('users').select('*').eq('id', user.id).single();
        if (userData) setProfile(userData);

        const { data: settingsData } = await supabase
          .from('user_settings').select('*').eq('user_id', user.id).single();
        if (settingsData) setSettings(settingsData);
      } catch (error) {
        console.error('Dashboard Error:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading, navigate]);

  const handleSaveSettings = async (type) => {
    const key = type === 'App Links' ? 'apps' : 'socials';
    setSaveStatus(s => ({ ...s, [key]: 'saving' }));
    try {
      const { error } = await supabase
        .from('user_settings').update(settings).eq('user_id', user.id);
      if (error) throw error;
      setSaveStatus(s => ({ ...s, [key]: 'saved' }));
      setTimeout(() => setSaveStatus(s => ({ ...s, [key]: '' })), 2500);
    } catch {
      setSaveStatus(s => ({ ...s, [key]: 'error' }));
      setTimeout(() => setSaveStatus(s => ({ ...s, [key]: '' })), 2500);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuggestApp = () => {
    const appName = prompt('Kaunsa naya app add karwana chahte ho? (e.g. Groww, Angel One)');
    if (appName) {
      alert(`✅ Shukriya! "${appName}" ka suggestion mil gaya. Hum jaldi add karenge.`);
    }
  };

  const handleWithdraw = async () => {
    if ((profile?.wallet_balance || 0) < 200) return;
    const upi = prompt('Apna UPI ID dalo (e.g. name@upi):');
    if (upi && upi.includes('@')) {
      alert(`✅ Withdrawal request ₹${profile.wallet_balance} for ${upi} submitted! 24 hours mein process hoga.`);
    } else if (upi) {
      alert('Invalid UPI ID. Please check and try again.');
    }
  };

  const getRentDaysLeft = () => {
    if (!profile?.rent_valid_upto) return 0;
    const diffTime = new Date(profile.rent_valid_upto) - new Date();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070a08] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#00ff88] flex items-center justify-center font-black text-[#0a0a0a] text-xl animate-pulse">₹</div>
        <Loader2 className="w-5 h-5 text-[#00ff88] animate-spin" />
      </div>
    );
  }

  const displayName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'User';
  const userShopUrl = profile?.subdomain ? `https://${profile.subdomain}.merikamai.in` : '#';
  const walletBalance = profile?.wallet_balance || 0;
  const daysLeft = getRentDaysLeft();
  const toWithdraw = Math.max(0, 200 - walletBalance);

  return (
    <div className="min-h-screen bg-[#070a08] text-[#e5e5e5] pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-white capitalize">
              Hi, {displayName}! 🚀
            </h1>
            <div className={`inline-flex items-center gap-1.5 mt-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
              daysLeft > 7 ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20' :
              daysLeft > 0 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
              'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              <Clock className="w-3 h-3" />
              Shop Rent: {daysLeft > 0 ? `${daysLeft} Days Left` : 'EXPIRED — Renew Now!'}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Live Views
            </span>
            {profile?.subdomain && (
              <img
                src={`https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=${userShopUrl}&count_bg=%2300FF88&title_bg=%23111827&icon=&icon_color=%23E7E7E7&title=Hits&edge_flat=true`}
                alt="Views"
                className="rounded"
              />
            )}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<Wallet className="w-4 h-4" />}
            label="Wallet Balance"
            value={`₹${walletBalance}`}
            sub={walletBalance >= 200 ? '✓ Ready to withdraw' : `₹${toWithdraw} more to go`}
          />
          <StatCard
            icon={<BarChart3 className="w-4 h-4" />}
            label="Total Referrals"
            value={profile?.total_referrals || 0}
            sub="This month"
            color="text-blue-400"
            border="border-blue-500/15"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Total Earned"
            value={`₹${profile?.total_earned || 0}`}
            sub="All time"
            color="text-purple-400"
            border="border-purple-500/15"
          />
          <StatCard
            icon={<Eye className="w-4 h-4" />}
            label="Shop Views"
            value={profile?.total_views || '—'}
            sub="Live tracker"
            color="text-yellow-400"
            border="border-yellow-500/15"
          />
        </div>

        {/* ── Wallet Card ── */}
        <div className="bg-gradient-to-br from-[#0d1a11] to-[#080d09] border border-[#00ff88]/25 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,255,136,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-sm text-gray-400 flex items-center gap-2">
              <Wallet className="text-[#00ff88] w-4 h-4" /> Wallet Balance
            </h2>
            <div className="text-xs font-bold text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-2.5 py-1 rounded-full">
              Min. ₹200 to withdraw
            </div>
          </div>

          <h3 className="text-5xl font-black text-white mb-1">
            <span className="text-[#00ff88] text-3xl mr-1">₹</span>{walletBalance}
          </h3>
          <p className="text-gray-600 text-xs mb-5">
            {walletBalance >= 200 ? '🎉 Withdrawal available!' : `₹${toWithdraw} more needed`}
          </p>

          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-800 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc66] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (walletBalance / 200) * 100)}%` }}
            />
          </div>

          <button
            onClick={handleWithdraw}
            disabled={walletBalance < 200}
            className={`w-full font-black py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${
              walletBalance >= 200
                ? 'bg-[#00ff88] text-[#0a0a0a] hover:bg-white shadow-[0_0_20px_rgba(0,255,136,0.25)]'
                : 'bg-gray-800/80 text-gray-600 cursor-not-allowed'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            {walletBalance >= 200 ? 'Withdraw to UPI' : `Need ₹${toWithdraw} More`}
          </button>
        </div>

        {/* ── Refer & Earn ── */}
        <div className="bg-[#0d1120] border border-blue-500/20 rounded-2xl p-5">
          <h2 className="font-black text-white mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-blue-400" /> Refer & Earn ₹50
          </h2>

          {/* Shop Link */}
          <div className="bg-[#070a08] rounded-xl p-3 border border-gray-800 mb-4">
            <p className="text-[10px] text-gray-600 mb-2 uppercase tracking-wider font-bold">Your Live Shop URL</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-[#00ff88] font-semibold truncate flex-1">
                {profile?.subdomain ? `${profile.subdomain}.merikamai.in` : 'Loading...'}
              </span>
              <div className="flex items-center gap-1 border-l border-gray-800 pl-2 shrink-0">
                <a href={userShopUrl} target="_blank" rel="noreferrer"
                  className="p-1.5 text-blue-400 hover:text-white transition-colors rounded-lg hover:bg-blue-900/20" title="View Shop">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => handleCopy(userShopUrl)}
                  className="p-1.5 text-[#00ff88] hover:text-white transition-colors rounded-lg hover:bg-[#00ff88]/10" title="Copy Link">
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Promo Code Box */}
          <div className="bg-blue-900/15 rounded-xl p-4 border border-dashed border-blue-500/30 text-center mb-4">
            <p className="text-[10px] text-blue-400/70 font-bold uppercase tracking-widest mb-1">Your VIP Promo Code</p>
            <p className="text-3xl font-black text-blue-300 tracking-widest mb-2">
              {profile?.refer_code || '---'}
            </p>
            <button
              onClick={() => handleCopy(profile?.refer_code || '')}
              className="text-xs text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full hover:bg-blue-900/30 transition-all"
            >
              {copied ? '✅ Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Pitch Box */}
          <div className="bg-[#070a08] rounded-xl p-3.5 border-l-4 border-[#00ff88] text-xs text-gray-300 leading-relaxed">
            💡 <strong className="text-white">Pitch karo:</strong>{' '}
            <em>"Yaar, English Course ₹999 ka hai par mera code laga toh seedha ₹499 mein milega — ₹500 bachega!
            Mera code hai <strong className="text-[#00ff88]">{profile?.refer_code || 'XXXXXX'}</strong>"</em>
          </div>
        </div>

        {/* ── Links Forms ── */}
        <div className="grid sm:grid-cols-2 gap-4">

          {/* App Links */}
          <div className="bg-[#0d1410] border border-gray-800 rounded-2xl p-5 flex flex-col">
            <h2 className="font-black text-white mb-4 flex items-center gap-2 text-sm">
              <Edit2 className="w-4 h-4 text-[#00ff88]" /> App Refer Links
            </h2>
            <div className="space-y-2.5 flex-grow">
              <AppInput placeholder="📈 Upstox Refer Link"
                value={settings.app_links?.upstox}
                onChange={e => setSettings({ ...settings, app_links: { ...settings.app_links, upstox: e.target.value } })} />
              <AppInput placeholder="🏦 Navi Refer Link"
                value={settings.app_links?.navi}
                onChange={e => setSettings({ ...settings, app_links: { ...settings.app_links, navi: e.target.value } })} />
              <AppInput placeholder="💳 PhonePe Refer Link"
                value={settings.app_links?.phonepe}
                onChange={e => setSettings({ ...settings, app_links: { ...settings.app_links, phonepe: e.target.value } })} />
            </div>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => handleSaveSettings('App Links')}
                className={`w-full text-xs font-black py-2.5 rounded-xl transition-all ${
                  saveStatus.apps === 'saved' ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' :
                  saveStatus.apps === 'error' ? 'bg-red-900/20 text-red-400 border border-red-500/30' :
                  'bg-gray-800 hover:bg-gray-700 text-[#00ff88] border border-gray-700'
                }`}
              >
                {saveStatus.apps === 'saving' ? '⏳ Saving...' :
                 saveStatus.apps === 'saved' ? '✅ Saved!' :
                 saveStatus.apps === 'error' ? '❌ Error' : 'Save Apps'}
              </button>
              <button onClick={handleSuggestApp}
                className="w-full text-[11px] text-gray-600 hover:text-[#00ff88] flex items-center justify-center gap-1 transition-colors py-1">
                <PlusCircle className="w-3 h-3" /> Suggest a new App
              </button>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-[#0d1410] border border-gray-800 rounded-2xl p-5 flex flex-col">
            <h2 className="font-black text-white mb-4 flex items-center gap-2 text-sm">
              <Share2 className="w-4 h-4 text-pink-400" /> Social Media Links
            </h2>
            <div className="space-y-2.5 flex-grow">
              <AppInput placeholder="🎬 YouTube Link"
                value={settings.youtube_link}
                onChange={e => setSettings({ ...settings, youtube_link: e.target.value })} />
              <AppInput placeholder="📸 Instagram Link"
                value={settings.instagram_link}
                onChange={e => setSettings({ ...settings, instagram_link: e.target.value })} />
              <AppInput placeholder="✈️ Telegram Link"
                value={settings.telegram_link}
                onChange={e => setSettings({ ...settings, telegram_link: e.target.value })} />
              <AppInput placeholder="💬 WhatsApp Link"
                value={settings.whatsapp_link}
                onChange={e => setSettings({ ...settings, whatsapp_link: e.target.value })} />
            </div>
            <div className="mt-4">
              <button
                onClick={() => handleSaveSettings('Social Links')}
                className={`w-full text-xs font-black py-2.5 rounded-xl transition-all ${
                  saveStatus.socials === 'saved' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/30' :
                  saveStatus.socials === 'error' ? 'bg-red-900/20 text-red-400 border border-red-500/30' :
                  'bg-gray-800 hover:bg-gray-700 text-pink-400 border border-gray-700'
                }`}
              >
                {saveStatus.socials === 'saving' ? '⏳ Saving...' :
                 saveStatus.socials === 'saved' ? '✅ Saved!' :
                 saveStatus.socials === 'error' ? '❌ Error' : 'Save Socials'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Watch & Grow ── */}
        <div className="bg-[#0d1410] border border-gray-800 rounded-2xl p-5">
          <h2 className="font-black text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" /> Watch & Grow
          </h2>
          <p className="text-xs text-gray-500 mb-4">Daily videos dekho — ₹10,000/month kaise kamayein!</p>
          <div className="bg-black rounded-xl overflow-hidden aspect-video border border-gray-800 mb-3">
            <iframe
              width="100%" height="100%"
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
              title="Tutorial" frameBorder="0" allowFullScreen
            />
          </div>
          <a href="https://youtube.com/playlist?list=YOUR_PLAYLIST_ID" target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full text-xs sm:text-sm font-bold bg-red-600/10 border border-red-500/20 text-red-400 py-3 rounded-xl hover:bg-red-600/15 transition-colors">
            ▶️ Watch Complete Masterclass Series
          </a>
        </div>

        {/* ── Quick Links ── */}
        <div className="bg-[#0d1410] border border-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'View My Shop', href: userShopUrl, external: true, icon: <ExternalLink className="w-4 h-4" />, color: 'text-[#00ff88]' },
              { label: 'Buy Course', to: '/checkout', icon: <BadgeCheck className="w-4 h-4" />, color: 'text-blue-400' },
              { label: 'Course Area', to: '/course', icon: <TrendingUp className="w-4 h-4" />, color: 'text-purple-400' },
              { label: 'Renew Shop', to: '/checkout?product=rent', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-400' },
            ].map((item, i) => (
              item.external ? (
                <a key={i} href={item.href} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-2.5 ${item.color} hover:border-gray-600 transition-all text-sm font-semibold`}>
                  {item.icon} {item.label}
                </a>
              ) : (
                <a key={i} href={item.to}
                  className={`flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-2.5 ${item.color} hover:border-gray-600 transition-all text-sm font-semibold`}>
                  {item.icon} {item.label}
                </a>
              )
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}