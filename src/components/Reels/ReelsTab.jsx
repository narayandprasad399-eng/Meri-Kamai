import { useState, useEffect, useRef, useCallback } from 'react'
import { CATEGORIES, fetchReels, getEmbedUrl } from '../../lib/youtube'
import { shouldShowAd, AD_CONFIG } from '../../lib/ads'

// ── Shuffle helper ──────────────────────────────
const shuffleArray = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Auto-advance timer (seconds) ────────────────
const AUTO_ADVANCE_SEC = 60  // 60 sec baad auto next

export default function ReelsTab({ portalSlug }) {
  const [category, setCategory] = useState('comedy')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [adState, setAdState] = useState(null)
  const [adTimer, setAdTimer] = useState(0)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [autoTimer, setAutoTimer] = useState(AUTO_ADVANCE_SEC)
  const [liked, setLiked] = useState({})
  const [saved, setSaved] = useState({})
  const [shareToast, setShareToast] = useState(false)

  const adRef = useRef(null)
  const autoRef = useRef(null)

  // ── Load + shuffle videos ──────────────────────
  const loadVideos = useCallback(async (cat) => {
    setLoading(true)
    const data = await fetchReels(cat)
    // Frontend shuffle — same 20 videos, alag order har baar
    const shuffled = shuffleArray(data.videos || [])
    setVideos(shuffled)
    setCurrentIdx(0)
    setAutoTimer(AUTO_ADVANCE_SEC)
    setLoading(false)
  }, [])

  useEffect(() => { loadVideos(category) }, [category])

  // ── Auto-advance countdown ─────────────────────
  useEffect(() => {
    if (loading || adState || videos.length === 0) return
    clearInterval(autoRef.current)
    setAutoTimer(AUTO_ADVANCE_SEC)
    autoRef.current = setInterval(() => {
      setAutoTimer(t => {
        if (t <= 1) { goNext(); return AUTO_ADVANCE_SEC }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(autoRef.current)
  }, [currentIdx, loading, adState, videos.length])

  // ── Touch/swipe detection ──────────────────────
  const touchStartY = useRef(null)

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return
    const diff = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()       // swipe up → next
      else goPrev()                // swipe down → prev
    }
    touchStartY.current = null
  }

  // ── Navigation ────────────────────────────────
  const goNext = () => {
    clearInterval(autoRef.current)
    const adType = shouldShowAd()
    if (adType) {
      const dur = adType === 'long' ? AD_CONFIG.longAdDuration : AD_CONFIG.shortAdDuration
      setAdState(adType)
      setAdTimer(dur)
    } else {
      setCurrentIdx(i => {
        const next = i + 1
        if (next >= videos.length) {
          // List khatam → reshuffle karo
          setVideos(v => shuffleArray(v))
          return 0
        }
        return next
      })
    }
  }

  const goPrev = () => {
    clearInterval(autoRef.current)
    setCurrentIdx(i => Math.max(0, i - 1))
    setAutoTimer(AUTO_ADVANCE_SEC)
  }

  // ── Ad countdown ──────────────────────────────
  useEffect(() => {
    if (!adState) return
    adRef.current = setInterval(() => {
      setAdTimer(t => {
        if (t <= 1) {
          clearInterval(adRef.current)
          setAdState(null)
          setCurrentIdx(i => {
            const next = i + 1
            if (next >= videos.length) { setVideos(v => shuffleArray(v)); return 0 }
            return next
          })
          setAutoTimer(AUTO_ADVANCE_SEC)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(adRef.current)
  }, [adState])

  // ── Share function ─────────────────────────────
  const handleShare = async (video) => {
    const portalUrl = portalSlug
      ? `${window.location.origin}/${portalSlug}`
      : window.location.href

    const message = `🎬 "${video?.title?.slice(0, 40) || 'Viral Reel'}"

🎮 Games khelo, 😂 Viral Reels dekho, 🗣️ English seekho — sab FREE mein!

👉 ${portalUrl}

#MeriKamai #Games #Reels #FreeEntertainment`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meri Kamai', text: message, url: portalUrl })
      } catch (e) { }
    } else {
      await navigator.clipboard.writeText(message)
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2500)
    }
  }

  // ── Branding watermark (YouTube policy safe) ──
  // Note: Sirf iframe ke BAHAR lagaya hai — player ko touch nahi kiya
  const BrandingOverlay = () => (
    <div style={{
      position: 'absolute',
      top: '12px',
      left: '12px',
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(4px)',
      borderRadius: '8px',
      padding: '4px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      pointerEvents: 'none',  // clicks block nahi honge
      zIndex: 5,
    }}>
      <span style={{ fontFamily: 'Orbitron', fontSize: '11px', fontWeight: 900, color: '#f0f0ff', letterSpacing: '0.5px' }}>
        MERI<span style={{ color: '#ff6b00' }}>KAMAI</span>
      </span>
      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>
        {portalSlug ? `/${portalSlug}` : ''}
      </span>
    </div>
  )

  // ── Ad Screen ─────────────────────────────────
  if (adState) {
    return (
      <div style={{ height: 'calc(100vh - var(--tab-h) - 57px)', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
          Ad {adTimer}s
        </div>
        <div style={{ width: '320px', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '16px', padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '44px' }}>🗣️</div>
          <div style={{ fontFamily: 'Teko', fontSize: '26px', fontWeight: 700, color: '#fff' }}>Speak English<br />Like a Pro!</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Sirf ₹199 mein — Karmi Minds</div>
          <a href="https://karmiminds.com" target="_blank" rel="noopener noreferrer" className="btn-main" style={{ fontSize: '15px', padding: '10px 24px' }}>
            Abhi Dekho →
          </a>
        </div>
        <div style={{ position: 'absolute', bottom: '30px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Advertisement</div>
      </div>
    )
  }

  const current = videos[currentIdx]

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--tab-h) - 57px)', userSelect: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '8px', padding: '10px 16px', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)} style={{ background: category === cat.id ? 'linear-gradient(135deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: category === cat.id ? 'transparent' : 'rgba(255,255,255,0.08)', color: category === cat.id ? '#000' : '#9090b0', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Rajdhani', transition: 'all 0.2s' }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Video area */}
      <div style={{ flex: 1, position: 'relative', background: '#000' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,107,0,0.2)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: 'var(--text2)', fontSize: '14px' }}>Reels load ho rahi hain...</div>
          </div>
        ) : current ? (
          <>
            {/* YouTube iframe — policy ke hisaab se untouched */}
            <iframe
              key={current.id}
              src={getEmbedUrl(current.id)}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture"
              allowFullScreen
              title={current.title}
            />

            {/* ── Branding (iframe ke bahar, policy safe) ── */}
            <BrandingOverlay />

            {/* ── Auto timer progress bar (top) ── */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.1)', zIndex: 4 }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#ff6b00,#ff9500)', transition: 'width 1s linear', width: `${((AUTO_ADVANCE_SEC - autoTimer) / AUTO_ADVANCE_SEC) * 100}%` }} />
            </div>

            {/* ── Right side action buttons ── */}
            <div style={{ position: 'absolute', right: '12px', bottom: '80px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', zIndex: 10 }}>

              {/* Like */}
              <ActionBtn
                icon={liked[current.id] ? '❤️' : '🤍'}
                label={liked[current.id] ? 'Liked!' : 'Like'}
                active={liked[current.id]}
                onClick={() => setLiked(l => ({ ...l, [current.id]: !l[current.id] }))}
              />

              {/* Save */}
              <ActionBtn
                icon={saved[current.id] ? '🔖' : '📌'}
                label={saved[current.id] ? 'Saved!' : 'Save'}
                active={saved[current.id]}
                onClick={() => setSaved(s => ({ ...s, [current.id]: !s[current.id] }))}
              />

              {/* Share — portal URL share hoga */}
              <ActionBtn
                icon="📤"
                label="Share"
                onClick={() => handleShare(current)}
              />

            </div>

            {/* ── Next button (optional, swipe already works) ── */}
            <button
              onClick={goNext}
              style={{ position: 'absolute', bottom: '20px', right: '12px', background: 'linear-gradient(135deg,#ff6b00,#ff9500)', border: 'none', color: '#000', width: '44px', height: '44px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,107,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }}
            >
              ↓
            </button>

            {/* ── Video info (bottom left) ── */}
            <div style={{ position: 'absolute', bottom: '20px', left: '12px', right: '70px', zIndex: 10 }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: 600, lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.8)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {current.title}
              </p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                {current.channel}
              </p>
            </div>

            {/* ── Auto timer badge ── */}
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff6b00', animation: 'pulse 1s infinite', display: 'inline-block' }} />
              {autoTimer}s
            </div>

            {/* ── Swipe hint (first time) ── */}
            <SwipeHint />

            {/* ── Share toast ── */}
            {shareToast && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.85)', color: '#00ff88', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, zIndex: 20, textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                ✅ Link copied!<br />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Ab share karo 📤</span>
              </div>
            )}
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: 'var(--text2)' }}>
            <div style={{ fontSize: '40px' }}>😕</div>
            <div style={{ fontFamily: 'Teko', fontSize: '22px' }}>No reels found</div>
            <button className="btn-ghost" onClick={() => loadVideos(category)}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Action Button Component ─────────────────────
function ActionBtn({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', border: active ? '1px solid rgba(255,107,0,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer', minWidth: '44px', transition: 'all 0.2s', transform: active ? 'scale(1.1)' : 'scale(1)' }}
    >
      <span style={{ fontSize: '22px', lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: '9px', color: active ? '#ff9500' : 'rgba(255,255,255,0.7)', fontWeight: 700, fontFamily: 'Rajdhani' }}>{label}</span>
    </button>
  )
}

// ── Swipe hint (ek baar dikhao) ────────────────
function SwipeHint() {
  const [show, setShow] = useState(() => !localStorage.getItem('mk_swipe_seen'))

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => {
      setShow(false)
      localStorage.setItem('mk_swipe_seen', '1')
    }, 2500)
    return () => clearTimeout(t)
  }, [show])

  if (!show) return null

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 15 }}>
      <div style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '16px 24px', textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
        <div style={{ fontSize: '32px', marginBottom: '6px' }}>👆</div>
        <div style={{ fontFamily: 'Teko', fontSize: '20px', color: '#fff' }}>Swipe Up for Next Reel</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Ya ↓ button dabao</div>
      </div>
    </div>
  )
}
