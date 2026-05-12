// ================================================
// lib/youtube.js — Frontend Reels Helper
// Categories: trending, comedy, desi
// ================================================
import { api } from './api' // Tumhara naya api.js helper

export const CATEGORIES = [
  { id: 'trending', label: '🔥 Trending' },
  { id: 'comedy',   label: '😂 Comedy' },
  { id: 'desi',     label: '🇮🇳 Desi' }
]

// Cloudflare Worker se reels fetch karo
export const fetchReels = async (category = 'trending', pageToken = null) => {
  try {
    const params = new URLSearchParams({ category, ...(pageToken && { pageToken }) })
    
    // 🚀 Naye worker route (/api/reels) par request bhej raha hai
    const data = await api.get(`/api/reels?${params}`)
    return data

  } catch (err) {
    console.error('Reels fetch error:', err)
    return { videos: [], nextPageToken: null }
  }
}

// Direct YouTube embed URL
export const getEmbedUrl = (videoId) => {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`
}