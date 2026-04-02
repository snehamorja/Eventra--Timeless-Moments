import React, { useState } from 'react';
import api from '../services/api';

const CustomInquiryModal = ({ isOpen, onClose, eventType = 'Weddings' }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        countryCode: '+91',
        phone: '',
        message: ''
    });

    const getPhoneMaxLength = (code) => {
        const lengths = {
            '+91': 10, '+1': 10, '+44': 10, '+61': 9, '+81': 10,
            '+86': 11, '+33': 9, '+49': 11, '+971': 9, '+65': 8,
        };
        return lengths[code] || 10;
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- VALIDATION: Must be @gmail.com ---
        if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
            alert('Email address must be a @gmail.com address.');
            return;
        }

        // --- VALIDATION: Phone Length ---
        const reqLen = getPhoneMaxLength(formData.countryCode);
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (cleanPhone.length !== reqLen) {
            alert(`Phone number must be exactly ${reqLen} digits for ${formData.countryCode}`);
            return;
        }

        setLoading(true);

        // --- FORMATTING: Combine Country Code and Phone ---
        const formattedPhone = `${formData.countryCode} ${cleanPhone}`;

        try {
            await api.post('/custom-inquiry/', {
                ...formData,
                phone: formattedPhone,
                event_type: eventType
            });
            alert('Your customization request has been sent! Check your email at snehamorja902@gmail.com for the request details.');
            onClose();
        } catch (error) {
            console.error('Failed to send inquiry', error);
            alert(error.response?.data?.error || 'Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: '#fff',
                width: '100%',
                maxWidth: '500px',
                borderRadius: '20px',
                padding: '40px',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '25px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.8rem',
                        cursor: 'pointer',
                        color: '#64748b'
                    }}
                >&times;</button>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.8rem', margin: '0 0 10px 0', color: '#1a1a1a' }}>
                        Custom Planning Request
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        Tell us about your dream {eventType} and we'll craft a perfect plan for you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Full Name *</label>
                        <input
                            required
                            type="text"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Email Address *</label>
                            <input
                                required
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Phone Number *</label>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <select
                                    value={formData.countryCode}
                                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value, phone: '' })}
                                    style={{ width: '70px', padding: '10px 5px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.8rem' }}
                                >
                                    <option value="+91">+91</option>
                                    <option value="+1">+1</option>
                                    <option value="+44">+44</option>
                                    <option value="+61">+61</option>
                                    <option value="+81">+81</option>
                                    <option value="+86">+86</option>
                                    <option value="+33">+33</option>
                                    <option value="+49">+49</option>
                                    <option value="+971">+971</option>
                                    <option value="+65">+65</option>
                                </select>
                                <input
                                    required
                                    type="tel"
                                    placeholder={`${getPhoneMaxLength(formData.countryCode)} Digits`}
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= getPhoneMaxLength(formData.countryCode)) {
                                            setFormData({ ...formData, phone: val });
                                        }
                                    }}
                                    style={{ flex: 1, padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Requirements / Notes *</label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Describe your vision, specific requests, or any questions..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        style={{
                            marginTop: '10px',
                            background: 'linear-gradient(135deg, #1D3557 0%, #457B9D 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '15px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: '0.3s',
                            boxShadow: '0 10px 15px -3px rgba(29, 53, 87, 0.3)'
                        }}
                    >
                        {loading ? 'Sending Request...' : 'Send Custom Request →'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CustomInquiryModal;
