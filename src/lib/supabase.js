import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth helpers
// 🟢 Update kiya gaya auth helper
export const signInWithGoogle = async (redirectPath = '/dashboard') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}${redirectPath}` }
  })
  return { data, error }
}

export const signOut = async () => {
  await supabase.auth.signOut()
}

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Portal helpers
export const getPortal = async (username) => {
  const { data, error } = await supabase
    .from('portals')
    .select('*')
    .eq('slug', username.toLowerCase())
    .single()
  return { data, error }
}

export const getUserPortal = async (userId) => {
  const { data, error } = await supabase
    .from('portals')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const createPortal = async (userId, slug, email, portalName = 'My Portal') => {
  const { data, error } = await supabase
    .from('portals')
    .insert([{ user_id: userId, slug, email, portal_name: portalName, plan: 'free', selected_games: [] }])
    .select()
    .single()
  return { data, error }
}

export const updatePortal = async (userId, updates) => {
  const { data, error } = await supabase
    .from('portals')
    .update(updates)
    .eq('user_id', userId)
  return { data, error }
}
