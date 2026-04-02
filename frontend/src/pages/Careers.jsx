import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Careers = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('access_token');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        position: 'Event Coordinator',
        message: '',
        portfolio: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token && location.state?.autoOpenForm) {
            setShowForm(true);
            setTimeout(() => {
                document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        }
    }, [token, location.state]);

    const handleApplyClick = () => {
        if (!token) {
            navigate('/login', { state: { from: '/careers', autoOpenForm: true } });
        } else {
            setShowForm(true);
            setTimeout(() => {
                document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    const positions = [
        'Event Coordinator',
        'Lead Decor Stylist',
        'Catering Supervisor',
        'Sound & Lighting Engineer',
        'Marketing Specialist',
        'Intern'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await API.post('careers/apply/', {
                ...formData,
                portfolio: formData.portfolio || null,
                message: formData.message || null
            });
            setStatus({ type: 'success', message: 'Your application has been received by our talent team.' });
            setFormData({ full_name: '', email: '', phone: '', position: 'Event Coordinator', message: '', portfolio: '' });
            setTimeout(() => setShowForm(false), 5000);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Encountered an issue submitting your application. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '0' }}>
            <Navbar />

            {/* Premium Header */}
            <div style={{
                backgroundColor: 'var(--dark)',
                padding: 'min(150px, 15vh) 20px',
                textAlign: 'center',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1920)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                    zIndex: 0
                }}></div>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ letterSpacing: '8px', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '20px', fontWeight: '700' }}>Join the Legacy</p>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                        marginBottom: '30px',
                        fontWeight: '300',
                        letterSpacing: '10px'
                    }}>CAREERS</h1>
                    <div style={{ width: '80px', height: '2px', backgroundColor: 'var(--primary)', margin: '0 auto 30px' }}></div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                        We are looking for visionaries, artisans, and perfectionists to help us craft the world's most extraordinary celebrations.
                    </p>
                </div>
            </div>

            {/* Culture Section */}
            <section style={{ padding: '120px 0' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '80px',
                        alignItems: 'center'
                    }}>
                        <div className="fade-in">
                            <h2 style={{ fontSize: '1rem', color: 'var(--primary)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '30px' }}>The Culture</h2>
                            <h3 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: '1.2', marginBottom: '30px', color: '#111' }}>
                                A symphony of talent working in perfect harmony.
                            </h3>
                            <p style={{ fontSize: '1.1rem', color: 'var(--gray)', lineHeight: '1.8', marginBottom: '30px' }}>
                                At Eventra, your craft is your identity. We provide a canvas for your creativity and a global stage for your execution. Join a team that values precision as much as imagination.
                            </p>
                            <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
                            </div>
                            {!showForm && <button className="btn-primary" style={{ padding: '18px 50px' }} onClick={handleApplyClick}>View Open Positions</button>}
                        </div>
                        <div className="fade-in">
                            <img
                                src="https://wallpaperaccess.com/full/7823416.jpg"
                                alt="Modern Office"
                                style={{ width: '100%', height: '550px', objectFit: 'cover', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Section */}
            {showForm && (
                <section id="application-form" className="fade-in" style={{ padding: '120px 0', backgroundColor: '#fdfbf7' }}>
                    <div className="container" style={{ maxWidth: '900px' }}>
                        <div className="glass" style={{ padding: '80px 60px', borderRadius: '20px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Begin Your Application</h2>
                                <p style={{ color: 'var(--gray)' }}>Tell us about your journey and your aspirations.</p>
                            </div>

                            {status.message && (
                                <div className="fade-in" style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '40px',
                                    background: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                    color: status.type === 'success' ? '#166534' : '#991b1b',
                                    border: `1px solid ${status.type === 'success' ? '#dcfce7' : '#fee2e2'}`,
                                    textAlign: 'center',
                                    fontWeight: '600'
                                }}>
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '30px' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr', gap: '30px'
                                }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#555' }}>Full Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#555' }}>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#555' }}>Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#555' }}>Position</label>
                                        <select
                                            name="position"
                                            value={formData.position}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', background: '#fff' }}
                                        >
                                            {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#555' }}>Portfolio URL</label>
                                    <input
                                        type="url"
                                        name="portfolio"
                                        value={formData.portfolio}
                                        onChange={handleChange}
                                        placeholder="LinkedIn or Personal Portfolio"
                                        style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#555' }}>Introduction</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="6"
                                        placeholder="What drives your passion for events?"
                                        style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' }}
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '20px', width: '100%', fontSize: '1rem' }}>
                                    {loading ? 'Processing...' : 'Submit Application'}
                                </button>

                                <p style={{ textAlign: 'center', color: '#999', fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setShowForm(false)}>
                                    Browse roles instead
                                </p>
                            </form>
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
};

export default Careers;
