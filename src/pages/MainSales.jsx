import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MonitorSmartphone, CheckCircle, PlayCircle,
  ShieldCheck, ExternalLink, Star, Users, TrendingUp, Zap,
  ArrowRight, ChevronDown, BadgeCheck, Flame, IndianRupee, Sparkles, Globe, Lock, Award
} from 'lucide-react';
import { FaYoutube, FaInstagram, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

// ─── Floating Particles ───────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 6}s`,
    size: `${2 + Math.random() * 3}px`,
    opacity: 0.1 + Math.random() * 0.3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#00ff88] animate-float"
          style={{
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ name, city, amount, text, avatar, delay }) {
  return (
    <div
      className="bg-[#0f1a14] border border-[#00ff88]/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-[#00ff88]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,136,0.08)]"
      style={{ animationDelay: delay }}
    >
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-[#00ff88] text-[#00ff88]" />
        ))}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed italic">"{text}"</p>
      <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00cc70] flex items-center justify-center font-black text-[#0a0a0a] text-sm">
          {avatar}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{name}</p>
          <p className="text-gray-500 text-xs">{city}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[#00ff88] font-black text-sm">+₹{amount}</p>
          <p className="text-gray-600 text-[10px]">earned</p>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${open ? 'border-[#00ff88]/40 bg-[#0f1a14]' : 'border-gray-800 bg-[#0d0d0d]'}`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center px-5 py-4 gap-4">
        <p className="text-white font-semibold text-sm">{q}</p>
        <ChevronDown className={`w-5 h-5 text-[#00ff88] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MainSales() {
  const [timeLeft, setTimeLeft] = useState({ h: 4, m: 23, s: 47 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 4; m = 23; s = 47; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = n => String(n).padStart(2, '0');

  const testimonials = [
    { name: 'Rahul M.', city: 'Lucknow, UP', amount: '2,400', text: 'Bhai pehle mahine mein hi ₹2400 aa gaye sirf 4-5 referrals se. Platform bahut simple hai.', avatar: 'R', delay: '0s' },
    { name: 'Priya S.', city: 'Jaipur, RJ', amount: '1,850', text: 'Maine apni Instagram se share kiya aur within 2 weeks wallet bhar gaya. Withdrawal bhi instant tha!', avatar: 'P', delay: '0.1s' },
    { name: 'Amit K.', city: 'Delhi', amount: '5,200', text: 'Mera Telegram group hai 800 log ka. Ek post se ₹5000+ aa gaye. Seriously best passive income hai.', avatar: 'A', delay: '0.2s' },
    { name: 'Sneha V.', city: 'Pune, MH', amount: '3,100', text: 'Platform itna clean hai ki customers khud trust karte hain. Live views tracking bhi solid hai!', avatar: 'S', delay: '0.3s' },
  ];

  const faqs = [
    { q: 'Kya setup karne mein technical knowledge chahiye?', a: 'Bilkul nahi! Sirf Google se login karo, apna naam aur UPI dal do — 5 minute mein teri dukan live ho jaati hai.' },
    { q: '₹9/month ke baad auto-debit hoga?', a: 'Nahi! Zero auto-debit. Jab chaho tab renew karo. Koi hidden charges nahi hain.' },
    { q: 'Refer commission kab milta hai?', a: 'Jaise hi payment verify hoti hai — 24 ghante ke andar wallet mein ₹50 credit ho jaata hai.' },
    { q: 'Minimum withdrawal kitna hai?', a: '₹200 hone par directly apne UPI account mein withdraw kar sakte ho. No bank form, no delays.' },
    { q: 'Kya main multiple apps promote kar sakta hun?', a: 'Haan! Upstox, Navi, PhonePe — apni marzi se koi bhi app choose karo. Aur naye apps regularly add hote rehte hain.' },
  ];

  return (
    <div className="min-h-screen bg-[#070a08] text-[#e5e5e5] font-sans overflow-x-hidden">

      {/* ── Urgency Banner ── */}
      <div className="bg-gradient-to-r from-[#00ff88]/10 via-[#00ff88]/20 to-[#00ff88]/10 border-b border-[#00ff88]/20 py-2 px-4 text-center">
        <p className="text-sm font-semibold text-[#00ff88] flex items-center justify-center gap-2">
          <Flame className="w-4 h-4 animate-pulse" />
          🎉 Limited Offer: ₹9/month plan — Offer expires in&nbsp;
          <span className="font-black tabular-nums bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/30">
            {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
          </span>
          &nbsp;— Abhi shuru karo!
          <Flame className="w-4 h-4 animate-pulse" />
        </p>
      </div>

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00ff88]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00ff88]/5 rounded-full blur-[100px] pointer-events-none" />
        <Particles />

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-bold px-5 py-2 rounded-full text-sm mb-8 shadow-[0_0_20px_rgba(0,255,136,0.15)]">
          <Sparkles className="w-4 h-4" />
          India's #1 Digital Earning Franchise Platform
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Headline */}
        <h1 className="relative z-10 text-center text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.05]">
          <span className="text-white">Bhatko Nahi,</span>
          <br />
          <span className="relative">
            <span className="text-[#00ff88] drop-shadow-[0_0_40px_rgba(0,255,136,0.4)]">Yahi Kamao.</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" fill="none">
              <path d="M0 6 Q100 0 200 6 Q300 12 400 6" stroke="#00ff88" strokeWidth="2.5" strokeOpacity="0.4" fill="none" />
            </svg>
          </span>
        </h1>

        <p className="relative z-10 text-center text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Apni <strong className="text-white">khud ki Earning Website</strong> banao — bina coding ke, bina investment ke.
          Sirf <strong className="text-[#00ff88]">₹9/month</strong> mein — aur pura commission <strong className="text-white">tumhara</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 mb-12">
          {/* ✅ FIXED ROUTING LINK */}
          <Link
            to="/dashboard"
            className="group flex items-center justify-center gap-3 bg-[#00ff88] text-[#0a0a0a] font-black text-lg px-8 py-4 rounded-2xl hover:bg-white transition-all duration-200 shadow-[0_0_30px_rgba(0,255,136,0.35)] hover:shadow-[0_0_50px_rgba(0,255,136,0.5)] hover:scale-105"
          >
            <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Apni Dukan Shuru Karo — Free!
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          {/* ✅ FIXED EXTERNAL LINK */}
          <a
            href="https://demo.merikamai.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-[#00ff88]/40 text-[#00ff88] font-bold text-base px-6 py-4 rounded-2xl hover:bg-[#00ff88]/10 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            Live Demo Shop Dekho
          </a>
        </div>

        {/* Trust Signals */}
        <div className="relative z-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          {[
            { icon: <BadgeCheck className="w-4 h-4 text-[#00ff88]" />, text: 'Zero Setup Fee' },
            { icon: <Lock className="w-4 h-4 text-[#00ff88]" />, text: 'Razorpay Secured' },
            { icon: <Users className="w-4 h-4 text-[#00ff88]" />, text: '2,000+ Active Earners' },
            { icon: <Zap className="w-4 h-4 text-[#00ff88]" />, text: '5 Minute Setup' },
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {item.icon}
              {item.text}
            </span>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-[#00ff88]/40" />
        </div>
      </section>

      {/* ── Social Proof Numbers ── */}
      <section className="bg-[#0a0f0b] border-y border-[#00ff88]/10 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Active Earners', value: 2340, suffix: '+', prefix: '' },
            { label: 'Total Paid Out', value: 8, suffix: 'L+', prefix: '₹' },
            { label: 'Cities Covered', value: 180, suffix: '+', prefix: '' },
            { label: 'Avg Monthly Earn', value: 3500, suffix: '+', prefix: '₹' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="text-4xl font-black text-[#00ff88]">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#00ff88] font-bold text-sm uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">3 Steps Mein Shuru Karo</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: <Users className="w-7 h-7" />, title: 'Google se Login Karo', desc: 'Apne Google account se sign in karo — koi password nahi, koi form nahi.' },
            { step: '02', icon: <Globe className="w-7 h-7" />, title: 'Apni Dukan Setup Karo', desc: 'naam.merikamai.in — apni website live. Refer links, social links, sab customize karo.' },
            { step: '03', icon: <IndianRupee className="w-7 h-7" />, title: 'Share Karo, Kamao', desc: 'Har successful referral pe ₹50 seedha wallet mein. ₹200 hone par UPI mein withdraw.' },
          ].map((item, i) => (
            <div key={i} className="relative bg-[#0d1410] border border-[#00ff88]/15 rounded-2xl p-6 hover:border-[#00ff88]/40 transition-all duration-300 group">
              <div className="absolute top-5 right-5 text-5xl font-black text-[#00ff88]/8 group-hover:text-[#00ff88]/15 transition-colors select-none">
                {item.step}
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center text-[#00ff88] mb-4">
                {item.icon}
              </div>
              <h3 className="font-black text-white text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Plan Explainer Video (MOVED UP HERE) ── */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="bg-[#0d1410] border border-[#00ff88]/20 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,255,136,0.04)]">
          <div className="text-center mb-6">
            <p className="text-[#00ff88] font-bold text-sm uppercase tracking-widest mb-3">Watch First</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center justify-center gap-2">
              <PlayCircle className="text-[#00ff88] w-7 h-7" /> Pura Plan 5 Min Mein Samjho
            </h2>
            <p className="text-gray-500 text-sm">Real numbers, real system, real earning proof.</p>
          </div>
          <div className="bg-black rounded-2xl overflow-hidden aspect-video relative border border-gray-800">
            <iframe
              width="100%" height="100%"
              src="https://www.youtube.com/embed/YOUR_PLAN_VIDEO_ID"
              title="Meri Kamai Business Plan"
              frameBorder="0" allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ── Product Card (Single Focus) ── */}
      <section className="py-8 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#00ff88] font-bold text-sm uppercase tracking-widest mb-3">Start Now</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Apni Digital Dukan Kholo</h2>
        </div>
        
        {/* Centered Single Product Card */}
        <div className="max-w-md mx-auto">
          <div className="relative bg-gradient-to-b from-[#0d1a11] to-[#080d09] border-2 border-[#00ff88]/40 rounded-3xl p-7 flex flex-col shadow-[0_0_40px_rgba(0,255,136,0.07)] hover:shadow-[0_0_60px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/70 transition-all duration-300">
            {/* Popular Badge */}
            <div className="absolute -top-3.5 left-6 bg-[#00ff88] text-[#0a0a0a] text-xs font-black px-4 py-1 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3" /> BEST DEAL
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#00ff88]/15 border border-[#00ff88]/30 flex items-center justify-center">
                <MonitorSmartphone className="w-6 h-6 text-[#00ff88]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Digital Earning Dukan</h2>
                <p className="text-[#00ff88] text-xs font-semibold">Your personal earning platform</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Apne naam ki website. Top apps promote karo. Social links dalo. Dashboard se sab control karo. Paise seedha bank mein.
            </p>

            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-black text-[#00ff88]">₹9</span>
              <div className="pb-1.5">
                <p className="text-gray-400 text-sm font-medium">/ month</p>
                <p className="text-gray-600 text-xs">No auto-debit. Ever.</p>
              </div>
            </div>

            <div className="bg-[#00ff88]/8 border border-[#00ff88]/20 rounded-xl p-3.5 mb-6 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#00ff88] shrink-0 mt-0.5" />
              <p className="text-sm text-[#00ff88]/90">
                <strong>Zero Setup Cost.</strong> Sirf ₹9 server kiraya — teri apni dukan, teri apni kamai.
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {[
                'Apni Website (naam.merikamai.in)',
                '100% Commission Tumhara',
                'Custom Referral Dashboard',
                'Live Views Counter',
                'App Links Customize Karo',
                'Social Media Links',
                'YouTube Learning Zone',
                'Instant UPI Withdrawal',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#00ff88] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="space-y-3 mt-auto">
              {/* ✅ FIXED ROUTING LINK */}
              <Link
                to="/dashboard"
                className="group block w-full text-center bg-[#00ff88] text-[#0a0a0a] font-black py-4 rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,136,0.25)] hover:shadow-[0_0_35px_rgba(0,255,136,0.4)] text-base"
              >
                Create My Shop Now →
              </Link>
              {/* ✅ FIXED EXTERNAL LINK */}
              <a
                href="https://demo.merikamai.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full text-center border border-[#00ff88]/30 text-[#00ff88] font-bold py-3.5 rounded-2xl hover:bg-[#00ff88]/8 transition-all text-sm"
              >
                <ExternalLink className="w-4 h-4" /> View Live Demo Shop
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#00ff88] font-bold text-sm uppercase tracking-widest mb-3">Real Stories</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Inki Sunn, Phir Decide Karo</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {testimonials.map((t, i) => <TestimonialCard key={i} {...t} />)}
        </div>
      </section>

      {/* ── Feature Highlight ── */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-[#0a1f12] via-[#0d1a14] to-[#0a1f12] border border-[#00ff88]/20 rounded-3xl p-8 sm:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Sirf ₹9 Mein Kya Milta Hai?
            </h2>
            <p className="text-gray-400">Isko dekh fir soch — kya isse better deal ho sakti hai?</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Globe className="w-6 h-6" />, title: 'Personal Website', desc: 'naam.merikamai.in — tera apna brand, teri apni dukaan.' },
              { icon: <TrendingUp className="w-6 h-6" />, title: 'Live Earning Dashboard', desc: 'Wallet balance, referrals, views — sab ek jagah dekho.' },
              { icon: <IndianRupee className="w-6 h-6" />, title: '100% Commission', desc: 'Jo bhi earn hoga, poora tumhara. Platform ka koi cut nahi.' },
              { icon: <Zap className="w-6 h-6" />, title: 'Instant UPI Withdrawal', desc: '₹200 hone par seedha UPI mein — no delays, no forms.' },
              { icon: <Award className="w-6 h-6" />, title: 'YouTube Learning Zone', desc: 'Dashboard mein exclusive videos — sikhte raho, karte raho.' },
              { icon: <Users className="w-6 h-6" />, title: 'Multi-App Promotion', desc: 'Upstox, Navi, PhonePe — choose karo, promote karo, kamao.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-[#00ff88]/3 border border-[#00ff88]/10 hover:border-[#00ff88]/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center text-[#00ff88] shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">{f.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[#00ff88] font-bold text-sm uppercase tracking-widest mb-3">FAQs</p>
          <h2 className="text-3xl font-black text-white">Sawal Puchhe? Jawab Lo.</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => <FaqItem key={i} {...faq} />)}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 text-center max-w-3xl mx-auto">
        <div className="relative bg-gradient-to-b from-[#0d1a11] to-[#070a08] border border-[#00ff88]/30 rounded-3xl p-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.06)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ab Sochna Band Karo,<br />
              <span className="text-[#00ff88]">Shuru Karo.</span>
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Ek click mein apni earning website live. Zero risk. Sirf ₹9.
            </p>
            {/* ✅ FIXED ROUTING LINK */}
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-3 bg-[#00ff88] text-[#0a0a0a] font-black text-lg px-10 py-4.5 rounded-2xl hover:bg-white transition-all shadow-[0_0_40px_rgba(0,255,136,0.4)] hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Abhi Shuru Karo — Free Setup
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-gray-600 text-xs mt-5">No credit card required. Login with Google.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-900 bg-[#050505] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00ff88] flex items-center justify-center font-black text-[#0a0a0a] text-lg">₹</div>
              <div>
                <p className="font-black text-xl text-white tracking-wide">Meri<span className="text-[#00ff88]">Kamai</span></p>
                <p className="text-gray-600 text-xs">India's #1 Earning Franchise</p>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {[
                { href: 'https://youtube.com/@playaviator_2026?si=LIHV1mBHwJFNvsZG', icon: <FaYoutube className="w-5 h-5" />, hover: 'hover:bg-red-600' },
                { href: 'https://www.instagram.com/aviatorgamer?igsh=eGozNDcycncyMzZk', icon: <FaInstagram className="w-5 h-5" />, hover: 'hover:bg-pink-600' },
                { href: 'https://t.me/+-vqDdRBqepM5N2M1', icon: <FaTelegramPlane className="w-5 h-5" />, hover: 'hover:bg-blue-500' },
                { href: 'https://t.me/+-vqDdRBqepM5N2M1', icon: <FaWhatsapp className="w-5 h-5" />, hover: 'hover:bg-green-500' },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer"
                  className={`bg-gray-900 border border-gray-800 p-3 rounded-xl text-gray-400 hover:text-white ${s.hover} hover:border-transparent transition-all`}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-[#00ff88] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-[#00ff88] transition-colors">Terms & Conditions</Link>
              <Link to="/refund" className="hover:text-[#00ff88] transition-colors">Refund Policy</Link>
            </div>
            <p className="text-gray-700 text-xs">© 2026 Meri Kamai. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        .animate-float { animation: float linear infinite; }
      `}</style>
    </div>
  );
}