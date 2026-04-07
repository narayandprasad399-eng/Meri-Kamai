import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export const useGameViews = (portalSlug, gameId) => {
  const intervalRef = useRef(null)
  const clicked = useRef(false)

  const trackView = async (type = 'interval') => {
    if (!portalSlug || !gameId) return
    try {
      await supabase.from('portal_views').insert([{
        portal_slug: portalSlug,
        game_id: gameId,
        view_type: type,
        date: new Date().toISOString().split('T')[0],
      }])
      await supabase.rpc('increment_views', { slug: portalSlug })
    } catch(e) {}
  }

  const startTracking = () => {
    if (!clicked.current) { clicked.current = true; trackView('click') }
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => trackView('interval'), 5 * 60 * 1000)
  }

  const stopTracking = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    clicked.current = false
  }

  useEffect(() => () => stopTracking(), [])
  return { startTracking, stopTracking }
}
