import { useState } from 'react'

const INTRO_VIDEO_ID = 'dQw4w9WgXcQ' // Replace with your actual YouTube video ID

const SHOPPING_OFFERS = [
  {
    id: 1,
    brand: 'Earn Karo',
    category: 'Reselling',
    title: 'Ghar baithe kamaao',
    desc: 'Meesho products share karo, har sale pe commission pao. Zero investment, zero risk.',
    badge: 'TOP PICK',
    badgeColor: '#ff6b00',
    earn: 'Up to ₹50,000/month',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80',
    cta: 'Abhi Join Karo',
    link: 'https://earnkaro.com',
    tags: ['Free', 'Work from home', 'No investment'],
  },
  {
    id: 2,
    brand: 'Electronics',
    category: 'Shopping Deals',
    title: 'Top electronics offers',
    desc: 'Mobiles, laptops, earbuds — sabse saste dam pe. Earn Karo se share karo aur cashback pao.',
    badge: 'HOT',
    badgeColor: '#e53935',
    earn: '5–12% cashback',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
    cta: 'Deals Dekho',
    link: 'https://earnkaro.com',
    tags: ['Electronics', 'Cashback', 'Top brands'],
  },
]

const UPI_OFFERS = [
  {
    id: 1,
    brand: 'Navi',
    category: 'UPI Cashback',
    title: 'Har UPI pe cashback',
    desc: 'Navi UPI se koi bhi payment karo — grocery, petrol, recharge — seedha bank mein cashback.',
    badge: 'BEST',
    badgeColor: '#ff6b00',
    earn: 'Up to ₹500/month',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80',
    cta: 'Navi Download Karo',
    link: 'https://navi.com',
    tags: ['Every payment', 'Instant cashback', 'All merchants'],
  },
  {
    id: 2,
    brand: 'Navi',
    category: 'Recharge Offers',
    title: 'Mobile recharge pe cashback',
    desc: 'Airtel, Jio, Vi — kisi bhi network ka recharge Navi se karo aur extra cashback pao.',
    badge: 'NEW',
    badgeColor: '#1e88e5',
    earn: 'Up to ₹50/recharge',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80',
    cta: 'Recharge Karo',
    link: 'https://navi.com',
    tags: ['Airtel', 'Jio', 'Vi'],
  },
]

// 🟢 NAYA PRODUCTIVITY OFFERS ARRAY
const PRODUCTIVITY_OFFERS = [
  {
    id: 1,
    brand: 'Notion',
    category: 'Mind Training',
    title: 'Second Brain for Students',
    desc: 'Apne notes, goals, aur logic-building tasks ko ek jagah organize karo. Top toppers ki pehli pasand.',
    badge: 'ESSENTIAL',
    badgeColor: '#000000',
    earn: '10x Focus & Memory',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&q=80',
    cta: 'Try Notion Free',
    link: 'https://notion.so',
    tags: ['Notes', 'Planning', 'Free'],
  },
  {
    id: 2,
    brand: 'Forest',
    category: 'Focus App',
    title: 'Stay Focused, Plant Trees',
    desc: 'Distraction khatam karo! Phone chhod kar padhai par dhyan do aur virtual ped ugao.',
    badge: 'POPULAR',
    badgeColor: '#2e7d32',
    earn: 'Zero Distraction',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400&q=80',
    cta: 'Get Forest App',
    link: 'https://www.forestapp.cc/',
    tags: ['Timer', 'Anti-Distraction', 'Study'],
  },
  {
    id: 3,
    brand: 'Grammarly',
    category: 'Writing Tool',
    title: 'English likhna aur asaan',
    desc: 'Emails, essays ya messages — har jagah English grammar ko automatic fix karo.',
    badge: 'SMART',
    badgeColor: '#1565c0',
    earn: 'Perfect Grammar',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead2708?w=400&q=80',
    cta: 'Install Grammarly',
    link: 'https://grammarly.com',
    tags: ['English', 'AI Assistant', 'Writing'],
  },
]

export default function OffersTab() {
  const [activeTab, setActiveTab] = useState('shopping')
  const [showVideo, setShowVideo] = useState(false)
  
  // 🟢 Tab ke hisaab se data load hoga
  const offers = 
    activeTab === 'shopping' ? SHOPPING_OFFERS : 
    activeTab === 'upi' ? UPI_OFFERS : 
    PRODUCTIVITY_OFFERS

  // Helper functions for dynamic content
  const getBannerInfo = () => {
    if(activeTab === 'shopping') return { top: '🛍️ Reselling + Shopping', mid: 'Ghar Baithe ₹50,000+', bot: 'Mahine Mein Kamaao', icon: '💰' }
    if(activeTab === 'upi') return { top: '💸 UPI se Kamaao', mid: 'Har Payment Pe', bot: 'Cashback Guaranteed', icon: '⚡' }
    return { top: '🧠 Hack Your Brain', mid: 'Apni Productivity', bot: '10 Guna Badao', icon: '🚀' }
  }

  const getCtaInfo = () => {
    if(activeTab === 'shopping') return { icon: '🛒', title: 'Earn Karo se aaj hi shuru karo', sub: 'Zero investment • Unlimited earning', btn: '🚀 Earn Karo Join Karo', link: 'https://earnkaro.com' }
    if(activeTab === 'upi') return { icon: '📱', title: 'Navi app install karo aaj hi', sub: 'Free install • Instant cashback', btn: '⚡ Navi Download Karo', link: 'https://navi.com' }
    return { icon: '🧠', title: 'Apne mind ka system upgrade karo', sub: 'Logic building • Laser focus', btn: '💡 Explore Karmi Minds', link: 'https://karmiminds.com' }
  }

  const banner = getBannerInfo()
  const cta = getCtaInfo()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080f',
      fontFamily: "'Rajdhani', sans-serif",
      overflowX: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        background: 'rgba(5,5,12,0.98)',
        borderBottom: '1px solid rgba(255,107,0,0.15)',
        padding: '12px 16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 900, color: '#f0f0ff', letterSpacing: 1 }}>
              MERI<span style={{ color: '#ff6b00' }}>KAMAI</span>
            </span>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1, fontWeight: 600, letterSpacing: 1 }}>OFFERS & TOOLS</div>
          </div>

          <button onClick={() => setShowVideo(true)} style={{
            background: 'rgba(255,107,0,0.12)',
            border: '1px solid rgba(255,107,0,0.35)',
            color: '#ff9500',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <span style={{ fontSize: 13 }}>▶</span> Kaise Use Karein
          </button>
        </div>

        {/* 🟢 Tab switcher - 3 Tabs Added */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { id: 'shopping', label: '🛍️ Shop', sub: 'Earn Karo' },
            { id: 'upi', label: '💸 UPI', sub: 'Cashback' },
            { id: 'productivity', label: '🧠 Focus', sub: 'Mind Tools' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1,
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #ff6b00, #ff9500)'
                : 'rgba(255,255,255,0.04)',
              border: '1px solid',
              borderColor: activeTab === tab.id ? 'transparent' : 'rgba(255,255,255,0.07)',
              borderBottom: 'none',
              borderRadius: '10px 10px 0 0',
              padding: '8px 2px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: activeTab === tab.id ? '#000' : '#9090b0' }}>{tab.label}</div>
              <div style={{ fontSize: 9, color: activeTab === tab.id ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{tab.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Hero banner */}
      <div style={{
        margin: '12px 12px 0',
        background: 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,149,0,0.08))',
        border: '1px solid rgba(255,107,0,0.2)',
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#ff9500', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
            {banner.top}
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginTop: 3 }}>
            {banner.mid}
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#ff6b00', lineHeight: 1.2 }}>
            {banner.bot}
          </div>
        </div>
        <div style={{ fontSize: 44, opacity: 0.9 }}>
          {banner.icon}
        </div>
      </div>

      {/* Offer cards */}
      <div style={{ padding: '12px 12px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {offers.map((offer, i) => (
          <OfferCard key={offer.id} offer={offer} index={i} />
        ))}

        {/* Bottom CTA */}
        <div style={{
          background: 'rgba(255,107,0,0.08)',
          border: '1px dashed rgba(255,107,0,0.3)',
          borderRadius: 14,
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{cta.icon}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
            {cta.title}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
            {cta.sub}
          </div>
          <a
            href={cta.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ff6b00, #ff9500)',
              color: '#000',
              padding: '10px 28px',
              borderRadius: 25,
              fontWeight: 900,
              fontSize: 13,
              textDecoration: 'none',
              letterSpacing: 0.5,
            }}>
            {cta.btn}
          </a>
        </div>
      </div>

      {/* Video Modal (Same as before) */}
      {showVideo && (
        <div
          onClick={() => setShowVideo(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Kaise Kamayen — Samjho</div>
              <button onClick={() => setShowVideo(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 12, overflow: 'hidden' }}>
              <iframe src={`https://www.youtube-nocookie.com/embed/${INTRO_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&color=white`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay; encrypted-media" title="Kaise Kamayen" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OfferCard({ offer, index }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', animation: `fadeUp 0.4s ease ${index * 0.08}s both` }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
        <img src={offer.image} alt={offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,1) 0%, rgba(8,8,15,0.3) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 10, left: 10, background: offer.badgeColor, color: '#fff', fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: 4, letterSpacing: 1.5 }}>{offer.badge}</div>
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>{offer.category}</div>
        <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'linear-gradient(135deg, #ff6b00, #ff9500)', color: '#000', fontSize: 11, fontWeight: 900, padding: '4px 10px', borderRadius: 20 }}>💡 {offer.earn}</div>
      </div>
      {/* Content */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 11, color: '#ff9500', fontWeight: 800, letterSpacing: 0.5, marginBottom: 3 }}>{offer.brand}</div>
        <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>{offer.title}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: 10 }}>{offer.desc}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {offer.tags.map(tag => (
            <span key={tag} style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)', color: '#ff9500', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{tag}</span>
          ))}
        </div>
        <a href={offer.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: 'linear-gradient(135deg, #ff6b00, #ff9500)', color: '#000', textAlign: 'center', padding: '10px', borderRadius: 10, fontWeight: 900, fontSize: 13, textDecoration: 'none', letterSpacing: 0.3 }}>{offer.cta} →</a>
      </div>
    </div>
  )
}