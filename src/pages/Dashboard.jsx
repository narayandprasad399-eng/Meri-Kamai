import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { getUserPortal, createPortal, signOut, supabase } from '../lib/supabase'
import { setupPWA } from '../lib/pwa'
import { GoogleLogin } from '../components/Auth/GoogleLogin'
import ReferralBanner from '../components/Auth/ReferralBanner'
import { SubscriptionPlans } from '../components/Payment/PaymentModals'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [portal, setPortal] = useState(null)
  const [portalLoading, setPortalLoading] = useState(true)
  const [guestMode, setGuestMode] = useState(false)
  const [showPlans, setShowPlans] = useState(false)
  const { subscription, refetch } = useSubscription(user?.id)

  useEffect(() => {
    setupPWA(null, null) // Dashboard manifest
  }, [])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await getUserPortal(user.id)
      if (data) { setPortal(data) }
      else {
        const slug = (user.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
        const { data: newPortal } = await createPortal(user.id, slug, user.email)
        setPortal(newPortal)
      }
      setPortalLoading(false)
    }
    load()
  }, [user])

  if (loading) return <Spinner />
  if (!user && !guestMode) return <GoogleLogin onGuest={() => setGuestMode(true)} />
  if (portalLoading && user) return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Teko', fontSize: '24px' }}>Setting up your portal... 🚀</div>

  const portalUrl = `${window.location.origin}/${portal?.slug || 'demo'}`
  const daysLeft = subscription?.daysLeft || 0
  const isPro = subscription?.active

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: '18px', fontWeight: 900, color: '#f0f0ff' }}>MERI<span style={{ color: '#ff6b00' }}>KAMAI</span></div>
        {user && <button onClick={signOut} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#9090b0', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Rajdhani' }}>Logout</button>}
      </div>

      <div style={{ padding: '20px' }}>
        {/* Portal card */}
        <div style={{ background: 'linear-gradient(135deg,rgba(255,107,0,0.15),rgba(139,92,246,0.1))', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '20px', padding: '24px', marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
          <h2 style={{ fontFamily: 'Teko', fontSize: '26px', marginBottom: '6px' }}>Tera Portal Ready Hai!</h2>
          <div style={{ color: '#ff6b00', fontWeight: 700, fontSize: '15px', marginBottom: '16px', wordBreak: 'break-all' }}>{portalUrl}</div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <a href={`/${portal?.slug}`} className="btn-main" style={{ fontSize: '14px', padding: '10px 20px' }}>Portal Dekho 👀</a>
            <button onClick={() => navigator.share?.({ title: 'Meri Kamai', url: portalUrl }) || navigator.clipboard.writeText(portalUrl)} className="btn-ghost" style={{ fontSize: '14px', padding: '10px 20px' }}>Share 📤</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Views', value: portal?.total_views || '0' },
            { label: 'Plan', value: isPro ? `⭐ Pro` : 'Free' },
            { label: 'Days Left', value: isPro ? `${daysLeft}d` : '—' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Teko', fontSize: '24px', color: '#ff6b00' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#9090b0' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Subscription upgrade */}
        {!isPro && (
          <div style={{ background: 'var(--card)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'Teko', fontSize: '20px', marginBottom: '8px' }}>🔥 Pro Upgrade Karo</div>
            <p style={{ fontSize: '13px', color: '#9090b0', marginBottom: '12px' }}>Apna GD account connect karo → 100% revenue tera!</p>
            <button onClick={() => setShowPlans(!showPlans)} className="btn-main" style={{ width: '100%', fontSize: '16px', padding: '12px', textAlign: 'center' }}>
              {showPlans ? 'Band Karo ✕' : 'Plans Dekho →'}
            </button>
            {showPlans && user && (
              <div style={{ marginTop: '16px' }}>
                <SubscriptionPlans user={user} currentPlan={portal?.plan} daysLeft={daysLeft} onSuccess={() => { setShowPlans(false); refetch() }} />
              </div>
            )}
          </div>
        )}

        {isPro && (
          <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ color: '#00ff88', fontFamily: 'Teko', fontSize: '20px', marginBottom: '4px' }}>✅ Pro Active — {daysLeft} days baaki</div>
            <p style={{ fontSize: '13px', color: '#9090b0' }}>Apna GD Publisher ID set karo dashboard mein!</p>
            <button onClick={() => setShowPlans(!showPlans)} style={{ marginTop: '10px', background: 'transparent', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 700 }}>
              Renew / Extend Karo
            </button>
            {showPlans && user && (
              <div style={{ marginTop: '16px' }}>
                <SubscriptionPlans user={user} currentPlan="pro" daysLeft={daysLeft} onSuccess={() => { setShowPlans(false); refetch() }} />
              </div>
            )}
          </div>
        )}

        {/* Referral */}
        <ReferralBanner user={user} portal={portal} />

        {/* Coming soon */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginTop: '16px' }}>
          <h3 style={{ fontFamily: 'Teko', fontSize: '20px', marginBottom: '16px', color: '#9090b0' }}>🔜 Coming Soon</h3>
          {['Games customize karo', 'Analytics dashboard', 'AdsTerra connect karo (Pro)', 'Custom portal name (Pro)', 'GD Publisher ID connect (Pro)'].map(f => (
            <div key={f} style={{ display: 'flex', gap: '10px', marginBottom: '10px', color: '#606080', fontSize: '14px' }}>⏳ {f}</div>
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
