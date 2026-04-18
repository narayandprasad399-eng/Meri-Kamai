import { useState, useEffect } from 'react'

export default function EarnTab({ userId }) {
  // 🔴 YAHAN APNI WANNADS KI API KEY / PUBLISHER ID DAAL
  const WANNADS_API_KEY = "YAHAN_APNI_API_KEY_PASTE_KAR"; 

  // Agar user logged in nahi hai, to temporary testing ke liye ek random ID bana lo
  const [uid, setUid] = useState(userId || localStorage.getItem('mk_user_id'));

  useEffect(() => {
    if (!uid) {
      const newId = 'test_user_' + Math.floor(Math.random() * 1000000);
      localStorage.setItem('mk_user_id', newId);
      setUid(newId);
    }
  }, [uid]);

  if (!uid) return <div style={{ color: '#fff', padding: 20, textAlign: 'center', fontFamily: 'Orbitron' }}>Loading...</div>;

  // Wannads ka official iframe URL format
  const iframeUrl = `https://wall.wannads.com/wall?apiKey=${WANNADS_API_KEY}&userId=${uid}`;

  return (
    <div style={{ height: 'calc(100dvh - var(--tab-h) - 57px)', display: 'flex', flexDirection: 'column', background: '#000', animation: 'fadeUp 0.3s ease' }}>
      
      {/* ── Header & Wallet UI ── */}
      <div style={{ 
        padding: '12px 16px', background: 'var(--bg-alt)', 
        borderBottom: '1px solid rgba(255,149,0,0.2)', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'Teko, sans-serif', fontSize: '26px', color: '#fff', letterSpacing: '1px', lineHeight: 1.1 }}>
            EARN <span style={{ color: '#ff6b00' }}>MONEY</span>
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#aaa', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
            Complete tasks & surveys to earn coins
          </p>
        </div>
        
        {/* Wallet Balance (Abhi dummy 0 hai, baad me Supabase se aayega) */}
        <div style={{ 
          background: 'rgba(255,149,0,0.1)', padding: '6px 12px', 
          borderRadius: '12px', border: '1px solid rgba(255,149,0,0.3)',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <span style={{ fontSize: '18px' }}>💰</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#ff9500', fontFamily: 'Orbitron, sans-serif' }}>
            0
          </span>
        </div>
      </div>

      {/* ── Wannads Offerwall Iframe ── */}
      <div style={{ flex: 1, position: 'relative', background: '#0a0a0a' }}>
        <iframe
          src={iframeUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Earn Rewards"
          allow="camera; microphone; geolocation" // Surveys ke liye in permissions ki zarurat pad sakti hai
        />
      </div>
      
    </div>
  )
}