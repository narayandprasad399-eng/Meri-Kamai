import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api, signOut, WORKER } from '../lib/api'
import InstallBanner from '../components/Layout/InstallBanner'

const WORKER_URL = WORKER

// ── No Access Screen ──────────────────────────────
function NoAccessScreen({ user }) {
  const [loading, setLoading] = useState(false)

  const handleBuyCourse = () => {
    window.open('https://karmiminds.pages.dev/app', '_blank')
  }

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      if (!window.Razorpay) {
        await new Promise((res, rej) => {
          const s = document.createElement('script')
          s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = res; s.onerror = rej
          document.head.appendChild(s)
        })
      }
      const order = await api.post('/payment/create', {
        productId: 'merikamai_sub',
        userId: user.id,
        userEmail: user.email,
      })
      if (order.error) { alert('Order create nahi hua: ' + order.error); setLoading(false); return }

      new window.Razorpay({
        key:         order.keyId,
        amount:      order.amount,
        currency:    'INR',
        name:        'MeriKamai',
        description: 'Dashboard Access — 30 Days',
        order_id:    order.orderId,
        prefill:     { email: user.email },
        theme:       { color: '#ff6b00' },
        handler: async (response) => {
          const vData = await api.post('/payment/verify', {
            razorpay_order_id:   response.razorpay_order_id || order.orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            userId:              user.id,
            productId:           'merikamai_sub',
          })
          if (vData.success) window.location.reload()
          else alert('Verification failed. Support se contact karo.')
        },
      }).open()
    } catch (e) { alert('Payment error: ' + e.message) }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔐</div>
      <h2 style={{ fontFamily: 'Teko', fontSize: '32px', color: '#f0f0ff', marginBottom: '8px' }}>Dashboard Access Chahiye?</h2>
      <p style={{ color: '#9090b0', fontSize: '14px', lineHeight: 1.7, maxWidth: '320px', marginBottom: '32px' }}>
        Apna portal banane ke liye neeche mein se koi ek option lo.
        Portal se Karmi Minds course sales pe <strong style={{ color: '#ff6b00' }}>₹50–₹100</strong> har refer pe milenge!
      </p>

      {/* Option 1 — Learn & Earn */}
      <div style={{ width: '100%', maxWidth: '360px', background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '2px solid rgba(255,107,0,0.4)', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(255,107,0,0.1)', color: '#ff6b00', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px' }}>
          ⭐ RECOMMENDED
        </div>
        <h3 style={{ fontFamily: 'Teko', fontSize: '24px', color: '#f0f0ff', marginBottom: '6px' }}>Learn & Earn Course</h3>
        <p style={{ color: '#9090b0', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
          Karmi Minds pe course karo + Lifetime dashboard access + <strong style={{ color: '#10b981' }}>₹100/referral</strong> unlock!
        </p>
        <div style={{ fontSize: '28px', fontWeight: 900, color: '#ff6b00', marginBottom: '16px' }}>
          ₹749 <span style={{ fontSize: '13px', color: '#9090b0', fontWeight: 400 }}>one-time</span>
        </div>
        <button onClick={handleBuyCourse}
          style={{ width: '100%', background: 'linear-gradient(135deg,#ff6b00,#ff9500)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Rajdhani' }}>
          Karmi Minds pe Karo →
        </button>
      </div>

      {/* Option 2 — Monthly */}
      <div style={{ width: '100%', maxWidth: '360px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
        <h3 style={{ fontFamily: 'Teko', fontSize: '24px', color: '#f0f0ff', marginBottom: '6px' }}>Monthly Subscription</h3>
        <p style={{ color: '#9090b0', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
          Sirf dashboard access chahiye? Monthly plan lo. (Referral reward ₹50/refer)
        </p>
        <div style={{ fontSize: '28px', fontWeight: 900, color: '#f0f0ff', marginBottom: '16px' }}>
          ₹101 <span style={{ fontSize: '13px', color: '#9090b0', fontWeight: 400 }}>/month</span>
        </div>
        <button onClick={handleSubscribe} disabled={loading}
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Rajdhani', opacity: loading ? 0.7 : 1 }}>
          {loading ? '⏳ Processing...' : 'Subscribe Karo'}
        </button>
      </div>

      <button onClick={signOut} style={{ marginTop: '24px', background: 'none', border: 'none', color: '#606080', cursor: 'pointer', fontSize: '13px' }}>
        Logout
      </button>
    </div>
  )
}

// ── Onboarding ─────────────────────────────────────
function OnboardingFlow({ user, onComplete }) {
  const [step,       setStep]       = useState(1)
  const [portalName, setPortalName] = useState('')
  const [slug,       setSlug]       = useState('')
  const [slugError,  setSlugError]  = useState('')
  const [checking,   setChecking]   = useState(false)
  const [creating,   setCreating]   = useState(false)

  const handleNameChange = (val) => {
    setPortalName(val)
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20))
    setSlugError('')
  }

  const checkSlug = async () => {
    if (!slug || slug.length < 3) { setSlugError('Kam se kam 3 characters chahiye'); return false }
    setChecking(true)
    const data = await api.get(`/portal/${slug}`)
    setChecking(false)
    if (!data.error) { setSlugError('Yeh naam already le gaya hai! Doosra try karo 😅'); return false }
    return true
  }

  const handleFinish = async () => {
    setCreating(true)
    const data = await api.post('/portal/create', { slug, portal_name: portalName || 'My Portal' })
    setCreating(false)
    if (data.portal) onComplete(data.portal)
    else alert(data.error || 'Portal create nahi hua')
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
            <input type="text" placeholder="jaise: Rahul Gaming Zone" value={portalName}
              onChange={e => handleNameChange(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0ff', padding: '12px 16px', borderRadius: '12px', fontSize: '16px', fontFamily: 'Rajdhani', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', color: '#9090b0', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Website URL milegi:</label>
            <div style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace', color: '#ff9500', wordBreak: 'break-all' }}>
              merikamai.in/<span style={{ fontWeight: 900 }}>{slug || 'tera-naam'}</span>
            </div>
            {slugError && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '6px' }}>{slugError}</p>}
          </div>
          <button onClick={async () => { const ok = await checkSlug(); if (ok) setStep(2) }}
            disabled={!slug || checking} className="btn-main"
            style={{ width: '100%', marginTop: '20px', fontSize: '18px', padding: '14px', textAlign: 'center', opacity: (!slug || checking) ? 0.6 : 1 }}>
            {checking ? 'Check ho raha hai...' : 'Aage Badho →'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚀</div>
          <h2 style={{ fontFamily: 'Teko', fontSize: '28px', color: '#f0f0ff', marginBottom: '6px' }}>Portal Ready Hai!</h2>
          <p style={{ color: '#9090b0', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>Dashboard mein jaake apna link share karo aur kamai shuru karo.</p>
          <button onClick={handleFinish} disabled={creating} className="btn-main"
            style={{ width: '100%', fontSize: '18px', padding: '14px', textAlign: 'center', opacity: creating ? 0.6 : 1 }}>
            {creating ? '⏳ Setup ho raha hai...' : 'Go to Dashboard →'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────
export default function Dashboard() {
  const { user, loading } = useAuth()
  const [portal,         setPortal]         = useState(null)
  const [portalLoading,  setPortalLoading]  = useState(true)
  const [hasAccess,      setHasAccess]      = useState(false)
  const [accessLoading,  setAccessLoading]  = useState(true)
  const [karmiEarnings,  setKarmiEarnings]  = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [copied,         setCopied]         = useState(false)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'manifest'; link.href = '/manifest-dashboard.json'
    document.head.appendChild(link)
    document.title = 'Partner Dashboard'
    return () => link.remove()
  }, [])

  // Access check + portal + earnings — ek hi session call mein
  useEffect(() => {
    if (!user) { setAccessLoading(false); setPortalLoading(false); return }

    const loadDashboard = async () => {
      try {
        // /auth/session already purchased_course_ids aur portal return karta hai
        const session = await api.get('/auth/session')

        // Access check
        const ids = session.purchased_course_ids || []
        const hasLearnEarn   = ids.includes(2)
        const hasPortalAccess = session.portal?.plan === 'active' &&
          session.portal?.subscription_expires_at &&
          new Date(session.portal.subscription_expires_at) > new Date()

        if (hasLearnEarn || hasPortalAccess) {
          setHasAccess(true)
          setKarmiEarnings(session.user?.wallet_balance || 0)

          if (session.portal) {
            setPortal(session.portal)
          } else {
            setShowOnboarding(true)
          }
        } else {
          setHasAccess(false)
        }
      } catch (e) {
        console.error('Dashboard load error:', e)
      } finally {
        setAccessLoading(false)
        setPortalLoading(false)
      }
    }
    loadDashboard()
  }, [user])

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Render gates ──
  if (loading || accessLoading || portalLoading) return <Spinner />
  if (!user)      return <LoginScreen />
  if (!hasAccess) return <NoAccessScreen user={user} />
  if (showOnboarding) return (
    <OnboardingFlow user={user} onComplete={p => { setPortal(p); setShowOnboarding(false) }} />
  )

  const portalUrl    = `${window.location.origin}/${portal?.slug || 'demo'}`
  const referralCode = user.id.substring(0, 8).toUpperCase()

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

        {/* Earnings Card */}
        <div style={{ background: 'linear-gradient(135deg,#059669,#047857)', borderRadius: '20px', padding: '24px', marginBottom: '20px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 20px rgba(16,185,129,0.25)' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '100px', opacity: 0.08 }}>💰</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Karmi Minds Earnings
          </div>
          <div style={{ fontFamily: 'Orbitron', fontSize: '42px', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: '6px' }}>
            ₹{karmiEarnings}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginBottom: '16px' }}>
            Har course purchase pe ₹50–₹100 • Min ₹250 pe withdraw
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            💡 Withdraw ke liye Karmi Minds app ka Refer tab use karo
          </div>
        </div>

        {/* Analytics */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: '#9090b0', fontWeight: 700, marginBottom: '14px' }}>📊 PORTAL ANALYTICS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {[
              { label: 'Site Views',    value: portal?.site_views    || 0, color: '#3b82f6', icon: '👁️' },
              { label: 'Game Clicks',   value: portal?.game_clicks   || 0, color: '#a855f7', icon: '🎮' },
              { label: 'Course Clicks', value: portal?.course_clicks || 0, color: '#f59e0b', icon: '📚' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{icon}</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color, lineHeight: 1, marginBottom: '4px' }}>{value}</div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Portal Link */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', color: '#9090b0', fontWeight: 700 }}>YOUR PORTAL LINK</div>
            <div style={{ fontSize: '12px', background: 'rgba(255,107,0,0.1)', color: '#ff6b00', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>LIVE 🔴</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '10px', color: '#ff6b00', fontWeight: 700, fontSize: '15px', wordBreak: 'break-all', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
            {portalUrl}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleCopy}
              style={{ flex: 1, background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: copied ? '#10b981' : '#fff', border: `1px solid ${copied ? '#10b981' : 'rgba(255,255,255,0.1)'}`, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Rajdhani' }}>
              {copied ? '✅ Copied!' : '📋 COPY LINK'}
            </button>
            <button onClick={() => navigator.share?.({ title: portal?.portal_name, url: portalUrl }) || navigator.clipboard.writeText(portalUrl)}
              style={{ flex: 1, background: 'linear-gradient(135deg,#ff6b00,#ff9500)', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Rajdhani' }}>
              📤 SHARE APP
            </button>
          </div>
        </div>

        {/* Referral Code */}
        <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '16px', padding: '18px 20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: '#9090b0', fontWeight: 700, marginBottom: '10px' }}>🔑 TERA REFERRAL CODE</div>
          <div style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: 900, color: '#3b82f6', letterSpacing: '3px', marginBottom: '10px' }}>
            {referralCode}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Jab koi tera portal visit karta hai aur Karmi Minds pe course kharidta hai — yeh code automatically use hota hai. ✅
          </div>
        </div>

        {/* How to Earn */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
          <h3 style={{ fontFamily: 'Teko', fontSize: '20px', marginBottom: '14px', color: '#f0f0ff' }}>💡 Paise Kaise Banenge?</h3>
          {[
            { step: '1', text: 'Apna portal link share karo — WhatsApp, Instagram, YouTube pe.' },
            { step: '2', text: 'Log aayenge, games khelenge, reels dekhenge.' },
            { step: '3', text: 'Jab koi "Courses" tab pe click karega — tera referral code ke saath Karmi Minds pe jaayega.' },
            { step: '4', text: 'Woh course kharidega — ₹50 ya ₹100 seedha tera Karmi Minds wallet mein!' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, color: '#ff6b00', flexShrink: 0 }}>
                {step}
              </div>
              <div style={{ fontSize: '14px', color: '#9090b0', lineHeight: 1.5, paddingTop: '3px' }}>{text}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

// ── Login Screen ──────────────────────────────────
function LoginScreen() {
  const handleLogin = () => {
    window.location.href = `${WORKER_URL}/auth/google?from=merikamai`
  }
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: '28px', fontWeight: 900, marginBottom: '32px', color: '#f0f0ff' }}>
        KARMI<span style={{ color: '#ff6b00' }}>PARTNER</span>
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '36px 28px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
        <h2 style={{ fontFamily: 'Teko', fontSize: '28px', marginBottom: '8px', color: '#f0f0ff' }}>Partner Dashboard</h2>
        <p style={{ fontSize: '14px', color: '#9090b0', lineHeight: 1.6, marginBottom: '28px' }}>
          Login karo aur apna portal manage karo.
        </p>
        <button onClick={handleLogin}
          style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: '14px 20px', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontFamily: 'Rajdhani' }}>
          <img src="https://www.google.com/favicon.ico" width="20" alt="Google" />
          Google se Login Karo
        </button>
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