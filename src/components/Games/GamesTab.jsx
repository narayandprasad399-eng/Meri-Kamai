import { useState, useEffect, useRef, useMemo } from 'react'
import { useGameViews } from '../../hooks/useGameViews'

const FEED_BASE = 'https://feeds.gamepix.com/v2/json?sid=ESGG6&pagination=48'

// ─── Category Icons ───────────────────────────────────────────────────────────
const CAT_ICONS = {
  all: '🎮', action: '⚔️', racing: '🏎️', puzzle: '🧩', sports: '⚽',
  adventure: '🗺️', arcade: '👾', casual: '🎲', strategy: '♟️',
  shooting: '🎯', board: '🎳', cards: '🃏', educational: '📚',
  music: '🎵', simulation: '🛸', default: '🕹️'
}
const catIcon = (cat) => CAT_ICONS[cat?.toLowerCase()] || CAT_ICONS.default

// ─── Local storage helpers ────────────────────────────────────────────────────
const LS_KEY = 'gt_play_counts'
const getPlayCounts = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} } }
const savePlayCount = (id) => {
  const counts = getPlayCounts()
  counts[id] = (counts[id] || 0) + 1
  localStorage.setItem(LS_KEY, JSON.stringify(counts))
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GamesTab({ portalSlug }) {
  const [allGames, setAllGames]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [nextUrl, setNextUrl]           = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm]     = useState('')
  const [sortMode, setSortMode]         = useState('quality') // quality | name | newest
  const [activeGame, setActiveGame]     = useState(null)
  const [playCounts, setPlayCounts]     = useState(getPlayCounts)
  const [view, setView]                 = useState('grid') // grid | list
  const catBarRef = useRef(null)

  const { startTracking, stopTracking } = useGameViews(portalSlug, activeGame?.id)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => { fetchGames(FEED_BASE + '&page=1') }, [])

  const fetchGames = async (url, isLoadMore = false) => {
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true)
      const res  = await fetch(url)
      const data = await res.json()
      if (data?.items) {
        setAllGames(prev => isLoadMore ? [...prev, ...data.items] : data.items)
        setNextUrl(data.next_url || null)
      }
    } catch (e) { console.error('GamePix Error:', e) }
    finally { setLoading(false); setLoadingMore(false) }
  }

  // ── Derived data ────────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const counts = {}
    allGames.forEach(g => { counts[g.category] = (counts[g.category] || 0) + 1 })
    return [
      { name: 'All', count: allGames.length },
      ...Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }))
    ]
  }, [allGames])

  const topPlayed = useMemo(() => {
    return Object.entries(playCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ game: allGames.find(g => g.id === id), count }))
      .filter(x => x.game)
  }, [playCounts, allGames])

  const filtered = useMemo(() => {
    let list = allGames
    if (activeCategory !== 'All') list = list.filter(g => g.category === activeCategory)
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.category?.toLowerCase().includes(q)
      )
    }
    if (sortMode === 'quality') return [...list].sort((a, b) => b.quality_score - a.quality_score)
    if (sortMode === 'name')    return [...list].sort((a, b) => a.title.localeCompare(b.title))
    if (sortMode === 'newest')  return [...list].sort((a, b) => new Date(b.date_published) - new Date(a.date_published))
    return list
  }, [allGames, activeCategory, searchTerm, sortMode])

  // ── Game open/close ─────────────────────────────────────────────────────────
  const openGame = (game) => {
    savePlayCount(game.id)
    setPlayCounts(getPlayCounts())
    setActiveGame(game)
    startTracking()
  }
  const closeGame = () => { stopTracking(); setActiveGame(null) }

  // ── Scroll active category into view ───────────────────────────────────────
  useEffect(() => {
    if (!catBarRef.current) return
    const active = catBarRef.current.querySelector('[data-active="true"]')
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeCategory])

  // ════════════════════════════════════════════════════════════════════════════
  // GAME PLAYER VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (activeGame) {
    return (
      <div style={{ height: 'calc(100dvh - var(--tab-h) - 57px)', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <div style={{
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px',
          background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', zIndex: 10
        }}>
          <button onClick={closeGame} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff',
            width: '34px', height: '34px', borderRadius: '8px', fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>←</button>
          <img src={activeGame.image} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
          <span style={{ fontFamily: 'Teko, sans-serif', fontSize: '20px', fontWeight: 700, color: '#fff', flex: 1 }}>
            {activeGame.title}
          </span>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '12px', color: '#ff9500', textTransform: 'capitalize', background: 'rgba(255,149,0,0.12)', padding: '3px 9px', borderRadius: '20px' }}>
            {catIcon(activeGame.category)} {activeGame.category}
          </span>
        </div>
        <iframe
          src={activeGame.url}
          style={{ flex: 1, border: 'none', width: '100%', background: '#000' }}
          allow="autoplay; fullscreen; payment"
          title={activeGame.title}
          scrolling="no"
        />
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN BROWSE VIEW
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: '12px 16px 24px', animation: 'fadeUp 0.3s ease' }}>

      {/* ── Search Bar ── */}
      <div style={{ marginBottom: '14px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search games or category..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
            padding: '11px 40px 11px 42px', color: '#fff', fontSize: '14px',
            outline: 'none', fontFamily: 'Rajdhani, sans-serif', boxSizing: 'border-box'
          }}
        />
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.5 }}>🔍</span>
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#aaa',
            width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
          }}>✕</button>
        )}
      </div>

      {/* ── Category Scroll Bar ── */}
      <div ref={catBarRef} style={{
        display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px',
        scrollbarWidth: 'none', marginBottom: '4px'
      }}>
        {categories.map(({ name, count }) => {
          const isActive = activeCategory === name
          return (
            <button
              key={name}
              data-active={isActive}
              onClick={() => setActiveCategory(name)}
              style={{
                background: isActive ? 'linear-gradient(135deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.05)',
                border: '1px solid',
                borderColor: isActive ? 'transparent' : 'rgba(255,255,255,0.08)',
                color: isActive ? '#000' : '#9090b0',
                padding: '6px 12px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
                textTransform: 'capitalize', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
                transition: 'all 0.15s'
              }}
            >
              <span>{catIcon(name)}</span>
              <span>{name === 'All' ? 'All' : name}</span>
              <span style={{ opacity: 0.6, fontSize: '11px' }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* ── Top Played Section ── */}
      {topPlayed.length > 0 && !searchTerm && activeCategory === 'All' && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px'
          }}>
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '11px', fontWeight: 800, color: '#ff9500', letterSpacing: '0.08em' }}>🔥 TOP PLAYED</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,149,0,0.15)' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
            {topPlayed.map(({ game, count }) => (
              <div key={game.id} onClick={() => openGame(game)} style={{
                flexShrink: 0, width: '80px', cursor: 'pointer', position: 'relative'
              }}>
                <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid rgba(255,149,0,0.3)' }}>
                  <img src={game.image} alt={game.title} style={{ width: '80px', height: '80px', objectFit: 'cover', display: 'block' }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent,rgba(0,0,0,0.8))',
                    padding: '12px 4px 4px', textAlign: 'center'
                  }}>
                    <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '9px', color: '#ff9500', fontWeight: 800 }}>▶ {count}x</span>
                  </div>
                </div>
                <div style={{ marginTop: '5px', fontFamily: 'Rajdhani, sans-serif', fontSize: '11px', color: '#ccc', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sort + Count Bar ── */}
      {!loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px' }}>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', color: '#666' }}>
            {filtered.length} game{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            {searchTerm ? ` for "${searchTerm}"` : ''}
          </span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {/* Sort buttons */}
            {[['quality','⭐'],['name','🔤'],['newest','🆕']].map(([mode, icon]) => (
              <button key={mode} onClick={() => setSortMode(mode)} style={{
                background: sortMode === mode ? 'rgba(255,149,0,0.15)' : 'rgba(255,255,255,0.04)',
                border: '1px solid', borderColor: sortMode === mode ? 'rgba(255,149,0,0.4)' : 'rgba(255,255,255,0.07)',
                color: sortMode === mode ? '#ff9500' : '#555',
                padding: '4px 8px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700
              }}>{icon}</button>
            ))}
            {/* Grid/List toggle */}
            <button onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              color: '#666', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer'
            }}>{view === 'grid' ? '☰' : '⊞'}</button>
          </div>
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && !loadingMore ? (
        <div style={{ textAlign: 'center', padding: '60px 40px', color: '#ff9500', fontFamily: 'Orbitron, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.05em' }}>
          <div style={{ fontSize: '28px', marginBottom: '12px', animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>🎮</div>
          <br />LOADING GAMES...
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
      ) : (
        <>
          {/* ── Grid View ── */}
          {view === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {filtered.map(game => (
                <GameCard key={game.id} game={game} playCount={playCounts[game.id] || 0} onPlay={() => openGame(game)} />
              ))}
            </div>
          )}

          {/* ── List View ── */}
          {view === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map(game => (
                <GameRow key={game.id} game={game} playCount={playCounts[game.id] || 0} onPlay={() => openGame(game)} />
              ))}
            </div>
          )}

          {/* ── Empty State ── */}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🕹️</div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '13px', color: '#444', fontWeight: 700 }}>NO GAMES FOUND</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', color: '#555', marginTop: '6px' }}>Try a different search or category</div>
            </div>
          )}

          {/* ── Load More ── */}
          {nextUrl && !searchTerm && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={() => fetchGames(nextUrl, true)}
                disabled={loadingMore}
                style={{
                  background: loadingMore ? 'rgba(255,255,255,0.04)' : 'rgba(255,149,0,0.08)',
                  border: '1px solid rgba(255,149,0,0.25)', color: loadingMore ? '#555' : '#ff9500',
                  padding: '11px 28px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
                  cursor: loadingMore ? 'default' : 'pointer', fontFamily: 'Orbitron, sans-serif',
                  letterSpacing: '0.04em', transition: 'all 0.2s'
                }}
              >
                {loadingMore ? '⏳ LOADING...' : 'LOAD MORE GAMES ↓'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Game Card (Grid) ─────────────────────────────────────────────────────────
function GameCard({ game, onPlay, playCount }) {
  const stars = (game.quality_score * 5).toFixed(1)
  const hasPlayed = playCount > 0
  return (
    <div
      onClick={onPlay}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '16px', overflow: 'hidden', position: 'relative',
        cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s',
        borderColor: hasPlayed ? 'rgba(255,149,0,0.3)' : 'var(--border)'
      }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {hasPlayed && (
        <div style={{
          position: 'absolute', top: '8px', right: '8px', zIndex: 2,
          background: 'rgba(255,149,0,0.85)', borderRadius: '8px',
          padding: '2px 6px', fontSize: '9px', fontFamily: 'Orbitron, sans-serif',
          fontWeight: 800, color: '#000'
        }}>▶ {playCount}x</div>
      )}
      <div style={{ aspectRatio: '1', background: '#111' }}>
        <img src={game.image} alt={game.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {game.title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginTop: '5px' }}>
          <span style={{ color: '#ff9500', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>⭐ {stars}</span>
          <span style={{ color: '#555', textTransform: 'capitalize', fontFamily: 'Rajdhani, sans-serif', fontSize: '11px' }}>
            {catIcon(game.category)} {game.category}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Game Row (List) ──────────────────────────────────────────────────────────
function GameRow({ game, onPlay, playCount }) {
  const stars = (game.quality_score * 5).toFixed(1)
  return (
    <div
      onClick={onPlay}
      style={{
        display: 'flex', gap: '12px', alignItems: 'center',
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '10px', cursor: 'pointer',
        borderColor: playCount > 0 ? 'rgba(255,149,0,0.25)' : 'var(--border)'
      }}
    >
      <div style={{ flexShrink: 0, width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', background: '#111' }}>
        <img src={game.image} alt={game.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {game.title}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '3px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '12px', color: '#555', textTransform: 'capitalize' }}>
            {catIcon(game.category)} {game.category}
          </span>
          <span style={{ color: '#ff9500', fontSize: '12px', fontFamily: 'Rajdhani, sans-serif' }}>⭐ {stars}</span>
          {playCount > 0 && <span style={{ fontSize: '11px', color: '#ff9500', fontFamily: 'Orbitron, sans-serif', fontWeight: 800 }}>▶ {playCount}x</span>}
        </div>
      </div>
      <div style={{ flexShrink: 0, background: 'linear-gradient(135deg,#ff6b00,#ff9500)', borderRadius: '10px', padding: '8px 12px', fontFamily: 'Orbitron, sans-serif', fontSize: '11px', fontWeight: 800, color: '#000' }}>
        PLAY
      </div>
    </div>
  )
}