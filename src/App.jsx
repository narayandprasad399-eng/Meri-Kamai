import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LiveEarningsTicker from './components/LiveEarningsTicker';
import Legal from './pages/Legal';

// Asli Pages jo humne bana liye hain
import MainSales from './pages/MainSales';
import UserSite from './pages/UserSite';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import CourseArea from './pages/CourseArea';

export default function App() {
  // 1. URL se Hostname nikalna (e.g., 'merikamai.in' ya 'demo.merikamai.in')
  const hostname = window.location.hostname;
  
  // 2. Subdomain check karne ka SMART logic (Synchronous)
  let isSubdomain = false;
  let subdomainName = "";

  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length >= 2 && parts[0] !== 'localhost') {
      isSubdomain = true;
      subdomainName = parts[0];
    }
  } 
  // Cloudflare pages default domain ko ignore karo
  else if (hostname.includes('pages.dev')) {
    isSubdomain = false; 
  } 
  // Production Logic (*.merikamai.in)
  else {
    const parts = hostname.split('.');
    // Agar 'www' nahi hai aur parts 3 hain (e.g., ajay.merikamai.in), toh subdomain hai
    if (parts.length >= 3 && parts[0] !== 'www') {
      isSubdomain = true;
      subdomainName = parts[0];
    }
  }

  // ─── GATE 1: Agar Subdomain hai, toh SIRF Dukan (UserSite) dikhao ───
  if (isSubdomain) {
    return (
      <div className="min-h-screen bg-[#060809] text-white font-sans selection:bg-[#00ff88] selection:text-black">
        <Routes>
          {/* Subdomain par koi bhi path khule, hamesha uski dukan dikhani hai */}
          <Route path="/*" element={<UserSite customSubdomain={subdomainName} />} />
        </Routes>
      </div>
    );
  }

  // ─── GATE 2: Agar Main Domain hai, toh normal Website dikhao ───
  return (
    <div className="min-h-screen bg-[#070a08] text-gray-300 font-sans selection:bg-[#00ff88] selection:text-black">
      <Navbar />
      
      <Routes>
        <Route path="/" element={<MainSales />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/course" element={<CourseArea />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="/refund" element={<Legal />} />
      </Routes>

      <LiveEarningsTicker />
    </div>
  );
}