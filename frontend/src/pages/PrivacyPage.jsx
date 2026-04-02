import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPage = () => {
    const sectionStyle = {
        padding: '60px 40px',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: "'Inter', sans-serif"
    };

    const headerStyle = {
        textAlign: 'center',
        padding: '80px 40px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
    };

    const blockStyle = {
        marginBottom: '40px'
    };

    const h2Style = {
        color: '#1a1a1a',
        fontSize: '1.8rem',
        marginBottom: '20px',
        fontWeight: '800'
    };

    const pStyle = {
        color: '#4a5568',
        lineHeight: '1.8',
        fontSize: '1rem'
    };

    return (
        <div style={{ background: '#fff' }}>
            <Navbar />
            <div style={headerStyle}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#1a202c', margin: 0 }}>Privacy Policy</h1>
                <p style={{ color: '#718096', marginTop: '10px' }}>Last Updated: March 19, 2026</p>
            </div>
            <div style={sectionStyle}>
                <div style={blockStyle}>
                    <h2 style={h2Style}>1. Information We Collect</h2>
                    <p style={pStyle}>
                        When you use EVENTRA Timeless Moments, we collect information that you provide to us directly. This includes your name, email address, phone number, and event details when you fill out our inquiry or booking forms. We may also collect payment information when you make a booking, which is processed securely by our payment partners.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>2. How We Use Your Information</h2>
                    <p style={pStyle}>
                        We use the information we collect to provide, maintain, and improve our services. This includes processing your bookings, sending you event updates, responding to your inquiries, and sending you marketing communications if you have opted in to receive them.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>3. Sharing of Information</h2>
                    <p style={pStyle}>
                        We do not sell your personal information to third parties. We may share your information with service providers who perform services on our behalf, such as venue partners, decorators, caterers, or payment processors, but only to the extent necessary for them to provide their services.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>4. Data Security</h2>
                    <p style={pStyle}>
                        We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access. However, no internet transmission is ever completely secure or error-free.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>5. Your Choices</h2>
                    <p style={pStyle}>
                        You can opt out of receiving marketing emails from us at any time by following the instructions in those emails. You may also request to access, update, or delete your personal information by contacting us at privacy@eventra.com.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>6. Contact Us</h2>
                    <p style={pStyle}>
                        If you have any questions about this Privacy Policy, please contact us at: <br />
                        <strong>EVENTRA Timeless Moments</strong> <br />
                        Surat, Gujarat, India <br />
                        Email: privacy@eventra.com
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPage;
