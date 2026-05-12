import { useState, useEffect } from 'react'

const WORKER_URL = import.meta.env.VITE_WORKER_URL
// 🚀 Karmi Minds ka base URL jahan images host hain
const KARMI_BASE = "https://karmiminds.pages.dev";

export default function CourseArea({ portal }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${KARMI_BASE}/courses/index.json`)
      .then(r => r.json())
      .then(data => {
        setCourses(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleCourseClick = async (course) => {
    // 1. Analytics Track Karo (Clean syntax bina invalid characters ke)
    if (portal?.slug && portal.slug !== 'demo') {
      try {
        await fetch(`${WORKER_URL}/portal/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: portal.slug, type: 'course_clicks' })
        })
      } catch (error) {
        // Silently ignore if analytics fail
      }
    }

    // 2. Redirect to Karmi Minds
    if (!portal || portal.slug === 'demo') {
      window.open('https://karmiminds.pages.dev/app', '_blank')
      return
    }

    const karmiUrl = `https://karmiminds.pages.dev/app?ref=${portal.slug}&course=${course.id}`
    window.open(karmiUrl, '_blank')
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading Courses...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 🎬 FOUNDER VISION VIDEO SECTION */}
      <div style={{ background: '#1e293b', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '32px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
          {/* 🔴 YAHAN APNI YOUTUBE VIDEO KA ID DAALNA (Jaise 'dQw4w9WgXcQ') */}
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE?rel=0&modestbranding=1" 
            title="Karmi Minds Vision" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0 }}
          ></iframe>
        </div>
        <div style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', fontFamily: 'Orbitron', letterSpacing: '2px', marginBottom: '8px' }}>
            KARMI <span style={{ color: '#3b82f6' }}>MINDS</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#94a3b8', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Master your mind. Upgrade your life.
          </p>
        </div>
      </div>

      {/* 📚 COURSES LIST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {courses.map(course => (
          <div key={course.id} style={{ background: '#1e293b', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Course Banner */}
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
              {course.banner ? (
                <img 
                  src={`${KARMI_BASE}${course.banner}`} 
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none' }} 
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${course.theme_color || '#3b82f6'}22, transparent)`, color: course.theme_color || '#3b82f6', fontSize: '40px' }}>
                  📚
                </div>
              )}
              {course.tag && (
                <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)' }}>
                  {course.tag}
                </span>
              )}
            </div>

            {/* Course Details */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginBottom: '8px', fontFamily: 'Orbitron' }}>{course.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
                {course.hook_description || "Is course ke sath apni skills ko upgrade karo aur career mein grow karo."}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                <div>
                  <span style={{ color: '#fff', fontSize: '22px', fontFamily: 'Orbitron', fontWeight: 900, lineHeight: 1 }}>
                    {course.price === 0 ? "FREE" : `₹${course.price}`}
                  </span>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>
                    {course.price === 0 ? "Limited Time Access" : "One-time"}
                  </div>
                </div>
                <button onClick={() => handleCourseClick(course)}
                  style={{ background: `linear-gradient(135deg, ${course.theme_color || '#3b82f6'}, ${course.theme_color || '#2563eb'})`, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontFamily: 'Orbitron', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 15px ${course.theme_color || '#3b82f6'}44` }}>
                  {course.price === 0 ? "START ↗" : "ENROLL ↗"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Courses abhi available nahi hain.
        </div>
      )}
    </div>
  )
}