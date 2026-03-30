import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight, PlayCircle, Tag, Loader2, Star,
  ShieldCheck, CheckCircle, Zap, Copy, Share2,
  ChevronDown, Flame, Sparkles, Gift, TrendingUp,
  ShoppingBag, Landmark, CreditCard, Gamepad2, ExternalLink
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { FaYoutube, FaInstagram, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';

/* ─────────────────────────────────────────────
   SECTION META — display info for each category
   category_key must match Supabase column
───────────────────────────────────────────── */
const SECTION_META = {
  shopping: {
    label: 'Shopping & Cashback',
    tagline: 'Har kharidari pe extra cashback — EarnKaro deals exclusive hain!',
    icon: <ShoppingBag className="w-5 h-5" />,
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.2)',
    accentText: 'text-amber-400',
    gradient: 'from-[#1a1400] to-[#0d0d00]',
    borderActive: 'border-amber-500/40',
    badgeStyle: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    btnStyle: 'bg-amber-500 hover:bg-amber-400 text-black',
    highlight: 'Cashback upto',
  },
  financial: {
    label: 'Financial Products',
    tagline: 'Loans, insurance, investments — ek jagah sab. GroMo se har kaam aasaan.',
    icon: <Landmark className="w-5 h-5" />,
    accent: '#10b981',
    accentBg: 'rgba(16,185,129,0.08)',
    accentBorder: 'rgba(16,185,129,0.2)',
    accentText: 'text-emerald-400',
    gradient: 'from-[#001a10] to-[#000d08]',
    borderActive: 'border-emerald-500/40',
    badgeStyle: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    btnStyle: 'bg-emerald-500 hover:bg-emerald-400 text-black',
    highlight: 'Earn upto',
  },
  payments: {
    label: 'UPI & Payment Apps',
    tagline: 'Daily payment apps — install karo, bonus pao, use karte raho!',
    icon: <CreditCard className="w-5 h-5" />,
    accent: '#8b5cf6',
    accentBg: 'rgba(139,92,246,0.08)',
    accentBorder: 'rgba(139,92,246,0.2)',
    accentText: 'text-violet-400',
    gradient: 'from-[#0d0014] to-[#080008]',
    borderActive: 'border-violet-500/40',
    badgeStyle: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    btnStyle: 'bg-violet-600 hover:bg-violet-500 text-white',
    highlight: 'Signup bonus',
  },
  earning_apps: {
    label: 'Install & Earn Apps',
    tagline: 'App install karo, register karo, seedha cash pao — bonus buddy aur aur bhi!',
    icon: <Gamepad2 className="w-5 h-5" />,
    accent: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
    accentBorder: 'rgba(239,68,68,0.2)',
    accentText: 'text-red-400',
    gradient: 'from-[#1a0000] to-[#0d0000]',
    borderActive: 'border-red-500/40',
    badgeStyle: 'bg-red-500/20 text-red-400 border border-red-500/30',
    btnStyle: 'bg-red-600 hover:bg-red-500 text-white',
    highlight: 'Earn upto',
  },
};

/* ─────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────── */
function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`flex items-center gap-1.5 transition-all duration-200 ${className}`}
    >
      {copied
        ? <><CheckCircle className="w-3.5 h-3.5 text-[#00ff88]" /><span className="text-[#00ff88] text-xs font-bold">Copied!</span></>
        : <><Copy className="w-3.5 h-3.5" /><span className="text-xs">Copy</span></>}
    </button>
  );
}

/* ─────────────────────────────────────────────
   APP CARD — fully driven by Supabase data
───────────────────────────────────────────── */
function AppCard({ app, meta, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-2xl border transition-all duration-300 overflow-hidden
        ${hovered ? meta.borderActive + ' shadow-lg' : 'border-gray-800/80'}
        bg-gradient-to-br ${meta.gradient}`}
      style={{
        animationDelay: `${index * 80}ms`,
        boxShadow: hovered ? `0 0 30px ${meta.accent}18` : 'none',
      }}
    >
      {/* Glow bg on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(circle at 80% 50%, ${meta.accent}10 0%, transparent 60%)`, opacity: hovered ? 1 : 0 }}
      />

      {/* Hot badge */}
      {app.is_featured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="flex items-center gap-1 text-[9px] font-black bg-[#00ff88] text-black px-2 py-0.5 rounded-full">
            <Flame className="w-2.5 h-2.5" /> HOT
          </span>
        </div>
      )}

      <div className="relative z-10 p-4 flex items-center gap-4">
        {/* App Logo / Emoji */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border"
          style={{ background: meta.accentBg, borderColor: meta.accentBorder }}
        >
          {app.logo_emoji || '📱'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h4 className="font-black text-white text-sm">{app.name}</h4>
            {app.badge_text && (
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${meta.badgeStyle}`}>
                {app.badge_text}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs leading-snug mb-2 line-clamp-2">{app.tagline}</p>

          {/* Earning range */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-600 font-medium">{meta.highlight}:</span>
            <span className={`text-xs font-black ${meta.accentText}`}>
              {app.earn_min && app.earn_max
                ? `₹${app.earn_min}–₹${app.earn_max}`
                : app.earn_min
                  ? `₹${app.earn_min}`
                  : 'Varies'}
            </span>
            {app.earn_note && (
              <span className="text-[9px] text-gray-600">({app.earn_note})</span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <a
          href={app.referral_url}
          target="_blank"
          rel="noreferrer"
          className={`shrink-0 font-black px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md ${meta.btnStyle}`}
        >
          {app.cta_text || 'Install'}
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Bottom strip for extra info */}
      {app.extra_info && (
        <div className="px-4 pb-3 relative z-10">
          <div
            className="text-[10px] text-gray-500 bg-black/30 border rounded-lg px-3 py-1.5 leading-relaxed"
            style={{ borderColor: meta.accentBorder }}
          >
            💡 {app.extra_info}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION BLOCK
───────────────────────────────────────────── */
function AppSection({ categoryKey, apps, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = SECTION_META[categoryKey];
  if (!meta || !apps?.length) return null;

  return (
    <div className="rounded-2xl border border-gray-800/60 overflow-hidden">
      {/* Section Header — clickable */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-white/3"
        style={{ background: open ? meta.accentBg : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border"
            style={{ background: meta.accentBg, borderColor: meta.accentBorder, color: meta.accent }}
          >
            {meta.icon}
          </div>
          <div className="text-left">
            <p className="font-black text-white text-sm">{meta.label}</p>
            <p className="text-gray-500 text-[10px]">{apps.length} app{apps.length > 1 ? 's' : ''} available</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${meta.badgeStyle}`}
          >
            {apps.filter(a => a.is_featured).length > 0 ? '🔥 Hot Deals' : 'Explore'}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300`}
            style={{ color: meta.accent, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {/* Section Body */}
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-800/50">
          <p className="text-gray-500 text-xs pt-2 pb-1">{meta.tagline}</p>
          {apps.map((app, i) => (
            <AppCard key={app.id} app={app} meta={meta} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   COURSE HERO CARD
───────────────────────────────────────────── */
function CourseBanner({ referCode, checkoutUrl }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => { setPulse(p => !p); }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-blue-500/40"
      style={{ background: 'linear-gradient(135deg, #060d1f 0%, #0a0d1a 50%, #060d1f 100%)' }}
    >
      {/* Animated glow orbs */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] transition-opacity duration-[3000ms]"
        style={{ background: '#3b82f620', opacity: pulse ? 0.8 : 0.3 }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-[60px] transition-opacity duration-[3000ms]"
        style={{ background: '#00ff8815', opacity: pulse ? 0.6 : 0.2 }} />

      {/* TOP DEAL flash badge */}
      <div className="relative z-10 flex justify-between items-start p-5 pb-0">
        <div className="flex gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] font-black bg-blue-600 text-white px-2.5 py-1 rounded-full">
            <Star className="w-2.5 h-2.5 fill-white" /> TOP DEAL
          </span>
          <span className="flex items-center gap-1 text-[10px] font-black bg-[#00ff88] text-black px-2.5 py-1 rounded-full">
            <Flame className="w-2.5 h-2.5" /> BESTSELLER
          </span>
        </div>
        <span className="text-[10px] font-black bg-red-600 text-white px-3 py-1 rounded-full">50% OFF</span>
      </div>

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex gap-3 mb-4 items-start">
          <div className="text-4xl">🎓</div>
          <div>
            <h3 className="text-xl font-black text-white leading-tight">Spoken English Mastery</h3>
            <p className="text-blue-400 text-xs font-semibold mt-0.5">Fluency · Confidence · Career Growth</p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['🎬 Video Modules', '📱 Mobile+Desktop', '♾️ Lifetime Access', '📝 Daily Practice'].map((f, i) => (
            <span key={i} className="text-[10px] text-gray-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">{f}</span>
          ))}
        </div>

        {/* Price row */}
        <div className="flex items-end gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-600 line-through">₹999</p>
            <p className="text-4xl font-black text-white leading-none">₹499</p>
          </div>
          <div className="pb-1">
            <p className="text-[10px] text-gray-500">with promo code</p>
            <p className="text-xs font-black text-[#00ff88]">Save ₹500 instantly!</p>
          </div>
        </div>

        {/* Promo code dashed box */}
        <div className="border border-dashed border-blue-500/40 rounded-xl bg-blue-900/15 p-3.5 mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="text-[9px] text-blue-400/60 font-bold uppercase tracking-widest">Promo Code</p>
              <p className="text-lg font-black text-blue-300 tracking-[0.15em]">{referCode}</p>
            </div>
          </div>
          <CopyButton
            text={referCode}
            className="text-blue-400 hover:text-blue-200 border border-blue-500/30 px-3 py-1.5 rounded-lg bg-blue-900/20 hover:bg-blue-900/40"
          />
        </div>

        {/* CTAs */}
        <a
          href={checkoutUrl}
          className="flex items-center justify-center gap-2 w-full font-black py-4 rounded-2xl mb-2.5 text-base transition-all shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        >
          <Gift className="w-4 h-4" />
          Buy Now @ ₹499 — Code Applied!
          <ArrowRight className="w-4 h-4" />
        </a>
        <Link
          to="/course"
          className="flex items-center justify-center gap-2 w-full text-blue-400 font-semibold py-3 rounded-xl hover:bg-blue-900/20 transition-all text-sm border border-blue-500/15"
        >
          <PlayCircle className="w-4 h-4" /> Watch Free Demo First
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FULL PAGE LOADER
───────────────────────────────────────────── */
function FullLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#060809] gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-[#00ff88] flex items-center justify-center font-black text-[#0a0a0a] text-2xl shadow-[0_0_40px_rgba(0,255,136,0.4)]">₹</div>
        <div className="absolute -inset-2 rounded-3xl border border-[#00ff88]/20 animate-ping" />
      </div>
      <Loader2 className="w-5 h-5 text-[#00ff88] animate-spin" />
      <p className="text-gray-600 text-sm">Loading your shop...</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TESTIMONIAL TICKER
───────────────────────────────────────────── */
const TESTIMONIALS = [
  { text: 'EarnKaro se pehle mahine hi ₹2200 ka cashback mila! Platform bahut acha hai.', name: 'Rohit M.', city: 'Delhi' },
  { text: 'GroMo se loan referral karaya aur ₹800 seed commission mili. Easy process.', name: 'Priya S.', city: 'Jaipur' },
  { text: 'English course se interview crack kiya — aur referral se ₹1500 extra bhi!', name: 'Amit K.', city: 'Mumbai' },
  { text: 'Bonus Buddy app se sirf install karke ₹120 mila. 5 minute ka kaam!', name: 'Sneha V.', city: 'Pune' },
];

function TestimonialTicker() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const curr = TESTIMONIALS[active];
  return (
    <div className="bg-[#0d1410] border border-[#00ff88]/12 rounded-2xl p-4">
      <div className="flex gap-1 mb-2">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-[#00ff88] text-[#00ff88]" />)}
      </div>
      <p className="text-gray-300 text-sm italic leading-relaxed mb-3">"{curr.text}"</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00cc66] flex items-center justify-center text-[10px] font-black text-black">
            {curr.name.charAt(0)}
          </div>
          <span className="text-gray-600 text-xs font-semibold">{curr.name}, {curr.city}</span>
        </div>
        <div className="flex gap-1">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-[#00ff88]' : 'w-1.5 bg-gray-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function UserSite({ customSubdomain }) {
  const { subdomain: paramSubdomain } = useParams();
  const subdomain = customSubdomain || paramSubdomain;
  const [loading, setLoading] = useState(true);
  const [shopOwner, setShopOwner] = useState(null);
  const [socialLinks, setSocialLinks] = useState(null);
  const [appsByCategory, setAppsByCategory] = useState({});
  const [shareSuccess, setShareSuccess] = useState(false);
  const [pageViewed, setPageViewed] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        /* 1. Owner info */
        const { data: user, error: userErr } = await supabase
          .from('users')
          .select('id, full_name, refer_code, subdomain')
          .eq('subdomain', subdomain)
          .single();

        if (userErr || !user) throw new Error('Shop not found');
        setShopOwner(user);

        /* 2. Social links */
        const { data: settings } = await supabase
          .from('user_settings')
          .select('youtube_link, instagram_link, telegram_link, whatsapp_link')
          .eq('user_id', user.id)
          .single();

        if (settings) setSocialLinks(settings);

        /* 3. Apps — fetch all active apps user has enabled, with category */
        const { data: userApps } = await supabase
          .from('user_apps')
          .select(`
            referral_url,
            app_id,
            apps (
              id, name, tagline, logo_emoji, badge_text, cta_text,
              category, earn_min, earn_max, earn_note, extra_info,
              is_featured, sort_order
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('apps(sort_order)', { ascending: true });

        /* Group by category */
        const grouped = {};
        (userApps || []).forEach(row => {
          if (!row.apps) return;
          const cat = row.apps.category;
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push({ ...row.apps, referral_url: row.referral_url });
        });
        setAppsByCategory(grouped);

        /* 4. Increment view count (fire and forget) */
        if (!pageViewed) {
          setPageViewed(true);
          supabase.rpc('increment_shop_views', { shop_subdomain: subdomain }).catch(() => {});
        }
      } catch (err) {
        console.error('UserSite Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) fetchAll();
  }, [subdomain]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${shopOwner?.full_name?.split(' ')[0]}'s Deals`,
          text: `Exclusive earning apps + English Course ₹499! Code: ${shopOwner?.refer_code}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch {}
  };

  if (loading) return <FullLoader />;

  if (!shopOwner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#060809] text-white gap-4 px-4 text-center">
        <div className="text-6xl">🔍</div>
        <h2 className="text-2xl font-black">Shop Not Found</h2>
        <p className="text-gray-500 max-w-xs">This shop link is inactive or incorrect. Check the URL.</p>
        <Link to="/" className="text-[#00ff88] font-bold hover:underline flex items-center gap-1">
          Go to MeriKamai <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const ownerFirst = shopOwner.full_name?.split(' ')[0] || 'Shop Owner';
  const checkoutUrl = `/checkout?product=course&ref=${shopOwner.refer_code}`;
  const categoryOrder = ['shopping', 'financial', 'payments', 'earning_apps'];
  const hasAnySections = categoryOrder.some(cat => appsByCategory[cat]?.length > 0);

  return (
    <div className="min-h-screen bg-[#060809] text-[#e5e5e5] overflow-x-hidden pb-16"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── Background atmosphere ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[120px]"
          style={{ background: 'rgba(0,255,136,0.04)' }} />
        <div className="absolute top-[40%] right-0 w-[300px] h-[300px] rounded-full blur-[100px]"
          style={{ background: 'rgba(59,130,246,0.04)' }} />
      </div>

      {/* ── HERO HEADER ── */}
      <div className="relative z-10 pt-8 pb-6 px-4 text-center border-b border-white/5"
        style={{ background: 'linear-gradient(to bottom, #0a0f0b, #060809)' }}>

        {/* Avatar */}
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center font-black text-[#0a0a0a] text-3xl shadow-[0_0_40px_rgba(0,255,136,0.35)]"
            style={{ background: 'linear-gradient(135deg, #00ff88, #00cc66)' }}>
            {ownerFirst.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#00ff88] rounded-full border-2 border-[#060809] flex items-center justify-center">
            <CheckCircle className="w-3.5 h-3.5 text-black" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
          <span className="text-[#00ff88]">{ownerFirst}'s</span> Deals & Offers
        </h1>
        <p className="text-gray-500 text-sm mb-4 max-w-xs mx-auto">
          Exclusive earning apps, cashback deals aur English Course — sab ek jagah!
        </p>

        {/* Verified strip */}
        <div className="inline-flex items-center gap-2 text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/8 border border-[#00ff88]/20 px-3 py-1.5 rounded-full mb-5">
          <ShieldCheck className="w-3 h-3" /> Verified MeriKamai Partner
        </div>

        {/* Social Links */}
        {socialLinks && (
          <div className="flex justify-center gap-2.5">
            {socialLinks.youtube_link && (
              <a href={socialLinks.youtube_link} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-[#0d1410] border border-gray-800 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500/30 transition-all">
                <FaYoutube className="w-4 h-4" />
              </a>
            )}
            {socialLinks.instagram_link && (
              <a href={socialLinks.instagram_link} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-[#0d1410] border border-gray-800 rounded-xl flex items-center justify-center text-gray-500 hover:text-pink-500 hover:border-pink-500/30 transition-all">
                <FaInstagram className="w-4 h-4" />
              </a>
            )}
            {socialLinks.telegram_link && (
              <a href={socialLinks.telegram_link} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-[#0d1410] border border-gray-800 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-400 hover:border-blue-500/30 transition-all">
                <FaTelegramPlane className="w-4 h-4" />
              </a>
            )}
            {socialLinks.whatsapp_link && (
              <a href={socialLinks.whatsapp_link} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-[#0d1410] border border-gray-800 rounded-xl flex items-center justify-center text-gray-500 hover:text-green-400 hover:border-green-500/30 transition-all">
                <FaWhatsapp className="w-4 h-4" />
              </a>
            )}
            <button onClick={handleShare}
              className="w-9 h-9 bg-[#0d1410] border border-gray-800 rounded-xl flex items-center justify-center text-gray-500 hover:text-[#00ff88] hover:border-[#00ff88]/30 transition-all">
              {shareSuccess ? <CheckCircle className="w-4 h-4 text-[#00ff88]" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 max-w-xl mx-auto px-4 mt-6 space-y-5">

        {/* ── 🔥 ENGLISH COURSE — HERO PLACEMENT ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#00ff88]" />
            <span className="text-xs font-black text-[#00ff88] uppercase tracking-widest">Featured Deal</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#00ff88]/20 to-transparent" />
          </div>
          <CourseBanner referCode={shopOwner.refer_code} checkoutUrl={checkoutUrl} />
        </div>

        {/* ── APPS SECTIONS ── */}
        {hasAnySections ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Earn More</span>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-500/20 to-transparent" />
            </div>
            <div className="space-y-3">
              {categoryOrder.map((cat, i) =>
                appsByCategory[cat]?.length > 0 ? (
                  <AppSection
                    key={cat}
                    categoryKey={cat}
                    apps={appsByCategory[cat]}
                    defaultOpen={i === 0} /* first section open by default */
                  />
                ) : null
              )}
            </div>
          </div>
        ) : (
          /* No apps added yet — soft prompt */
          <div className="text-center py-8 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-3xl mb-2">🛍️</p>
            <p className="text-gray-500 text-sm">No apps added yet.</p>
            <p className="text-gray-700 text-xs mt-1">Check back soon — deals coming!</p>
          </div>
        )}

        {/* ── TRUST STRIP ── */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: <ShieldCheck className="w-4 h-4" />, label: '100% Secure', sub: 'Razorpay', color: 'text-[#00ff88]' },
            { icon: <Zap className="w-4 h-4" />, label: 'Instant Access', sub: 'Post Payment', color: 'text-yellow-400' },
            { icon: <TrendingUp className="w-4 h-4" />, label: '2000+ Earners', sub: 'Trusted', color: 'text-blue-400' },
          ].map((t, i) => (
            <div key={i} className="bg-[#0d1410] border border-gray-800/60 rounded-xl p-3 text-center">
              <div className={`flex justify-center mb-1 ${t.color}`}>{t.icon}</div>
              <p className="text-white font-bold text-[11px]">{t.label}</p>
              <p className="text-gray-700 text-[9px]">{t.sub}</p>
            </div>
          ))}
        </div>

        {/* ── TESTIMONIALS ── */}
        <TestimonialTicker />

        {/* ── OWNER MESSAGE ── */}
        <div className="bg-[#0d1410] border border-[#00ff88]/10 rounded-2xl p-4 flex gap-3">
          <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-black text-sm"
            style={{ background: 'linear-gradient(135deg, #00ff88, #00cc66)' }}>
            {ownerFirst.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold text-sm mb-1">{ownerFirst} recommends:</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              "Maine yeh sab apps khud try kiye hain — genuine earning hoti hai.
              Course ke liye code <span className="font-black text-[#00ff88]">{shopOwner.refer_code}</span> use karo, ₹500 off milega! Koi sawaal ho toh message karo."
            </p>
          </div>
        </div>

        {/* ── FOOTER BRAND ── */}
        <div className="text-center pt-2 pb-2">
          <p className="text-gray-800 text-[10px] mb-1.5">Powered by</p>
          <Link to="/" className="inline-flex items-center gap-1.5 group">
            <div className="w-5 h-5 rounded bg-[#00ff88] flex items-center justify-center font-black text-black text-[10px]">₹</div>
            <span className="font-black text-sm text-gray-600 group-hover:text-[#00ff88] transition-colors">
              Meri<span className="text-[#00ff88]">Kamai</span>
            </span>
          </Link>
          <p className="text-gray-900 text-[9px] mt-1">India's #1 Digital Earning Franchise</p>
        </div>
      </div>
    </div>
  );
}