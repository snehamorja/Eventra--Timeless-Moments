import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const footerStyle = {
        backgroundColor: '#0A0A0A',
        color: '#FFFFFF',
        padding: '80px 40px 40px',
        fontFamily: "'Inter', sans-serif"
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '60px'
    };

    const sectionTitleStyle = {
        color: '#C4A059',
        fontSize: '1.2rem',
        fontWeight: '700',
        marginBottom: '25px',
        textTransform: 'uppercase',
        letterSpacing: '2px'
    };

    const linkStyle = {
        color: '#A0AEC0',
        textDecoration: 'none',
        fontSize: '0.95rem',
        display: 'block',
        marginBottom: '12px',
        transition: 'color 0.3s ease',
        cursor: 'pointer'
    };

    const bottomStyle = {
        borderTop: '1px solid #2D3748',
        paddingTop: '30px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
    };

    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
                {/* Brand Section */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#C4A059', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>E</div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', letterSpacing: '2px' }}>EVENTRA</h2>
                    </div>
                    <p style={{ color: '#718096', lineHeight: '1.8', fontSize: '0.9rem', marginBottom: '25px' }}>
                        Crafting timeless moments and extraordinary experiences since 2010. From grand weddings to elite corporate galas, we redefine elegance.
                    </p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {['FB', 'IG', 'TW', 'LI'].map(s => (
                            <div key={s} style={{ width: '35px', height: '35px', border: '1px solid #2D3748', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#C4A059', cursor: 'pointer' }}>{s}</div>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 style={sectionTitleStyle}>Navigation</h3>
                    <Link to="/" style={linkStyle} onMouseOver={(e) => e.target.style.color = '#C4A059'} onMouseOut={(e) => e.target.style.color = '#A0AEC0'}>Home</Link>
                    <Link to="/about" style={linkStyle} onMouseOver={(e) => e.target.style.color = '#C4A059'} onMouseOut={(e) => e.target.style.color = '#A0AEC0'}>Our Story</Link>
                    <Link to="/wedding-details" style={linkStyle} onMouseOver={(e) => e.target.style.color = '#C4A059'} onMouseOut={(e) => e.target.style.color = '#A0AEC0'}>Wedding Planning</Link>
                    <Link to="/concerts" style={linkStyle} onMouseOver={(e) => e.target.style.color = '#C4A059'} onMouseOut={(e) => e.target.style.color = '#A0AEC0'}>Live Concerts</Link>
                    <Link to="/festivals" style={linkStyle} onMouseOver={(e) => e.target.style.color = '#C4A059'} onMouseOut={(e) => e.target.style.color = '#A0AEC0'}>Cultural Festivals</Link>
                    <Link to="/sports" style={linkStyle} onMouseOver={(e) => e.target.style.color = '#C4A059'} onMouseOut={(e) => e.target.style.color = '#A0AEC0'}>Sports Events</Link>
                </div>

                {/* Services */}
                <div>
                    <h3 style={sectionTitleStyle}>Resources</h3>
                    <Link to="/gallery" style={linkStyle} onMouseOver={(e) => e.target.style.color = '#C4A059'} onMouseOut={(e) => e.target.style.color = '#A0AEC0'}>Portfolio</Link>
                    <Link to="/blog" style={linkStyle} onMouseOver={(e) => e.target.style.color = '#C4A059'} onMouseOut={(e) => e.target.style.color = '#A0AEC0'}>Expert Advice</Link>
                    <Link to="/careers" style={linkStyle} onMouseOver={(e) => e.target.style.color = '#C4A059'} onMouseOut={(e) => e.target.style.color = '#A0AEC0'}>Careers</Link>
                    <Link to="/privacy" style={linkStyle} onMouseOver={(e) => e.target.style.color = '#C4A059'} onMouseOut={(e) => e.target.style.color = '#A0AEC0'}>Privacy Policy</Link>
                    <Link to="/terms" style={linkStyle} onMouseOver={(e) => e.target.style.color = '#C4A059'} onMouseOut={(e) => e.target.style.color = '#A0AEC0'}>Terms of Service</Link>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 style={sectionTitleStyle}>Get In Touch</h3>
                    <div style={{ ...linkStyle, cursor: 'default' }}>📍 Surat, Gujarat, India</div>
                    <div style={{ ...linkStyle, cursor: 'default' }}>📞 +91 84697 45000</div>
                    <div style={{ ...linkStyle, cursor: 'default' }}>✉️ snehamorja902@gmail.com</div>
                </div>
            </div>

            <div style={bottomStyle}>
                <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0 }}>
                    © 2026 EVENTRA Timeless Moments. All rights reserved.
                </p>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0 }}>India | Global Presence</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
