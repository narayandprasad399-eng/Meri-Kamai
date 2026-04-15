import { useState, useEffect } from 'react'
import { useGameViews } from '../../hooks/useGameViews'

export default function GamesTab({ portalSlug }) {
  // 🟢 API Data aur Loading State
  const [games, setGames] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [loading, setLoading] = useState(true)
  
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeGame, setActiveGame] = useState(null)
  
  const { startTracking, stopTracking } = useGameViews(portalSlug, activeGame?.id)

  // 🟢 GamePix RSS API Fetch
  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Tera GamePix ka direct JSON URL
        const res = await fetch('https://feeds.gamepix.com/v2/json?sid=ESGG6&pagination=24&page=1')
        const data = await res.json()
        
        if (data && data.items) {
          setGames(data.items)
          
          // API se dynamically unique categories nikalna
          const uniqueCats = ['All', ...new Set(data.items.map(g => g.category))]
          setCategories(uniqueCats)
        }
      } catch (error) {
        console.error("GamePix API Error:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchGames()
  }, [])

  // 🟢 Filter Logic
  const filtered = activeCategory === 'All' 
    ? games 
    : games.filter(g => g.category === activeCategory)

  const openGame = (game) => {
    setActiveGame(game)
    startTracking()
  }

  const closeGame = () => {
    stopTracking()
    setActiveGame(null)
  }

  // 🟢 1. Game Player View (Iframe)
  if (activeGame) {
    return (
      <div style={{ height: 'calc(100dvh - var(--tab-h) - 57px)', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', zIndex: 10 }}>
          <button onClick={closeGame} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>←</button>
          <span style={{ fontFamily: 'Teko', fontSize: '20px', fontWeight: 700, color: '#fff' }}>
            {activeGame.title}
          </span>
        </div>
        
        {/* GamePix URL direct iframe mein! */}
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

  // 🟢 2. Games Catalog View
  return (
    <div style={{ padding: '12px 16px', animation: 'fadeUp 0.3s ease' }}>
      
      {/* Dynamic Categories Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none', marginBottom: '4px' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            style={{ 
              background: activeCategory === cat ? 'linear-gradient(135deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.05)', 
              border: '1px solid', 
              borderColor: activeCategory === cat ? 'transparent' : 'rgba(255,255,255,0.08)', 
              color: activeCategory === cat ? '#000' : '#9090b0', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              fontSize: '13px', 
              fontWeight: 700, 
              cursor: 'pointer', 
              whiteSpace: 'nowrap', 
              transition: 'all 0.2s', 
              fontFamily: 'Rajdhani',
              textTransform: 'capitalize'
            }}>
            {cat}
          </button>
        ))}
      </div>
      
      {/* Loading State */}
      {loading ? (
         <div style={{ textAlign: 'center', padding: '40px', color: '#ff9500', fontFamily: 'Orbitron', fontSize: '16px', fontWeight: 800 }}>
            Loading Premium Games...
         </div>
      ) : (
        <>
          {/* Games Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {filtered.map(game => <GameCard key={game.id} game={game} onPlay={() => openGame(game)} />)}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎮</div>
              <div style={{ fontFamily: 'Teko', fontSize: '22px' }}>No games found</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// 🟢 3. Game Card UI (API variables mapped)
function GameCard({ game, onPlay }) {
  // GamePix quality score (0 to 1) ko 5-star rating mein convert karna
  const starRating = game.quality_score ? (game.quality_score * 5).toFixed(1) : '4.5';

  return (
    <div onClick={onPlay} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}>

      <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg,#1a1a35,#0a0a20)', position: 'relative', overflow: 'hidden' }}>
        {game.image ? (
            <img src={game.image} alt={game.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> 
        ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🎮</div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0}>
          <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#ff6b00,#ff9500)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#000' }}>▶</div>
        </div>
      </div>
      
      <div style={{ padding: '10px 10px 12px' }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {game.title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#ff9500', fontWeight: 'bold' }}>⭐ {starRating}</span>
          <span style={{ fontSize: '11px', color: 'var(--text2)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
            {game.category}
          </span>
        </div>
      </div>
    </div>
  )
}