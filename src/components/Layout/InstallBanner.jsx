import { useState, useEffect } from 'react'
import { canInstall, showInstallPrompt } from '../../lib/pwa'

export default function InstallBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(canInstall()), 3000)
    window.addEventListener('beforeinstallprompt', () => setTimeout(() => setShow(true), 3000))
    return () => clearTimeout(t)
  }, [])

  if (!show) return null

  const handleInstall = async () => {
    const accepted = await showInstallPrompt()
    if (accepted) setShow(false)
  }

  return (
    <div style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: '420px', background: 'linear-gradient(135deg,#1a1a35,#0a0a20)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 90, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
      <div style={{ fontSize: '28px' }}>📲</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Teko', fontSize: '17px', fontWeight: 700, color: '#f0f0ff' }}>App Install Karo!</div>
        <div style={{ fontSize: '12px', color: '#9090b0' }}>Home screen pe lagao — fast access</div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleInstall} style={{ background: 'linear-gradient(135deg,#ff6b00,#ff9500)', color: '#000', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Rajdhani' }}>Install</button>
        <button onClick={() => setShow(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#9090b0', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>×</button>
      </div>
    </div>
  )
}
