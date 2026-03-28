import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tag, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
// Razorpay script load karne ka function
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
export default function Checkout() {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  
  const [promoCode, setPromoCode] = useState(initialRef);
  const [isApplied, setIsApplied] = useState(false);
  const [referrerData, setReferrerData] = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);
  
  // Pricing Logic
  const basePrice = 999;
  const discount = 500;
  const finalPrice = isApplied ? basePrice - discount : basePrice;

  // Auto-apply if code comes from URL
  useEffect(() => {
    if (initialRef) {
      handleApplyCode(initialRef);
    }
  }, []);

  const handleApplyCode = async (codeToApply = promoCode) => {
    if (!codeToApply || codeToApply.length < 4) return alert("Enter a valid code");
    
    setLoadingCode(true);
    try {
      // Database Check: Does this code exist?
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('refer_code', codeToApply.toUpperCase())
        .single();
      
      if (error || !data) {
        alert("Invalid Promo Code!");
        setIsApplied(false);
        setReferrerData(null);
      } else {
        setIsApplied(true);
        setReferrerData(data); // Save who gets the ₹50
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCode(false);
    }
  };

  const handlePayment = async () => {
    // 1. Script load karo
    const res = await loadRazorpayScript();
    if (!res) return alert("Razorpay fail! Internet check karo.");

    setLoadingCode(true);
    try {
      // 2. Cloudflare Worker se Asli Order ID mangwana
      // TODO: 'YOUR_WORKER_URL' ki jagah apne deployed worker ka link daalna
      const WORKER_URL = import.meta.env.VITE_WORKER_URL;
      const orderRes = await fetch(`${WORKER_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: "course", // ya "rent" agar rent ka page ho
          promoCode: isApplied ? promoCode : "none",
          userId: user.id, // Supabase user ID (Auth context se)
          email: user.email,
        })
      });
      const orderData = await orderRes.json();

      if (!orderData.id) throw new Error("Order creation failed");

      // 3. Razorpay Popup Open
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Tera Razorpay Key
        amount: finalPrice * 100,
        currency: "INR",
        name: "Meri Kamai",
        description: "Spoken English Mastery",
        order_id: orderData.id, 
        handler: async function (response) {
          
          // 4. Payment Success hone par Worker ko Verify karne bolna (Aur ₹50 Commission batna)
          const verifyRes = await fetch("https://hackthewealth.narayandprasad399.workers.dev/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.id,
              productType: "course",
              promoCode: isApplied ? promoCode : "none"
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment Successful! Course Unlocked.");
            window.location.href = "/dashboard"; // Payment ke baad wapas dashboard
          } else {
            alert("Payment verification failed! Support se contact karein.");
          }
        },
        theme: { color: "#00FF88" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingCode(false);
    }
  };

    

  return (
    <div className="min-h-screen bg-brandDark text-brandText pt-10 px-4">
      <div className="max-w-md mx-auto bg-brandCard border border-gray-800 rounded-2xl p-6 shadow-2xl">
        
        <h1 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Checkout</h1>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-lg text-white">Spoken English Mastery</h2>
            <p className="text-xs text-gray-400">Full Video Course Access</p>
          </div>
          <span className="text-lg font-bold text-gray-300">₹{basePrice}</span>
        </div>

        {/* Dynamic Promo Code Logic */}
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <label className="text-xs text-gray-400 mb-2 block">Have a VIP Promo/Referral Code?</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={isApplied}
              placeholder="Enter Code (e.g. NEER101)" 
              className="bg-brandDark border border-gray-600 rounded px-3 py-2 text-sm w-full uppercase text-white focus:border-brandGreen outline-none disabled:opacity-50"
            />
            <button 
              onClick={() => handleApplyCode()}
              disabled={isApplied || loadingCode}
              className={`px-4 py-2 rounded text-sm font-bold transition-all flex items-center gap-2 ${isApplied ? 'bg-green-500/20 text-green-400' : 'bg-brandGreen text-brandDark hover:bg-green-400'}`}
            >
              {loadingCode ? <Loader2 className="w-4 h-4 animate-spin"/> : (isApplied ? 'Applied!' : 'Apply')}
            </button>
          </div>
          {isApplied && (
            <p className="text-xs text-brandGreen mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3"/> Awesome! You got a flat ₹500 discount via {referrerData?.full_name?.split(' ')[0]}.
            </p>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-gray-800 pt-4 mb-6 text-sm">
          <div className="flex justify-between text-gray-400"><span>Course Price</span><span>₹{basePrice}</span></div>
          {isApplied && (
            <div className="flex justify-between text-brandGreen font-medium"><span>Promo Discount</span><span>- ₹{discount}</span></div>
          )}
          <div className="flex justify-between text-white text-xl font-bold pt-2 border-t border-gray-800">
            <span>Total to Pay</span><span>₹{finalPrice}</span>
          </div>
        </div>

        <button onClick={handlePayment} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 shadow-lg flex justify-center items-center gap-2 transition-all">
          Pay ₹{finalPrice} with UPI/Cards <ShieldCheck className="w-5 h-5"/>
        </button>
        <p className="text-[10px] text-center text-gray-500 mt-3">Secured via Razorpay</p>
      </div>
    </div>
  );
}