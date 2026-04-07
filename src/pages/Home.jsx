import { useState } from 'react'
import { signInWithGoogle } from '../lib/supabase'

export default function Home() {
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    await signInWithGoogle()
    setLoading(false)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Navbar */}
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
        <button onClick={handleSignup} className="btn-main" style={{ fontSize: '14px', padding: '8px 20px' }}>
          Start Free
        </button>
      </nav>

      {/* Hero Section - UPDATED FOR GD & ADSTERRA APPROVAL */}
      <section style={{
        padding: '140px 24px 80px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(255,107,0,0.12) 0%, transparent 60%)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Premium Badge */}
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

          {/* Safe & Professional Headline */}
          <h1 style={{
            fontFamily: 'Teko',
            fontSize: 'clamp(45px, 8vw, 80px)',
            lineHeight: 1.05,
            marginBottom: '20px',
            color: '#f0f0ff',
          }}>
            LAUNCH YOUR OWN <span style={{ color: '#ff6b00' }}>GAMING & REELS</span> PORTAL
          </h1>

          {/* Professional Sub-headline */}
          <p style={{
            fontSize: '18px',
            color: '#9090b0',
            maxWidth: '700px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}>
            Give your audience a world-class entertainment experience. Play 1000+ Premium HTML5 Games, swipe viral Shorts, and sell courses. Pre-integrated and ready to launch in 2 minutes.
          </p>

          {/* CTA Buttons - DEMO Highlighted */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
            
            {/* BIG GLOWING DEMO BUTTON - For GD Reviewers */}
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

            {/* User Signup Button */}
            <button
              onClick={handleSignup}
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
              {loading ? 'Loading...' : '⚡ Create Free Account'}
            </button>
          </div>

          {/* YouTube Explainer Video Section */}
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', background: '#000' }}>
            {/* Yahan 'YOUR_VIDEO_ID' ki jagah apne YouTube video ki 11-digit ID daal dena */}
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
            {
              icon: '🎮',
              title: 'Games',
              desc: '500+ premium HTML5 games. Users apne favorite games choose kar sakte hain!',
              color: '#00d4ff',
            },
            {
              icon: '🎬',
              title: 'Reels',
              desc: 'Comedy, Cricket, Bollywood aur aur bhi. Category choose karo aur dekho!',
              color: '#ff6b00',
            },
            {
              icon: '🗣️',
              title: 'English',
              desc: 'English speaking course sirf ₹199 mein. Har portal pe available!',
              color: '#8b5cf6',
            },
          ].map(f => (
            <div key={f.title} style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '28px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '44px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{
                fontFamily: 'Teko',
                fontSize: '26px',
                color: f.color,
                marginBottom: '10px',
              }}>
                {f.title}
              </h3>
              <p style={{ color: '#9090b0', fontSize: '15px', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '60px 24px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'Teko',
          fontSize: '40px',
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          KAISE KAAM KARTA HAI?
        </h2>

        {[
          { step: '01', title: 'Sign Up Karo', desc: 'Google se login karo. Apna username choose karo.' },
          { step: '02', title: 'Portal Ready!', desc: 'merikamai.in/tumhara-naam — tera portal ready!' },
          { step: '03', title: 'Share Karo', desc: 'WhatsApp, Instagram pe share karo. Traffic lao!' },
          { step: '04', title: 'Monetize Portal', desc: 'Jab traffic aane lage, ₹299/mo me PRO upgrade karein aur apne Ads lagayein!' }
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '28px',
            alignItems: 'flex-start',
          }}>
            <div style={{
              fontFamily: 'Orbitron',
              fontSize: '13px',
              fontWeight: 900,
              color: '#ff6b00',
              background: 'rgba(255,107,0,0.1)',
              border: '1px solid rgba(255,107,0,0.3)',
              borderRadius: '8px',
              padding: '6px 10px',
              flexShrink: 0,
            }}>
              {s.step}
            </div>
            <div>
              <div style={{ fontFamily: 'Teko', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                {s.title}
              </div>
              <div style={{ color: '#9090b0', fontSize: '15px', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section style={{
        padding: '60px 24px',
        background: 'var(--bg-alt)',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{ fontFamily: 'Teko', fontSize: '40px', textAlign: 'center', marginBottom: '32px' }}>
          PRICING
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {/* Free */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px',
          }}>
            <div style={{ color: '#9090b0', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
              FREE
            </div>
            <div style={{ fontFamily: 'Teko', fontSize: '52px', lineHeight: 1, marginBottom: '20px' }}>
              ₹0<span style={{ fontSize: '18px', color: '#9090b0' }}>/month</span>
            </div>
            {['3 tab portal', 'Games + Reels + English', 'merikamai.in/username', 'Guest access'].map(f => (
              <div key={f} style={{ display: 'flex', gap: '8px', marginBottom: '10px', color: '#9090b0', fontSize: '15px' }}>
                <span>✅</span> {f}
              </div>
            ))}
            <button onClick={handleSignup} className="btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
              Start Free
            </button>
          </div>

          {/* Pro */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid #ff6b00',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 0 30px rgba(255,107,0,0.15)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(255,107,0,0.1)', color: '#ff6b00',
              padding: '4px 12px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
              border: '1px solid rgba(255,107,0,0.3)',
            }}>
              PRO
            </div>
            <div style={{ color: '#ff6b00', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
              PREMIUM
            </div>
            <div style={{ fontFamily: 'Teko', fontSize: '52px', lineHeight: 1, marginBottom: '20px' }}>
              ₹299<span style={{ fontSize: '18px', color: '#9090b0' }}>/month</span>
            </div>
            {['Custom GD Integration', 'Direct Ad Network (100% Revenue)', 'Subdomain + custom name', 'Priority support'].map(f => (
              <div key={f} style={{ display: 'flex', gap: '8px', marginBottom: '10px', color: '#d0d0e8', fontSize: '15px' }}>
                <span>🔥</span> {f}
              </div>
            ))}
            <button onClick={handleSignup} className="btn-main" style={{ width: '100%', marginTop: '16px', textAlign: 'center' }}>
              Upgrade Karo
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(255,107,0,0.08) 0%, transparent 70%)',
      }}>
        <h2 style={{ fontFamily: 'Teko', fontSize: '48px', marginBottom: '16px' }}>
          READY HO? <span style={{ color: '#ff6b00' }}>FREE</span> MEIN SHURU KARO!
        </h2>
        <p style={{ color: '#9090b0', marginBottom: '32px', fontSize: '16px' }}>
          Khelo. Haso. Seekho. Kamao. 🚀
        </p>
        <button onClick={handleSignup} className="btn-main" style={{ fontSize: '22px', padding: '16px 48px' }}>
          Apna Portal Banao — Free!
        </button>
      </section>

      {/* Cleaned & Merged Footer */}
      <footer style={{
        padding: '40px 24px',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        background: 'var(--bg-alt)'
      }}>
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