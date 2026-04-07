// Origin-based PWA
// merikamai.in → dashboard manifest
// merikamai.in/username → portal manifest

export const setupPWA = (portalName, username) => {
  const isPortal = !!username
  const manifestUrl = isPortal ? '/manifest-portal.json' : '/manifest-dashboard.json'

  // Dynamic manifest
  let link = document.querySelector('link[rel="manifest"]')
  if (!link) { link = document.createElement('link'); link.rel = 'manifest'; document.head.appendChild(link) }
  link.href = manifestUrl

  // Portal name update karo manifest mein
  if (isPortal && portalName) {
    const manifest = {
      name: portalName,
      short_name: portalName.slice(0, 12),
      description: `${portalName} - Games, Reels & English`,
      start_url: `/${username}`,
      display: 'standalone',
      background_color: '#05050a',
      theme_color: '#ff6b00',
      orientation: 'portrait',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ]
    }
    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' })
    link.href = URL.createObjectURL(blob)
  }

  // Theme color
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta) }
  meta.content = '#ff6b00'
}

// PWA install prompt
let deferredPrompt = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
})

export const showInstallPrompt = async () => {
  if (!deferredPrompt) return false
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  return outcome === 'accepted'
}

export const canInstall = () => !!deferredPrompt
