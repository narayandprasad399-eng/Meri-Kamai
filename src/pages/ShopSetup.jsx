import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import {
  Store, Phone, ArrowRight, CheckCircle, Loader2,
  Zap, ShieldCheck, Clock, Sparkles, ExternalLink, Globe
} from 'lucide-react';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Load Razorpay script
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function ShopSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🚀 BUG FIXED: hasCourse hook ab sahi jagah (component ke andar) hai
  const [hasCourse, setHasCourse] = useState(false);
  const [step, setStep] = useState('checking'); // checking | setup | paying | success | renew
  const [shopName, setShopName] = useState('');
  const [customSubdomain, setCustomSubdomain] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');
  const [shopData, setShopData] = useState(null);

  // ── On mount: check if user already has shop ──
  useEffect(() => {
    if (!user) return;
    checkExistingShop();
  }, [user]);

  const checkExistingShop = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
     
      const res = await fetch(`${WORKER_URL}/api/check-shop`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.user?.has_course) {
        setHasCourse(true);
      }

      if (data.hasShop && !data.rentExpired) {
        // Shop already active → go to dashboard
        navigate('/dashboard');
        return;
      }

      if (data.hasShop && data.rentExpired) {
        // Shop exists but expired → renewal flow
        setShopName(data.user.full_name || '');
        setStep('renew');
        return;
      }

      // No shop → fresh setup
      setStep('setup');
    } catch (err) {
      console.error(err);
      setStep('setup');
    }
  };

  const handleSubmit = () => {
    setError('');
    if (!shopName.trim() || shopName.trim().length < 2) {
      return setError('Apna naam daalo (minimum 2 letters)');
    }
    if (!customSubdomain.trim() || customSubdomain.length < 3) {
      return setError('Shop URL kam se kam 3 letters ka hona chahiye');
    }
    if (!whatsapp.trim() || !/^[6-9]\d{9}$/.test(whatsapp.replace(/\s/g, ''))) {
      return setError('Valid 10-digit WhatsApp number daalo');
    }

    // Blocked VIP words check
    const blockedWords = ['admin', 'support', 'help', 'api', 'merikamai', 'official', 'test', 'kamai', 'www', 'cdn'];
    if (blockedWords.includes(customSubdomain)) {
      return setError('Yeh VIP URL allowed nahi hai, koi aur try karo');
    }

    initiatePayment();
  };

  const initiatePayment = async () => {
    setStep('paying');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay load nahi hua. Internet check karo.");

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      // Create order
      const orderRes = await fetch(`${WORKER_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          productType: "rent",
          userId: user.id,
          shopName: shopName.trim(),
          customSubdomain: customSubdomain.trim(),
          whatsapp: whatsapp.trim()
        })
      });
      const orderData = await orderRes.json();
      if (!orderData.id) throw new Error("Order create nahi hua: " + JSON.stringify(orderData));

      // Open Razorpay
      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.amount,
        currency: "INR",
        name: "Meri Kamai",
        description: "Digital Earning Shop — ₹21/month",
        order_id: orderData.id,
        prefill: {
          name: shopName.trim(),
          contact: whatsapp.trim(),
          email: user.email || ''
        },
        theme: { color: "#00ff88" },
        handler: async function (response) {
          await verifyAndSetup(response, token);
        },
        modal: {
          ondismiss: () => setStep('setup')  // user closed popup → back to form
        }
      };
      new window.Razorpay(options).open();

    } catch (err) {
      setError(err.message);
      setStep('setup');
    }
  };

  const verifyAndSetup = async (razorpayResponse, token) => {
    setStep('paying');
    try {
      const verifyRes = await fetch(`${WORKER_URL}/api/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          userId: user.id,
          productType: "rent",
          shopName: shopName.trim(),
          customSubdomain: customSubdomain.trim(),
          whatsapp: whatsapp.trim(),
          promoCode: "none"
        })
      });
      const result = await verifyRes.json();

      if (!result.success) throw new Error(result.error || "Verification failed");

      setShopData(result);
      setStep('success');
    } catch (err) {
      setError("Payment verify nahi hua: " + err.message + " — Support se contact karo.");
      setStep('setup');
    }
  };

  // ── RENEWAL (same as setup but no name/whatsapp fields) ──
  const handleRenewal = async () => {
    setError('');
    setStep('paying');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay load nahi hua.");

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const orderRes = await fetch(`${WORKER_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType: "rent", userId: user.id })
      });
      const orderData = await orderRes.json();
      if (!orderData.id) throw new Error("Order failed");

      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.amount,
        currency: "INR",
        name: "Meri Kamai",
        description: "Shop Renewal — 30 Days",
        order_id: orderData.id,
        theme: { color: "#00ff88" },
        handler: async (response) => {
          await verifyAndSetup(response, token);
        },
        modal: { ondismiss: () => setStep('renew') }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      setError(err.message);
      setStep('renew');
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────

  // CHECKING STATE
  if (step === 'checking') {
    return (
      <div className="min-h-screen bg-[#060809] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00ff88] flex items-center justify-center font-black text-black text-xl animate-pulse">₹</div>
          <Loader2 className="w-5 h-5 text-[#00ff88] animate-spin" />
          <p className="text-gray-600 text-sm">Checking your shop...</p>
        </div>
      </div>
    );
  }

  // PAYING STATE
  if (step === 'paying') {
    return (
      <div className="min-h-screen bg-[#060809] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#00ff88] animate-spin mx-auto mb-4" />
          <p className="text-white font-black text-lg mb-1">Processing...</p>
          <p className="text-gray-500 text-sm">Payment window band mat karo</p>
        </div>
      </div>
    );
  }

  // SUCCESS STATE
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#060809] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="bg-[#0a0f0b] border border-[#00ff88]/30 rounded-3xl p-7 text-center shadow-[0_0_60px_rgba(0,255,136,0.08)]">
            <div className="w-16 h-16 bg-[#00ff88]/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00ff88]/30">
              <CheckCircle className="w-8 h-8 text-[#00ff88]" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">
              {shopData?.isNew ? '🎉 Shop Ready!' : '✅ Renewed!'}
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              {shopData?.isNew
                ? 'Teri earning dukan live ho gayi hai!'
                : 'Shop 30 din ke liye renew ho gayi!'}
            </p>

            {shopData?.isNew && (
              <div className="space-y-3 mb-5">
                <div className="bg-[#060809] border border-[#00ff88]/15 rounded-xl p-3.5 text-left">
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-1">Your Shop URL</p>
                  <p className="text-[#00ff88] font-black text-sm break-all">{shopData.subdomain}.merikamai.in</p>
                </div>
                <div className="bg-[#060809] border border-blue-500/15 rounded-xl p-3.5 text-left">
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-1">Your Promo Code</p>
                  <p className="text-blue-400 font-black text-xl tracking-widest">{shopData.refer_code}</p>
                  <p className="text-gray-600 text-[10px] mt-1">Share this code — earn ₹50 per referral</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[#00ff88] text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all"
              >
                <Zap className="w-4 h-4" /> Go to Dashboard
              </button>
              {shopData?.isNew && (
                <a
                  href={`https://${shopData.subdomain}.merikamai.in`}
                  target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 border border-[#00ff88]/25 text-[#00ff88] font-bold py-3 rounded-2xl text-sm hover:bg-[#00ff88]/8 transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> View My Shop
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENEWAL STATE
  if (step === 'renew') {
    return (
      <div className="min-h-screen bg-[#060809] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="bg-[#0a0f0b] border border-amber-500/25 rounded-3xl p-7 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-black text-white mb-2">Shop Expired!</h2>
            <p className="text-gray-500 text-sm mb-5">
              Teri shop ka rent expire ho gaya. ₹21 renew karo — 30 din ke liye.
            </p>
            {error && <p className="text-red-400 text-xs mb-3 bg-red-900/20 px-3 py-2 rounded-xl">{error}</p>}
            <button
              onClick={handleRenewal}
              className="w-full bg-amber-500 text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-all mb-3"
            >
              <Clock className="w-4 h-4" /> Renew for ₹21
            </button>
            <button onClick={() => navigate('/dashboard')} className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
              Skip for now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SETUP STATE (main form)
  return (
    <div className="min-h-screen bg-[#060809] flex items-center justify-center px-4 py-10"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#00ff88] flex items-center justify-center font-black text-black text-2xl mx-auto mb-4 shadow-[0_0_30px_rgba(0,255,136,0.3)]">₹</div>
          <h1 className="text-2xl font-black text-white mb-1">Apni Dukan Banao</h1>
          <p className="text-gray-500 text-sm">Sirf ₹21/month — cancel anytime</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0a0f0b] border border-gray-800 rounded-3xl p-6 shadow-xl">

          {/* What you get */}
          <div className="bg-[#00ff88]/5 border border-[#00ff88]/15 rounded-2xl p-4 mb-5">
            <p className="text-[#00ff88] font-black text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Kya milega
            </p>
            <div className="space-y-1.5">
              {[
                'Apni khud ki website link',
                'Apps promote karo, 100% commission lo',
                'Referral dashboard + UPI withdrawal',
                'Live views tracker',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-400 text-xs">
                  <CheckCircle className="w-3 h-3 text-[#00ff88] shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wider block mb-1.5">
                Apna Naam
              </label>
              <div className="flex items-center gap-2 bg-[#060809] border border-gray-800 rounded-xl px-3 py-3 focus-within:border-[#00ff88]/40 transition-colors">
                <Store className="w-4 h-4 text-gray-600 shrink-0" />
                <input
                  type="text"
                  value={shopName}
                  onChange={e => setShopName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  maxLength={30}
                  className="bg-transparent text-white text-sm flex-1 outline-none placeholder-gray-700"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>

            {/* Shop URL Input */}
            <div>
              <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wider block mb-1.5">
                Aapki Dukan Ka URL
              </label>
              <div className="flex items-center gap-2 bg-[#060809] border border-gray-800 rounded-xl px-3 py-3 focus-within:border-[#00ff88]/40 transition-colors">
                <Globe className="w-4 h-4 text-gray-600 shrink-0" />
                <input
                  type="text"
                  value={customSubdomain}
                  onChange={e => setCustomSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. rahul-deals"
                  maxLength={20}
                  className="bg-transparent text-[#00ff88] font-bold text-sm flex-1 outline-none placeholder-gray-700 min-w-0"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                <span className="text-gray-500 text-sm select-none">.merikamai.in</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-600 font-bold uppercase tracking-wider block mb-1.5">
                WhatsApp Number
              </label>
              <div className="flex items-center gap-2 bg-[#060809] border border-gray-800 rounded-xl px-3 py-3 focus-within:border-[#00ff88]/40 transition-colors">
                <Phone className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="text-gray-600 text-sm">+91</span>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="10-digit number"
                  className="bg-transparent text-white text-sm flex-1 outline-none placeholder-gray-700"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/25 rounded-xl px-3 py-2.5 mb-4">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleSubmit}
            className="w-full bg-[#00ff88] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,136,0.25)] hover:shadow-[0_0_35px_rgba(0,255,136,0.4)] text-base"
          >
            <Zap className="w-4 h-4" />
            Create My Shop — ₹21
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-700">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Razorpay Secured</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2 min setup</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant Live</span>
          </div>
        </div>

        <p className="text-gray-800 text-[10px] text-center mt-4">
          Already have a shop?
          <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-[#00ff88] transition-colors ml-1">Go to Dashboard →</button>
        </p>

        {/* Course Buyers Bypass CTA */}
        {hasCourse && (
           <div className="mt-4 text-center border-t border-gray-800 pt-4">
             <p className="text-xs text-gray-500 mb-2">You already own the English Course!</p>
             <button onClick={() => navigate('/course')} className="w-full bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold py-3 rounded-xl hover:bg-blue-600/20 transition-all text-sm flex items-center justify-center gap-2">
               <PlayCircle className="w-4 h-4" /> Go Directly to Course Area
             </button>
           </div>
        )}
      </div>
    </div>
  );
}