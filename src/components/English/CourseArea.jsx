import { useState, useEffect } from 'react'

const WORKER_URL = import.meta.env.VITE_WORKER_URL

export default function CourseArea({ portal }) {
  const [courses,  setCourses]  = useState([])
  const [loading,  setLoading]  = useState(true)

  // Public JSON se courses fetch karo — zero worker request
  useEffect(() => {
    fetch('https://karmiminds.pages.dev/courses/index.json')
      .then(r => r.json())
      .then(data => {
        setCourses(data.filter(c => c.is_active && c.price > 0))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleCourseClick = async (course) => {
    // Analytics track karo
    if (portal?.slug && portal.slug !== 'demo') {
      fetch(`${WORKER_URL}/portal/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: portal.slug, type: 'course_clicks' })
      }).catch(() => {})
    }

    // Referral code generate karo aur Karmi Minds pe bhejo
    if (!portal || portal.slug === 'demo') {
      window.open('https://karmiminds.pages.dev/app', '_blank')
      return
    }

    const karmiRefCode = portal.user_id?.substring(0, 8).toUpperCase()
    const url = karmiRefCode
      ? `https://karmiminds.pages.dev/app?ref=${karmiRefCode}`
      : 'https://karmiminds.pages.dev/app'

    window.open(url, '_blank')
  }

  if (loading) return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(255,107,0,0.2)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ height: 'calc(100dvh - var(--tab-h) - 57px)', overflowY: 'auto', background: '#000', padding: '20px 16px', color: '#fff' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: '26px', fontWeight: 900, letterSpacing: '1px', margin: '0 0 8px 0', background: 'linear-gradient(90deg, #ff6b00, #ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          KARMI MINDS
        </h1>
        <p style={{ color: '#9090b0', fontSize: '14px', fontFamily: 'Rajdhani', fontWeight: 600 }}>
          Master your mind. Upgrade your life.
        </p>
      </div>

      {/* Courses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {courses.map((course, idx) => (
          <div key={course.id}
            style={{ background: '#111122', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px 20px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', borderLeft: `4px solid ${course.theme_color || '#ff6b00'}` }}>

            {/* Glow */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '120px', height: '120px', background: course.theme_color || '#ff6b00', filter: 'blur(60px)', opacity: 0.12, pointerEvents: 'none' }} />

            {/* Tag */}
            {course.tag && (
              <div style={{ background: course.theme_color || '#ff6b00', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', display: 'inline-block', marginBottom: '12px', letterSpacing: '1px' }}>
                {course.tag === 'TRENDING' ? '🔥' : course.tag === 'NEW' ? '✨' : course.tag === 'PREMIUM' ? '⭐' : '📌'} {course.tag}
              </div>
            )}

            {/* Title */}
            <h2 style={{ fontFamily: 'Teko', fontSize: '24px', lineHeight: 1.1, margin: '0 0 8px 0', color: '#fff' }}>
              {course.title}
            </h2>

            {/* Students */}
            {course.students && (
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                👥 {course.students} Enrolled
              </div>
            )}

            {/* Price + CTA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <div>
                <span style={{ color: '#fff', fontSize: '22px', fontFamily: 'Orbitron', fontWeight: 900, lineHeight: 1 }}>₹{course.price}</span>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>One-time • Lifetime</div>
              </div>
              <button onClick={() => handleCourseClick(course)}
                style={{ background: `linear-gradient(135deg, ${course.theme_color || '#ff6b00'}, ${course.theme_color || '#ff9500'})`, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontFamily: 'Orbitron', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 15px ${course.theme_color || '#ff6b00'}44` }}>
                ENROLL ↗
              </button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Courses loading nahi hue. Baad mein try karo.
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'Rajdhani', fontWeight: 600 }}>
        100% Secure Checkout • Lifetime Access<br />
        Powered by Karmi Minds
      </div>
    </div>
  )
}