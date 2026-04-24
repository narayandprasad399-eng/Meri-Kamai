import { useState } from 'react'
import { usePayment } from '../../hooks/usePayment'

// ---- English Course Payment (UNCHANGED) ----
export function EnglishCoursePayment({ user, onSuccess }) {
  const { initiatePayment, loading, error } = usePayment()

  const handlePay = () => {
    initiatePayment({
      productId: 'english_course',
      userId: user.id,
      userEmail: user.email,
      userName: user.user_metadata?.full_name,
      onSuccess: (data) => onSuccess?.(data),
      onFailure: (msg) => alert('Payment failed: ' + msg)
    })
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗣️</div>
      <h3 style={{ fontFamily: 'Teko', fontSize: '26px', marginBottom: '8px' }}>English Speaking Course</h3>
      <p style={{ color: '#9090b0', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
        30 din mein fluent English. Lifetime access. Karmi Minds ke saath!
      </p>
      {['30 din ka structured course', 'Daily 15 min practice', 'Lifetime access', 'Certificate'].map(f => (
        <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', textAlign: 'left', color: '#d0d0e8', fontSize: '14px' }}>
          <span>✅</span> {f}
        </div>
      ))}
      <div style={{ margin: '20px 0', fontFamily: 'Teko', fontSize: '42px', color: '#ff6b00' }}>
        ₹199<span style={{ fontSize: '16px', color: '#9090b0', fontFamily: 'Rajdhani' }}> one-time</span>
      </div>
      {error && <div style={{ color: '#ff4444', fontSize: '13px', marginBottom: '12px' }}>⚠️ {error}</div>}
      <button onClick={handlePay} disabled={loading} className="btn-main" style={{ width: '100%', fontSize: '18px', opacity: loading ? 0.7 : 1 }}>
        {loading ? '⏳ Processing...' : '🎓 Abhi Kharido — ₹199'}
      </button>
      <p style={{ fontSize: '11px', color: '#606080', marginTop: '10px' }}>🔒 Secure payment via Razorpay</p>
    </div>
  )
}

// ---- Website Subscription Plans (NEW 3-TIER SAAS MODEL) ----
export function SubscriptionPlans({ user, currentPlan, onSuccess }) {
  const { initiatePayment, loading, error } = usePayment()
  const [selectedPlan, setSelectedPlan] = useState('plan_pro_499') // Default popular plan

  const plans = [
    {
      id: 'plan_basic_299',
      name: 'BASIC',
      price: 299,
      icon: '🎓',
      color: '#ff6b00', // Orange
      features: ['Earn 15% Course Commission', 'Standard Portal URL', 'Wannads Tasks Active'],
      badge: null,
    },
    {
      id: 'plan_pro_499',
      name: 'PRO',
      price: 499,
      icon: '🎮',
      color: '#00d4ff', // Blue
      features: ['Connect GamePix ID (100% Ads)', 'Keep full Game Revenue', '+ All Basic Features'],
      badge: 'POPULAR',
    },
    {
      id: 'plan_premium_799',
      name: 'PREMIUM',
      price: 799,
      icon: '🌍',
      color: '#8b5cf6', // Purple
      features: ['Custom Domain Name', 'Full Brand Control', '+ All Pro Features'],
      badge: 'AGENCY',
    }
  ]

  const handlePay = () => {
    initiatePayment({
      productId: selectedPlan,
      userId: user.id,
      userEmail: user.email,
      userName: user.user_metadata?.full_name,
      onSuccess: (data) => onSuccess?.(data),
      onFailure: (msg) => alert('Payment failed: ' + msg),
    })
  }

  return (
    <div style={{ textAlign: 'left' }}>
      
      {currentPlan !== 'free' && (
        <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', textAlign: 'center' }}>
          <span style={{ color: '#00ff88', fontWeight: 700 }}>✅ Current Plan: {currentPlan.toUpperCase()}</span>
        </div>
      )}

      <h3 style={{ fontFamily: 'Teko', fontSize: '28px', marginBottom: '6px', textAlign: 'center', color: '#fff' }}>
        Unlock True Earning Potential
      </h3>
      <p style={{ textAlign: 'center', color: '#9090b0', fontSize: '13px', marginBottom: '20px' }}>
        Select a plan to activate premium features on your portal.
      </p>

      {/* Plan selector (Vertical Stack for better mobile view) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {plans.map(plan => {
          const isSelected = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                background: isSelected ? `rgba(${hexToRgb(plan.color)}, 0.1)` : 'var(--card)',
                border: `2px solid ${isSelected ? plan.color : 'var(--border)'}`,
                borderRadius: '16px',
                padding: '16px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: '-10px', right: '20px', background: plan.color, color: '#000', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '10px', letterSpacing: '1px' }}>
                  {plan.badge}
                </div>
              )}
              
              {/* Icon & Name */}
              <div style={{ textAlign: 'center', minWidth: '60px' }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>{plan.icon}</div>
                <div style={{ fontFamily: 'Teko', fontSize: '18px', color: isSelected ? plan.color : '#fff', lineHeight: 1 }}>
                  {plan.name}
                </div>
              </div>

              {/* Details */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Orbitron', fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>
                  ₹{plan.price}<span style={{ fontSize: '12px', color: '#9090b0', fontFamily: 'Rajdhani' }}>/mo</span>
                </div>
                {plan.features.map(f => (
                  <div key={f} style={{ fontSize: '12px', color: '#d0d0e8', display: 'flex', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ color: plan.color }}>✔</span> {f}
                  </div>
                ))}
              </div>

              {/* Radio Button */}
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? plan.color : '#666'}`, background: isSelected ? plan.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSelected && <div style={{ width: '8px', height: '8px', background: '#000', borderRadius: '50%' }} />}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          width: '100%', 
          background: `linear-gradient(135deg, ${plans.find(p => p.id === selectedPlan).color}, #fff)`,
          color: '#000',
          border: 'none',
          padding: '16px',
          borderRadius: '14px',
          fontSize: '18px',
          fontWeight: 900,
          fontFamily: 'Rajdhani',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          boxShadow: `0 10px 20px rgba(${hexToRgb(plans.find(p => p.id === selectedPlan).color)}, 0.3)`
        }}
      >
        {loading
          ? '⏳ Processing...'
          : `💳 Pay ₹${plans.find(p => p.id === selectedPlan)?.price} — Upgrade Now`
        }
      </button>

      <p style={{ fontSize: '11px', color: '#606080', marginTop: '12px', textAlign: 'center' }}>
        🔒 Secure payment via Razorpay. Auto-renewal is disabled.
      </p>
    </div>
  )
}

// Utility function for HEX to RGB conversion
function hexToRgb(hex) {
  let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}