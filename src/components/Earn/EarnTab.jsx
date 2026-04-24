import { useState, useEffect } from 'react';
import { useAuth } from "../../hooks/useAuth";
import { signInWithGoogle } from "../../lib/supabase";

// 'userId' ka matlab yahan 'Creator ka Username' hai (jaise: rahul)
export default function EarnTab({ userId }) {
  const { user, loading } = useAuth();
  
  // 🔴 YAHAN APNI WANNADS KI API KEY DAAL
  const WANNADS_API_KEY = "69e907293cd22224400393"; 

  const handleEarnLogin = async () => {
    // 1. Creator ka naam browser me save karo taaki baad me commission mil sake
    if (userId) {
      localStorage.setItem('referred_by', userId);
    }
    // 2. Login ke baad wapas isi portal par lao (Earn tab open rahe)
    await signInWithGoogle(`/${userId}?tab=earn`);
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>Loading...</div>;

  // 🛑 Agar user login nahi hai, to login UI dikhao
  if (!user) {
    return (
      <div style={{ height: 'calc(100dvh - var(--tab-h) - 57px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '20px' }}>
        <div style={{ fontSize: '60px', marginBottom: '10px' }}>💸</div>
        <h2 style={{ fontFamily: 'Teko, sans-serif', fontSize: '36px', color: '#fff', margin: '0 0 8px 0', lineHeight: 1 }}>
          EARN REAL <span style={{ color: '#00b84c' }}>CASH</span>
        </h2>
        <p style={{ color: '#9090b0', textAlign: 'center', fontSize: '15px', marginBottom: '24px', maxWidth: '300px' }}>
          Play games, complete surveys, and withdraw directly to your UPI.
          <br/><br/>
          <span style={{ background: 'rgba(0,184,76,0.1)', color: '#00b84c', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
            🔥 1000 Coins = ₹35
          </span>
        </p>

        <button 
          onClick={handleEarnLogin}
          style={{
            background: 'linear-gradient(135deg, #00b84c, #00963e)',
            color: '#fff',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 800,
            fontFamily: 'Rajdhani',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0,184,76,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <img src="https://www.google.com/favicon.ico" width="18" alt="Google" style={{ background: '#fff', borderRadius: '50%', padding: '2px' }}/>
          Login to Create Wallet
        </button>
      </div>
    );
  }

  // ✅ Agar user login hai, to use Wannads ka iframe aur uska asli balance dikhao
  // (Yahan user.id ka use kar rahe hain taaki Wannads exactly is bachche ko track kare)
  const iframeUrl = `https://wall.wannads.com/wall?apiKey=${WANNADS_API_KEY}&userId=${user.id}`;

  return (
    <div style={{ height: 'calc(100dvh - var(--tab-h) - 57px)', display: 'flex', flexDirection: 'column', background: '#000' }}>
      
      {/* ── Header & Wallet UI ── */}
      <div style={{ 
        padding: '12px 16px', background: 'var(--bg-alt)', 
        borderBottom: '1px solid rgba(255,149,0,0.2)', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'Teko, sans-serif', fontSize: '24px', color: '#fff', lineHeight: 1.1 }}>
            KARMI <span style={{ color: '#ff6b00' }}>WALLET</span>
          </h2>
          <p style={{ margin: 0, fontSize: '11px', color: '#00b84c', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>
            1000 Coins = ₹35 (Withdraw via UPI)
          </p>
        </div>
        
        <div style={{ 
          background: 'rgba(255,149,0,0.1)', padding: '6px 12px', 
          borderRadius: '12px', border: '1px solid rgba(255,149,0,0.3)',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <span style={{ fontSize: '16px' }}>💰</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#ff9500', fontFamily: 'Orbitron, sans-serif' }}>
            0
          </span>
        </div>
      </div>

      {/* ── Wannads Iframe ── */}
      <div style={{ flex: 1, position: 'relative', background: '#0a0a0a' }}>
        <iframe
          src={iframeUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Earn Rewards"
        />
      </div>
    </div>
  );
}