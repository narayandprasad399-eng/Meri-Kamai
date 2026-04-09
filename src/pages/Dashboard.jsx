import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { getUserPortal, createPortal, updatePortal, signOut, supabase } from '../lib/supabase'
import { GoogleLogin } from '../components/Auth/GoogleLogin'
import ReferralBanner from '../components/Auth/ReferralBanner'
import { SubscriptionPlans } from '../components/Payment/PaymentModals'
import InstallBanner from '../components/Layout/InstallBanner'

// ── Onboarding steps ──────────────────────────────
// Step 1: Portal naam
// Step 2: Games select
// Step 3: Done
function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(1)
  const [portalName, setPortalName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugError, setSlugError] = useState('')
  const [checking, setChecking] = useState(false)
  const [creating, setCreating] = useState(false)

  // Auto slug from portal name
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

      {/* Progress */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {[1, 2].map(s => (
          <div key={s} style={{ width: '60px', height: '4px', borderRadius: '2px', background: step >= s ? 'linear-gradient(90deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>

      {step === 1 && (
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏪</div>
            <h2 style={{ fontFamily: 'Teko', fontSize: '28px', color: '#f0f0ff', marginBottom: '6px' }}>
              Apni Shop ka Naam Rakho!
            </h2>
            <p style={{ color: '#9090b0', fontSize: '14px', lineHeight: 1.5 }}>
              Yeh naam teri website pe dikhega.<br />Baad mein bhi change kar sakte ho.
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#9090b0', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Portal / Shop Name
            </label>
            <input
              type="text"
              placeholder="jaise: Rahul Gaming Zone"
              value={portalName}
              onChange={e => handleNameChange(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0ff', padding: '12px 16px', borderRadius: '12px', fontSize: '16px', fontFamily: 'Rajdhani', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', color: '#9090b0', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Website URL milegi:
            </label>
            <div style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace', color: '#ff9500', wordBreak: 'break-all' }}>
              merikamai.in/<span style={{ fontWeight: 900 }}>{slug || 'tera-naam'}</span>
            </div>
            {slugError && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '6px' }}>{slugError}</p>}
          </div>

          <button
            onClick={handleStep1}
            disabled={!slug || checking}
            className="btn-main"
            style={{ width: '100%', marginTop: '20px', fontSize: '18px', padding: '14px', textAlign: 'center', opacity: (!slug || checking) ? 0.6 : 1 }}>
            {checking ? 'Check ho raha hai...' : 'Aage Badho →'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎮</div>
          <h2 style={{ fontFamily: 'Teko', fontSize: '28px', color: '#f0f0ff', marginBottom: '6px' }}>
            Games Baad Mein Select Karo!
          </h2>
          <p style={{ color: '#9090b0', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            Abhi default games lagenge — Dashboard mein jaake apne pasand ke games choose kar sakte ho anytime.
          </p>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
            {[
              { icon: '🎮', text: 'Games tab — 500+ games' },
              { icon: '🎬', text: 'Reels tab — Viral shorts' },
              { icon: '🗣️', text: 'English tab — Speaking course' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < 2 ? '12px' : 0, alignItems: 'center' }}>
                <span style={{ fontSize: '20px' }}>{f.icon}</span>
                <span style={{ fontSize: '14px', color: '#d0d0e8', fontWeight: 600 }}>{f.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleFinish}
            disabled={creating}
            className="btn-main"
            style={{ width: '100%', fontSize: '18px', padding: '14px', textAlign: 'center', opacity: creating ? 0.6 : 1 }}>
            {creating ? '⏳ Portal ban raha hai...' : '🚀 Portal Launch Karo!'}
          </button>

          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#606080', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}>
            ← Wapas jaao
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
  const [showPlans, setShowPlans] = useState(false)
  const { subscription, refetch } = useSubscription(user?.id)

  useEffect(() => {
    if (!user) { setPortalLoading(false); return }
    const load = async () => {
      const { data } = await getUserPortal(user.id)
      if (data) {
        setPortal(data)
      } else {
        // Naya user — onboarding dikhao
        setShowOnboarding(true)
      }
      setPortalLoading(false)
    }
    load()
  }, [user])

  if (loading || (user && portalLoading)) return <Spinner />
  if (!user) return <GoogleLogin onGuest={() => {}} />

  if (showOnboarding) {
    return <OnboardingFlow user={user} onComplete={(newPortal) => {
      setPortal(newPortal)
      setShowOnboarding(false)
    }} />
  }

  const portalUrl = `${window.location.origin}/${portal?.slug || 'demo'}`
  const daysLeft = subscription?.daysLeft || 0
  const isPro = subscription?.active

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: '480px', margin: '0 auto', paddingBottom: '80px' }}>

      <InstallBanner />

      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(5,5,10,0.97)', backdropFilter: 'blur(10px)', zIndex: 50 }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: '18px', fontWeight: 900, color: '#f0f0ff' }}>
          MERI<span style={{ color: '#ff6b00' }}>KAMAI</span>
        </div>
        <button onClick={signOut} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#9090b0', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Rajdhani' }}>
          Logout
        </button>
      </div>

      <div style={{ padding: '20px' }}>

        {/* Portal card */}
        <div style={{ background: 'linear-gradient(135deg,rgba(255,107,0,0.15),rgba(139,92,246,0.1))', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '20px', padding: '24px', marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
          <h2 style={{ fontFamily: 'Teko', fontSize: '26px', marginBottom: '4px' }}>
            {portal?.portal_name || 'Tera Portal'}
          </h2>
          <div style={{ color: '#ff6b00', fontWeight: 700, fontSize: '14px', marginBottom: '16px', wordBreak: 'break-all' }}>
            {portalUrl}
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`/${portal?.slug}`} className="btn-main" style={{ fontSize: '14px', padding: '10px 20px' }}>
              Portal Dekho 👀
            </a>
            <button
              onClick={() => navigator.share?.({ title: portal?.portal_name || 'Meri Kamai', url: portalUrl }) || navigator.clipboard.writeText(portalUrl)}
              className="btn-ghost"
              style={{ fontSize: '14px', padding: '10px 20px' }}>
              Share 📤
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Views', value: portal?.total_views || '0' },
            { label: 'Plan', value: isPro ? '⭐ Pro' : 'Free' },
            { label: 'Days Left', value: isPro ? `${daysLeft}d` : '—' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Teko', fontSize: '24px', color: '#ff6b00' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#9090b0' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pro upgrade */}
        {!isPro && (
          <div style={{ background: 'var(--card)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'Teko', fontSize: '20px', marginBottom: '8px' }}>🔥 Pro Upgrade Karo</div>
            <p style={{ fontSize: '13px', color: '#9090b0', marginBottom: '12px' }}>
              Apna GD account connect karo → 100% revenue tera!
            </p>
            <button onClick={() => setShowPlans(!showPlans)} className="btn-main"
              style={{ width: '100%', fontSize: '16px', padding: '12px', textAlign: 'center' }}>
              {showPlans ? 'Band Karo ✕' : 'Plans Dekho →'}
            </button>
            {showPlans && (
              <div style={{ marginTop: '16px' }}>
                <SubscriptionPlans user={user} currentPlan={portal?.plan} daysLeft={daysLeft}
                  onSuccess={() => { setShowPlans(false); refetch() }} />
              </div>
            )}
          </div>
        )}

        {isPro && (
          <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ color: '#00ff88', fontFamily: 'Teko', fontSize: '20px', marginBottom: '4px' }}>
              ✅ Pro Active — {daysLeft} days baaki
            </div>
            <p style={{ fontSize: '13px', color: '#9090b0' }}>Apna GD Publisher ID set karo!</p>
            <button onClick={() => setShowPlans(!showPlans)}
              style={{ marginTop: '10px', background: 'transparent', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 700 }}>
              Renew / Extend Karo
            </button>
            {showPlans && (
              <div style={{ marginTop: '16px' }}>
                <SubscriptionPlans user={user} currentPlan="pro" daysLeft={daysLeft}
                  onSuccess={() => { setShowPlans(false); refetch() }} />
              </div>
            )}
          </div>
        )}

        {/* Referral */}
        <ReferralBanner user={user} portal={portal} />

        {/* Coming soon */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginTop: '16px' }}>
          <h3 style={{ fontFamily: 'Teko', fontSize: '20px', marginBottom: '16px', color: '#9090b0' }}>🔜 Coming Soon</h3>
          {['Games customize karo', 'Analytics dashboard', 'AdsTerra connect karo (Pro)', 'Custom portal naam change (Pro)', 'GD Publisher ID connect (Pro)'].map(f => (
            <div key={f} style={{ display: 'flex', gap: '10px', marginBottom: '10px', color: '#606080', fontSize: '14px' }}>
              ⏳ {f}
            </div>
          ))}
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
