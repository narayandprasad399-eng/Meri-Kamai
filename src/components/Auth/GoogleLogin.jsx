import { signInWithGoogle } from '../../lib/supabase'

export function GoogleLogin({ onGuest }) {
  const handleGoogle = async () => {
    await signInWithGoogle()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'Orbitron',
        fontSize: '32px',
        fontWeight: 900,
        marginBottom: '8px',
        color: '#f0f0ff',
      }}>
        MERI<span style={{ color: '#ff6b00' }}>KAMAI</span>
      </div>
      <div style={{ fontSize: '14px', color: '#606080', marginBottom: '48px' }}>
        Khelo. Haso. Seekho.
      </div>

      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '36px 28px',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
        <h2 style={{
          fontFamily: 'Teko',
          fontSize: '28px',
          marginBottom: '8px',
          color: '#f0f0ff',
        }}>
          Apni Free Website Banao!
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#9090b0',
          lineHeight: 1.6,
          marginBottom: '28px',
        }}>
          Sign in karo, apna portal banao aur share karo. 100% free!
        </p>

        <button
          onClick={handleGoogle}
          style={{
            width: '100%',
            background: '#fff',
            color: '#000',
            border: 'none',
            padding: '14px 20px',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '12px',
            fontFamily: 'Rajdhani',
          }}
        >
          <img
            src="https://www.google.com/favicon.ico"
            width="20"
            alt="Google"
          />
          Google se Sign In Karo
        </button>

        <div style={{ color: '#606080', fontSize: '13px', marginBottom: '12px' }}>ya</div>

        <button
          onClick={onGuest}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#9090b0',
            padding: '12px',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Rajdhani',
          }}
        >
          Guest Mode mein Dekho 👀
        </button>
      </div>

      <p style={{
        marginTop: '24px',
        fontSize: '12px',
        color: '#404060',
        textAlign: 'center',
      }}>
        Sign in karke aap hamare Terms & Privacy Policy se agree karte hain
      </p>
    </div>
  )
}
