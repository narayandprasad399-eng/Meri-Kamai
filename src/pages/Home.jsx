import { useState, useEffect } from 'react'
import { WORKER } from '../lib/api'
import { BrainCircuit, Rocket, Zap, Globe, BookOpen, Lock, ChevronRight, Check } from 'lucide-react'

export default function Home() {
  const [loading, setLoading] = useState(false)

  // Title update for better SEO
  useEffect(() => {
    document.title = "MeriKamai | Build Your Digital Coaching Empire"
  }, [])

  const handleSignup = () => {
    setLoading(true)
    // Direct Google Auth pe bhejenge free login ke liye
    window.location.href = `${WORKER}/auth/google?from=merikamai`
  }

  return (
    <div style={{ background: '#05050a', minHeight: '100vh', fontFamily: 'Rajdhani, sans-serif' }}>

      {/* ── 1. NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', padding: '16px 24px', background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: '22px', fontWeight: 900, color: '#f0f0ff' }}>
          MERI<span style={{ color: '#ff6b00' }}>KAMAI</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={handleSignup} style={{ background: 'transparent', color: '#f0f0ff', border: 'none', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
            Login
          </button>
          <button onClick={handleSignup} style={{ background: 'linear-gradient(135deg,#ff6b00,#ff9500)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
            Start Free Shop
          </button>
        </div>
      </nav>

      {/* ── 2. HERO SECTION ── */}
      <section style={{ paddingTop: '160px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', textAlign: 'center', background: 'radial-gradient(circle at 50% 0%, rgba(255,107,0,0.15) 0%, transparent 70%)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,107,0,0.1)', color: '#ff6b00', padding: '6px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '24px', border: '1px solid rgba(255,107,0,0.2)' }}>
            <Zap size={14} /> FREE ED-TECH PLATFORM FOR CREATORS
          </div>
          
          <h1 style={{ fontFamily: 'Teko', fontSize: 'clamp(50px, 9vw, 90px)', lineHeight: 1.05, marginBottom: '24px', color: '#f0f0ff', textTransform: 'uppercase' }}>
            PAISA HARD WORK SE NAHI,<br />
            <span style={{ color: '#ff6b00', textShadow: '0 0 40px rgba(255,107,0,0.4)' }}>SYSTEM SE BANTA HAI.</span>
          </h1>
          
          <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '650px', margin: '0 auto 40px', lineHeight: 1.6, fontWeight: 500 }}>
            Apni khud ki digital coaching start karein. Karmi Minds ke proven courses sell karein, marketing seekhein, aur aage chalkar apna khud ka course launch karein. <strong style={{color:'#fff'}}>Zero investment se shuruat.</strong>
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
            <button onClick={handleSignup} disabled={loading}
              style={{ padding: '16px 36px', background: '#fff', color: '#000', border: 'none', borderRadius: '14px', fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1, boxShadow: '0 10px 30px rgba(255,255,255,0.15)' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              {loading ? '⏳ Loading System...' : '🚀 Claim Your Free Digital Shop'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', color: '#64748b', fontSize: '13px', fontWeight: 700, flexWrap: 'wrap' }}>
            <span style={{display:'flex', alignItems:'center', gap:'6px'}}><Check size={16} color="#10b981"/> No Credit Card Required</span>
            <span style={{display:'flex', alignItems:'center', gap:'6px'}}><Check size={16} color="#10b981"/> 100% Free Onboarding</span>
            <span style={{display:'flex', alignItems:'center', gap:'6px'}}><Check size={16} color="#10b981"/> Free Marketing Training</span>
          </div>
        </div>
      </section>

      {/* ── 3. THE "SYSTEM" PHILOSOPHY ── */}
      <section style={{ padding: '80px 24px', background: '#0a0f1c', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Teko', fontSize: '46px', color: '#fff', lineHeight: 1.1, marginBottom: '20px' }}>
              ONLINE COACHING KA ASLI SECRET KYA HAI?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.7, marginBottom: '24px', fontWeight: 500 }}>
              Bade creators aur educators paisa apne knowledge se nahi, apne <strong>Digital System</strong> se kamate hain. Platform, payment gateway, content delivery, aur marketing funnels — in sabme lakho ka kharcha aur mahino lagte hain.
            </p>
            <p style={{ color: '#ff6b00', fontSize: '18px', fontWeight: 800, background: 'rgba(255,107,0,0.1)', padding: '12px 16px', borderRadius: '12px', borderLeft: '4px solid #ff6b00' }}>
              MeriKamai aapko ye pura readymade system FREE mein deta hai.
            </p>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            {[
              { icon: Globe, title: 'Readymade Digital Shop', desc: 'Aapke brand naam ka custom landing page (e.g. /s/rahul-classes)' },
              { icon: BookOpen, title: 'Pre-loaded High Ticket Courses', desc: 'Karmi Minds ke proven top-selling courses sell karne ke liye ready' },
              { icon: Rocket, title: 'Step-by-Step Training', desc: 'YouTube/Insta se viral organic traffic laane ka exclusive free course' },
              { icon: Lock, title: 'Upcoming: Creator Studio', desc: 'Future mein apne khud ke video courses Karmi Server par launch karein' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: i !== 3 ? '24px' : '0' }}>
                <div style={{ background: 'rgba(255,107,0,0.1)', color: '#ff6b00', padding: '12px', borderRadius: '14px', height: 'fit-content' }}>
                  <f.icon size={24} />
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0' }}>{f.title}</h4>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ── */}
      <section id="how" style={{ padding: '100px 24px', background: '#05050a', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
        <h2 style={{ fontFamily: 'Teko', fontSize: '48px', textAlign: 'center', marginBottom: '12px', color: '#f0f0ff' }}>START YOUR EMPIRE IN 3 STEPS</h2>
        <p style={{ textAlign: 'center', color: '#9090b0', fontSize: '16px', marginBottom: '60px', fontWeight: 500 }}>Zero se professional digital coach banne ka road-map</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          {[
            { step: '01', title: 'Setup Free Shop', desc: 'Google se login karein aur apne brand ka naam choose karein. Aapki custom branded website 10 second mein live.', color: '#3b82f6' },
            { step: '02', title: 'Learn & Market',  desc: 'Hamari free Partner Academy se seekhein ki Instagram aur YouTube se unlimited students (leads) kaise laane hain.', color: '#a855f7' },
            { step: '03', title: 'Earn & Upgrade',  desc: 'Pehle ₹2500 kamayein. Uske baad Pro Tier (₹299/mo) unlock karein jahan aap khud courses ke manchahe prices set kar sakte hain.', color: '#10b981' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: `1px solid ${s.color}40`, borderRadius: '24px', padding: '36px 28px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontFamily: 'Orbitron', fontSize: '120px', fontWeight: 900, color: `${s.color}10`, lineHeight: 1 }}>{s.step}</div>
              <h3 style={{ fontFamily: 'Teko', fontSize: '32px', color: '#fff', marginBottom: '16px', position: 'relative', letterSpacing: '1px' }}>{s.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, position: 'relative', margin: 0, fontWeight: 500 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. CTA SECTION ── */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #ff6b00, #dc2626)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 10%, transparent 10%)', backgroundSize: '40px 40px', opacity: 0.2 }}></div>
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontFamily: 'Teko', fontSize: '50px', color: '#fff', lineHeight: 1.1, marginBottom: '20px' }}>
            READY TO BUILD YOUR DIGITAL FUTURE?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '18px', marginBottom: '40px', fontWeight: 600 }}>
            Aaj hi apna free account banayein aur dekhein ek scalable online business kaise kaam karta hai.
          </p>
          <button onClick={handleSignup} style={{ padding: '18px 40px', background: '#fff', color: '#dc2626', border: 'none', borderRadius: '16px', fontSize: '20px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', display: 'inline-flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            Start For Free Now <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* ── 6. FOOTER ── */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', background: '#020205' }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: '20px', fontWeight: 900, color: '#f0f0ff', marginBottom: '20px' }}>
          MERI<span style={{ color: '#ff6b00' }}>KAMAI</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Contact Support','/contact']].map(([l,h]) => (
            <a key={h} href={h} style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ff6b00'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>{l}</a>
          ))}
        </div>
        <p style={{ color: '#475569', fontSize: '13px', margin: 0, fontWeight: 500 }}>
          © {new Date().getFullYear()} MeriKamai Platform (A Karmi Minds Initiative). Build the future.
        </p>
      </footer>
    </div>
  )
}