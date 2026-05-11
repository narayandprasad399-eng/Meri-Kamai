import { useState, useEffect } from 'react'

const WORKER_URL = import.meta.env.VITE_WORKER_URL

export const useSubscription = (userId) => {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    checkSubscription()
  }, [userId])

  const checkSubscription = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/portal/dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', userId }),
      })
      const data = await res.json()
      setSubscription(data)
    } catch (err) {
      console.error('Subscription check error:', err)
      setSubscription({ plan: 'free', active: false, daysLeft: 0 })
    } finally {
      setLoading(false)
    }
  }

  return { subscription, loading, refetch: checkSubscription }
}
