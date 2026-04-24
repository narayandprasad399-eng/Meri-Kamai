import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

// 🟢 1. Supabase aur useAuth ko yahan import kiya hai
import { getPortal, supabase } from '../lib/supabase' 
import { useAuth } from '../hooks/useAuth'
import { setupPWA } from '../lib/pwa'

import Navbar from '../components/Layout/Navbar'
import BottomTabs from '../components/Layout/BottomTabs'
import GamesTab from '../components/Games/GamesTab'
import ReelsTab from '../components/Reels/ReelsTab'
import CourseArea from '../components/English/CourseArea'
import InstallBanner from '../components/Layout/InstallBanner'

// 🟢 YAHAN HAI ASLI FIX: Missing Imports add kar diye gaye hain
import EarnTab from '../components/Earn/EarnTab'
import OffersTab from '../components/Offers/OffersTab'

export default function Portal() {
  // 🟢 2. SAARE HOOKS SABSE UPAR (Rules of Hooks)
  const { username } = useParams()
  const { user } = useAuth() 
  
  const [activeTab, setActiveTab] = useState('games')
  const [portal, setPortal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // 🟢 3. Portal Data Load karne ka logic
  useEffect(() => {
    const load = async () => {
      if (username === 'demo') {
        const demo = { slug: 'demo', portal_name: 'Demo Portal', selected_games: [], plan: 'free' }
        setPortal(demo)
        setupPWA('Demo Portal', 'demo')
        setLoading(false)
        return
      }
      const { data, error } = await getPortal(username)
      if (error || !data) { 
        setNotFound(true) 
      } else {
        setPortal(data)
        setupPWA(data.portal_name, data.slug)
      }
      setLoading(false)
    }
    load()
  }, [username])

  // 🟢 4. User ko Creator se Bind Karne ka logic (Referral)
  useEffect(() => {
    const bindUserToCreator = async () => {
      if (user && username && username !== 'demo') {
        const { data } = await supabase
          .from('profiles')
          .select('referred_by')
          .eq('user_id', user.id)
          .single()

        if (!data || !data.referred_by) {
          await supabase.from('profiles').upsert({
            user_id: user.id,
            referred_by: username 
          })
        }
      }
    }
    bindUserToCreator()
  }, [user, username])

  // 🛑 HOOKS ke baad hi 'if' conditions lagani hain
  if (loading) return <LoadingScreen />
  if (notFound) return <NotFoundScreen username={username} />

  return (
    <div className="portal-wrap">
      <Navbar portalName={portal?.portal_name} username={portal?.slug} />
      <InstallBanner />
      <div style={{ minHeight: 'calc(100vh - var(--tab-h) - 57px)' }}>
        {activeTab === 'games' && <GamesTab selectedGames={portal?.selected_games} portalSlug={portal?.slug} />}
        {activeTab === 'reels' && <ReelsTab portalSlug={portal?.slug} />}
        {activeTab === 'english' && <CourseArea />}
        {/* 🟢 Ab ye dono crash nahi honge */}
        {activeTab === 'earn' && <EarnTab userId={portal?.slug} />}
        {activeTab === 'offers' && <OffersTab />}
      </div>
      <BottomTabs active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: 'var(--bg)' }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: '24px', fontWeight: 900, color: '#f0f0ff' }}>MERI<span style={{ color: '#ff6b00' }}>KAMAI</span></div>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,107,0,0.2)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
}

function NotFoundScreen({ username }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: 'var(--bg)', padding: '24px', textAlign: 'center' }}>
      <div style={{ fontSize: '60px' }}>😕</div>
      <h2 style={{ fontFamily: 'Teko', fontSize: '32px' }}>@{username} nahi mila!</h2>
      <p style={{ color: 'var(--text2)', maxWidth: '280px', lineHeight: 1.6 }}>Yeh portal exist nahi karta. Apna portal banane ke liye sign up karo!</p>
      <a href="/" className="btn-main" style={{ marginTop: '8px' }}>Free Portal Banao 🚀</a>
    </div>
  )
}