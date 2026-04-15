import { useState } from 'react'

const tabs = [
  { id: 'games', icon: '🎮', label: 'Games' },
  { id: 'reels', icon: '🎬', label: 'Reels' },
  { id: 'learn', icon: '🗣️', label: 'Learn' },
]

export default function BottomTabs({ active, onChange }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      height: 'var(--tab-h)',
      background: 'rgba(10,10,20,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      zIndex: 100,
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.2s',
          }}
        >
          {/* Active indicator */}
          {active === tab.id && (
            <span style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '2px',
              background: 'linear-gradient(90deg, #ff6b00, #ff9500)',
              borderRadius: '2px',
            }} />
          )}

          <span style={{
            fontSize: '22px',
            filter: active === tab.id ? 'none' : 'grayscale(1) opacity(0.5)',
            transform: active === tab.id ? 'scale(1.15)' : 'scale(1)',
            transition: 'all 0.2s',
          }}>
            {tab.icon}
          </span>

          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            color: active === tab.id ? '#ff6b00' : '#606080',
            transition: 'color 0.2s',
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
