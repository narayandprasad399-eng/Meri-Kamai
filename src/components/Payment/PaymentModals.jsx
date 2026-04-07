import { useState } from 'react'
import { usePayment } from '../../hooks/usePayment'

// ---- English Course Payment ----
export function EnglishCoursePayment({ user, onSuccess }) {
  const { initiatePayment, loading, error } = usePayment()

  const handlePay = () => {
    initiatePayment({
      productId: 'english_course',
      userId: user.id,
      userEmail: user.email,
      userName: user.user_metadata?.full_name,
      onSuccess: (data) => {
        onSuccess?.(data)
      },
      onFailure: (msg) => {
        alert('Payment failed: ' + msg)
      }
    })
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid rgba(255,107,0,0.3)',
      borderRadius: '20px',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗣️</div>
      <h3 style={{ fontFamily: 'Teko', fontSize: '26px', marginBottom: '8px' }}>
        English Speaking Course
      </h3>
      <p style={{ color: '#9090b0', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
        30 din mein fluent English. Lifetime access. Karmi Minds ke saath!
      </p>

      {/* Features */}
      {['30 din ka structured course', 'Daily 15 min practice', 'Lifetime access', 'Certificate'].map(f => (
        <div key={f} style={{
          display: 'flex', gap: '8px', alignItems: 'center',
          marginBottom: '8px', textAlign: 'left',
          color: '#d0d0e8', fontSize: '14px',
        }}>
          <span>✅</span> {f}
        </div>
      ))}

      <div style={{
        margin: '20px 0',
        fontFamily: 'Teko',
        fontSize: '42px',
        color: '#ff6b00',
      }}>
        ₹199
        <span style={{ fontSize: '16px', color: '#9090b0', fontFamily: 'Rajdhani' }}> one-time</span>
      </div>

      {error && (
        <div style={{ color: '#ff4444', fontSize: '13px', marginBottom: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="btn-main"
        style={{ width: '100%', fontSize: '18px', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? '⏳ Processing...' : '🎓 Abhi Kharido — ₹199'}
      </button>

      <p style={{ fontSize: '11px', color: '#606080', marginTop: '10px' }}>
        🔒 Secure payment via Razorpay
      </p>
    </div>
  )
}

// ---- Website Subscription Plans ----
export function SubscriptionPlans({ user, currentPlan, daysLeft, onSuccess }) {
  const { initiatePayment, loading, error } = usePayment()
  const [selectedPlan, setSelectedPlan] = useState('website_subscription_30')

  const plans = [
    {
      id: 'website_subscription_30',
      label: '30 Days',
      price: 299,
      perDay: '₹9.97/day',
      popular: false,
    },
    {
      id: 'website_subscription_90',
      label: '90 Days',
      price: 799,
      perDay: '₹8.88/day',
      popular: true,
      badge: 'Save ₹98!',
    },
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
    <div>
      {/* Current status */}
      {currentPlan === 'pro' && daysLeft > 0 && (
        <div style={{
          background: 'rgba(0,255,136,0.1)',
          border: '1px solid rgba(0,255,136,0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: '#00ff88', fontWeight: 700 }}>✅ Pro Active</span>
          <span style={{ color: '#9090b0', fontSize: '14px' }}>{daysLeft} days baaki</span>
        </div>
      )}

      <h3 style={{ fontFamily: 'Teko', fontSize: '24px', marginBottom: '16px', textAlign: 'center' }}>
        {currentPlan === 'pro' ? 'Renew / Extend Karo' : 'Pro Upgrade Karo'}
      </h3>

      {/* Plan selector */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {plans.map(plan => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            style={{
              flex: 1,
              background: selectedPlan === plan.id ? 'rgba(255,107,0,0.15)' : 'var(--card)',
              border: `1px solid ${selectedPlan === plan.id ? '#ff6b00' : 'var(--border)'}`,
              borderRadius: '16px',
              padding: '16px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s',
            }}
          >
            {plan.badge && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ff6b00',
                color: '#000',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '10px',
                whiteSpace: 'nowrap',
              }}>
                {plan.badge}
              </div>
            )}
            <div style={{ fontFamily: 'Teko', fontSize: '20px', marginBottom: '4px' }}>
              {plan.label}
            </div>
            <div style={{
              fontFamily: 'Teko',
              fontSize: '30px',
              color: selectedPlan === plan.id ? '#ff6b00' : '#f0f0ff',
            }}>
              ₹{plan.price}
            </div>
            <div style={{ fontSize: '12px', color: '#606080' }}>{plan.perDay}</div>
          </div>
        ))}
      </div>

      {/* Pro features */}
      <div style={{
        background: 'var(--card)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
      }}>
        {[
          'Apna GD Publisher ID connect karo',
          '100% ad revenue tera',
          'Custom portal name',
          'Priority support',
        ].map(f => (
          <div key={f} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#d0d0e8' }}>
            <span>🔥</span> {f}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ color: '#ff4444', fontSize: '13px', marginBottom: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="btn-main"
        style={{ width: '100%', fontSize: '18px', opacity: loading ? 0.7 : 1 }}
      >
        {loading
          ? '⏳ Processing...'
          : `💳 Pay ₹${plans.find(p => p.id === selectedPlan)?.price} — Upgrade Karo`
        }
      </button>

      <p style={{ fontSize: '11px', color: '#606080', marginTop: '10px', textAlign: 'center' }}>
        🔒 Secure payment via Razorpay. Auto-renewal nahi hai.
      </p>
    </div>
  )
}
