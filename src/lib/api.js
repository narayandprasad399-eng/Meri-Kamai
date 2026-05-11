// ================================================
// lib/api.js — Worker API Helper
// Dono sites ke liye shared helper
// ================================================

export const WORKER = import.meta.env.VITE_WORKER_URL || 'https://karmi-worker.YOUR_SUBDOMAIN.workers.dev'

export const api = {
  get:  (path)       => fetch(`${WORKER}${path}`, { credentials: 'include' }).then(r => r.json()),
  post: (path, body) => fetch(`${WORKER}${path}`, {
    method:      'POST',
    headers:     { 'Content-Type': 'application/json' },
    credentials: 'include',
    body:        JSON.stringify(body),
  }).then(r => r.json()),
}

// Google login redirect
export const signInWithGoogle = (redirectTo = '/dashboard') => {
  window.location.href = `${WORKER}/auth/google?from=merikamai&redirect=${encodeURIComponent(redirectTo)}`
}

// Logout
export const signOut = async () => {
  await api.post('/auth/logout', {})
  window.location.href = '/'
}