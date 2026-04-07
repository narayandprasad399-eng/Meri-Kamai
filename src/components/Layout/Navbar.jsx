export default function Navbar({ portalName, username }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(5,5,10,0.95)',
      backdropFilter: 'blur(15px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, #ff6b00, #ff9500)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: 900,
          color: '#000',
          fontFamily: 'Orbitron, sans-serif',
        }}>
          {(portalName || 'M')[0].toUpperCase()}
        </div>
        <div>
          <div style={{
            fontFamily: 'Teko, sans-serif',
            fontSize: '18px',
            fontWeight: 700,
            color: '#f0f0ff',
            lineHeight: 1,
          }}>
            {portalName || 'Meri Kamai'}
          </div>
          {username && (
            <div style={{ fontSize: '11px', color: '#606080' }}>
              @{username}
            </div>
          )}
        </div>
      </div>

      {/* Karmi Minds floating promo */}
      <a
        href="https://karmiminds.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: 'linear-gradient(135deg, #ff6b00, #ff9500)',
          color: '#000',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          textDecoration: 'none',
          fontFamily: 'Rajdhani, sans-serif',
          letterSpacing: '0.5px',
          animation: 'pulse 2s infinite',
          whiteSpace: 'nowrap',
        }}
      >
        🎓 Speak English!
      </a>
    </header>
  )
}
