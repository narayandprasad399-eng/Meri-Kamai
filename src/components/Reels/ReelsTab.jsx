import { useState, useEffect, useRef, useCallback } from 'react'
import { CATEGORIES, fetchReels } from '../../lib/youtube'

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const getInterest = () => JSON.parse(localStorage.getItem('mk_interest') || '{}')
const updateInterest = (cat, type) => {
  const d = getInterest()
  d[cat] = (d[cat] || 0) + (type === 'like' ? 4 : type === 'skip' ? -1 : 2)
  localStorage.setItem('mk_interest', JSON.stringify(d))
}
const applyAISort = (vids) => {
  const interest = getInterest()
  return [...vids].sort((a, b) => (interest[b.category] || 0) - (interest[a.category] || 0))
}
const PROMO_VIDEOS = [
  '/videos/promo-english.mp4',
  '/videos/promo-10th-board.mp4',
  '/videos/promo-earn-money.mp4'
];
// ── KARMI MINDS COURSES ──────────────────────────
const COURSES = [
  { 
    id: 1, 
    title: '🗣️ Speak English Like a Pro!', 
    desc: 'Confidence badhao, ₹199 mein', 
    link: 'https://karmiminds.pages.dev', 
    bg: 'linear-gradient(135deg, #ff6b00, #ff9500)', 
    text: '#000' 
  },
  { 
    id: 2, 
    title: '📚 Score 90%+ in 10th Boards', 
    desc: 'Smart study & mind-training secrets', 
    link: 'https://karmiminds.pages.dev', 
    bg: 'linear-gradient(135deg, #23d160, #00b84c)', 
    text: '#000' 
  },
  { 
    id: 3, 
    title: '💸 Earn Money Online', 
    desc: 'Book reviews se paise kamana seekho', 
    link: 'https://karmiminds.com', 
    bg: 'linear-gradient(135deg, #3273dc, #1d5ec5)', 
    text: '#fff' 
  }
];

// mute=0 — sound on by default, user ne interact kiya toh browser allow karega
const embedUrl = (id) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&color=white`

export default function ReelsTab({ portalSlug }) {
  const [category, setCategory] = useState('comedy')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [liked, setLiked] = useState({})
  const [saved, setSaved] = useState({})
  const [shareToast, setShareToast] = useState(false)
  const [swipeHint, setSwipeHint] = useState(() => !localStorage.getItem('mk_swipe'))

  // Sound state — pehli baar muted, user tap kare toh unmute
  const [userInteracted, setUserInteracted] = useState(false)
  const [showSoundBtn, setShowSoundBtn] = useState(true)

  const touchY = useRef(null)
  const touchStartX = useRef(null)

  useEffect(() => {
    if (swipeHint) {
      const timer = setTimeout(() => {
        setSwipeHint(false)
        localStorage.setItem('mk_swipe', '1')
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [swipeHint])

  const loadVideos = useCallback(async (cat) => {
    setLoading(true)
    const cacheKey = `mk_reels_cache_${cat}`
    try {
      let vids = []
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData) {
        vids = JSON.parse(cachedData)
      } else {
        const data = await fetchReels(cat)
        vids = data.videos || []
        if (vids.length > 0) localStorage.setItem(cacheKey, JSON.stringify(vids))
      }
      setVideos(applyAISort(shuffle(vids)))
      setCurrentIdx(0)
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { loadVideos(category) }, [category])

  // Naya video aane pe sound button wapas dikhao sirf agar user ne abhi interact nahi kiya
  useEffect(() => {
    if (!userInteracted) setShowSoundBtn(true)
  }, [currentIdx])

  const goNext = useCallback(() => {
    const currentCount = parseInt(localStorage.getItem('mk_reels_watched') || '0')
    localStorage.setItem('mk_reels_watched', (currentCount + 1).toString())
    setCurrentIdx(i => {
      const next = i + 1
      if (next >= videos.length) {
        setVideos(v => applyAISort(shuffle(v)))
        return 0
      }
      return next
    })
    if (videos[currentIdx]) updateInterest(videos[currentIdx].category || 'comedy', 'watch')
  }, [videos, currentIdx])

  const goPrev = useCallback(() => setCurrentIdx(i => Math.max(0, i - 1)), [])

  // YouTube postMessage — video end pe auto next
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.origin !== 'https://www.youtube-nocookie.com') return
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        if (data.event === 'onStateChange' && data.info === 0) goNext()
      } catch (err) {}
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [goNext])

  // Touch — overlay sirf upar hai, neeche 25% open hai taaki user player tap kar sake
  const onTouchStart = (e) => {
    touchY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
    if (swipeHint) { setSwipeHint(false); localStorage.setItem('mk_swipe', '1') }
  }

  const onTouchEnd = (e) => {
    if (touchY.current === null) return
    const diffY = touchY.current - e.changedTouches[0].clientY
    const diffX = Math.abs(touchStartX.current - e.changedTouches[0].clientX)
    // Sirf vertical swipe count karo, horizontal ignore
    if (Math.abs(diffY) > diffX) {
      if (diffY > 50) goNext()
      else if (diffY < -50) goPrev()
    }
    touchY.current = null
  }

  const handleShare = async () => {
    const video = videos[currentIdx]
    const portalUrl = portalSlug ? `${window.location.origin}/${portalSlug}` : window.location.origin
    const msg = `🎬 "${(video?.title || 'Viral Reel').slice(0, 45)}..."\n\n😂 Viral Reels dekho — FREE!\n\n👉 ${portalUrl}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'MeriKamai', text: msg, url: portalUrl })
      } else {
        await navigator.clipboard.writeText(msg)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2000)
      }
    } catch (e) {}
  }

  const handleSoundTap = () => {
    setUserInteracted(true)
    setShowSoundBtn(false)
    // iframe ko reload karo mute=0 ke saath — ab browser allow karega kyunki user ne tap kiya
    setCurrentIdx(i => i) // force re-render with same index
  }

  const video = videos[currentIdx]
  // चेक करो कि क्या प्रोमो का टाइम है
  const isPromoTime = currentIdx > 0 && (currentIdx + 1) % 5 === 0;

// कौन सा प्रोमो दिखाना है? (0, 1, 2 के बीच घूमता रहेगा)
  const activePromoIndex = Math.floor(currentIdx / 5) % PROMO_VIDEOS.length;
  const activeCourse = COURSES[activePromoIndex]; // जो वीडियो, उसी का टेक्स्ट

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--tab-h) - 57px)', background: '#000', userSelect: 'none', touchAction: 'none' }}>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, background: 'rgba(5,5,10,0.95)' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            style={{ background: category === cat.id ? 'linear-gradient(135deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: category === cat.id ? 'transparent' : 'rgba(255,255,255,0.08)', color: category === cat.id ? '#000' : '#9090b0', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Rajdhani', flexShrink: 0 }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Player Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(255,107,0,0.2)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: '#9090b0', fontSize: 14 }}>Reels load ho rahi hain...</div>
          </div>
        ) : !video && !isPromoTime ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 40 }}>😕</div>
            <div style={{ fontFamily: 'Teko', fontSize: 22, color: '#fff' }}>No reels found</div>
            <button onClick={() => loadVideos(category)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 20px', borderRadius: 8, cursor: 'pointer' }}>Try Again</button>
          </div>
        ) : (
          <>
            {/* 
              Overlay sirf top 75% pe — neeche 25% open taaki 
              user player ke controls tak pahunch sake aur sound on kar sake 
            */}
            <div
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '75%', zIndex: 4 }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            />

            {isPromoTime ? (
              <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0a0a' }}>
                
                {/* Sponsored Badge */}
                <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 4, zIndex: 10, border: '1px solid rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  Sponsored
                </div>

                {/* डायनामिक वीडियो सोर्स */}
                <video
                  src={PROMO_VIDEOS[activePromoIndex]}
                  autoPlay
                  playsInline
                  loop
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* डायनामिक टेक्स्ट और लिंक */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 20, background: 'linear-gradient(to top, rgba(0,0,0,0.88), transparent)', zIndex: 5, pointerEvents: 'none' }}>
                  <h2 style={{ fontFamily: 'Teko', fontSize: 32, color: '#fff', marginBottom: 5, lineHeight: 1 }}>{activeCourse.title}</h2>
                  <p style={{ color: '#ff9500', fontSize: 14, fontWeight: 'bold', marginBottom: 15 }}>Karmi Minds Exclusive • {activeCourse.desc}</p>
                  <a
                    href={activeCourse.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ pointerEvents: 'auto', background: activeCourse.bg, color: activeCourse.text, textAlign: 'center', padding: 12, borderRadius: 8, fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', fontSize: 14 }}>
                    👉 Enroll Now
                  </a>
                </div>

                {/* स्वाइप करने के लिए नीचे वाला बटन */}
                <button onClick={goNext} style={{ position: 'absolute', bottom: 100, right: 12, background: 'linear-gradient(135deg,#ff6b00,#ff9500)', border: 'none', color: '#000', width: 44, height: 44, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }}>↓</button>
              </div>

            ) : (
              <>
                <iframe
                  key={`${video.id}-${userInteracted}`}
                  src={embedUrl(video.id)}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  title={video.title || 'Reel'}
                />

                {/* Sound Button — pehli baar tap karne tak dikhega */}
                {showSoundBtn && (
                  <button
                    onClick={handleSoundTap}
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: 64, height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 8, gap: 2 }}>
                    <span style={{ fontSize: 24, lineHeight: 1 }}>🔇</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontFamily: 'Rajdhani' }}>TAP FOR SOUND</span>
                  </button>
                )}
              </>
            )}

            {/* Branding badge */}
            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: 8, padding: '4px 10px', pointerEvents: 'none', zIndex: 6 }}>
              <span style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 900, color: '#f0f0ff' }}>
                MERI<span style={{ color: '#ff6b00' }}>KAMAI</span>
              </span>
            </div>

            {/* Action buttons — sirf normal reels pe */}
            {!isPromoTime && (
              <div style={{ position: 'absolute', right: 12, bottom: 80, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', zIndex: 10 }}>
                <Btn icon={liked[video?.id] ? '❤️' : '🤍'} label={liked[video?.id] ? 'Liked' : 'Like'} active={liked[video?.id]}
                  onClick={() => { setLiked(l => ({ ...l, [video.id]: !l[video.id] })); updateInterest(video.category || 'comedy', 'like') }} />
                <Btn icon={saved[video?.id] ? '🔖' : '📌'} label={saved[video?.id] ? 'Saved' : 'Save'} active={saved[video?.id]}
                  onClick={() => setSaved(s => ({ ...s, [video.id]: !s[video.id] }))} />
                <Btn icon="📤" label="Share" onClick={handleShare} />
              </div>
            )}

            {/* Next button */}
            {!isPromoTime && (
              <button onClick={goNext} style={{ position: 'absolute', bottom: 16, right: 12, background: 'linear-gradient(135deg,#ff6b00,#ff9500)', border: 'none', color: '#000', width: 44, height: 44, borderRadius: '50%', fontSize: 18, cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,107,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }}>↓</button>
            )}

            {/* Video title + channel */}
            {!isPromoTime && video && (
              <div style={{ position: 'absolute', bottom: 20, left: 12, right: 70, zIndex: 6, pointerEvents: 'none' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.95)', fontWeight: 600, lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.9)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{video.title}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, margin: '4px 0 0' }}>{video.channel}</p>
              </div>
            )}

            {/* Swipe hint */}
            {swipeHint && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', borderRadius: 12, padding: '12px 20px', zIndex: 20, textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 28 }}>👆</div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Rajdhani', marginTop: 4 }}>Swipe up for next reel</div>
              </div>
            )}
            {/* 🟢 APNA NATIVE COURSE BANNER (Rotates dynamically) */}
      <div 
        onClick={() => window.open(COURSES[currentIdx % COURSES.length].link, '_blank')} 
        style={{ 
          height: '56px', 
          background: COURSES[currentIdx % COURSES.length].bg, 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 16px', 
          flexShrink: 0, 
          position: 'relative', 
          zIndex: 20, 
          cursor: 'pointer',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: COURSES[currentIdx % COURSES.length].text, fontFamily: 'Rajdhani', letterSpacing: '0.5px' }}>
            {COURSES[currentIdx % COURSES.length].title}
          </span>
          <span style={{ fontSize: '11px', color: COURSES[currentIdx % COURSES.length].text, opacity: 0.85, fontWeight: 600 }}>
            {COURSES[currentIdx % COURSES.length].desc}
          </span>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.15)', color: COURSES[currentIdx % COURSES.length].text, padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
          Explore ↗
        </div>
      </div>

            {/* Share toast */}
            {shareToast && (
              <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,107,0,0.9)', color: '#000', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, zIndex: 20, whiteSpace: 'nowrap' }}>
                Link copied! ✓
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Btn({ icon, label, onClick, active }) {
  return (
    <button onClick={onClick} style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', border: `1px solid ${active ? 'rgba(255,107,0,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', minWidth: 46, transition: 'all 0.15s', transform: active ? 'scale(1.12)' : 'scale(1)' }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 9, color: active ? '#ff9500' : 'rgba(255,255,255,0.65)', fontWeight: 700, fontFamily: 'Rajdhani' }}>{label}</span>
    </button>
  )
}