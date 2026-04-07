// GameDistribution Publisher ID
export const GD_PUBLISHER_ID = import.meta.env.VITE_GD_PUBLISHER_ID

// GD Game embed URL generator
export const getGameUrl = (gameId) => {
  return `https://html5.gamedistribution.com/${gameId}/?gd_sdk_referrer_url=${encodeURIComponent(window.location.href)}`
}

// Default game categories
export const GAME_CATEGORIES = [
  { id: 'all', label: '🎮 All' },
  { id: 'action', label: '⚔️ Action' },
  { id: 'racing', label: '🏎️ Racing' },
  { id: 'puzzle', label: '🧩 Puzzle' },
  { id: 'sports', label: '⚽ Sports' },
  { id: 'casual', label: '🎲 Casual' },
  { id: 'girls', label: '💅 Girls' },
]

// Featured games from GD (ye GD API se aayenge)
// User dashboard mein customize kar sakta hai
export const DEFAULT_GAMES = [
  {
    id: '8d6ab91c04d74fd5b7f8d5f2394e7e61',
    name: 'Cricket Blitz',
    category: 'sports',
    thumb: 'https://img.gamedistribution.com/8d6ab91c04d74fd5b7f8d5f2394e7e61-512x512.jpeg',
    rating: '4.9',
    players: '3.5k'
  },
  {
    id: 'f893d7e241a640e497e6f6f46174c52f',
    name: 'Car Rush',
    category: 'racing',
    thumb: 'https://img.gamedistribution.com/f893d7e241a640e497e6f6f46174c52f-512x512.jpeg',
    rating: '4.7',
    players: '2.1k'
  },
  {
    id: '7a2f27f482f642d5abefa2fce4a44e13',
    name: 'Brain Puzzle',
    category: 'puzzle',
    thumb: 'https://img.gamedistribution.com/7a2f27f482f642d5abefa2fce4a44e13-512x512.jpeg',
    rating: '4.5',
    players: '1.8k'
  },
]
