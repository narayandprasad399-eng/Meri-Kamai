export default function Privacy() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: '#e0e0e0', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <h1 style={{ color: '#ff6b00', marginBottom: '20px' }}>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h3 style={{ marginTop: '25px', color: '#fff' }}>1. Information We Collect</h3>
      <p>When you use Meri Kamai, we collect your email address and basic profile information via Google OAuth strictly for account creation and secure login.</p>

      <h3 style={{ marginTop: '25px', color: '#fff' }}>2. YouTube API Services</h3>
      <p>Our platform uses YouTube API Services to display video content. By using our service, you agree to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" style={{color: '#ff6b00'}}>YouTube Terms of Service</a> and the <a href="https://policies.google.com/privacy" target="_blank" style={{color: '#ff6b00'}}>Google Privacy Policy</a>. We do not collect or store your personal YouTube data.</p>

      <h3 style={{ marginTop: '25px', color: '#fff' }}>3. Third-Party Ads & Games</h3>
      <p>We partner with GameDistribution for HTML5 games and Adsterra for advertising. These third parties may use cookies and web beacons to collect non-personal data (like device type and interaction stats) to provide personalized ads and gaming experiences.</p>

      <h3 style={{ marginTop: '25px', color: '#fff' }}>4. Data Security</h3>
      <p>Your portal data and user details are securely stored using industry-standard encryption (Supabase). We do not sell your personal data to any third party.</p>

      <div style={{ marginTop: '40px' }}><a href="/" style={{ color: '#ff6b00', textDecoration: 'none' }}>← Back to Home</a></div>
    </div>
  );
}