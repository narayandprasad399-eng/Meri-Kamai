// Cloudflare Worker se call hoga - API key safe rahegi
const WORKER_URL = import.meta.env.VITE_CF_WORKER_URL

export const CATEGORIES = [
  { id: 'comedy', label: '😂 Comedy', query: 'funny comedy hindi shorts' },
  { id: 'cricket', label: '🏏 Cricket', query: 'cricket funny moments shorts' },
  { id: 'bollywood', label: '🎬 Bollywood', query: 'bollywood funny scenes shorts' },
  { id: 'desi', label: '🇮🇳 Desi', query: 'desi funny videos india shorts' },
  { id: 'food', label: '🍛 Food', query: 'indian street food shorts' },
  { id: 'facts', label: '🤯 Facts', query: 'amazing facts hindi shorts' },
]

// Cloudflare Worker se videos fetch karo
export const fetchReels = async (category = 'comedy', pageToken = null) => {
  try {
    const params = new URLSearchParams({ category, ...(pageToken && { pageToken }) })
    const res = await fetch(`${WORKER_URL}/youtube?${params}`)
    const data = await res.json()
    return data
  } catch (err) {
    console.error('Reels fetch error:', err)
    return { videos: [], nextPageToken: null }
  }
}

// Direct YouTube embed URL
export const getEmbedUrl = (videoId) => {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`
}
