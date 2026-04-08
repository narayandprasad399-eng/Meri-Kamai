import React from 'react';
import { useNavigate } from 'react-router-dom';

// 🎮 तेरा गेम डेटाबेस (भविष्य में नए गेम्स यहीं ऐड करने हैं)
const GAMES_LIST = [
  { id: 'ludo-infinity', title: 'Ludo Infinity', icon: '🎲', file: '/games/ludo-game.html', tag: 'Trending' },
  { id: 'How Lucky u are', title: 'Memory Matrix', icon: '🧠', file: '/games/luck_dice.html', tag: 'Logic' },
  { id: 'Sort Bottles', title: 'Math Ninja', icon: '🥷', file: '/games/bottle_sort.html', tag: 'Speed' },
  { id: 'Know Everything', title: 'Color Puzzle', icon: '🎨', file: '/games/know-the-world.html', tag: 'Focus' }
];

export default function Games() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 20px 40px' }}>
      
      <h1 style={{ fontFamily: 'Teko', fontSize: '50px', color: '#f0f0ff', textAlign: 'center', marginBottom: '10px' }}>
        KARMI <span style={{ color: '#ff6b00' }}>ARCADE</span>
      </h1>
      <p style={{ textAlign: 'center', color: '#9090b0', marginBottom: '40px' }}>Train your brain & earn rewards!</p>

      {/* Games Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {GAMES_LIST.map((game) => (
          <div 
            key={game.id} 
            onClick={() => navigate(`/play/${game.id}`)}
            style={{
              background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s, borderColor 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#ff6b00'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>{game.icon}</div>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '18px', color: '#fff', marginBottom: '10px' }}>{game.title}</h3>
            <span style={{ background: 'rgba(255,107,0,0.1)', color: '#ff6b00', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
              {game.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}