import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download, ArrowRight, PlayCircle, Tag, Loader2,
  Star, ShieldCheck, CheckCircle, Zap, Gift,
  Copy, Share2, ExternalLink, Clock, TrendingUp
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { FaYoutube, FaInstagram, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';

// ─── App Config ───────────────────────────────────────────────────────────────
const APP_CONFIG = {
  upstox: {
    emoji: '📈',
    name: 'Upstox',
    tagline: 'Free Demat Account — ₹500 Bonus on First Trade',
    badge: 'MOST POPULAR',
    badgeColor: 'bg-[#00ff88] text-[#0a0a0a]',
    highlight: 'text-[#00ff88]',
    btnColor: 'bg-[#00ff88] text-[#0a0a0a] hover:bg-white',
    borderColor: 'border-[#00ff88]/20 hover:border-[#00ff88]/50',
  },
  navi: {
    emoji: '🏦',
    name: 'Navi',
    tagline: 'Instant Loan up to ₹20L — 100% Online',
    badge: 'FAST APPROVAL',
    badgeColor: 'bg-blue-500 text-white',
    highlight: 'text-blue-400',
    btnColor: 'bg-blue-600 text-white hover:bg-blue-500',
    borderColor: 'border-blue-500/20 hover:border-blue-500/50',
  },
  phonepe: {
    emoji: '💳',
    name: 'PhonePe',
    tagline: 'India\'s Trusted Payment App — Exclusive Cashback',
    badge: '10Cr+ USERS',
    badgeColor: 'bg-purple-500 text-white',
    highlight: 'text-purple-400',
    btnColor: 'bg-purple-600 text-white hover:bg-purple-500',
    borderColor: 'border-purple-500/20 hover:border-purple-500/50',
  },
};

// ─── Loader ───────────────────────────────────────────────────────────────────
function FullLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070a08] gap-4">
      <div className="w-12 h-12 rounded-2xl bg-[#00ff88] flex items-center justify-center font-black text-[#0a0a0a] text-xl animate-pulse">₹</div>
      <Loader2 className="w-6 h-6 text-[#00ff88] animate-spin" />
      <p className="text-gray-600 text-sm">Loading shop...</p>
    </div>
  );
}

// ─── App Card ─────────────────────────────────────────────────────────────────
function AppCard({ appKey, url, referCode }) {
  const cfg = APP_CONFIG[appKey];
  if (!cfg || !url) return null;

  return (
    <div className={`relative bg-[#0d1410] border ${cfg.borderColor} rounded-2xl p-5 flex items-center justify-between gap-4 transition-all duration-300 group`}>
      <div className="absolute top-3 right-3">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${cfg.badgeColor}`}>
          {cfg.badge}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-3xl">{cfg.emoji}</div>
        <div>
          <h4 className="font-black text-white text-base">{cfg.name}</h4>
          <p className={`text-xs font-medium ${cfg.highlight}`}>{cfg.tagline}</p>
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={`shrink-0 ${cfg.btnColor} font-black px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg flex items-center gap-1.5`}
      >
        Install <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={`flex items-center gap-1.5 transition-all ${className}`}>
      {copied
        ? <><CheckCircle className="w-4 h-4 text-[#00ff88]" /><span className="text-[#00ff88] text-xs font-bold">Copied!</span></>
        : <><Copy className="w-4 h-4" /><span className="text-xs">Copy Code</span></>
      }
    </button>
  );
}

// ─── Mini Testimonial ─────────────────────────────────────────────────────────
const miniTestimonials = [
  { text: 'Is platform se mujhe pehle hi mahine ₹1800 mile!', name: 'Rohit, Delhi', stars: 5 },
  { text: 'Bahut easy hai — ek link share karo, paise aao!', name: 'Kavya, Pune', stars: 5 },
  { text: 'English course se interview crack kiya bhi aur referral bhi mili!', name: 'Sameer, Mumbai', stars: 5 },
];

// ─── Main UserSite ────────────────────────────────────────────────────────────
export default function UserSite() {
  const { subdomain } = useParams();
  const [loading, setLoading] = useState(true);
  const [shopOwner, setShopOwner] = useState(null);
  const [links, setLinks] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const { data: user, error: userErr } = await supabase
          .from('users')
          .select('id, full_name, refer_code')
          .eq('subdomain', subdomain)
          .single();

        if (userErr || !user) throw new Error('Shop not found');
        setShopOwner(user);

        const { data: userSettings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (userSettings) setLinks(userSettings);
      } catch (error) {
        console.error('Shop Load Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) fetchShopData();
  }, [subdomain]);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % miniTestimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: `${shopOwner?.full_name?.split(' ')[0]}'s Earning Shop`,
      text: `Check out exclusive earning apps and deals! Use code ${shopOwner?.refer_code} for ₹500 off!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <FullLoader />;

  if (!shopOwner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070a08] text-white gap-4">
        <div className="text-6xl">🔍</div>
        <h2 className="text-2xl font-black">Shop Not Found</h2>
        <p className="text-gray-500">This shop may be inactive or the link is incorrect.</p>
        <Link to="/" className="text-[#00ff88] font-bold hover:underline">Go to Meri Kamai →</Link>
      </div>
    );
  }

  const ownerFirstName = shopOwner.full_name?.split(' ')[0] || 'Shop Owner';
  const hasAnyApp = links?.app_links?.upstox || links?.app_links?.navi || links?.app_links?.phonepe;
  const checkoutUrl = `/checkout?product=course&ref=${shopOwner.refer_code}`;

  return (
    <div className="min-h-screen bg-[#070a08] text-[#e5e5e5] font-sans overflow-x-hidden pb-16">

      {/* ── Background Glows ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00ff88]/4 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/3 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ── Header / Hero ── */}
      <div className="relative z-10 bg-gradient-to-b from-[#0a1410] to-[#070a08] border-b border-[#00ff88]/10 pt-10 pb-8 px-4">
        <div className="max-w-2xl mx-auto text-center">

          {/* Avatar */}
          <div className="relative inline-block mb-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00ff88] to-[#00cc66] flex items-center justify-center font-black text-[#0a0a0a] text-3xl shadow-[0_0_40px_rgba(0,255,136,0.3)] mx-auto">
              {ownerFirstName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#00ff88] rounded-full border-2 border-[#070a08] flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-[#0a0a0a]" />
            </div>
          </div>

          {/* Name & Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Welcome to <span className="text-[#00ff88]">{ownerFirstName}'s</span> Shop
          </h1>
          <p className="text-gray-400 text-base mb-5 max-w-md mx-auto">
            Exclusive earning apps, best deals, aur ek ₹500 OFF course — sab ek jagah!
          </p>

          {/* Verified Badge */}
          <div className="inline-flex items-center gap-2 bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Meri Kamai Partner
          </div>

          {/* Social Links */}
          {(links?.youtube_link || links?.instagram_link || links?.telegram_link || links?.whatsapp_link) && (
            <div className="flex justify-center gap-3 mb-4">
              {links?.youtube_link && (
                <a href={links.youtube_link} target="_blank" rel="noreferrer"
                  className="w-10 h-10 bg-[#0d1410] border border-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500/40 transition-all">
                  <FaYoutube className="w-5 h-5" />
                </a>
              )}
              {links?.instagram_link && (
                <a href={links.instagram_link} target="_blank" rel="noreferrer"
                  className="w-10 h-10 bg-[#0d1410] border border-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-pink-500 hover:border-pink-500/40 transition-all">
                  <FaInstagram className="w-5 h-5" />
                </a>
              )}
              {links?.telegram_link && (
                <a href={links.telegram_link} target="_blank" rel="noreferrer"
                  className="w-10 h-10 bg-[#0d1410] border border-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-400/40 transition-all">
                  <FaTelegramPlane className="w-5 h-5" />
                </a>
              )}
              {links?.whatsapp_link && (
                <a href={links.whatsapp_link} target="_blank" rel="noreferrer"
                  className="w-10 h-10 bg-[#0d1410] border border-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-400/40 transition-all">
                  <FaWhatsapp className="w-5 h-5" />
                </a>
              )}
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-[#0d1410] border border-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#00ff88] hover:border-[#00ff88]/40 transition-all"
                title="Share this shop"
              >
                {shareSuccess ? <CheckCircle className="w-5 h-5 text-[#00ff88]" /> : <Share2 className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 mt-8 space-y-6">

        {/* ── English Course Card ── */}
        <div className="relative bg-gradient-to-br from-[#0d1120] to-[#080a12] border-2 border-blue-500/30 rounded-2xl overflow-hidden">
          {/* Ribbon */}
          <div className="absolute top-5 -right-8 bg-red-600 text-white text-[10px] font-black px-10 py-1 rotate-45 shadow-lg">
            50% OFF
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/8 rounded-full blur-[60px]" />

          <div className="p-6 relative z-10">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">🎓</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg font-black text-white">Spoken English Mastery</h3>
                  <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">BESTSELLER</span>
                </div>
                <p className="text-sm text-gray-400">Fluency, confidence, career growth — ek course mein sab.</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-black text-gray-500 line-through">₹999</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">₹499</span>
              </div>
              <span className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-full font-bold">Save ₹500</span>
            </div>

            {/* Code Box */}
            <div className="bg-blue-900/20 border border-blue-500/30 border-dashed rounded-xl p-4 mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-blue-400/70 font-medium uppercase tracking-wider">Promo Code</p>
                  <p className="text-xl font-black text-blue-300 tracking-widest">{shopOwner.refer_code}</p>
                </div>
              </div>
              <CopyButton
                text={shopOwner.refer_code}
                className="text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg bg-blue-900/20"
              />
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { icon: '🎬', text: 'Full Video Modules' },
                { icon: '📱', text: 'Mobile + Desktop' },
                { icon: '♾️', text: 'Lifetime Access' },
                { icon: '📝', text: 'Daily Practice' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={checkoutUrl}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_35px_rgba(59,130,246,0.4)] text-base mb-3"
            >
              Buy Now @ ₹499 <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/course"
              className="flex items-center justify-center gap-2 w-full border border-blue-500/20 text-blue-400 font-semibold py-3 rounded-xl hover:bg-blue-900/20 transition-all text-sm"
            >
              <PlayCircle className="w-4 h-4" /> Watch Free Demo First
            </Link>
          </div>
        </div>

        {/* ── Apps Section ── */}
        {hasAnyApp && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-[#00ff88]" />
              <h2 className="text-lg font-black text-white">Top Earning Apps</h2>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Install → Earn</span>
            </div>
            <div className="space-y-3">
              <AppCard appKey="upstox" url={links?.app_links?.upstox} referCode={shopOwner.refer_code} />
              <AppCard appKey="navi" url={links?.app_links?.navi} referCode={shopOwner.refer_code} />
              <AppCard appKey="phonepe" url={links?.app_links?.phonepe} referCode={shopOwner.refer_code} />
            </div>
          </div>
        )}

        {/* ── Trust Strip ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <ShieldCheck className="w-5 h-5 text-[#00ff88]" />, label: '100% Secure', sub: 'Razorpay Protected' },
            { icon: <Zap className="w-5 h-5 text-yellow-400" />, label: 'Instant Access', sub: 'After Payment' },
            { icon: <TrendingUp className="w-5 h-5 text-blue-400" />, label: '2000+ Earners', sub: 'Trust Platform' },
          ].map((t, i) => (
            <div key={i} className="bg-[#0d1410] border border-gray-800 rounded-xl p-3.5 text-center">
              <div className="flex justify-center mb-1.5">{t.icon}</div>
              <p className="text-white font-bold text-xs">{t.label}</p>
              <p className="text-gray-600 text-[10px]">{t.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Testimonial Rotator ── */}
        <div className="bg-[#0d1410] border border-[#00ff88]/15 rounded-2xl p-5 min-h-[100px] relative overflow-hidden">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[#00ff88] text-[#00ff88]" />)}
          </div>
          <p className="text-gray-300 text-sm italic mb-3 leading-relaxed">
            "{miniTestimonials[activeTestimonial].text}"
          </p>
          <p className="text-gray-600 text-xs font-semibold">{miniTestimonials[activeTestimonial].name}</p>
          {/* Dots */}
          <div className="flex gap-1.5 mt-3">
            {miniTestimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeTestimonial ? 'bg-[#00ff88] w-4' : 'bg-gray-700'}`}
              />
            ))}
          </div>
        </div>

        {/* ── Shop Owner Pitch ── */}
        <div className="bg-[#0f1a14] border border-[#00ff88]/10 rounded-2xl p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00cc66] flex items-center justify-center font-black text-[#0a0a0a] shrink-0">
            {ownerFirstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold text-sm mb-1">{ownerFirstName} says:</p>
            <p className="text-gray-400 text-sm leading-relaxed italic">
              "Yeh apps maine personally use kiye hain aur in se seedha paise kamaye hain.
              Code <strong className="text-[#00ff88]">{shopOwner.refer_code}</strong> se course ₹499 mein milega!
              Mujhe reach karo kisi bhi sawaal ke liye."
            </p>
          </div>
        </div>

        {/* ── Footer Brand ── */}
        <div className="text-center pt-4">
          <p className="text-gray-700 text-xs mb-1">Powered by</p>
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#00ff88] transition-colors">
            <div className="w-5 h-5 rounded bg-[#00ff88] flex items-center justify-center font-black text-[#0a0a0a] text-xs">₹</div>
            <span className="font-bold text-sm">Meri<span className="text-[#00ff88]">Kamai</span></span>
          </Link>
          <p className="text-gray-800 text-[10px] mt-1">India's #1 Digital Earning Franchise</p>
        </div>
      </div>
    </div>
  );
}