import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameViews } from '../../hooks/useGameViews'

const SID = 'ESGG6'
const PER_CAT = 12   // ← Kitne games per category chahiye (change kar sakte ho)

// Jo categories fetch karni hain — order = default browse order
// GamePix ke category slugs exactly yahi hone chahiye
const CATEGORIES = [
  'action', 'racing', 'puzzle', 'sports', 'arcade',
  'adventure', 'shooting', 'casual', 'strategy', 'board',
  'cards', 'simulation', 'educational', 'music'
]

// Category wise API URL builder
const catUrl = (cat) =>
  `https://feeds.gamepix.com/v2/json?sid=${SID}&pagination=${PER_CAT}&page=1&s=quality&category=${cat}`

// ── LocalStorage helpers ─────────────────────────────────────────────────────
const LS_COUNTS = 'gametab_play_counts'
const LS_CAT    = 'gametab_cat_counts'
const getLS  = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} } }
const setLS  = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }
const incCount = (key, id) => {
  const data = getLS(key); data[id] = (data[id] || 0) + 1
  setLS(key, data); return data
}

// ── Category icons ───────────────────────────────────────────────────────────
const CAT_ICONS = {
  all:'🎮', action:'⚔️', racing:'🏎️', puzzle:'🧩', sports:'⚽',
  adventure:'🗺️', arcade:'👾', casual:'🎲', strategy:'♟️',
  shooting:'🎯', board:'🎳', cards:'🃏', educational:'📚',
  music:'🎵', simulation:'🛸', 'mind games':'🧠',
  default:'🕹️'
}
const catIcon = (c) => CAT_ICONS[(c||'').toLowerCase()] || CAT_ICONS.default

// ════════════════════════════════════════════════════════════════════════════
export default function GamesTab({ portalSlug }) {
  const [gamesByCat, setGamesByCat]     = useState({})  // { action: [...], racing: [...] }
  const [loadedCats, setLoadedCats]     = useState([])  // jo categories load ho gayi
  const [loadingCats, setLoadingCats]   = useState([])  // jo abhi load ho rahi hain
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm]     = useState('')
  const [activeGame, setActiveGame]     = useState(null)
  const [playCounts, setPlayCounts]     = useState(() => getLS(LS_COUNTS))
  const [catCounts, setCatCounts]       = useState(() => getLS(LS_CAT))
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [catLoadMore, setCatLoadMore]   = useState({})  // { action: nextUrl }
  const [catLoadingMore, setCatLoadingMore] = useState(null)

  const gameContainerRef = useRef(null)
  const { startTracking, stopTracking } = useGameViews(portalSlug, activeGame?.id)

  // ── Initial: fetch all categories in parallel ──────────────────────────
  useEffect(() => {
    fetchAllCategories()
  }, [])

  const fetchAllCategories = async () => {
    setLoadingCats([...CATEGORIES])

    // Parallel fetch — sab ek saath
    const results = await Promise.allSettled(
      CATEGORIES.map(cat =>
        fetch(catUrl(cat))
          .then(r => r.json())
          .then(data => ({ cat, items: data.items || [], next_url: data.next_url || null }))
          .catch(() => ({ cat, items: [], next_url: null }))
      )
    )

    const newGamesByCat = {}
    const newNextUrls   = {}

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const { cat, items, next_url } = result.value
        // Deduplicate by id (kuch games multiple categories mein ho sakti hain)
        newGamesByCat[cat] = items
        if (next_url) newNextUrls[cat] = next_url
      }
    })

    setGamesByCat(newGamesByCat)
    setLoadedCats(CATEGORIES.filter(c => (newGamesByCat[c]?.length || 0) > 0))
    setCatLoadMore(newNextUrls)
    setLoadingCats([])
  }

  // ── Load more for a specific category ─────────────────────────────────
  const loadMoreForCat = async (cat) => {
    const url = catLoadMore[cat]
    if (!url || catLoadingMore) return
    setCatLoadingMore(cat)
    try {
      const res  = await fetch(url)
      const data = await res.json()
      if (data?.items?.length) {
        setGamesByCat(prev => ({ ...prev, [cat]: [...(prev[cat] || []), ...data.items] }))
        setCatLoadMore(prev => ({ ...prev, [cat]: data.next_url || null }))
      }
    } catch (e) { console.error(e) }
    setCatLoadingMore(null)
  }

  // ── All games flat (for "All" view + search) ───────────────────────────
  const allGames = Object.values(gamesByCat).flat()

  // ── Smart category order: user most played first ───────────────────────
  const sortedCategories = ['All', ...[...loadedCats].sort((a, b) => {
    const ua = catCounts[a] || 0
    const ub = catCounts[b] || 0
    if (ub !== ua) return ub - ua
    return (gamesByCat[b]?.length || 0) - (gamesByCat[a]?.length || 0)
  })]

  // ── Games to show based on active category + search ────────────────────
  const visibleGames = (() => {
    let list = activeCategory === 'All'
      ? allGames
      : (gamesByCat[activeCategory] || [])

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = allGames.filter(g =>
        g.title.toLowerCase().includes(q) ||
        (g.category || '').toLowerCase().includes(q)
      )
    }

    // Most played first, then quality
    return [...list].sort((a, b) => {
      const pa = playCounts[a.id] || 0, pb = playCounts[b.id] || 0
      if (pb !== pa) return pb - pa
      return b.quality_score - a.quality_score
    })
  })()

  const isInitialLoading = loadingCats.length > 0 && loadedCats.length === 0

  // ── Open game ──────────────────────────────────────────────────────────
  const openGame = useCallback(async (game) => {
    const newPlays = incCount(LS_COUNTS, game.id)
    const newCats  = incCount(LS_CAT, game.category)
    setPlayCounts(newPlays)
    setCatCounts(newCats)
    setActiveGame(game)
    startTracking()
    try {
      const target = game.orientation === 'landscape' ? 'landscape' : 'portrait'
      if (screen?.orientation?.lock) await screen.orientation.lock(target)
    } catch {}
  }, [startTracking])

  // ── Close game ─────────────────────────────────────────────────────────
  const closeGame = useCallback(async () => {
    stopTracking(); setActiveGame(null); setIsFullscreen(false)
    try { if (screen?.orientation?.unlock) screen.orientation.unlock() } catch {}
    try { if (document.fullscreenElement) await document.exitFullscreen() } catch {}
  }, [stopTracking])

  // ── Fullscreen ─────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    const el = gameContainerRef.current; if (!el) return
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen({ navigationUI: 'hide' }); setIsFullscreen(true)
        if (activeGame?.orientation && screen?.orientation?.lock)
          await screen.orientation.lock(activeGame.orientation === 'landscape' ? 'landscape' : 'portrait').catch(() => {})
      } else {
        await document.exitFullscreen(); setIsFullscreen(false)
      }
    } catch { setIsFullscreen(p => !p) }
  }, [activeGame])

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  // ════════════════════════════════════════════════════════════════════════
  // GAME PLAYER
  // ════════════════════════════════════════════════════════════════════════
  if (activeGame) {
    return (
      <>
        <style>{`
          .gt-wrap { height: calc(100dvh - var(--tab-h) - 57px); display:flex; flex-direction:column; background:#000; }
          .gt-wrap.gt-fs { position:fixed!important; inset:0!important; height:100dvh!important; width:100dvw!important; z-index:9999!important; }
          .gt-iframe-box { flex:1; position:relative; overflow:hidden; background:#000; }
          .gt-iframe-box iframe { width:100%; height:100%; border:none; display:block; }
        `}</style>
        <div ref={gameContainerRef} className={`gt-wrap${isFullscreen ? ' gt-fs' : ''}`}>
          <div style={{ padding:'8px 14px', display:'flex', alignItems:'center', gap:'10px', background:'#0a0a0a', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
            <button onClick={closeGame} style={{ background:'rgba(255,255,255,0.08)', border:'none', color:'#fff', width:'34px', height:'34px', borderRadius:'8px', fontSize:'18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
            <img src={activeGame.image} alt="" style={{ width:'26px', height:'26px', borderRadius:'6px', objectFit:'cover', flexShrink:0 }} />
            <span style={{ fontFamily:'Teko, sans-serif', fontSize:'20px', fontWeight:700, color:'#fff', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{activeGame.title}</span>
            <span style={{ fontFamily:'Rajdhani, sans-serif', fontSize:'11px', color:'#ff9500', background:'rgba(255,149,0,0.1)', padding:'3px 8px', borderRadius:'6px', flexShrink:0 }}>
              {activeGame.orientation === 'landscape' ? '↔️ Landscape' : '↕️ Portrait'}
            </span>
            <button onClick={toggleFullscreen} style={{ background:'rgba(255,255,255,0.08)', border:'none', color:'#fff', width:'34px', height:'34px', borderRadius:'8px', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {isFullscreen ? '✕' : '⛶'}
            </button>
          </div>
          <div className="gt-iframe-box">
            <iframe src={activeGame.url} allow="autoplay; fullscreen; payment; gyroscope; accelerometer; screen-orientation" allowFullScreen title={activeGame.title} scrolling="no" />
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
    <div style={{ padding:'12px 16px 24px', animation:'fadeUp 0.3s ease' }}>

      {/* Search */}
      <div style={{ marginBottom:'14px', position:'relative' }}>
        <input
          type="text" placeholder="Search games..." value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px 40px', color:'#fff', fontSize:'14px', outline:'none', fontFamily:'Rajdhani, sans-serif' }}
        />
        <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', opacity:0.5 }}>🔍</span>
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.1)', border:'none', color:'#aaa', width:'22px', height:'22px', borderRadius:'50%', cursor:'pointer', fontSize:'12px' }}>✕</button>
        )}
      </div>

      {/* Category bar */}
      <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'12px', scrollbarWidth:'none', marginBottom:'12px' }}>
        {sortedCategories.map(cat => {
          const isActive  = activeCategory === cat
          const userPlays = catCounts[cat] || 0
          const count     = cat === 'All' ? allGames.length : (gamesByCat[cat]?.length || 0)
          const isLoading = loadingCats.includes(cat)
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              background: isActive ? 'linear-gradient(135deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.05)',
              border:'1px solid',
              borderColor: isActive ? 'transparent' : userPlays > 0 ? 'rgba(255,149,0,0.3)' : 'rgba(255,255,255,0.08)',
              color: isActive ? '#000' : userPlays > 0 ? '#ffb84d' : '#9090b0',
              padding:'6px 13px', borderRadius:'20px', fontSize:'13px', fontWeight:700,
              whiteSpace:'nowrap', textTransform:'capitalize', cursor:'pointer', flexShrink:0,
              display:'flex', alignItems:'center', gap:'5px', opacity: isLoading ? 0.5 : 1
            }}>
              <span>{catIcon(cat)}</span>
              <span>{cat}</span>
              {!isLoading && count > 0 && (
                <span style={{ fontSize:'10px', opacity:0.6 }}>{count}</span>
              )}
              {isLoading && <span style={{ fontSize:'10px' }}>⏳</span>}
              {userPlays > 0 && cat !== 'All' && !isLoading && (
                <span style={{ fontSize:'10px' }}>🔥</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Loading skeleton */}
      {isInitialLoading ? (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ borderRadius:'16px', overflow:'hidden', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', aspectRatio:'0.85' }}>
              <div style={{ aspectRatio:'1', background:'rgba(255,255,255,0.03)', animation:'pulse 1.5s ease infinite alternate' }} />
              <div style={{ padding:'10px' }}>
                <div style={{ height:'12px', borderRadius:'4px', background:'rgba(255,255,255,0.05)', marginBottom:'8px' }} />
                <div style={{ height:'10px', borderRadius:'4px', background:'rgba(255,255,255,0.03)', width:'60%' }} />
              </div>
              <style>{`@keyframes pulse{from{opacity:0.4}to{opacity:0.8}}`}</style>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Category section headers — only in All view without search */}
          {activeCategory === 'All' && !searchTerm ? (
            <>
              {sortedCategories.filter(c => c !== 'All').map(cat => {
                const catGames = gamesByCat[cat] || []
                if (!catGames.length) return null
                // Sort: played first
                const sorted = [...catGames].sort((a, b) => {
                  const pa = playCounts[a.id] || 0, pb = playCounts[b.id] || 0
                  if (pb !== pa) return pb - pa
                  return b.quality_score - a.quality_score
                })
                return (
                  <div key={cat} style={{ marginBottom:'24px' }}>
                    {/* Section header */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontSize:'16px' }}>{catIcon(cat)}</span>
                        <span style={{ fontFamily:'Orbitron, sans-serif', fontSize:'11px', fontWeight:800, color:'#ff9500', letterSpacing:'0.06em', textTransform:'uppercase' }}>{cat}</span>
                        {catCounts[cat] > 0 && <span style={{ fontSize:'10px' }}>🔥</span>}
                      </div>
                      <button
                        onClick={() => setActiveCategory(cat)}
                        style={{ fontFamily:'Rajdhani, sans-serif', fontSize:'12px', color:'#555', background:'none', border:'none', cursor:'pointer' }}
                      >
                        See all →
                      </button>
                    </div>
                    {/* Horizontal scroll row */}
                    <div style={{ display:'flex', gap:'10px', overflowX:'auto', scrollbarWidth:'none', paddingBottom:'4px' }}>
                      {sorted.map(game => (
                        <GameCardH key={game.id} game={game} playCount={playCounts[game.id] || 0} onPlay={() => openGame(game)} />
                      ))}
                      {/* Load more inline */}
                      {catLoadMore[cat] && (
                        <button
                          onClick={() => loadMoreForCat(cat)}
                          disabled={catLoadingMore === cat}
                          style={{ flexShrink:0, width:'100px', borderRadius:'12px', border:'1px dashed rgba(255,149,0,0.2)', background:'rgba(255,149,0,0.05)', color:'#ff9500', cursor:'pointer', fontFamily:'Orbitron, sans-serif', fontSize:'9px', fontWeight:800 }}
                        >
                          {catLoadingMore === cat ? '...' : 'MORE +'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </>
          ) : (
            /* Grid view for filtered/search */
            <>
              {searchTerm && (
                <div style={{ fontFamily:'Rajdhani, sans-serif', fontSize:'13px', color:'#555', marginBottom:'10px' }}>
                  {visibleGames.length} results for "{searchTerm}"
                </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {visibleGames.map(game => (
                  <GameCard key={game.id} game={game} playCount={playCounts[game.id] || 0} onPlay={() => openGame(game)} />
                ))}
              </div>
              {/* Load more for specific category */}
              {activeCategory !== 'All' && catLoadMore[activeCategory] && !searchTerm && (
                <div style={{ textAlign:'center', marginTop:'24px' }}>
                  <button
                    onClick={() => loadMoreForCat(activeCategory)}
                    disabled={catLoadingMore === activeCategory}
                    style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'10px 24px', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'Orbitron, sans-serif' }}
                  >
                    {catLoadingMore === activeCategory ? 'Loading...' : 'LOAD MORE ↓'}
                  </button>
                </div>
              )}
              {visibleGames.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px', color:'#666' }}>No games found</div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── Horizontal scroll card (for All view sections) ────────────────────────────
function GameCardH({ game, onPlay, playCount }) {
  return (
    <div onClick={onPlay} style={{ flexShrink:0, width:'130px', background:'var(--card)', border:`1px solid ${playCount > 0 ? 'rgba(255,149,0,0.3)' : 'var(--border)'}`, borderRadius:'14px', overflow:'hidden', position:'relative', cursor:'pointer' }}>
      {playCount > 0 && (
        <div style={{ position:'absolute', top:'6px', right:'6px', zIndex:2, background:'rgba(255,149,0,0.9)', borderRadius:'6px', padding:'1px 6px', fontSize:'9px', fontFamily:'Orbitron, sans-serif', fontWeight:800, color:'#000' }}>▶{playCount}x</div>
      )}
      {game.orientation === 'landscape' && (
        <div style={{ position:'absolute', top:'6px', left:'6px', zIndex:2, background:'rgba(0,0,0,0.6)', borderRadius:'4px', padding:'1px 5px', fontSize:'9px', color:'#aaa' }}>↔️</div>
      )}
      <div style={{ width:'130px', height:'100px', background:'#111' }}>
        <img src={game.image} alt={game.title} loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>
      <div style={{ padding:'7px 8px 9px' }}>
        <div style={{ fontFamily:'Rajdhani, sans-serif', fontSize:'12px', fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{game.title}</div>
        <div style={{ fontSize:'10px', color:'#ff9500', marginTop:'3px' }}>⭐ {(game.quality_score * 5).toFixed(1)}</div>
      </div>
    </div>
  )
}

// ── Grid card ─────────────────────────────────────────────────────────────────
function GameCard({ game, onPlay, playCount }) {
  return (
    <div onClick={onPlay} style={{ background:'var(--card)', border:`1px solid ${playCount > 0 ? 'rgba(255,149,0,0.3)' : 'var(--border)'}`, borderRadius:'16px', overflow:'hidden', position:'relative', cursor:'pointer' }}>
      {playCount > 0 && (
        <div style={{ position:'absolute', top:'8px', right:'8px', zIndex:2, background:'rgba(255,149,0,0.9)', borderRadius:'8px', padding:'2px 7px', fontSize:'9px', fontFamily:'Orbitron, sans-serif', fontWeight:800, color:'#000' }}>▶ {playCount}x</div>
      )}
      {game.orientation === 'landscape' && (
        <div style={{ position:'absolute', top:'8px', left:'8px', zIndex:2, background:'rgba(0,0,0,0.6)', borderRadius:'6px', padding:'2px 6px', fontSize:'9px', color:'#aaa' }}>↔️</div>
      )}
      <div style={{ aspectRatio:'1', background:'#111' }}>
        <img src={game.image} alt={game.title} loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>
      <div style={{ padding:'10px' }}>
        <div style={{ fontFamily:'Rajdhani, sans-serif', fontSize:'14px', fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{game.title}</div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginTop:'4px' }}>
          <span style={{ color:'#ff9500' }}>⭐ {(game.quality_score * 5).toFixed(1)}</span>
          <span style={{ color:'#666', textTransform:'capitalize' }}>{catIcon(game.category)} {game.category}</span>
        </div>
      </div>
    </div>
  )
}

// ── Rotate hint ───────────────────────────────────────────────────────────────
function RotateHint() {
  const [visible, setVisible] = useState(true)
  useEffect(() => { const t = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(t) }, [])
  if (!visible) return null
  return (
    <div style={{ position:'absolute', bottom:'24px', left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.8)', border:'1px solid rgba(255,149,0,0.35)', borderRadius:'12px', padding:'10px 18px', display:'flex', alignItems:'center', gap:'10px', pointerEvents:'none', zIndex:20, whiteSpace:'nowrap' }}>
      <span style={{ fontSize:'22px' }}>📱</span>
      <div>
        <div style={{ fontFamily:'Rajdhani, sans-serif', fontSize:'13px', fontWeight:700, color:'#ff9500' }}>Phone rotate karo ↔️</div>
        <div style={{ fontFamily:'Rajdhani, sans-serif', fontSize:'11px', color:'#888' }}>Yeh game landscape mein best hai</div>
      </div>
    </div>
  )
}