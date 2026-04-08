import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// वही सेम लिस्ट यहाँ भी चाहिए (या इसे अलग file me export kar lena baad me)
const GAMES_LIST = [
  { id: 'ludo-infinity', file: '/games/ludo-game.html', tag: 'Trending' },
  { id: 'How Lucky u are', file: '/games/luck_dice.html', tag: 'Logic' },
  { id: 'Sort Bottles', file: '/games/bottle_sort.html', tag: 'Speed' },
  { id: 'Know Everything', file: '/games/know-the-world.html', tag: 'Focus' }
];

export default function PlayGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  // URL के ID से गेम ढूंढो
  const game = GAMES_LIST.find(g => g.id === gameId);
  
  // Adsterra Link .env से उठाओ
  const adsterraLink = import.meta.env.VITE_ADSTERRA_KEY;

  if (!game) {
    return <h2 style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Game Not Found!</h2>;
  }

  // 🪄 असली जादू: गेम का URL + Adsterra Link 
  const iframeUrl = `${game.file}?adlink=${encodeURIComponent(adsterraLink)}`;

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000', position: 'relative' }}>
      
      {/* 🔙 Back Button */}
      <button 
        onClick={() => navigate('/games')}
        style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', backdropFilter: 'blur(5px)' }}
      >
        ← Exit Game
      </button>

      {/* 🎮 The Game Window */}
      <iframe 
        src={iframeUrl} 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Karmi Minds Game"
        allowFullScreen
      />
    </div>
  );
}