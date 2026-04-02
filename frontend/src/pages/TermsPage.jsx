import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsPage = () => {
    const sectionStyle = {
        padding: '60px 40px',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: "'Inter', sans-serif"
    };

    const headerStyle = {
        textAlign: 'center',
        padding: '80px 40px',
        background: '#f1f5f9',
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
                <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#1a202c', margin: 0 }}>Terms of Service</h1>
                <p style={{ color: '#718096', marginTop: '10px' }}>Last Updated: March 19, 2026</p>
            </div>
            <div style={sectionStyle}>
                <div style={blockStyle}>
                    <h2 style={h2Style}>1. Introduction</h2>
                    <p style={pStyle}>
                        Welcome to EVENTRA Timeless Moments. These Terms of Service govern your use of our website and services. By accessing or using our website, you agree to be bound by these terms. If you do not agree with any part of these terms, you should not use our services.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>2. Services</h2>
                    <p style={pStyle}>
                        Our services include event planning, management, catering, decoration, and coordination across various event categories such as weddings, concerts, festivals, and sports events. Each service may be subject to a separate contract with specific terms for those activities.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>3. Booking & Payments</h2>
                    <p style={pStyle}>
                        All bookings made through the website are subject to availability and acceptance by EVENTRA. A booking is confirmed only upon receipt of the required advance payment and a signed agreement. All payments are non-refundable unless stated otherwise in the specific service contract.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>4. User Responsibilities</h2>
                    <p style={pStyle}>
                        When using our website, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of any login credentials and for all activities that occur under your account.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>5. Intellectual Property</h2>
                    <p style={pStyle}>
                        All content on this website, including text, designs, images, logos, and software, is the property of EVENTRA and is protected by copyright and other intellectual property laws. You may not use, reproduce, or distribute any content without our prior written consent.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>6. Limitation of Liability</h2>
                    <p style={pStyle}>
                        EVENTRA shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of our website or services, even if we have been advised of the possibility of such damages.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>7. Changes to Terms</h2>
                    <p style={pStyle}>
                        We reserve the right to update or modify these Terms of Service at any time without prior notice. Your continued use of the website following any changes constitutes your acceptance of the new terms.
                    </p>
                </div>

                <div style={blockStyle}>
                    <h2 style={h2Style}>8. Governing Law</h2>
                    <p style={pStyle}>
                        These Terms of Service are governed by the laws of India and the courts of Surat, Gujarat shall have exclusive jurisdiction over any disputes arising out of these terms.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TermsPage;
