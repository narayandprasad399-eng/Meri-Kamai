import React, { useState, useEffect } from 'react';
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

// Dummy Pages jo hum aage banayenge (Taki app crash na ho)



function App() {
  const [subdomain, setSubdomain] = useState(null);

  useEffect(() => {
    // 1. URL se Hostname nikalna
  const hostname = window.location.hostname;
  
  // 2. Subdomain check karne ka SMART logic
  let isSubdomain = false;
  let subdomainName = "";

  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length >= 2 && parts[0] !== 'localhost') {
      isSubdomain = true;
      subdomainName = parts[0];
    }
  } 
  // 🚨 NAYA FIX: Cloudflare ke default domain ko ignore karo
  else if (hostname.includes('pages.dev')) {
    isSubdomain = false; 
  } 
  // Production Logic (*.merikamai.in)
  else {
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
      isSubdomain = true;
      subdomainName = parts[0];
    }
  }
  }, []);

  return (
    <div className="min-h-screen bg-brandDark text-brandText font-sans selection:bg-brandGreen selection:text-brandDark">
      <Navbar />
      
      <Routes>
        <Route 
          path="/" 
          element={subdomain ? <UserSite username={subdomain} /> : <MainSales />} 
        />
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

export default App;