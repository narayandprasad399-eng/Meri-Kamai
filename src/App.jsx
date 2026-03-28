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
    const host = window.location.hostname; 
    const parts = host.split('.');
    
    if (parts.length >= 3 && parts[0] !== 'www') {
      setSubdomain(parts[0]);
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('user')) {
      setSubdomain(urlParams.get('user'));
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
      </Routes>

      <LiveEarningsTicker />
    </div>
  );
}

export default App;