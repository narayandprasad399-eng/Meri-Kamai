export default function Contact() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: '#e0e0e0', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <h1 style={{ color: '#ff6b00', marginBottom: '20px' }}>Contact Us</h1>
      <p>We're here to help you grow your portal and solve any issues!</p>
      
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '12px', marginTop: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#fff', margin: '0 0 10px 0' }}>Support Details</h3>
        <p><strong>Email:</strong> support@merikamai.in</p>
        <p><strong>Response Time:</strong> We aim to reply within 24-48 business hours.</p>
        
        <h3 style={{ color: '#fff', margin: '25px 0 10px 0' }}>Business Address</h3>
        {/* Razorpay ke liye yahan apna asli address daal dena baad mein */}
        <p>Karmi Minds / Meri Kamai<br/>
        Kota, Uttar Pradesh<br/>
        India</p>
      </div>

      <div style={{ marginTop: '40px' }}><a href="/" style={{ color: '#ff6b00', textDecoration: 'none' }}>← Back to Home</a></div>
    </div>
  );
}