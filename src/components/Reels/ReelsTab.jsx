import { useState, useEffect, useRef, useCallback } from 'react'
import { CATEGORIES, fetchReels } from '../../lib/youtube'
import { shouldShowAd, AD_CONFIG } from '../../lib/ads'

// ── Shuffle ──────────────────────────────────────
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── AI Interest (localStorage) ───────────────────
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

// ── YouTube embed URL (policy safe) ──────────────
const embedUrl = (id, autoplay = 1) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay}&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`

// ── Thumbnail preload (no iframe) ────────────────
const preloadThumb = (id) => {
  if (!id) return
  const img = new Image()
  img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

const AUTO_SEC = 45

export default function ReelsTab({ portalSlug }) {
  const [category, setCategory] = useState('comedy')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [adState, setAdState] = useState(null)
  const [adTimer, setAdTimer] = useState(0)
  const [autoSec, setAutoSec] = useState(AUTO_SEC)
  const [liked, setLiked] = useState({})
  const [saved, setSaved] = useState({})
  const [shareToast, setShareToast] = useState(false)
  const [swipeHint, setSwipeHint] = useState(() => !localStorage.getItem('mk_swipe'))

  const touchY = useRef(null)
  const adTimer$ = useRef(null)
  const auto$ = useRef(null)

  // ── Load videos ───────────────────────────────
  const loadVideos = useCallback(async (cat) => {
    setLoading(true)
    try {
      const data = await fetchReels(cat)
      const vids = applyAISort(shuffle(data.videos || []))
      setVideos(vids)
      setCurrentIdx(0)
      if (vids[1]) preloadThumb(vids[1].id)
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { loadVideos(category) }, [category])

  // ── Auto countdown ─────────────────────────────
  const resetAuto = useCallback(() => {
    clearInterval(auto$.current)
    setAutoSec(AUTO_SEC)
    auto$.current = setInterval(() => {
      setAutoSec(s => {
        if (s <= 1) { goNext(); return AUTO_SEC }
        return s - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    if (loading || adState || !videos.length) return
    resetAuto()
    return () => clearInterval(auto$.current)
  }, [currentIdx, loading, adState, videos.length])

  // ── Navigation ────────────────────────────────
  const goNext = useCallback(() => {
    clearInterval(auto$.current)
    const adType = shouldShowAd()
    if (adType) {
      const dur = adType === 'long' ? AD_CONFIG.longAdDuration : AD_CONFIG.shortAdDuration
      setAdState(adType); setAdTimer(dur)
      return
    }
    setCurrentIdx(i => {
      const next = i + 1
      if (next >= videos.length) {
        setVideos(v => applyAISort(shuffle(v)))
        return 0
      }
      if (videos[next + 1]) preloadThumb(videos[next + 1].id)
      return next
    })
    if (videos[currentIdx]) updateInterest(videos[currentIdx].category || 'comedy', 'watch')
  }, [videos, currentIdx])

  const goPrev = useCallback(() => {
    clearInterval(auto$.current)
    setCurrentIdx(i => Math.max(0, i - 1))
    resetAuto()
  }, [resetAuto])

  // ── Ad countdown ──────────────────────────────
  useEffect(() => {
    if (!adState) return
    adTimer$.current = setInterval(() => {
      setAdTimer(t => {
        if (t <= 1) {
          clearInterval(adTimer$.current)
          setAdState(null)
          setCurrentIdx(i => {
            const next = i + 1
            if (next >= videos.length) { setVideos(v => applyAISort(shuffle(v))); return 0 }
            return next
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(adTimer$.current)
  }, [adState])

  // ── Buffer fetch ──────────────────────────────
  useEffect(() => {
    if (currentIdx > 0 && currentIdx >= videos.length - 5) {
      fetchReels(category).then(data => {
        const newVids = applyAISort(shuffle(data.videos || []))
        setVideos(v => {
          const existingIds = new Set(v.map(x => x.id))
          const unique = newVids.filter(x => !existingIds.has(x.id))
          return [...v, ...unique]
        })
      }).catch(() => {})
    }
  }, [currentIdx, videos.length, category])

  // ── Touch swipe ───────────────────────────────
  const onTouchStart = (e) => {
    touchY.current = e.touches[0].clientY
    // Swipe hint hide karo
    if (swipeHint) { setSwipeHint(false); localStorage.setItem('mk_swipe', '1') }
  }
  const onTouchEnd = (e) => {
    if (touchY.current === null) return
    const diff = touchY.current - e.changedTouches[0].clientY
    if (diff > 50) goNext()
    else if (diff < -50) goPrev()
    touchY.current = null
  }

  // ── Share ─────────────────────────────────────
  const handleShare = async () => {
    const video = videos[currentIdx]
    const portalUrl = portalSlug
      ? `${window.location.origin}/${portalSlug}`
      : window.location.origin

    const msg = `🎬 "${(video?.title || 'Viral Reel').slice(0, 45)}..."

🎮 Games khelo, 😂 Viral Reels dekho
🗣️ English seekho — sab FREE mein!

👉 ${portalUrl}

#MeriKamai #FreeGames #ViralReels`

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Meri Kamai', text: msg, url: portalUrl })
      } else {
        await navigator.clipboard.writeText(msg)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2000)
      }
    } catch (e) {}
  }

  // ── Ad screen ─────────────────────────────────
  if (adState) {
    return (
      <div style={{ height: 'calc(100vh - var(--tab-h) - 57px)', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 700, color: '#fff' }}>
          Ad {adTimer}s
        </div>
        <div style={{ width: 300, background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 16, padding: '28px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🗣️</div>
          <div style={{ fontFamily: 'Teko', fontSize: 26, color: '#fff', marginBottom: 8 }}>Speak English<br />Like a Pro!</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>Sirf ₹199 mein — Karmi Minds</div>
          <a href="https://karmiminds.com" target="_blank" rel="noopener noreferrer" className="btn-main" style={{ fontSize: 15, padding: '10px 24px' }}>Abhi Dekho →</a>
        </div>
        <div style={{ position: 'absolute', bottom: 20, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Advertisement</div>
      </div>
    )
  }

  const video = videos[currentIdx]  // ✅ SIRF EK VIDEO RENDER

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--tab-h) - 57px)', background: '#000', userSelect: 'none', touchAction: 'none' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, background: 'rgba(5,5,10,0.95)' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            style={{ background: category === cat.id ? 'linear-gradient(135deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: category === cat.id ? 'transparent' : 'rgba(255,255,255,0.08)', color: category === cat.id ? '#000' : '#9090b0', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Rajdhani', flexShrink: 0 }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Player area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(255,107,0,0.2)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: '#9090b0', fontSize: 14, fontFamily: 'Rajdhani' }}>Reels load ho rahi hain...</div>
          </div>
        ) : !video ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 40 }}>😕</div>
            <div style={{ fontFamily: 'Teko', fontSize: 22, color: '#fff' }}>No reels found</div>
            <button className="btn-ghost" onClick={() => loadVideos(category)}>Try Again</button>
          </div>
        ) : (
          <>
            {/* ✅ SIRF 1 IFRAME — key se force reload on change */}
            <iframe
              key={video.id}
              src={embedUrl(video.id, 1)}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title={video.title || 'Reel'}
            />

            {/* Auto progress bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.1)', zIndex: 5 }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#ff6b00,#ff9500)', width: `${((AUTO_SEC - autoSec) / AUTO_SEC) * 100}%`, transition: 'width 1s linear' }} />
            </div>

            {/* Branding — iframe ke BAHAR, pointerEvents:none (policy safe) */}
            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: 8, padding: '4px 10px', pointerEvents: 'none', zIndex: 6 }}>
              <span style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 900, color: '#f0f0ff' }}>
                MERI<span style={{ color: '#ff6b00' }}>KAMAI</span>
              </span>
              {portalSlug && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>/{portalSlug}</span>}
            </div>

            {/* Auto timer badge */}
            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '3px 10px', borderRadius: 10, fontSize: 11, color: 'rgba(255,255,255,0.6)', zIndex: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff6b00', animation: 'pulse 1s infinite', display: 'inline-block' }} />
              {autoSec}s
            </div>

            {/* Right action buttons */}
            <div style={{ position: 'absolute', right: 12, bottom: 80, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', zIndex: 10 }}>
              <Btn icon={liked[video.id] ? '❤️' : '🤍'} label={liked[video.id] ? 'Liked' : 'Like'} active={liked[video.id]}
                onClick={() => { setLiked(l => ({ ...l, [video.id]: !l[video.id] })); updateInterest(video.category || 'comedy', 'like') }} />
              <Btn icon={saved[video.id] ? '🔖' : '📌'} label={saved[video.id] ? 'Saved' : 'Save'} active={saved[video.id]}
                onClick={() => setSaved(s => ({ ...s, [video.id]: !s[video.id] }))} />
              <Btn icon="📤" label="Share" onClick={handleShare} />
            </div>

            {/* Next button */}
            <button onClick={goNext} style={{ position: 'absolute', bottom: 16, right: 12, background: 'linear-gradient(135deg,#ff6b00,#ff9500)', border: 'none', color: '#000', width: 44, height: 44, borderRadius: '50%', fontSize: 18, cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,107,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }}>↓</button>

            {/* Video info */}
            <div style={{ position: 'absolute', bottom: 70, left: 12, right: 70, zIndex: 6, pointerEvents: 'none' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600, lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.9)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{video.channel}</p>
            </div>

            {/* Swipe hint */}
            {swipeHint && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 15 }}>
                <div style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', borderRadius: 16, padding: '16px 28px', textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>👆</div>
                  <div style={{ fontFamily: 'Teko', fontSize: 20, color: '#fff' }}>Swipe karo next reel ke liye</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Ya ↓ button dabao</div>
                </div>
              </div>
            )}

            {/* Share toast */}
            {shareToast && (
              <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.9)', color: '#00ff88', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, zIndex: 20, textAlign: 'center', backdropFilter: 'blur(8px)', whiteSpace: 'nowrap' }}>
                ✅ Link copied!
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Ab WhatsApp pe share karo 📤</div>
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
    <button onClick={onClick}
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', border: `1px solid ${active ? 'rgba(255,107,0,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', minWidth: 46, transition: 'all 0.15s', transform: active ? 'scale(1.12)' : 'scale(1)' }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 9, color: active ? '#ff9500' : 'rgba(255,255,255,0.65)', fontWeight: 700, fontFamily: 'Rajdhani' }}>{label}</span>
    </button>
  )
}
