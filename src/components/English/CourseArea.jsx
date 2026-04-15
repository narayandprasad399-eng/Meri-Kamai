import { useState } from 'react'

// ── KARMI MINDS CATALOG ──────────────────────────
const COURSES = [
  { 
    id: 1, 
    badge: '🔥 BESTSELLER',
    badgeColor: '#ff0055',
    title: 'Speak English Like a Pro!', 
    desc: 'Bina dare, confidence ke sath English bolna seekhein. Interview aur daily life ke liye perfect.', 
    originalPrice: '₹999',
    price: '₹299',
    link: 'https://karmiminds.pages,dev', 
    bg: 'linear-gradient(135deg, #ff6b00, #ff9500)',
    icon: '🗣️'
  },
  { 
    id: 2, 
    badge: '🚀 TRENDING',
    badgeColor: '#00d1b2',
    title: 'Secure 90%+ in 10th Boards', 
    desc: 'Smart study techniques, focus secrets aur mind-training jo toppers use karte hain.', 
    originalPrice: '₹1999',
    price: '₹999',
    link: 'https://karmiminds.pages.dev', 
    bg: 'linear-gradient(135deg, #23d160, #00b84c)',
    icon: '📚'
  },
  { 
    id: 3, 
    badge: '💡 NEW',
    badgeColor: '#b86bff',
    title: 'Earn Money Online (Book Reviews)', 
    desc: 'Ghar baithe kitabein padh kar aur unka review likh kar passive income generate karein.', 
    originalPrice: '₹1499',
    price: '₹499',
    link: 'https://karmiminds.pages.dev', 
    bg: 'linear-gradient(135deg, #3273dc, #1d5ec5)',
    icon: '💸'
  }
];

export default function LearnTab() {
  return (
    <div style={{ height: 'calc(100dvh - var(--tab-h) - 57px)', overflowY: 'auto', background: '#000', padding: '20px 16px', color: '#fff' }}>
      
      {/* 🟢 Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '30px', animation: 'fadeUp 0.4s ease' }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: '28px', fontWeight: 900, letterSpacing: '1px', margin: '0 0 8px 0', background: 'linear-gradient(90deg, #ff6b00, #ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          KARMI MINDS
        </h1>
        <p style={{ color: '#9090b0', fontSize: '14px', fontFamily: 'Rajdhani', fontWeight: 600 }}>
          Master your mind. Upgrade your life.
        </p>
      </div>

      {/* 🟢 Course Showcase Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {COURSES.map((course, idx) => (
          <div 
            key={course.id} 
            style={{ 
              background: '#111122', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '20px', 
              padding: '24px 20px', 
              position: 'relative', 
              overflow: 'hidden',
              animation: `fadeUp 0.5s ease ${idx * 0.1}s both`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '120px', height: '120px', background: course.bg, filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none' }} />

            {/* Badge */}
            <div style={{ background: course.badgeColor, color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', display: 'inline-block', marginBottom: '12px', letterSpacing: '1px' }}>
              {course.badge}
            </div>

            {/* Icon & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{ fontSize: '32px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>{course.icon}</span>
              <h2 style={{ fontFamily: 'Teko', fontSize: '24px', lineHeight: 1.1, margin: 0 }}>{course.title}</h2>
            </div>

            {/* Description */}
            <p style={{ color: '#9090b0', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
              {course.desc}
            </p>

            {/* Pricing & CTA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#ff6b00', fontSize: '22px', fontFamily: 'Orbitron', fontWeight: 900, lineHeight: 1 }}>{course.price}</span>
                <span style={{ color: '#666', fontSize: '12px', textDecoration: 'line-through', marginTop: '4px' }}>{course.originalPrice}</span>
              </div>
              
              <button 
                onClick={() => window.open(course.link, '_blank')}
                style={{ 
                  background: course.bg, 
                  color: '#000', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: '12px', 
                  fontFamily: 'Orbitron', 
                  fontSize: '13px', 
                  fontWeight: 800, 
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s'
                }}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                ENROLL NOW ↗
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🟢 Trust Footer */}
      <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'Rajdhani', fontWeight: 600 }}>
        100% Secure Checkout • Lifetime Access <br/>
        Powered by Karmi Minds
      </div>

    </div>
  )
}