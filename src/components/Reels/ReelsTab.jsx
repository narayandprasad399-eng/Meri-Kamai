import { useState, useEffect, useRef, useCallback } from 'react'
import { CATEGORIES, fetchReels, getEmbedUrl } from '../../lib/youtube'
import { shouldShowAd, AD_CONFIG } from '../../lib/ads'

export default function ReelsTab() {
  const [category, setCategory] = useState('comedy')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [adState, setAdState] = useState(null) // null | 'short' | 'long'
  const [adTimer, setAdTimer] = useState(0)
  const [currentIdx, setCurrentIdx] = useState(0)
  const timerRef = useRef(null)

  // Videos fetch
  const loadVideos = useCallback(async (cat) => {
    setLoading(true)
    const data = await fetchReels(cat)
    setVideos(data.videos || [])
    setCurrentIdx(0)
    setLoading(false)
  }, [])

  useEffect(() => { loadVideos(category) }, [category])

  // Next video + ad check
  const nextVideo = () => {
    const adType = shouldShowAd()
    if (adType) {
      const dur = adType === 'long' ? AD_CONFIG.longAdDuration : AD_CONFIG.shortAdDuration
      setAdState(adType)
      setAdTimer(dur)
    } else {
      setCurrentIdx(i => Math.min(i + 1, videos.length - 1))
    }
  }

  // Ad countdown
  useEffect(() => {
    if (!adState) return
    timerRef.current = setInterval(() => {
      setAdTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setAdState(null)
          setCurrentIdx(i => Math.min(i + 1, videos.length - 1))
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [adState])

  // Ad screen
  if (adState) {
    return (
      <div style={{
        height: 'calc(100vh - var(--tab-h) - 57px)',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(255,255,255,0.15)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 700,
          color: '#fff',
        }}>
          Ad {adTimer}s
        </div>

        {/* AdsTerra banner */}
        <div style={{
          width: '320px', height: '250px',
          background: 'rgba(255,107,0,0.1)',
          border: '1px solid rgba(255,107,0,0.3)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}>
          <div style={{ fontSize: '40px' }}>🎓</div>
          <div style={{
            fontFamily: 'Teko',
            fontSize: '26px',
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
          }}>
            Speak English<br />Like a Pro!
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            Sirf ₹199 mein — Karmi Minds
          </div>
          <a
            href="https://karmiminds.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-main"
            style={{ fontSize: '15px', padding: '8px 24px' }}
          >
            Abhi Dekho →
          </a>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '30px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)',
        }}>
          Advertisement
        </div>
      </div>
    )
  }

  const current = videos[currentIdx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--tab-h) - 57px)' }}>

      {/* Category filter */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '10px 16px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            style={{
              background: category === cat.id ? 'linear-gradient(135deg, #ff6b00, #ff9500)' : 'rgba(255,255,255,0.05)',
              border: '1px solid',
              borderColor: category === cat.id ? 'transparent' : 'rgba(255,255,255,0.08)',
              color: category === cat.id ? '#000' : '#9090b0',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              fontFamily: 'Rajdhani',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Video player */}
      <div style={{ flex: 1, position: 'relative', background: '#000' }}>
        {loading ? (
          <div style={{
            height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '12px',
          }}>
            <div style={{
              width: '36px', height: '36px',
              border: '3px solid rgba(255,107,0,0.2)',
              borderTopColor: '#ff6b00',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ color: 'var(--text2)', fontSize: '14px' }}>Loading reels...</div>
          </div>
        ) : current ? (
          <>
            <iframe
              key={current.id}
              src={getEmbedUrl(current.id)}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; fullscreen"
              title={current.title}
            />

            {/* Next button */}
            <button
              onClick={nextVideo}
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '16px',
                background: 'linear-gradient(135deg, #ff6b00, #ff9500)',
                border: 'none',
                color: '#000',
                width: '48px', height: '48px',
                borderRadius: '50%',
                fontSize: '20px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255,107,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              ↓
            </button>

            {/* Video counter */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'rgba(0,0,0,0.6)',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.7)',
            }}>
              {currentIdx + 1}/{videos.length}
            </div>
          </>
        ) : (
          <div style={{
            height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '12px', color: 'var(--text2)',
          }}>
            <div style={{ fontSize: '40px' }}>😕</div>
            <div style={{ fontFamily: 'Teko', fontSize: '22px' }}>No reels found</div>
            <button className="btn-ghost" onClick={() => loadVideos(category)}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
