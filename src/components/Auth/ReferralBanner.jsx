// Referral - sirf refer karo, kuch nahi milta dono ko
// User apna link share kare → traffic aaye → tera faida
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ReferralBanner({ user, portal }) {
  const [copied, setCopied] = useState(false)

  if (!user || !portal?.referral_code) return null

  const referralUrl = `${window.location.origin}?ref=${portal.referral_code}`

  const copy = async () => {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Meri Kamai - Free Gaming Website',
        text: 'Yeh dekho! Free games, reels aur English course - ek jagah!',
        url: referralUrl,
      })
    } else copy()
  }

  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(255,107,0,0.1),rgba(139,92,246,0.1))', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '16px', padding: '16px', margin: '16px' }}>
      <div style={{ fontFamily: 'Teko', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>🔗 Apna Link Share Karo!</div>
      <p style={{ fontSize: '13px', color: '#9090b0', marginBottom: '12px', lineHeight: 1.5 }}>
        Jitne log aayenge, utna traffic — aur jab 2K daily ho, ₹299/month wala plan mil jaayega!
      </p>
      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#ff6b00', fontFamily: 'monospace', marginBottom: '12px', wordBreak: 'break-all' }}>
        {referralUrl}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={copy} style={{ flex: 1, background: copied ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: copied ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.08)', color: copied ? '#00ff88' : '#9090b0', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Rajdhani' }}>
          {copied ? '✅ Copied!' : '📋 Copy Link'}
        </button>
        <button onClick={share} style={{ flex: 1, background: 'linear-gradient(135deg,#ff6b00,#ff9500)', color: '#000', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Rajdhani' }}>
          📤 Share Karo
        </button>
      </div>
    </div>
  )
}
