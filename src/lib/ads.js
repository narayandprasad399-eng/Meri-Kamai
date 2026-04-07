// Ad timing system
let reelCount = 0
let lastAdTime = 0

export const AD_CONFIG = {
  reelsBeforeAd: 3,      // Har 3 reels baad ad
  shortAdDuration: 5,    // 5 sec short ad
  longAdDuration: 15,    // 15 sec long ad
  longAdEvery: 9,        // Har 9 reels baad 15 sec ad
}

// Check karo ad dikhana hai ya nahi
export const shouldShowAd = () => {
  reelCount++
  if (reelCount % AD_CONFIG.longAdEvery === 0) return 'long'
  if (reelCount % AD_CONFIG.reelsBeforeAd === 0) return 'short'
  return false
}

export const resetAdCounter = () => { reelCount = 0 }

// AdsTerra script inject karo
export const loadAdsTerra = () => {
  const key = import.meta.env.VITE_ADSTERRA_KEY
  if (!key || document.getElementById('adsterra-script')) return
  const script = document.createElement('script')
  script.id = 'adsterra-script'
  script.src = `//pl${key}.profitablecpmrate.com/${key}/invoke.js`
  script.async = true
  document.body.appendChild(script)
}

// Banner ad placeholder
export const BANNER_AD_CODE = import.meta.env.VITE_ADSTERRA_BANNER || ''
