import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameViews } from '../../hooks/useGameViews'

const FEED_URL = 'https://feeds.gamepix.com/v2/json?sid=ESGG6&pagination=24&page=1'

// ── LocalStorage helpers ────────────────────────────────────────────────────
const LS_COUNTS = 'gametab_play_counts'
const LS_CAT    = 'gametab_cat_counts'

const getLS = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} } }
const setLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

const incCount = (key, id) => {
  const data = getLS(key)
  data[id] = (data[id] || 0) + 1
  setLS(key, data)
  return data
}

// ── Category Icons ───────────────────────────────────────────────────────────
const CAT_ICONS = {
  all: '🎮', action: '⚔️', racing: '🏎️', puzzle: '🧩', sports: '⚽',
  adventure: '🗺️', arcade: '👾', casual: '🎲', strategy: '♟️',
  shooting: '🎯', board: '🎳', cards: '🃏', educational: '📚',
  music: '🎵', simulation: '🛸', 'mind games': '🧠', ludo: '🎲',
  default: '🕹️'
}
const catIcon = (c) => CAT_ICONS[(c || '').toLowerCase()] || CAT_ICONS.default

// ════════════════════════════════════════════════════════════════════════════
export default function GamesTab({ portalSlug }) {
  const [games, setGames]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [nextUrl, setNextUrl]           = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm]     = useState('')
  const [activeGame, setActiveGame]     = useState(null)
  const [playCounts, setPlayCounts]     = useState(() => getLS(LS_COUNTS))
  const [catCounts, setCatCounts]       = useState(() => getLS(LS_CAT))
  const [isFullscreen, setIsFullscreen] = useState(false)

  const gameContainerRef = useRef(null)
  const { startTracking, stopTracking } = useGameViews(portalSlug, activeGame?.id)

  // ── Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => { fetchGames(FEED_URL) }, [])

  const fetchGames = async (url, isLoadMore = false) => {
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true)
      const res  = await fetch(url)
      const data = await res.json()
      if (data?.items) {
        setGames(prev => isLoadMore ? [...prev, ...data.items] : data.items)
        setNextUrl(data.next_url || null)
      }
    } catch (e) { console.error('GamePix Error:', e) }
    finally { setLoading(false); setLoadingMore(false) }
  }

  // ── Smart categories: user most played first ───────────────────────────
  const categories = (() => {
    if (!games.length) return ['All']
    const gameCatCount = {}
    games.forEach(g => { gameCatCount[g.category] = (gameCatCount[g.category] || 0) + 1 })
    const sorted = Object.keys(gameCatCount).sort((a, b) => {
      const ua = catCounts[a] || 0
      const ub = catCounts[b] || 0
      if (ub !== ua) return ub - ua
      return gameCatCount[b] - gameCatCount[a]
    })
    return ['All', ...sorted]
  })()

  // ── Filtered + sorted (played games first within category) ─────────────
  const sortedFiltered = (() => {
    let list = games.filter(g => {
      const matchesCat    = activeCategory === 'All' || g.category === activeCategory
      const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCat && matchesSearch
    })
    return [...list].sort((a, b) => {
      const pa = playCounts[a.id] || 0
      const pb = playCounts[b.id] || 0
      if (pb !== pa) return pb - pa
      return b.quality_score - a.quality_score
    })
  })()

  // ── Open game ──────────────────────────────────────────────────────────
  const openGame = useCallback(async (game) => {
    const newPlays = incCount(LS_COUNTS, game.id)
    const newCats  = incCount(LS_CAT, game.category)
    setPlayCounts(newPlays)
    setCatCounts(newCats)
    setActiveGame(game)
    startTracking()

    // Try to lock orientation
    try {
      const target = game.orientation === 'landscape' ? 'landscape' : 'portrait'
      if (screen?.orientation?.lock) await screen.orientation.lock(target)
    } catch (e) {
      console.warn('Orientation lock not supported:', e.message)
    }
  }, [startTracking])

  // ── Close game ─────────────────────────────────────────────────────────
  const closeGame = useCallback(async () => {
    stopTracking()
    setActiveGame(null)
    setIsFullscreen(false)
    try { if (screen?.orientation?.unlock) screen.orientation.unlock() } catch {}
    try { if (document.fullscreenElement) await document.exitFullscreen() } catch {}
  }, [stopTracking])

  // ── Fullscreen toggle ──────────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    const el = gameContainerRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen({ navigationUI: 'hide' })
        setIsFullscreen(true)
        // Re-lock orientation after entering fullscreen (needed on Android Chrome)
        if (activeGame && screen?.orientation?.lock) {
          const target = activeGame.orientation === 'landscape' ? 'landscape' : 'portrait'
          await screen.orientation.lock(target).catch(() => {})
        }
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch { setIsFullscreen(prev => !prev) }
  }, [activeGame])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // ════════════════════════════════════════════════════════════════════════
  // GAME PLAYER VIEW
  // ════════════════════════════════════════════════════════════════════════
  if (activeGame) {
    return (
      <>
        <style>{`
          .gt-game-wrap {
            height: calc(100dvh - var(--tab-h) - 57px);
            display: flex; flex-direction: column; background: #000;
          }
          .gt-game-wrap.gt-fs {
            position: fixed !important; inset: 0 !important;
            height: 100dvh !important; width: 100dvw !important;
            z-index: 9999 !important;
          }
          .gt-iframe-box { flex: 1; position: relative; overflow: hidden; background: #000; }
          .gt-iframe-box iframe { width: 100%; height: 100%; border: none; display: block; }
          @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        `}</style>

        <div ref={gameContainerRef} className={`gt-game-wrap${isFullscreen ? ' gt-fs' : ''}`}>

          {/* Top bar */}
          <div style={{
            padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px',
            background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0
          }}>
            <button onClick={closeGame} style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff',
              width: '34px', height: '34px', borderRadius: '8px', fontSize: '18px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>←</button>

            <img src={activeGame.image} alt="" style={{ width: '26px', height: '26px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />

            <span style={{ fontFamily: 'Teko, sans-serif', fontSize: '20px', fontWeight: 700, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeGame.title}
            </span>

            {/* Orientation badge */}
            <span style={{
              fontFamily: 'Rajdhani, sans-serif', fontSize: '11px', color: '#ff9500',
              background: 'rgba(255,149,0,0.1)', padding: '3px 8px', borderRadius: '6px', flexShrink: 0
            }}>
              {activeGame.orientation === 'landscape' ? '↔️ Landscape' : '↕️ Portrait'}
            </span>

            {/* Fullscreen button */}
            <button onClick={toggleFullscreen} style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff',
              width: '34px', height: '34px', borderRadius: '8px', fontSize: '16px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              {isFullscreen ? '✕' : '⛶'}
            </button>
          </div>

          {/* Iframe */}
          <div className="gt-iframe-box">
            <iframe
              src={activeGame.url}
              allow="autoplay; fullscreen; payment; gyroscope; accelerometer; screen-orientation"
              allowFullScreen
              title={activeGame.title}
              scrolling="no"
            />
            {/* Rotate hint for landscape games */}
            {activeGame.orientation === 'landscape' && <RotateHint />}
          </div>
        </div>
      </>
    )
  }

  // ════════════════════════════════════════════════════════════════════════
  // BROWSE VIEW
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: '12px 16px 24px', animation: 'fadeUp 0.3s ease' }}>

      {/* Search */}
      <div style={{ marginBottom: '14px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search games (Ludo, Racing...)"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '12px 40px 12px 40px',
            color: '#fff', fontSize: '14px', outline: 'none',
            fontFamily: 'Rajdhani, sans-serif'
          }}
        />
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#aaa',
            width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', fontSize: '12px'
          }}>✕</button>
        )}
      </div>

      {/* Categories — user's most played first, 🔥 badge on played ones */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none', marginBottom: '8px' }}>
        {categories.map(cat => {
          const isActive   = activeCategory === cat
          const userPlays  = catCounts[cat] || 0
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              background: isActive ? 'linear-gradient(135deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.05)',
              border: '1px solid',
              borderColor: isActive ? 'transparent' : userPlays > 0 ? 'rgba(255,149,0,0.3)' : 'rgba(255,255,255,0.08)',
              color: isActive ? '#000' : userPlays > 0 ? '#ffb84d' : '#9090b0',
              padding: '6px 13px', borderRadius: '20px', fontSize: '13px', fontWeight: 700,
              whiteSpace: 'nowrap', textTransform: 'capitalize', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '5px'
            }}>
              <span>{catIcon(cat)}</span>
              <span>{cat}</span>
              {userPlays > 0 && cat !== 'All' && <span style={{ fontSize: '10px' }}>🔥</span>}
            </button>
          )
        })}
      </div>

      {loading && !loadingMore ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#ff9500', fontFamily: 'Orbitron, sans-serif', fontWeight: 800 }}>
          Loading Games...
        </div>
      ) : (
        <>
          {searchTerm && (
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', color: '#555', marginBottom: '10px' }}>
              {sortedFiltered.length} results for "{searchTerm}"
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {sortedFiltered.map(game => (
              <GameCard key={game.id} game={game} playCount={playCounts[game.id] || 0} onPlay={() => openGame(game)} />
            ))}
          </div>

          {nextUrl && !searchTerm && (
            <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '20px' }}>
              <button onClick={() => fetchGames(nextUrl, true)} disabled={loadingMore} style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', padding: '10px 24px', borderRadius: '12px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Orbitron, sans-serif'
              }}>
                {loadingMore ? 'Loading...' : 'LOAD MORE GAMES ↓'}
              </button>
            </div>
          )}

          {sortedFiltered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No games found</div>
          )}
        </>
      )}
    </div>
  )
}

// ── Rotate Hint overlay (auto-hides after 3s) ─────────────────────────────────
function RotateHint() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3500)
    return () => clearTimeout(t)
  }, [])
  if (!visible) return null
  return (
    <div style={{
      position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,149,0,0.35)',
      borderRadius: '12px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '10px',
      pointerEvents: 'none', zIndex: 20, whiteSpace: 'nowrap'
    }}>
      <span style={{ fontSize: '22px' }}>📱</span>
      <div>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', fontWeight: 700, color: '#ff9500' }}>
          Phone rotate karo ↔️
        </div>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '11px', color: '#888' }}>
          Yeh game landscape mein best hai
        </div>
      </div>
    </div>
  )
}

// ── Game Card ─────────────────────────────────────────────────────────────────
function GameCard({ game, onPlay, playCount }) {
  return (
    <div onClick={onPlay} style={{
      background: 'var(--card)',
      border: `1px solid ${playCount > 0 ? 'rgba(255,149,0,0.3)' : 'var(--border)'}`,
      borderRadius: '16px', overflow: 'hidden', position: 'relative', cursor: 'pointer'
    }}>
      {playCount > 0 && (
        <div style={{
          position: 'absolute', top: '8px', right: '8px', zIndex: 2,
          background: 'rgba(255,149,0,0.9)', borderRadius: '8px',
          padding: '2px 7px', fontSize: '9px',
          fontFamily: 'Orbitron, sans-serif', fontWeight: 800, color: '#000'
        }}>▶ {playCount}x</div>
      )}
      {game.orientation === 'landscape' && (
        <div style={{
          position: 'absolute', top: '8px', left: '8px', zIndex: 2,
          background: 'rgba(0,0,0,0.6)', borderRadius: '6px',
          padding: '2px 6px', fontSize: '9px', color: '#aaa'
        }}>↔️</div>
      )}
      <div style={{ aspectRatio: '1', background: '#111' }}>
        <img src={game.image} alt={game.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '10px' }}>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {game.title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px' }}>
          <span style={{ color: '#ff9500' }}>⭐ {(game.quality_score * 5).toFixed(1)}</span>
          <span style={{ color: '#666', textTransform: 'capitalize' }}>{catIcon(game.category)} {game.category}</span>
        </div>
      </div>
    </div>
  )
}