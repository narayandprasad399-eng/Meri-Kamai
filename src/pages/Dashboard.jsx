import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getUserPortal, createPortal, signOut, supabase } from '../lib/supabase'
import { GoogleLogin } from '../components/Auth/GoogleLogin'
import ReferralBanner from '../components/Auth/ReferralBanner'
import InstallBanner from '../components/Layout/InstallBanner'

// ── Onboarding steps ──────────────────────────────
function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(1)
  const [portalName, setPortalName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugError, setSlugError] = useState('')
  const [checking, setChecking] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleNameChange = (val) => {
    setPortalName(val)
    const s = val.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
    setSlug(s)
    setSlugError('')
  }

  const checkSlug = async () => {
    if (!slug || slug.length < 3) { setSlugError('Kam se kam 3 characters chahiye'); return false }
    setChecking(true)
    const { data } = await supabase.from('portals').select('slug').eq('slug', slug).single()
    setChecking(false)
    if (data) { setSlugError('Yeh naam already le gaya hai! Doosra try karo 😅'); return false }
    return true
  }

  const handleStep1 = async () => {
    const ok = await checkSlug()
    if (ok) setStep(2)
  }

  const handleFinish = async () => {
    setCreating(true)
    const { data } = await createPortal(user.id, slug, user.email, portalName || 'My Portal')
    setCreating(false)
    if (data) onComplete(data)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {[1, 2].map(s => (
          <div key={s} style={{ width: '60px', height: '4px', borderRadius: '2px', background: step >= s ? 'linear-gradient(90deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>

      {step === 1 && (
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏪</div>
            <h2 style={{ fontFamily: 'Teko', fontSize: '28px', color: '#f0f0ff', marginBottom: '6px' }}>Apni Shop ka Naam Rakho!</h2>
            <p style={{ color: '#9090b0', fontSize: '14px', lineHeight: 1.5 }}>Yeh naam teri website pe dikhega.</p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#9090b0', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Portal / Shop Name</label>
            <input type="text" placeholder="jaise: Rahul Gaming Zone" value={portalName} onChange={e => handleNameChange(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0ff', padding: '12px 16px', borderRadius: '12px', fontSize: '16px', fontFamily: 'Rajdhani', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', color: '#9090b0', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Website URL milegi:</label>
            <div style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace', color: '#ff9500', wordBreak: 'break-all' }}>
              merikamai.in/<span style={{ fontWeight: 900 }}>{slug || 'tera-naam'}</span>
            </div>
            {slugError && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '6px' }}>{slugError}</p>}
          </div>
          <button onClick={handleStep1} disabled={!slug || checking} className="btn-main" style={{ width: '100%', marginTop: '20px', fontSize: '18px', padding: '14px', textAlign: 'center', opacity: (!slug || checking) ? 0.6 : 1 }}>
            {checking ? 'Check ho raha hai...' : 'Aage Badho →'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚀</div>
          <h2 style={{ fontFamily: 'Teko', fontSize: '28px', color: '#f0f0ff', marginBottom: '6px' }}>Portal Ready Hai!</h2>
          <p style={{ color: '#9090b0', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>Dashboard mein jaake apna link share karo aur kamai shuru karo.</p>
          <button onClick={handleFinish} disabled={creating} className="btn-main" style={{ width: '100%', fontSize: '18px', padding: '14px', textAlign: 'center', opacity: creating ? 0.6 : 1 }}>
            {creating ? '⏳ Setup ho raha hai...' : 'Go to Dashboard →'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────
export default function Dashboard() {
  const { user, loading } = useAuth()
  const [portal, setPortal] = useState(null)
  const [portalLoading, setPortalLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  useEffect(() => {
    // Dashboard ke liye static manifest load karo
    const link = document.createElement('link')
    link.rel = 'manifest'
    link.href = '/manifest-dashboard.json'
    document.head.appendChild(link)
    document.title = 'Partner Dashboard'

    return () => link.remove() // Jab portal pe jaaye to ise hata do
  }, [])

  // 🟢 WALLET DATA (Supabase se aayega)
  const walletCoins = portal?.wallet_balance || 0; 
  // Creator ka profit formula: 1000 Coins pe ₹10
  const rsValue = (walletCoins / 1000) * 10; 

  useEffect(() => {
    if (!user) { setPortalLoading(false); return }
    const load = async () => {
      const { data } = await getUserPortal(user.id)
      if (data) { setPortal(data) } else { setShowOnboarding(true) }
      setPortalLoading(false)
    }
    load()
  }, [user])

  if (loading || (user && portalLoading)) return <Spinner />
  if (!user) return <GoogleLogin onGuest={() => {}} />
  if (showOnboarding) return <OnboardingFlow user={user} onComplete={(newPortal) => { setPortal(newPortal); setShowOnboarding(false) }} />

  const portalUrl = `${window.location.origin}/${portal?.slug || 'demo'}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: '480px', margin: '0 auto', paddingBottom: '80px', fontFamily: 'Rajdhani' }}>
      <InstallBanner />

      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(5,5,10,0.97)', backdropFilter: 'blur(10px)', zIndex: 50 }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: '18px', fontWeight: 900, color: '#f0f0ff' }}>
          KARMI<span style={{ color: '#ff6b00' }}>PARTNER</span>
        </div>
        <button onClick={signOut} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#9090b0', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 700 }}>
          Logout
        </button>
      </div>

      <div style={{ padding: '20px' }}>

        {/* 🟢 WALLET SECTION */}
        <div style={{ background: 'linear-gradient(135deg, #00b84c 0%, #007a33 100%)', borderRadius: '20px', padding: '24px', marginBottom: '20px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,184,76,0.2)' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '100px', opacity: 0.1 }}>💰</div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Earnings</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: '42px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>₹{rsValue.toFixed(2)}</div>
            <div style={{ fontSize: '14px', color: '#e0ffe0', fontWeight: 600, paddingBottom: '6px' }}>({walletCoins} Coins)</div>
          </div>
          <button style={{ background: '#fff', color: '#007a33', border: 'none', padding: '12px 20px', width: '100%', borderRadius: '12px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Rajdhani' }}>
             Withdraw to UPI 💸
          </button>
        </div>

        {/* 🟢 PORTAL LINK CARD */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', color: '#9090b0', fontWeight: 700 }}>YOUR PORTAL LINK</div>
            <div style={{ fontSize: '12px', background: 'rgba(255,107,0,0.1)', color: '#ff6b00', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>LIVE 🔴</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '10px', color: '#ff6b00', fontWeight: 700, fontSize: '15px', wordBreak: 'break-all', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
            {portalUrl}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigator.clipboard.writeText(portalUrl)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
              📋 COPY LINK
            </button>
            <button onClick={() => navigator.share?.({ title: 'Meri Kamai', url: portalUrl }) || navigator.clipboard.writeText(portalUrl)} style={{ flex: 1, background: 'linear-gradient(135deg, #ff6b00, #ff9500)', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
              📤 SHARE APP
            </button>
          </div>
        </div>

        {/* Referral */}
        <ReferralBanner user={user} portal={portal} />

        {/* Info Box */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', marginTop: '20px' }}>
          <h3 style={{ fontFamily: 'Teko', fontSize: '20px', marginBottom: '12px', color: '#9090b0' }}>💡 Paise Kaise Banenge?</h3>
          <ul style={{ paddingLeft: '20px', color: '#606080', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            <li>Apne doston ko apna link bhejo.</li>
            <li>Jab wo <strong>Earn Tab</strong> me jaakar tasks (apps/surveys) karenge.</li>
            <li>Unhe ₹35 milenge aur aapko har 1000 coins pe ₹10 ka commission seedha aapke is wallet me aayega!</li>
          </ul>
        </div>

      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,107,0,0.2)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
}