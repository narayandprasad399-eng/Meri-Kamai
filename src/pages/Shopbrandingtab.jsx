import { useState, useRef } from 'react'
import { api } from '../lib/api'

// ── CONSTANTS ──────────────────────────────────────────────
const MAX_LOGO_KB       = 100          // 100KB
const MAX_VIDEO_MB      = 30           // ~5 min @ 1Mbps = ~37MB, we keep 30MB safe limit
const MAX_VIDEO_BITRATE = 1_000_000    // 1 Mbps in bits
const MAX_VIDEO_SECONDS = 300          // 5 minutes

// ── CLIENT-SIDE IMAGE COMPRESSOR ───────────────────────────
// Phone pe hi compress karo — R2 storage bachao
async function compressImage(file, targetKB = 100) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        // Max dimension 400px for logo
        const MAX_DIM = 400
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) { height = Math.round(height * MAX_DIM / width); width = MAX_DIM }
          else { width = Math.round(width * MAX_DIM / height); height = MAX_DIM }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)

        // Quality iterate karo jab tak size 100KB ke andar na aaye
        let quality = 0.85
        const tryCompress = () => {
          canvas.toBlob(blob => {
            if (!blob) { reject(new Error('Compression failed')); return }
            const kb = blob.size / 1024
            if (kb <= targetKB || quality <= 0.2) {
              resolve(new File([blob], 'logo.jpg', { type: 'image/jpeg' }))
            } else {
              quality -= 0.1
              tryCompress()
            }
          }, 'image/jpeg', quality)
        }
        tryCompress()
      }
    }
  })
}

// ── CLIENT-SIDE VIDEO VALIDATOR ────────────────────────────
// Video ko upload se pehle validate karo — bitrate aur duration check
async function validateVideo(file) {
  return new Promise((resolve, reject) => {
    // File size check: 1Mbps * 300s = 37.5MB — hum 30MB safe rakhte hain
    const fileMB = file.size / (1024 * 1024)
    if (fileMB > MAX_VIDEO_MB) {
      reject(new Error(`Video ${fileMB.toFixed(1)}MB hai. Maximum ${MAX_VIDEO_MB}MB allowed hai (5 min @ 1Mbps).`))
      return
    }

    // Duration check via video element
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = url
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      const duration = video.duration
      if (duration > MAX_VIDEO_SECONDS) {
        reject(new Error(`Video ${Math.round(duration)}s ki hai. Maximum 5 minutes (300s) allowed hai.`))
        return
      }
      // Approximate bitrate check
      const bitrate = (file.size * 8) / duration // bits per second
      if (bitrate > MAX_VIDEO_BITRATE * 1.2) { // 20% tolerance
        reject(new Error(`Video ka bitrate ${(bitrate/1_000_000).toFixed(1)}Mbps hai. Please compress karke 1Mbps se neeche rakho.`))
        return
      }
      resolve({ duration: Math.round(duration), bitrateMbps: (bitrate/1_000_000).toFixed(2), sizeMB: fileMB.toFixed(1) })
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Video file read nahi ho paya. Koi aur file try karo.'))
    }
  })
}

// ── COLOR PRESETS ──────────────────────────────────────────
const COLOR_PRESETS = [
  { label: 'Karmi Orange', color: '#FF6B00', gradient: 'linear-gradient(135deg, #FF6B00, #E85500)' },
  { label: 'Royal Blue',   color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  { label: 'Emerald',      color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { label: 'Purple',       color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  { label: 'Rose',         color: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
  { label: 'Amber',        color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
]

// ══════════════════════════════════════════════════════════
// MAIN SHOP BRANDING TAB
// ══════════════════════════════════════════════════════════
export default function ShopBrandingTab({ portal, isPremium, workerUrl }) {
  const shopId = portal?.slug || ''

  // Form state — existing values se initialize karo
  const [brandName,   setBrandName]   = useState(portal?.brand_name   || portal?.portal_name || '')
  const [tagline,     setTagline]     = useState(portal?.tagline       || 'Mind Training Platform')
  const [founderName, setFounderName] = useState(portal?.founder_name  || '')
  const [themeColor,  setThemeColor]  = useState(portal?.theme_color   || '#FF6B00')
  const [gradient,    setGradient]    = useState(portal?.theme_gradient || 'linear-gradient(135deg, #FF6B00, #E85500)')
  const [customColor, setCustomColor] = useState(false)

  // File state
  const [logoFile,      setLogoFile]      = useState(null)
  const [logoPreview,   setLogoPreview]   = useState(portal?.logo_url || null)
  const [videoFile,     setVideoFile]     = useState(null)
  const [videoMeta,     setVideoMeta]     = useState(null)
  const [existingVideo, setExistingVideo] = useState(portal?.founder_video || null)

  // UI state
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState(null)
  const [logoError,   setLogoError]   = useState(null)
  const [videoError,  setVideoError]  = useState(null)
  const [videoLoading,setVideoLoading]= useState(false)

  const logoRef  = useRef(null)
  const videoRef = useRef(null)

  // ── LOGO HANDLER ──────────────────────────────────────
  const handleLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoError(null)

    const originalKB = (file.size / 1024).toFixed(1)

    try {
      const compressed = await compressImage(file, MAX_LOGO_KB)
      const compressedKB = (compressed.size / 1024).toFixed(1)
      setLogoFile(compressed)
      setLogoPreview(URL.createObjectURL(compressed))
      if (compressedKB < originalKB) {
        setLogoError(`✅ Compressed: ${originalKB}KB → ${compressedKB}KB`)
      }
    } catch (err) {
      setLogoError('❌ Logo compress nahi hua: ' + err.message)
    }
  }

  // ── VIDEO HANDLER ─────────────────────────────────────
  const handleVideo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoError(null)
    setVideoMeta(null)
    setVideoLoading(true)

    try {
      const meta = await validateVideo(file)
      setVideoFile(file)
      setVideoMeta(meta)
      setVideoError(`✅ Video valid: ${meta.duration}s, ${meta.sizeMB}MB, ${meta.bitrateMbps}Mbps`)
    } catch (err) {
      setVideoError('❌ ' + err.message)
      setVideoFile(null)
      if (videoRef.current) videoRef.current.value = ''
    } finally {
      setVideoLoading(false)
    }
  }

  // ── COLOR PRESET SELECT ───────────────────────────────
  const handlePreset = (preset) => {
    setThemeColor(preset.color)
    setGradient(preset.gradient)
    setCustomColor(false)
  }

  // ── SAVE HANDLER ──────────────────────────────────────
  const handleSave = async () => {
    if (!brandName.trim()) { setError('Brand name required hai!'); return }
    setSaving(true); setError(null); setSaved(false)

    try {
      const formData = new FormData()
      formData.append('shopId',      shopId)
      formData.append('brandName',   brandName.trim())
      formData.append('tagline',     tagline.trim())
      formData.append('founderName', founderName.trim())
      formData.append('themeColor',  themeColor)
      formData.append('gradient',    gradient)

      if (logoFile)  formData.append('logo',  logoFile)
      if (videoFile) formData.append('video', videoFile)

      const res = await fetch(`${workerUrl}/portal/branding`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setSaved(true)
      if (data.logo_url)        setLogoPreview(data.logo_url)
      if (data.founder_video)   setExistingVideo(data.founder_video)
      setLogoFile(null); setVideoFile(null); setVideoMeta(null)
      if (logoRef.current)  logoRef.current.value  = ''
      if (videoRef.current) videoRef.current.value = ''
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('❌ ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── RENDER ────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#f0f0ff', marginBottom: '4px' }}>
          🎨 Shop Branding
        </h2>
        <p style={{ fontSize: '13px', color: '#9090b0', margin: 0 }}>
          Apni shop ka look customize karo. Yeh settings tumhara affiliate link open karne par dikhengi.
        </p>
      </div>

      {/* LIVE PREVIEW CARD */}
      <div style={{ background: gradient, borderRadius: '16px', padding: '20px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
          {logoPreview
            ? <img src={logoPreview} alt="Logo" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', background: '#fff' }} />
            : <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🧠</div>
          }
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: '#fff', lineHeight: 1 }}>{brandName || 'Tumhara Brand'}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{tagline || 'Your tagline here'}</div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>LIVE PREVIEW</div>
      </div>

      {/* BRAND NAME */}
      <Section label="BRAND NAME">
        <input
          type="text" placeholder="e.g. Rahul Tutorials" value={brandName}
          onChange={e => setBrandName(e.target.value)} maxLength={40}
          style={inputStyle}
        />
        <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{brandName.length}/40 characters</div>
      </Section>

      {/* TAGLINE */}
      <Section label="TAGLINE">
        <input
          type="text" placeholder="e.g. Crack Any Exam in 90 Days" value={tagline}
          onChange={e => setTagline(e.target.value)} maxLength={60}
          style={inputStyle}
        />
        <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{tagline.length}/60 characters</div>
      </Section>

      {/* FOUNDER NAME */}
      <Section label="FOUNDER / TEACHER NAME">
        <input
          type="text" placeholder="e.g. Rahul Sharma" value={founderName}
          onChange={e => setFounderName(e.target.value)} maxLength={40}
          style={inputStyle}
        />
        <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Home screen pe "Meet the Founder" card mein dikhega</div>
      </Section>

      {/* THEME COLOR */}
      <Section label="THEME COLOR">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          {COLOR_PRESETS.map(p => (
            <button key={p.color} onClick={() => handlePreset(p)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: themeColor === p.color ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', border: `2px solid ${themeColor === p.color ? p.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '8px 12px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: p.gradient }} />
              <span style={{ fontSize: 12, color: themeColor === p.color ? '#fff' : '#64748b', fontWeight: themeColor === p.color ? 800 : 500 }}>{p.label}</span>
            </button>
          ))}
          <button onClick={() => setCustomColor(c => !c)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: customColor ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', border: `2px solid ${customColor ? '#fff' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '8px 12px', cursor: 'pointer' }}>
            <span style={{ fontSize: 18 }}>🎨</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>Custom</span>
          </button>
        </div>
        {customColor && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="color" value={themeColor}
              onChange={e => { setThemeColor(e.target.value); setGradient(`linear-gradient(135deg, ${e.target.value}, ${e.target.value}cc)`) }}
              style={{ width: 48, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }} />
            <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>{themeColor}</span>
          </div>
        )}
      </Section>

      {/* LOGO UPLOAD */}
      <Section label="SHOP LOGO">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          {logoPreview
            ? <img src={logoPreview} alt="Logo" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', background: '#fff' }} />
            : <div style={{ width: 64, height: 64, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📷</div>
          }
          <div>
            <button onClick={() => logoRef.current?.click()}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              {logoPreview ? '🔄 Change Logo' : '📤 Upload Logo'}
            </button>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 5 }}>PNG/JPG — auto-compressed to &lt;100KB on your phone</div>
          </div>
        </div>
        <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp"
          onChange={handleLogo} style={{ display: 'none' }} />
        {logoError && (
          <div style={{ fontSize: 12, color: logoError.startsWith('✅') ? '#10b981' : '#ef4444', marginTop: 6, fontWeight: 600 }}>
            {logoError}
          </div>
        )}
      </Section>

      {/* FOUNDER VIDEO UPLOAD */}
      <Section label="FOUNDER INTRO VIDEO">
        <div style={{ background: 'rgba(255,107,0,0.05)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#ff9500', fontWeight: 700, marginBottom: 4 }}>📋 Video Requirements:</div>
          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.7 }}>
            • Max duration: <b style={{ color: '#fff' }}>5 minutes (300 seconds)</b><br />
            • Max bitrate: <b style={{ color: '#fff' }}>1 Mbps</b> (compress karo pehle)<br />
            • Max size: <b style={{ color: '#fff' }}>~30 MB</b><br />
            • Recommended: WhatsApp quality ya 720p compressed video<br />
            • Tip: <b style={{ color: '#fff' }}>HandBrake (free)</b> se compress karo — preset "Web Optimized"
          </div>
        </div>

        {existingVideo && !videoFile && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>CURRENT VIDEO:</div>
            <video src={existingVideo} controls style={{ width: '100%', borderRadius: 12, maxHeight: 180, background: '#000' }} />
          </div>
        )}

        <button onClick={() => videoRef.current?.click()} disabled={videoLoading}
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', color: '#94a3b8', padding: '14px', borderRadius: 12, cursor: videoLoading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {videoLoading ? '⏳ Validating...' : existingVideo ? '🔄 Change Video' : '🎬 Upload Intro Video'}
        </button>
        <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime"
          onChange={handleVideo} style={{ display: 'none' }} />

        {videoError && (
          <div style={{ fontSize: 12, color: videoError.startsWith('✅') ? '#10b981' : '#ef4444', marginTop: 8, fontWeight: 600, lineHeight: 1.5 }}>
            {videoError}
          </div>
        )}
        {videoMeta && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Duration', val: `${videoMeta.duration}s` },
              { label: 'Size',     val: `${videoMeta.sizeMB}MB` },
              { label: 'Bitrate',  val: `${videoMeta.bitrateMbps}Mbps` },
            ].map(({ label, val }) => (
              <div key={label} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                {label}: {val}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* JSON PREVIEW (for transparency) */}
      <Section label="WHAT GETS SAVED TO R2">
        <div style={{ background: '#0f172a', borderRadius: 10, padding: '12px 14px', fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', lineHeight: 1.8, border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
          <span style={{ color: '#64748b' }}>{'{'}</span><br />
          &nbsp;&nbsp;<span style={{ color: '#7c3aed' }}>"shopId"</span>: <span style={{ color: '#10b981' }}>"{shopId}"</span>,<br />
          &nbsp;&nbsp;<span style={{ color: '#7c3aed' }}>"brandName"</span>: <span style={{ color: '#10b981' }}>"{brandName || '...'}"</span>,<br />
          &nbsp;&nbsp;<span style={{ color: '#7c3aed' }}>"tagline"</span>: <span style={{ color: '#10b981' }}>"{tagline || '...'}"</span>,<br />
          &nbsp;&nbsp;<span style={{ color: '#7c3aed' }}>"founderName"</span>: <span style={{ color: '#10b981' }}>"{founderName || '...'}"</span>,<br />
          &nbsp;&nbsp;<span style={{ color: '#7c3aed' }}>"themeColor"</span>: <span style={{ color: '#10b981' }}>"{themeColor}"</span>,<br />
          &nbsp;&nbsp;<span style={{ color: '#7c3aed' }}>"themeGradient"</span>: <span style={{ color: '#10b981' }}>"{gradient}"</span>,<br />
          &nbsp;&nbsp;<span style={{ color: '#7c3aed' }}>"logoUrl"</span>: <span style={{ color: logoPreview ? '#10b981' : '#ef4444' }}>{logoPreview ? '"✅ uploaded"' : '"not set"'}</span>,<br />
          &nbsp;&nbsp;<span style={{ color: '#7c3aed' }}>"founderVideo"</span>: <span style={{ color: existingVideo || videoFile ? '#10b981' : '#ef4444' }}>{existingVideo || videoFile ? '"✅ uploaded"' : '"not set"'}</span><br />
          <span style={{ color: '#64748b' }}>{'}'}</span>
        </div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
          Yeh JSON <code style={{ color: '#ff9500' }}>{shopId}.json</code> naam se R2 bucket mein save hoga aur Karmi Minds fetch karega.
        </div>
      </Section>

      {/* ERROR / SUCCESS */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 14, color: '#ef4444', fontSize: 13, fontWeight: 700 }}>
          {error}
        </div>
      )}
      {saved && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 14, color: '#10b981', fontSize: 13, fontWeight: 700 }}>
          ✅ Branding save ho gaya! Students ab tumhari shop visit karenge toh yeh branding dikhegi.
        </div>
      )}

      {/* SAVE BUTTON */}
      <button onClick={handleSave} disabled={saving}
        style={{ width: '100%', background: saving ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#ff6b00,#ff9500)', border: 'none', color: saving ? '#64748b' : '#fff', padding: '15px', borderRadius: '14px', fontWeight: 900, fontSize: '16px', cursor: saving ? 'not-allowed' : 'pointer', marginBottom: 8 }}>
        {saving ? '⏳ Saving to R2...' : '💾 Save Shop Branding'}
      </button>
      <div style={{ fontSize: 11, color: '#475569', textAlign: 'center' }}>
        Changes live ho jaate hain jab koi tumhara link visit karta hai
      </div>

      {/* SUBSCRIPTION HINT — free users ke liye */}
      {!isPremium && (
        <div style={{ marginTop: 20, background: 'rgba(124,58,237,0.06)', border: '1px dashed rgba(124,58,237,0.3)', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 900, marginBottom: 4 }}>🔒 PREMIUM (₹299/month) se milega:</div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>
            • Course prices customize karo<br />
            • Razorpay key apna lagao<br />
            • Custom domain support (coming soon)<br />
            • Advanced analytics
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
            Branding customization free plan mein bhi available hai ✅
          </div>
        </div>
      )}
    </div>
  )
}

// ── HELPER COMPONENTS ──────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 8 }}>{label}</div>
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px' }}>
        {children}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f0f0ff',
  padding: '11px 14px',
  borderRadius: '10px',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Rajdhani',
}