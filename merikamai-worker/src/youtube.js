// ================================================
// YouTube Shorts Handler
// API key safe hai — sirf worker ke andar
// KV Cache use karta hai quota bachane ke liye
// ================================================

const CATEGORY_QUERIES = {
  comedy:    'funny comedy hindi shorts 2024',
  cricket:   'cricket funny moments india shorts',
  bollywood: 'bollywood funny scenes hindi shorts',
  desi:      'desi funny videos india shorts',
  food:      'indian street food shorts',
  facts:     'amazing facts hindi shorts',
  trending:  'trending india viral shorts',
}

// Cache duration: 6 ghante (quota bachao)
const CACHE_TTL = 6 * 60 * 60

export async function handleYouTube(request, env) {
  const url = new URL(request.url)
  const category = url.searchParams.get('category') || 'comedy'
  const pageToken = url.searchParams.get('pageToken') || ''

  // Cache key
  const cacheKey = `yt:${category}:${pageToken}`

  // KV cache check karo pehle
  if (env.CACHE) {
    const cached = await env.CACHE.get(cacheKey, 'json')
    if (cached) {
      return jsonResponse({ ...cached, fromCache: true })
    }
  }

  // YouTube API call
  const query = CATEGORY_QUERIES[category] || CATEGORY_QUERIES.comedy
  const apiKey = env.YOUTUBE_API_KEY

  if (!apiKey) {
    return jsonResponse({ error: 'YouTube API key not configured' }, 500)
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    videoDuration: 'short',        // 60 sec se kam
    videoEmbeddable: 'true',       // Sirf embeddable videos
    maxResults: '20',
    order: 'relevance',
    relevanceLanguage: 'hi',       // Hindi prefer karo
    regionCode: 'IN',              // India
    key: apiKey,
    ...(pageToken && { pageToken }),
  })

  const ytUrl = `https://www.googleapis.com/youtube/v3/search?${params}`

  const res = await fetch(ytUrl)
  const data = await res.json()

  if (!res.ok) {
    console.error('YouTube API error:', data)
    return jsonResponse({ error: 'YouTube API error', details: data.error?.message }, 500)
  }

  // Format karo
  const videos = (data.items || [])
    .filter(item => item.id?.videoId) // Sirf valid videos
    .map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumb: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
    }))

  const result = {
    videos,
    nextPageToken: data.nextPageToken || null,
    totalResults: data.pageInfo?.totalResults || 0,
    category,
  }

  // KV mein cache karo
  if (env.CACHE && videos.length > 0) {
    await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: CACHE_TTL })
  }

  return jsonResponse(result)
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
