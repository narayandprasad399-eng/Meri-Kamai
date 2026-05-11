// ================================================
// hooks/useAuth.js — Worker Cookie Session
// Supabase useAuth replace kar diya
// ================================================

import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [portal,  setPortal]  = useState(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await api.get('/auth/session')
        if (data.user) {
          setUser(data.user)
          setPortal(data.portal || null)
        }
      } catch (e) {
        console.log('Session check failed:', e)
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  return { user, loading, portal, setPortal }
}