import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tag, CheckCircle, ShieldCheck, Loader2, Globe } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 1. URL padhkar Product Type pata karo
  const productType = searchParams.get('product') || 'course';
  const isRent = productType === 'rent';
  
  const initialRef = searchParams.get('ref') || '';
  
  const [promoCode, setPromoCode] = useState(initialRef);
  const [isApplied, setIsApplied] = useState(false);
  const [referrerData, setReferrerData] = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);
  
  // 2. Dynamic Pricing Logic (Rent ke liye direct 21, warna course logic)
  const basePrice = isRent ? 21 : 999;
  const discount = isRent ? 0 : 500;
  const finalPrice = (isApplied && !isRent) ? basePrice - discount : basePrice;

  // Title and Desc
  const titleText = isRent ? "1 Month Shop Server Rent" : "Spoken English Mastery";
  const descText = isRent ? "Activate your digital shop for 30 days" : "Full Video Course Access";

  useEffect(() => {
    // Agar user logged in nahi hai, toh login/dashboard par bhejo
    if (!user) {
      navigate('/dashboard');
    }
    if (initialRef && !isRent) {
      handleApplyCode(initialRef);
    }
  }, [user, navigate, initialRef, isRent]);

  const handleApplyCode = async (codeToApply = promoCode) => {
    if (isRent) return; // Rent par promo applicable nahi
    if (!codeToApply || codeToApply.length < 4) return alert("Enter a valid code");
    
    setLoadingCode(true);
    try {
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
        setReferrerData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCode(false);
    }
  };

  const handlePayment = async () => {
    if (!user) return alert("Please login first!");

    const res = await loadRazorpayScript();
    if (!res) return alert("Razorpay fail! Internet check karo.");

    setLoadingCode(true);
    try {
      const WORKER_URL = import.meta.env.VITE_WORKER_URL;
      
      // Step 1: Create Order
      const orderRes = await fetch(`${WORKER_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: productType, 
          promoCode: (isApplied && !isRent) ? promoCode : "none",
          userId: user.id, 
          email: user.email,
        })
      });
      const orderData = await orderRes.json();

      if (!orderData.id) throw new Error("Order creation failed");

      // Step 2: Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: finalPrice * 100,
        currency: "INR",
        name: "Meri Kamai",
        description: titleText,
        order_id: orderData.id, 
        handler: async function (response) {
          
          // Step 3: Verify Payment
          const verifyRes = await fetch(`${WORKER_URL}/api/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.id,
              productType: productType,
              promoCode: (isApplied && !isRent) ? promoCode : "none"
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert(isRent ? "Shop Unlocked Successfully!" : "Payment Successful! Course Unlocked.");
            window.location.href = "/dashboard";
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
        
        <h1 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-4">
          Checkout {isRent && <span className="text-sm font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded ml-2">Shop Rent</span>}
        </h1>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {isRent && <Globe className="w-8 h-8 text-brandGreen" />}
            <div>
              <h2 className="font-bold text-lg text-white">{titleText}</h2>
              <p className="text-xs text-gray-400">{descText}</p>
            </div>
          </div>
          <span className="text-lg font-bold text-gray-300">₹{basePrice}</span>
        </div>

        {/* Promo Code Logic: Sirf Course ke liye dikhega */}
        {!isRent && (
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
                <CheckCircle className="w-3 h-3"/> Awesome! You got a flat ₹500 discount via {referrerData?.full_name?.split(' ')[0] || 'Referrer'}.
              </p>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-gray-800 pt-4 mb-6 text-sm">
          <div className="flex justify-between text-gray-400"><span>Item Price</span><span>₹{basePrice}</span></div>
          {isApplied && !isRent && (
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