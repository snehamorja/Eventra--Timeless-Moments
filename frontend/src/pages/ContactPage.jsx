import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../services/api';
import CustomAlert from '../components/CustomAlert';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        event_type: 'Wedding',
        event_date: '',
        location_type: 'Indoor',
        guests: 100,
        service_style: 'Full Service',
        cuisine_preferences: '',
        internal_notes: ''
    });

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, title: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/event-inquiries/', formData);
            setAlert({
                show: true,
                title: 'SUCCESS',
                message: 'Your inquiry has been received. Our elite planning team will contact you shortly.'
            });
            setFormData({
                contact_name: '',
                contact_email: '',
                contact_phone: '',
                event_type: 'Wedding',
                event_date: '',
                location_type: 'Indoor',
                guests: 100,
                service_style: 'Full Service',
                cuisine_preferences: '',
                internal_notes: ''
            });
        } catch (err) {
            setAlert({
                show: true,
                title: 'ERROR',
                message: 'Failed to send inquiry. Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    };

    const sectionStyle = {
        padding: '100px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'start'
    };

    const inputStyle = {
        width: '100%',
        padding: '15px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        marginBottom: '20px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.3s'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '0.85rem',
        fontWeight: '700',
        color: '#4a5568',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    };

    return (
        <div style={{ background: '#fff' }}>
            <Navbar />
            
            {/* Hero Header */}
            <div style={{
                height: '40vh',
                background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=1920)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0, letterSpacing: '2px' }}>CONTACT US</h1>
                <p style={{ fontSize: '1.2rem', marginTop: '10px', color: '#C4A059', fontWeight: '600' }}>Your journey to a timeless event begins here.</p>
            </div>

            <div style={sectionStyle} className="contact-grid">
                {/* Contact Info */}
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a202c', marginBottom: '30px' }}>Get In Touch</h2>
                    <p style={{ fontSize: '1.1rem', color: '#718096', lineHeight: '1.8', marginBottom: '40px' }}>
                        Whether you're planning a grand gala or an intimate gathering, our team of expert planners is ready to bring your vision to life.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ width: '50px', height: '50px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#C4A059', border: '1px solid #e2e8f0' }}>📍</div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Our Headquarters</h4>
                                <p style={{ margin: 0, color: '#718096' }}>Surat, Gujarat, India</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ width: '50px', height: '50px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#C4A059', border: '1px solid #e2e8f0' }}>✉️</div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Email Address</h4>
                                <p style={{ margin: 0, color: '#718096' }}>contact@eventra.com</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ width: '50px', height: '50px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#C4A059', border: '1px solid #e2e8f0' }}>📞</div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Phone Line</h4>
                                <p style={{ margin: 0, color: '#718096' }}>+91 84697 45000</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '60px', padding: '30px', background: '#1a202c', color: '#fff', borderRadius: '20px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '15px' }}>Visit Our Studio</h3>
                        <p style={{ color: '#a0aec0', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                            Our creative studio is open for consultations from Monday to Saturday, 10:00 AM to 7:00 PM. We recommend booking an appointment for a personalized viewing of our decor and catering collections.
                        </p>
                    </div>
                </div>

                {/* Contact Form */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '50px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1a202c', marginBottom: '30px', textAlign: 'center' }}>Send An Inquiry</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <input type="text" name="contact_name" value={formData.contact_name} onChange={handleChange} placeholder="John Doe" style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Email Address</label>
                                <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} placeholder="john@example.com" style={inputStyle} required />
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Phone Number</label>
                                <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="+91 XXXX XXXX" style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Event Type</label>
                                <select name="event_type" value={formData.event_type} onChange={handleChange} style={inputStyle}>
                                    {['Wedding', 'Corporate Gala', 'Concert', 'Festival', 'Sports Event', 'Private Party'].map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Proposed Date</label>
                                <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Est. Guest Count</label>
                                <input type="number" name="guests" value={formData.guests} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>

                        <label style={labelStyle}>Additional Information / Vision</label>
                        <textarea name="cuisine_preferences" value={formData.cuisine_preferences} onChange={handleChange} placeholder="Tell us more about your dream event..." style={{ ...inputStyle, height: '120px', resize: 'none' }}></textarea>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                padding: '20px', 
                                background: '#1a202c', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '15px', 
                                fontSize: '1.1rem', 
                                fontWeight: '800', 
                                cursor: 'pointer',
                                transition: '0.3s',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'SENDING...' : 'DISPATCH INQUIRY'}
                        </button>
                    </form>
                </div>
            </div>

            <Footer />
            {alert.show && <CustomAlert title={alert.title} message={alert.message} onClose={() => setAlert({ show: false })} />}
        </div>
    );
};

export default ContactPage;
