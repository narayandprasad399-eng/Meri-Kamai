import { useState } from 'react'
import { signInWithGoogle } from '../lib/supabase'

export default function Home() {
  const [loading, setLoading] = useState(false)
  
  // 🟢 Promo Code State
  const [promoCode, setPromoCode] = useState('')
  const [isPromoApplied, setIsPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')

  const handleSignup = async () => {
    setLoading(true)
    await signInWithGoogle()
    setLoading(false)
  }

  // 🟢 Promo Code Checker Logic
  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase()
    // Yahan tu aur bhi codes add kar sakta hai
    if (code === 'KARMIMINDS' || code === 'MERIKAMAI') {
      setIsPromoApplied(true)
      setPromoError('')
    } else {
      setIsPromoApplied(false)
      setPromoError('❌ Invalid Promo Code. Please check again.')
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Navbar - 🟢 LOGIN OPTION ADDED */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%',
        padding: '14px 20px',
        background: 'rgba(5,5,10,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 100,
      }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: '20px', fontWeight: 900, color: '#f0f0ff' }}>
          MERI<span style={{ color: '#ff6b00' }}>KAMAI</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={handleSignup} style={{ background: 'transparent', color: '#f0f0ff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'Rajdhani' }}>
            Login
          </button>
          <button onClick={handleSignup} className="btn-main" style={{ fontSize: '13px', padding: '8px 16px' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '140px 24px 80px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(255,107,0,0.12) 0%, transparent 60%)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,107,0,0.1)',
            color: '#ff6b00',
            padding: '6px 18px',
            borderRadius: '50px',
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '1px',
            marginBottom: '25px',
            border: '1px solid rgba(255,107,0,0.3)',
          }}>
            🚀 INDIA'S #1 PORTAL BUILDER
          </div>

          <h1 style={{
            fontFamily: 'Teko',
            fontSize: 'clamp(45px, 8vw, 80px)',
            lineHeight: 1.05,
            marginBottom: '20px',
            color: '#f0f0ff',
          }}>
            LAUNCH YOUR OWN <span style={{ color: '#ff6b00' }}>GAMING & REELS</span> PORTAL
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#9090b0',
            maxWidth: '700px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}>
            Give your audience a world-class entertainment experience. Play 1000+ Premium HTML5 Games, swipe viral Shorts, and sell courses. Pre-integrated and ready to launch in 2 minutes.
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
            <a href="/demo" style={{
              padding: '16px 40px',
              background: 'linear-gradient(45deg, #ff3366, #ff6b00)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '20px',
              fontWeight: 800,
              boxShadow: '0 10px 30px rgba(255,107,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              🎮 PLAY LIVE DEMO
            </a>

            <button
              onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
              disabled={loading}
              style={{
                padding: '16px 40px',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              ⚡ View Pricing
            </button>
          </div>

          {/* YouTube Video Section */}
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', background: '#000' }}>
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID?rel=0&modestbranding=1"
              title="Meri Kamai Platform Overview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen>
            </iframe>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{
        padding: '60px 24px',
        background: 'var(--bg-alt)',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontFamily: 'Teko',
          fontSize: '40px',
          textAlign: 'center',
          marginBottom: '40px',
          color: '#f0f0ff',
        }}>
          3 TABS, INFINITE POSSIBILITIES
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {[
            { icon: '🎮', title: 'Games', desc: '500+ premium HTML5 games. Users apne favorite games choose kar sakte hain!', color: '#00d4ff' },
            { icon: '🎬', title: 'Reels', desc: 'Comedy, Cricket, Bollywood aur aur bhi. Category choose karo aur dekho!', color: '#ff6b00' },
            { icon: '🗣️', title: 'English', desc: 'English speaking course sirf ₹199 mein. Har portal pe available!', color: '#8b5cf6' },
          ].map(f => (
            <div key={f.title} style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '28px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '44px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Teko', fontSize: '26px', color: f.color, marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ color: '#9090b0', fontSize: '15px', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🟢 PRICING & PROMO CODE SECTION */}
      <section id="pricing" style={{
        padding: '80px 24px',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{ fontFamily: 'Teko', fontSize: '40px', textAlign: 'center', marginBottom: '32px', color: '#f0f0ff' }}>
          START YOUR EARNING PLATFORM
        </h2>
        
        <div style={{
          background: 'var(--card)',
          border: '1px solid rgba(255,107,0,0.3)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '500px',
          margin: '0 auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          position: 'relative'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {!isPromoApplied ? (
              <>
                <div style={{ color: '#ff6b00', fontSize: '64px', fontWeight: 900, fontFamily: 'Orbitron', lineHeight: 1 }}>
                  ₹101 <span style={{ fontSize: '18px', fontWeight: 700, color: '#9090b0', fontFamily: 'Rajdhani' }}>/mo</span>
                </div>
                <p style={{ color: '#9090b0', fontSize: '14px', marginTop: '12px' }}>
                  Full Access. Auto-updates. Premium Hosting.
                </p>
              </>
            ) : (
              <>
                <div style={{ textDecoration: 'line-through', color: '#666', fontSize: '24px', fontWeight: 800 }}>
                  ₹101 <span style={{ fontSize: '14px' }}>/month</span>
                </div>
                <div style={{ color: '#00b84c', fontSize: '64px', fontWeight: 900, marginTop: '-5px', fontFamily: 'Orbitron', lineHeight: 1 }}>
                  ₹0 <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Rajdhani' }}>for life!</span>
                </div>
                <div style={{ background: 'rgba(0,184,76,0.1)', color: '#00b84c', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, marginTop: '12px', display: 'inline-block' }}>
                  🎉 Promo Code Applied Successfully!
                </div>
              </>
            )}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', marginBottom: '24px' }}>
            {['Your own URL (merikamai.in/naam)', 'Passive Income Engine', 'Viral Reels & Unlimited Games', 'Earn as much you imagine'].map(f => (
              <div key={f} style={{ display: 'flex', gap: '10px', marginBottom: '12px', color: '#d0d0e8', fontSize: '15px', fontWeight: 600 }}>
                <span>✅</span> {f}
              </div>
            ))}
          </div>

          {/* Promo Code Input Box */}
          {!isPromoApplied && (
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#9090b0', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Have a Partner Promo Code?</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Enter Code..." 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,107,0,0.3)', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '14px', outline: 'none', textTransform: 'uppercase', fontFamily: 'Rajdhani', fontWeight: 700 }}
                />
                <button onClick={handleApplyPromo} style={{ background: 'rgba(255,107,0,0.1)', color: '#ff6b00', border: '1px solid rgba(255,107,0,0.3)', padding: '0 20px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Rajdhani' }}>
                  APPLY
                </button>
              </div>
              {promoError && <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>{promoError}</div>}
            </div>
          )}

          <button onClick={handleSignup} className="btn-main" style={{ width: '100%', textAlign: 'center', fontSize: '18px', padding: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {isPromoApplied ? 'Claim Your Free Site Now 🚀' : 'Pay ₹101 & Start Now 💳'}
          </button>

          <p style={{ fontSize: '11px', color: '#606080', textAlign: 'center', marginTop: '16px' }}>
            No credit card required for free signup.
          </p>
        </div>
      </section>

      {/* Cleaned Footer */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border)', textAlign: 'center', background: 'var(--bg-alt)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Terms & Conditions</a>
          <a href="/refund" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Refund Policy</a>
          <a href="/contact" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Contact Us</a>
        </div>
        
        <div style={{ fontFamily: 'Orbitron', fontSize: '18px', fontWeight: 900, color: '#f0f0ff', marginBottom: '10px' }}>
          MERI<span style={{ color: '#ff6b00' }}>KAMAI</span>
        </div>
        
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
          © {new Date().getFullYear()} MeriKamai. Khelo. Haso. Seekho. All rights reserved.
        </p>
      </footer>
    </div>
  )
}