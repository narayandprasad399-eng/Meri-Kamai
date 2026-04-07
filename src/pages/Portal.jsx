import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPortal } from '../lib/supabase'
import { setupPWA } from '../lib/pwa'
import Navbar from '../components/Layout/Navbar'
import BottomTabs from '../components/Layout/BottomTabs'
import GamesTab from '../components/Games/GamesTab'
import ReelsTab from '../components/Reels/ReelsTab'
import CourseArea from '../components/English/CourseArea'
import InstallBanner from '../components/Layout/InstallBanner'

export default function Portal() {
  const { username } = useParams()
  const [activeTab, setActiveTab] = useState('games')
  const [portal, setPortal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

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
      if (error || !data) { setNotFound(true) }
      else {
        setPortal(data)
        setupPWA(data.portal_name, data.slug)
      }
      setLoading(false)
    }
    load()
  }, [username])

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
