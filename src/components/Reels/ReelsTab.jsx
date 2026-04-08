import { useState, useEffect, useRef, useCallback } from 'react'
import { CATEGORIES, fetchReels } from '../../lib/youtube'

// ── Shuffle Array ─────────────────────────────────
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── AI Interest Tracking ──────────────────────────
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

// ── YouTube embed URL (Smart API Enabled) ────────
const embedUrl = (id) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&controls=0`

export default function ReelsTab({ portalSlug }) {
  const [category, setCategory] = useState('comedy')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  
  // Interactions State
  const [liked, setLiked] = useState({})
  const [saved, setSaved] = useState({})
  const [shareToast, setShareToast] = useState(false)
  const [swipeHint, setSwipeHint] = useState(() => !localStorage.getItem('mk_swipe'))

  const touchY = useRef(null)

  // ── Auto-hide Swipe Hint ───────────────────────
  useEffect(() => {
    if (swipeHint) {
      const timer = setTimeout(() => {
        setSwipeHint(false)
        localStorage.setItem('mk_swipe', '1')
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [swipeHint])

  // ── 1. Fetch & Local Storage Cache Logic ────────
  const loadVideos = useCallback(async (cat) => {
    setLoading(true)
    const cacheKey = `mk_reels_cache_${cat}`
    
    try {
      let vids = []
      const cachedData = localStorage.getItem(cacheKey)
      
      if (cachedData) {
        // Cache mil gaya -> API bacha li!
        vids = JSON.parse(cachedData)
      } else {
        // Cache nahi hai -> Cloudflare worker / YouTube API call karo
        const data = await fetchReels(cat)
        vids = data.videos || []
        if (vids.length > 0) {
          localStorage.setItem(cacheKey, JSON.stringify(vids))
        }
      }

      // Har bar shuffle karke dikhao fresh feel ke liye
      const sortedShuffledVids = applyAISort(shuffle(vids))
      setVideos(sortedShuffledVids)
      setCurrentIdx(0)
      
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { loadVideos(category) }, [category])

  // ── 2. Navigation Logic ─────────────────────────
  const goNext = useCallback(() => {
    setCurrentIdx(i => {
      const next = i + 1
      // Agar list khatam, to wapas shuffle karke loop chala do
      if (next >= videos.length) {
        setVideos(v => applyAISort(shuffle(v)))
        return 0
      }
      return next
    })
    if (videos[currentIdx]) updateInterest(videos[currentIdx].category || 'comedy', 'watch')
  }, [videos, currentIdx])

  const goPrev = useCallback(() => {
    setCurrentIdx(i => Math.max(0, i - 1))
  }, [])
  // ── Adsterra Native Banner Load Logic ────────
  useEffect(() => {
    // चेक करो कि स्क्रिप्ट पहले से लोड तो नहीं है (ताकि डबल ऐड ना दिखे)
    if (!document.getElementById('adsterra-native-script')) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.dataset.cfasync = 'false';
      script.id = 'adsterra-native-script';
      script.src = 'https://pl29099674.profitablecpmratenetwork.com/673333848ed16f2e00c502225c992db9/invoke.js';
      
      // स्क्रिप्ट को बॉडी में डाल दो
      document.body.appendChild(script);
    }
  }, []);

  // ── 3. Smart YouTube Auto-Play (PostMessage) ────
  useEffect(() => {
    // YouTube API hume message bhejti hai jab video khatam hoti hai
    const handleMessage = (e) => {
      if (e.origin !== "https://www.youtube-nocookie.com") return;
      try {
        const data = JSON.parse(e.data);
        // info: 0 ka matlab hai video "ENDED"
        if (data.event === 'onStateChange' && data.info === 0) {
          goNext(); // Automatically next reel par jao!
        }
      } catch (err) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [goNext]);

  // ── 4. Touch Swipe Overlay Logic ────────────────
  const onTouchStart = (e) => {
    touchY.current = e.touches[0].clientY
    if (swipeHint) { setSwipeHint(false); localStorage.setItem('mk_swipe', '1') }
  }
  const onTouchEnd = (e) => {
    if (touchY.current === null) return
    const diff = touchY.current - e.changedTouches[0].clientY
    if (diff > 50) goNext()
    else if (diff < -50) goPrev()
    touchY.current = null
  }

  // ── Share Logic ─────────────────────────────────
  const handleShare = async () => {
    const video = videos[currentIdx]
    const portalUrl = portalSlug ? `${window.location.origin}/${portalSlug}` : window.location.origin
    const msg = `🎬 "${(video?.title || 'Viral Reel').slice(0, 45)}..."\n\n🎮 Games khelo, 😂 Viral Reels dekho\n🗣️ English seekho — sab FREE mein!\n\n👉 ${portalUrl}`

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

  const video = videos[currentIdx]
  
  // ── 5. The "Karmi Minds" Promo Check ────────────
  // Har 5vi reel par apna video aayega (e.g., index 4, 9, 14...)
  const isPromoTime = currentIdx > 0 && (currentIdx + 1) % 5 === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--tab-h) - 57px)', background: '#000', userSelect: 'none', touchAction: 'none' }}>
      
      {/* 🟢 Category Filter */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, background: 'rgba(5,5,10,0.95)' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            style={{ background: category === cat.id ? 'linear-gradient(135deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: category === cat.id ? 'transparent' : 'rgba(255,255,255,0.08)', color: category === cat.id ? '#000' : '#9090b0', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Rajdhani', flexShrink: 0 }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* 🟢 Player Area */}
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
            <button className="btn-ghost" onClick={() => loadVideos(category)}>Try Again</button>
          </div>
        ) : (
          <>
            {/* INVISIBLE OVERLAY FOR SWIPE (Top 75%) */}
            <div 
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '25%', zIndex: 4 }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            />

            {/* 🟢 TIKTOK STYLE RENDERING (Promo vs YouTube) */}
            {isPromoTime ? (
              // 👑 TERA APNA VIDEO AD (Karmi Minds)
              <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0a0a' }}>
                <video 
                  src="/videos/english-course-promo.mp4" 
                  autoPlay 
                  playsInline 
                  loop 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Promo Overlay & CTA */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', zIndex: 5, pointerEvents: 'none' }}>
                  <h2 style={{ fontFamily: 'Teko', fontSize: 32, color: '#fff', marginBottom: 5, lineHeight: 1 }}>Speak English Like a Pro!</h2>
                  <p style={{ color: '#ff9500', fontSize: 14, fontWeight: 'bold', marginBottom: 15 }}>Karmi Minds Exclusive • Sirf ₹199</p>
                  <a 
                    href="https://karmiminds.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ pointerEvents: 'auto', background: 'linear-gradient(135deg, #ff6b00, #ff9500)', color: '#000', textAlign: 'center', padding: '12px', borderRadius: 8, fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase' }}
                  >
                    👉 Enroll Now
                  </a>
                </div>
              </div>
            ) : (
              // 📺 YOUTUBE IFRAME
              <iframe
                key={video.id}
                src={embedUrl(video.id)}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                allow="autoplay; encrypted-media; picture-in-picture"
                title={video.title || 'Reel'}
              />
            )}

            {/* Branding Logo */}
            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: 8, padding: '4px 10px', pointerEvents: 'none', zIndex: 6 }}>
              <span style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 900, color: '#f0f0ff' }}>MERI<span style={{ color: '#ff6b00' }}>KAMAI</span></span>
            </div>

            {/* Right Action Buttons (Hide during Promo) */}
            {!isPromoTime && (
              <div style={{ position: 'absolute', right: 12, bottom: 80, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', zIndex: 10 }}>
                <Btn icon={liked[video.id] ? '❤️' : '🤍'} label={liked[video.id] ? 'Liked' : 'Like'} active={liked[video.id]} onClick={() => { setLiked(l => ({ ...l, [video.id]: !l[video.id] })); updateInterest(video.category || 'comedy', 'like') }} />
                <Btn icon={saved[video.id] ? '🔖' : '📌'} label={saved[video.id] ? 'Saved' : 'Save'} active={saved[video.id]} onClick={() => setSaved(s => ({ ...s, [video.id]: !s[video.id] }))} />
                <Btn icon="📤" label="Share" onClick={handleShare} />
              </div>
            )}

            {/* Manual Next button */}
            <button onClick={goNext} style={{ position: 'absolute', bottom: isPromoTime ? 100 : 16, right: 12, background: 'linear-gradient(135deg,#ff6b00,#ff9500)', border: 'none', color: '#000', width: 44, height: 44, borderRadius: '50%', fontSize: 18, cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,107,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }}>↓</button>

            {/* Video Info (Hide during Promo) */}
            {!isPromoTime && (
              <div style={{ position: 'absolute', bottom: 20, left: 12, right: 70, zIndex: 6, pointerEvents: 'none' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.95)', fontWeight: 600, lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.9)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{video.channel}</p>
              </div>
            )}

            {/* Swipe hint */}
            {swipeHint && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 15 }}>
                <div style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', borderRadius: 16, padding: '16px 28px', textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>👆</div>
                  <div style={{ fontFamily: 'Teko', fontSize: 20, color: '#fff' }}>Swipe karo next reel ke liye</div>
                </div>
              </div>
            )}

            {/* Share toast */}
            {shareToast && (
              <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.9)', color: '#00ff88', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, zIndex: 20, textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                ✅ Link copied!
              </div>
            )}
          </>
        )}
      </div>

      {/* 🟢 Adsterra Native Banner Area (Always at the bottom, 100% Safe) */}
      <div style={{ height: '50px', background: '#0a0a0c', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, position: 'relative', zIndex: 20 }}>
        <span style={{ position: 'absolute', left: '10px', fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Ad</span>
        {/* Yahan Tera Adsterra ka Native Banner Script load hoga */}
        <div id="container-673333848ed16f2e00c502225c992db9" style={{ width: '100%', height: '50px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}></div>
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