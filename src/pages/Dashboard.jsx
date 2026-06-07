import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api, signOut, WORKER } from '../lib/api'
import InstallBanner from '../components/Layout/InstallBanner'
import ShopBrandingTab from './ShopBrandingTab'

const MIN_WITHDRAWAL = 250

// ── 1. TRAINING TAB COMPONENT (0 Worker Request, Static JSON) ──
function TrainingTab() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/training.json')
      .then(res => res.json())
      .then(data => { setVideos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Loading Training...</div>

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#f0f0ff', marginBottom: '4px' }}>Partner Training Academy 🎓</h2>
        <p style={{ fontSize: '13px', color: '#9090b0' }}>Sikho ki YouTube, Instagram aur WhatsApp par marketing karke roz ke 10+ sales kaise nikalein.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {videos.map((v, i) => (
          <div key={i} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>{v.title}</span>
              <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>{v.duration}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0', lineHeight: 1.5 }}>{v.description}</p>
            <button onClick={() => window.open(v.video_url, '_blank')}
              style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid #ff6b00', color: '#ff6b00', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Rajdhani' }}>
              ▶️ Start Watching
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 2. COURSES TAB COMPONENT (Dynamic Locking based on Earnings) ──
function CoursesTab({ priceCap, isPremium, selectedCourses = [], customPrices = {} }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [prices,  setPrices]  = useState({})
  const [selected,setSelected] = useState([])
  
  // Naye Lock States
  const [isLocked, setIsLocked] = useState(false)
  const [lockExpiresAt, setLockExpiresAt] = useState(null)

  useEffect(() => {
    api.get('/partner/courses').then(data => {
      if (data.courses) {
        setCourses(data.courses)
        const p = {}, s = []
        data.courses.forEach(c => {
          if (c.price > 0) {
            p[c.id] = c.custom_price || c.base_price
            if (c.is_selected) s.push(c.id)
          }
        })
        setPrices(p); setSelected(s)
        
        // Backend se lock status set karo
        setIsLocked(data.is_locked || false)
        setLockExpiresAt(data.lock_expires_at || null)
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    if (!isPremium || isLocked) return
    setSaving(true)
    const custom = {}
    selected.forEach(id => { if (prices[id]) custom[id] = prices[id] })
    
    const res = await api.post('/partner/courses', { selected_courses: selected, custom_prices: custom })
    setSaving(false)
    
    if (res.error) {
      alert(res.error)
    } else {
      setSaved(true)
      setIsLocked(true) // UI me turant lock lagao
      setLockExpiresAt(Date.now() + (7 * 24 * 60 * 60 * 1000))
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const toggleCourse = (id) => {
    if (!isPremium || isLocked) return
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const markup = (id) => Math.max(0, (prices[id] || 0) - (courses.find(c => c.id === id)?.base_price || 0))

  if (loading) return <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Loading Courses...</div>

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#f0f0ff', marginBottom: '4px' }}>Course & Shop Manager 🛒</h2>
        <p style={{ fontSize: '13px', color: '#9090b0' }}>
          {!isPremium 
            ? "Abhi aap Free Tier pe hain. Prices fixed hain. ₹2500 kama kar Premium unlock karein aur manchaha price set karein!"
            : "Premium Unlocked! Apna custom price set karein. Earning = Tumhara Price − Base Price."}
        </p>
      </div>

      {/* 7-DAY PRICE LOCK MESSAGE (Sirf Premium users ke liye) */}
      {isPremium && isLocked && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px dashed rgba(239,68,68,0.4)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
          <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span>🔒</span>
            <span>
              Prices abhi locked hain. Market ko stable rakhne ke liye aap agla price update <b style={{color: '#fff'}}>{lockExpiresAt ? new Date(lockExpiresAt).toLocaleDateString() : '7 dino baad'}</b> ko kar payenge.
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {courses.map(c => {
          const isFree = c.price === 0
          const isSel  = isFree || selected.includes(c.id)
          const earn   = isFree ? 0 : (!isPremium ? 50 : Math.max(0, markup(c.id) - Math.round(prices[c.id] * 0.02))) 
          
          return (
            <div key={c.id} style={{ background: '#1e293b', border: `1px solid ${isSel && !isFree ? 'rgba(255,107,0,0.35)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '18px', padding: '18px', opacity: (!isPremium && !isFree) || isLocked ? 0.8 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div onClick={() => toggleCourse(c.id)}
                  style={{ width: 24, height: 24, borderRadius: '6px', border: `2px solid ${isSel ? '#ff6b00' : 'rgba(255,255,255,0.2)'}`, background: isSel ? '#ff6b00' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (isPremium && !isLocked) ? 'pointer' : 'not-allowed' }}>
                  {isSel && <span style={{ color: '#fff', fontSize: '14px', fontWeight: 900 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>{c.title}</span>
                    {isFree && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>FREE HOOK</span>}
                  </div>
                  
                  {!isFree && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Base: ₹{c.base_price}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>→ Price:</span>
                      <input type="number" value={prices[c.id] || c.base_price} disabled={!isPremium || isLocked}
                        onChange={e => {
                          const val = Math.min(Math.max(Number(e.target.value), c.base_price), c.base_price + priceCap)
                          setPrices(p => ({ ...p, [c.id]: val }))
                        }}
                        style={{ width: '75px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '14px', fontWeight: 700, outline: 'none' }} />
                      
                      <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 800 }}>
                        +₹{earn}/sale {isPremium && <span style={{fontSize:'9px', color:'#64748b'}}>(Net)</span>}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {isPremium ? (
        <button onClick={handleSave} disabled={saving || isLocked}
          style={{ width: '100%', background: isLocked ? 'rgba(255,255,255,0.05)' : (saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ff6b00,#ff9500)'), border: 'none', color: isLocked ? '#64748b' : '#fff', padding: '14px', borderRadius: '14px', fontWeight: 900, fontSize: '16px', cursor: isLocked ? 'not-allowed' : 'pointer', fontFamily: 'Rajdhani' }}>
          {saving ? '⏳ Saving...' : isLocked ? '🔒 Prices Locked (See above)' : saved ? '✅ Saved!' : '💾 Save Shop Prices'}
        </button>
      ) : (
        <div style={{ background: 'rgba(255,107,0,0.05)', border: '1px dashed #ff6b00', borderRadius: '12px', padding: '14px', textDisplay: 'center', fontSize: '13px', color: '#ff9500', textAlign: 'center', fontWeight: 700 }}>
          🔒 Price Customization aur Markup unlock karne ke liye ₹2500 kamaein!
        </div>
      )}
    </div>
  )
}

// ── 3. PREMIUM SUBSCRIPTION MODAL SCREEN ──
function PremiumPayScreen({ user, onBack }) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      if (!window.Razorpay) {
        await new Promise((res, rej) => {
          const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = res; s.onerror = rej; document.head.appendChild(s)
        })
      }
      const order = await api.post('/payment/create', { productId: 'merikamai_sub' })
      if (order.error) { alert(order.error); setLoading(false); return }

      new window.Razorpay({
        key: order.keyId, amount: 29900, currency: 'INR', 
        name: 'Karmi Minds Partner Pro', description: 'Unlock Custom Pricing & Store Hosting',
        order_id: order.orderId, prefill: { email: user.email },
        theme: { color: '#ff6b00' },
        handler: async (response) => {
          const v = await api.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id || order.orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            productId: 'merikamai_sub',
          })
          if (v.success) window.location.reload()
          else alert('Verification failed.')
        },
      }).open()
    } catch (e) { alert(e.message) }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
      <div style={{ width: '100%', maxWidth: '360px', background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '2px solid #ff6b00', borderRadius: '20px', padding: '28px' }}>
        <h3 style={{ fontFamily: 'Teko', fontSize: '32px', color: '#fff', marginBottom: '4px' }}>⚡ GO PRO CREATOR</h3>
        <p style={{ color: '#9090b0', fontSize: '13px', marginBottom: '20px' }}>Aapne successfully ₹2500+ earn kar liye hain! Ab apna real digital empire setup karein.</p>
        <div style={{ fontSize: '42px', fontWeight: 900, color: '#ff6b00', fontFamily: 'Orbitron', marginBottom: '20px' }}>₹299<span style={{ fontSize: '14px', color: '#9090b0' }}>/month</span></div>
        
        {['Manchaha custom pricing lagao', 'Apna khud ka course host karo (Teaser Live)', 'Advanced analytics & pixel integration', 'Automatic fast-track payout support'].map(f => (
          <div key={f} style={{ display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '14px', color: '#d0d0e8', textAlign: 'left' }}>
            <span>🚀</span> {f}
          </div>
        ))}

        <button onClick={handleSubscribe} disabled={loading}
          style={{ width: '100%', background: 'linear-gradient(135deg,#ff6b00,#ff9500)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', marginTop: '24px', fontFamily: 'Rajdhani' }}>
          {loading ? '⏳ Activating Pro...' : '💳 Activate Pro Tier — ₹299'}
        </button>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#606080', cursor: 'pointer', fontSize: '13px', marginTop: '16px' }}>Go Back Dashboard</button>
      </div>
    </div>
  )
}

// ── 4. FREE INITIAL ONBOARDING FLOW ──
function OnboardingFlow({ user, onComplete }) {
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [slugError, setSlugError] = useState('')
  const [checking, setChecking] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleNameChange = (val) => {
    setName(val)
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20))
    setSlugError('')
  }

  const handleCreate = async () => {
    if (!slug || slug.length < 3) { setSlugError('Kam se kam 3 characters chahiye'); return }
    setChecking(true)
    const check = await api.get(`/portal/${slug}`)
    setChecking(false)
    if (!check.error) { setSlugError('Yeh shop name already taken hai!'); return }
    setCreating(true)
    const data = await api.post('/portal/create', { slug, portal_name: name || 'My Digital Shop' })
    setCreating(false)
    if (data.portal) onComplete(data.portal)
    else alert(data.error || 'Setup fail hua')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏪</div>
          <h2 style={{ fontFamily: 'Teko', fontSize: '32px', color: '#f0f0ff', marginBottom: '4px' }}>Apni Digital Shop Setup Karein</h2>
          <p style={{ color: '#9090b0', fontSize: '14px' }}>Yeh shop name aapke personal brand identity ko unique banayega.</p>
        </div>
        <label style={{ fontSize: '13px', color: '#9090b0', fontWeight: 700, display: 'block', marginBottom: '8px' }}>SHOP / BRAND NAME</label>
        <input type="text" placeholder="Rahul Logic Coaching" value={name} onChange={e => handleNameChange(e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0ff', padding: '12px 16px', borderRadius: '12px', fontSize: '16px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }} />
        
        <label style={{ fontSize: '13px', color: '#9090b0', fontWeight: 700, display: 'block', marginBottom: '8px' }}>YOUR LANDING LINK HOGA:</label>
        <div style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace', color: '#ff9500', wordBreak: 'break-all', marginBottom: '8px' }}>
          karmiminds.pages.dev/s/<span style={{ fontWeight: 900 }}>{slug || 'your-shop'}</span>
        </div>
        {slugError && <p style={{ color: '#ff4444', fontSize: '12px', marginBottom: '12px' }}>{slugError}</p>}
        <button onClick={handleCreate} disabled={!slug || checking || creating}
          style={{ width: '100%', marginTop: '16px', background: 'linear-gradient(135deg,#ff6b00,#ff9500)', border:'none', color:'#fff', borderRadius:'12px', fontSize: '18px', padding: '14px', fontWeight:800, cursor:'pointer', opacity: (!slug || checking || creating) ? 0.6 : 1 }}>
          {creating ? '⏳ Creating Store...' : checking ? 'Checking name...' : 'Launch Free Shop →'}
        </button>
      </div>
    </div>
  )
}

// ── 5. MAIN EARNINGS & WITHDRAWAL VIEW ──
function EarningsTab({ walletBal, recentSales }) {
  const [upiId,       setUpiId]       = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [msg,         setMsg]         = useState(null)

  const handleWithdraw = async () => {
    if (walletBal < MIN_WITHDRAWAL) { setMsg({ type: 'error', text: `Minimum ₹${MIN_WITHDRAWAL} chahiye` }); return }
    if (!upiId || !upiId.includes('@')) { setMsg({ type: 'error', text: 'Valid UPI ID dalo' }); return }
    setWithdrawing(true)
    const data = await api.post('/wallet/withdraw', { upi_id: upiId, amount: walletBal })
    setWithdrawing(false)
    if (data.success) setMsg({ type: 'success', text: '✅ Request submitted! 24-48 hrs mein transfer hoga.' })
    else setMsg({ type: 'error', text: data.error || 'Failed. Try again.' })
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#f0f0ff', marginBottom: '16px' }}>Earnings & Payouts 💸</h2>
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>AVAILABLE FOR UPI TRANSFER</div>
        <div style={{ fontFamily: 'Orbitron', fontSize: '32px', fontWeight: 900, color: '#10b981', marginBottom: '14px' }}>₹{walletBal}</div>
        <input type="text" placeholder="UPI ID (e.g. rahul@oksbi)" value={upiId} onChange={e => setUpiId(e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0ff', padding: '12px 16px', borderRadius: '12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
        {msg && <div style={{ color: msg.type === 'success' ? '#10b981' : '#ef4444', fontSize: '13px', marginBottom: '12px', fontWeight: 'bold' }}>{msg.text}</div>}
        <button onClick={handleWithdraw} disabled={withdrawing || walletBal < MIN_WITHDRAWAL}
          style={{ width: '100%', background: walletBal >= MIN_WITHDRAWAL ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.05)', border: 'none', color: walletBal >= MIN_WITHDRAWAL ? '#fff' : '#475569', padding: '13px', borderRadius: '12px', fontWeight: 900, fontSize: '15px', cursor: 'pointer' }}>
          {withdrawing ? '⏳ Processing...' : `Withdraw to UPI`}
        </button>
      </div>
    </div>
  )
}

// ── 6. MAIN CONTROLLER CONTAINER ──
export default function Dashboard() {
  const { user, loading } = useAuth()
  const [tab,             setTab]            = useState('overview')
  const [dashData,        setDashData]       = useState(null)
  const [dashLoading,     setDashLoading]    = useState(true)
  const [showOnboarding,  setShowOnboarding] = useState(false)
  const [showPayScreen,   setShowPayScreen]  = useState(false)
  const [copied,          setCopied]         = useState(false)

  useEffect(() => {
    document.title = 'Partner Dashboard'
  }, [])

  useEffect(() => {
    if (!user) { setDashLoading(false); return }
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    try {
      const data = await api.get('/portal/dashboard')
      if (data.error === 'Portal not found' && data.needs_onboarding) {
        setShowOnboarding(true)
      } else {
        setDashData(data)
      }
    } catch (e) { console.error(e) }
    setDashLoading(false)
  }

  if (loading || dashLoading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40vh' }}>Verifying Profile...</div>
  if (!user) return <LoginScreen />
  if (showOnboarding) return <OnboardingFlow user={user} onComplete={() => { setShowOnboarding(false); loadDashboard() }} />
  if (showPayScreen) return <PremiumPayScreen user={user} onBack={() => setShowPayScreen(false)} />

  const d          = dashData
  const walletBal  = d?.wallet_balance  || 0
  const totalEarn  = d?.total_earnings  || 0
  
  // 🚀 NAYA: Clean Vanity URL (/s/shop-name)
  const refUrl     = d?.portal?.slug ? `https://karmiminds.pages.dev/s/${d.portal.slug}` : `https://karmiminds.pages.dev/s/${d?.referral_code || ''}`
  const isPremium  = d?.portal?.plan === 'active'

  const targetReached = totalEarn >= 2500
  const capPct     = Math.min((totalEarn / 2500) * 100, 100)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: '480px', margin: '0 auto', paddingBottom: '80px', fontFamily: 'Rajdhani' }}>
      <InstallBanner />

      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(5,5,10,0.97)', zIndex: 50 }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: '18px', fontWeight: 900, color: '#f0f0ff' }}>MERI<span style={{ color: '#ff6b00' }}>KAMAI</span></div>
        <button onClick={signOut} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#9090b0', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>Logout</button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,5,10,0.95)' }}>
        {[{ id: 'overview', label: '📊 Overview' }, { id: 'courses', label: '🏪 Shop' }, { id: 'training', label: '🎓 Training' }, { id: 'earnings', label: '💸 Payouts' }, { id: 'branding', label: '🎨 Branding' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '13px 4px', background: 'none', border: 'none', borderBottom: `3px solid ${tab === t.id ? '#ff6b00' : 'transparent'}`, color: tab === t.id ? '#fff' : '#64748b', fontWeight: tab === t.id ? 800 : 500, fontSize: '13px', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        {tab === 'overview' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '22px', marginBottom: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>TOTAL WALLET BALANCE</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: '40px', fontWeight: 900, color: '#10b981', lineHeight: 1, marginBottom: '14px' }}>₹{walletBal}</div>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#fff', fontWeight: 700, marginBottom: '7px' }}>
                  <span>{targetReached ? '🎉 Premium unlocked criteria met!' : '🚀 Earn ₹2500 to unlock Custom Prices'}</span>
                  <span style={{color: '#ff6b00'}}>₹{totalEarn}/₹2500</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${capPct}%`, background: targetReached ? '#10b981' : 'linear-gradient(90deg,#ff6b00,#ff9500)', borderRadius: '10px' }} />
                </div>
              </div>

              {targetReached && !isPremium && (
                <button onClick={() => setShowPayScreen(true)}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#ff6b00,#ff9500)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 900, fontSize: '14px', cursor: 'pointer' }}>
                  ⚡ Unlock Premium Tier & Custom Pricing (₹299)
                </button>
              )}
              {isPremium && (
                <div style={{ textDisplay: 'center', color: '#10b981', fontWeight: 800, fontSize: '14px', textAlign: 'center', background: 'rgba(16,185,129,0.08)', padding: '10px', borderRadius: '10px', border: '1px dashed #10b981' }}>
                  👑 PREMIUM ACCOUNT ACTIVE (Shop Customization Enabled)
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Link Clicks', value: d?.portal?.course_clicks || 0, color: '#3b82f6' },
                { label: 'Sales Done',  value: d?.total_sales || 0,    color: '#f59e0b' },
                { label: 'Net Earned',  value: `₹${totalEarn}`,       color: '#10b981' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#1e293b', borderRadius: '14px', padding: '14px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color, marginBottom: '2px' }}>{value}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>{label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Custom Referral Link Module with PRO TIP */}
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '18px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>YOUR PROFESSIONAL SHOP LINK</div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px 0', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span>💡</span> Yeh link aapke students ke saath share karein. Isme 'referral' jaisa kuch nahi likha hota, isliye unhe lagega ye aapki apni website hai!
              </p>
              
              <div style={{ background: '#0f172a', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', color: '#ff9500', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '12px' }}>{refUrl}</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { navigator.clipboard.writeText(refUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '11px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
                  {copied ? '✅ Copied!' : '📋 Copy Link'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '16px', background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(15,23,42,0.5))', border: '1px dashed rgba(124,58,237,0.3)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 900, letterSpacing: '1px', marginBottom: '4px' }}>UPCOMING PREMIUM FEATURE SEED</div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px 0', color: '#fff' }}>🏠 Host Your Own Course (Creator Studio)</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Kya aap khud coaching chalate hain? Jaldi hi aap Karmi Minds encryption server par apna course host kar payenge!</p>
            </div>
          </div>
        )}

        {tab === 'courses' && <CoursesTab priceCap={d?.portal?.price_cap || 2000} isPremium={isPremium} />}
        {tab === 'training' && <TrainingTab />}
        {tab === 'earnings' && <EarningsTab walletBal={walletBal} recentSales={d?.recent_sales || []} />}
        {tab === 'branding' && <ShopBrandingTab portal={d?.portal} isPremium={isPremium} workerUrl={WORKER} />}
      </div>
    </div>
  )
}

function LoginScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: '28px', fontWeight: 900, marginBottom: '32px', color: '#f0f0ff' }}>MERI<span style={{ color: '#ff6b00' }}>KAMAI</span></div>
      <button onClick={() => window.location.href = `${WORKER}/auth/google?from=merikamai`}
        style={{ background: '#fff', color: '#000', border: 'none', padding: '14px 20px', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Rajdhani' }}>
        <img src="https://www.google.com/favicon.ico" width="20" alt="Google" /> Google se Free Login Karo
      </button>
    </div>
  )
}