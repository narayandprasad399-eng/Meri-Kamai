import { useState } from 'react'
import { getGameUrl, GAME_CATEGORIES, DEFAULT_GAMES } from '../../lib/gameDistribution'
import { useGameViews } from '../../hooks/useGameViews'

// 🟢 1. हमारे खुद के 4 Premium/Exclusive Games (inme isLocal: true lagaya hai)
const LOCAL_GAMES = [
  { id: 'ludo-infinity', name: 'Ludo Infinity Pro', thumb: '', file: '/games/ludo-game.html', category: 'board', rating: '4.9', players: '5k+', isLocal: true },
  { id: 'ludo-rush', name: 'Ludo Neon Rush', thumb: '', file: '/games/luck_dice.html', category: 'board', rating: '4.8', players: '3k+', isLocal: true },
  { id: 'bottle-sort', name: 'Neon Liquid Sort', thumb: '', file: '/games/bottle_sort.html', category: 'puzzle', rating: '4.7', players: '2k+', isLocal: true },
  { id: 'know-world', name: 'Know It All Quiz', thumb: '', file: '/games/know-the-world.html', category: 'quiz', rating: '4.9', players: '10k+', isLocal: true }
];

export default function GamesTab({ selectedGames, portalSlug }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeGame, setActiveGame] = useState(null)
  
  const { startTracking, stopTracking } = useGameViews(portalSlug, activeGame?.id)

  // 🟢 2. GD Games + Local Games का 'Maha-Sangam' (Local games sabse aage dikhenge)
  const gdGames = selectedGames?.length ? selectedGames : DEFAULT_GAMES
  const ALL_GAMES = [...LOCAL_GAMES, ...gdGames]

  // Filter Logic
  const filtered = activeCategory === 'all' 
    ? ALL_GAMES 
    : ALL_GAMES.filter(g => g.category === activeCategory)

  const openGame = (game) => {
    setActiveGame(game)
    startTracking()
  }

  const closeGame = () => {
    stopTracking()
    setActiveGame(null)
  }

  if (activeGame) {
    // 🟢 3. असली जादू: अगर गेम अपना है तो HTML फाइल चलाओ, वरना GD का लिंक लाओ!
    const iframeSrc = activeGame.isLocal ? activeGame.file : getGameUrl(activeGame.id);

    return (
      <div style={{ height: 'calc(100vh - var(--tab-h) - 57px)', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', zIndex: 10 }}>
          <button onClick={closeGame} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>←</button>
          <span style={{ fontFamily: 'Teko', fontSize: '20px', fontWeight: 700, color: '#fff' }}>
            {activeGame.name} {activeGame.isLocal && <span style={{fontSize: '12px', color: '#ff6b00'}}>★ PRO</span>}
          </span>
        </div>
        
        <iframe 
          src={iframeSrc} 
          style={{ flex: 1, border: 'none', width: '100%', background: '#000' }} 
          allow="autoplay; fullscreen; payment" 
          title={activeGame.name} 
          scrolling="no" 
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 16px', animation: 'fadeUp 0.3s ease' }}>
      
      {/* Categories Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none', marginBottom: '4px' }}>
        <button onClick={() => setActiveCategory('all')} style={{ background: activeCategory === 'all' ? 'linear-gradient(135deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: activeCategory === 'all' ? 'transparent' : 'rgba(255,255,255,0.08)', color: activeCategory === 'all' ? '#000' : '#9090b0', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'Rajdhani' }}>
          All Games
        </button>
        {GAME_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ background: activeCategory === cat.id ? 'linear-gradient(135deg,#ff6b00,#ff9500)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: activeCategory === cat.id ? 'transparent' : 'rgba(255,255,255,0.08)', color: activeCategory === cat.id ? '#000' : '#9090b0', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'Rajdhani' }}>
            {cat.label}
          </button>
        ))}
      </div>
      
      {/* Games Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {filtered.map(game => <GameCard key={game.id} game={game} onPlay={() => openGame(game)} />)}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎮</div>
          <div style={{ fontFamily: 'Teko', fontSize: '22px' }}>No games in this category</div>
        </div>
      )}
    </div>
  )
}

function GameCard({ game, onPlay }) {
  return (
    <div onClick={onPlay} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}>
      
      {/* 🔥 Local Game Badge */}
      {game.isLocal && (
        <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'linear-gradient(135deg, #ff0055, #ff6b00)', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '3px 8px', borderRadius: '10px', zIndex: 5, letterSpacing: '1px' }}>
          EXCLUSIVE
        </div>
      )}

      <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg,#1a1a35,#0a0a20)', position: 'relative', overflow: 'hidden' }}>
        {game.thumb ? <img src={game.thumb} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🎮</div>}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0}>
          <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#ff6b00,#ff9500)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>▶</div>
        </div>
      </div>
      
      <div style={{ padding: '10px 10px 12px' }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.name}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#ff9500' }}>⭐ {game.rating || '4.5'}</span>
          <span style={{ fontSize: '11px', color: 'var(--text2)' }}>👥 {game.players || '1k+'}</span>
        </div>
      </div>
    </div>
  )
}