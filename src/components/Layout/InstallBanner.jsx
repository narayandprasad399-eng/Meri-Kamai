import { useState, useEffect } from 'react'

// PWA install prompt — browser event ko directly handle karo
let _deferredPrompt = null

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const [prompt, setPrompt] = useState(null)

  useEffect(() => {
    // Already installed hai?
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Already dismissed?
    if (localStorage.getItem('mk_install_dismissed')) return

    const handler = (e) => {
      e.preventDefault()
      _deferredPrompt = e
      setPrompt(e)
      // 2 sec baad dikhao
      setTimeout(() => setShow(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!show || !prompt) return null

  const handleInstall = async () => {
    if (!_deferredPrompt) return
    _deferredPrompt.prompt()
    const { outcome } = await _deferredPrompt.userChoice
    _deferredPrompt = null
    setPrompt(null)
    setShow(false)
    if (outcome === 'accepted') localStorage.setItem('mk_install_dismissed', '1')
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('mk_install_dismissed', '1')
  }

  return (
    <div style={{
      position: 'fixed', bottom: 'calc(var(--tab-h) + 12px)',
      left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)', maxWidth: '420px',
      background: 'linear-gradient(135deg,#1a1a35,#0d0d20)',
      border: '1px solid rgba(255,107,0,0.4)',
      borderRadius: '16px', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: '12px',
      zIndex: 200, boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
      animation: 'fadeUp 0.4s ease',
    }}>
      <div style={{ fontSize: '28px' }}>📲</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Teko', fontSize: '17px', fontWeight: 700, color: '#f0f0ff' }}>
          App Install Karo!
        </div>
        <div style={{ fontSize: '12px', color: '#9090b0' }}>
          Home screen pe lagao — fast access
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleInstall}
          style={{ background: 'linear-gradient(135deg,#ff6b00,#ff9500)', color: '#000', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Rajdhani' }}>
          Install
        </button>
        <button
          onClick={handleDismiss}
          style={{ background: 'rgba(255,255,255,0.06)', color: '#9090b0', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px' }}>
          ×
        </button>
      </div>
    </div>
  )
}
