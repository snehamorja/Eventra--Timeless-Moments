import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

const RegisterPage = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        countryCode: '+91',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const filteredValue = value.replace(/\D/g, '');
            const maxLength = getPhoneMaxLength(userData.countryCode);
            if (filteredValue.length <= maxLength) {
                setUserData({ ...userData, [name]: filteredValue });
            }
            return;
        }
        setUserData({ ...userData, [name]: value });
    };

    const getPhoneMaxLength = (countryCode) => {
        const lengths = {
            '+91': 10, '+1': 10, '+44': 10, '+61': 9, '+81': 10,
            '+86': 11, '+33': 9, '+49': 11, '+971': 9, '+65': 8,
        };
        return lengths[countryCode] || 10;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(userData.username)) {
            setError('Username must start with a letter and contain only alphanumeric/underscore.');
            return;
        }

        if (!userData.email.toLowerCase().endsWith('@gmail.com')) {
            setError('Only @gmail.com email addresses are allowed.');
            return;
        }

        if (userData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (userData.password !== userData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.post('/register/', {
                username: userData.username,
                email: userData.email,
                phone: `${userData.countryCode}${userData.phone}`,
                password: userData.password,
                confirm_password: userData.confirmPassword
            });
            setCustomAlert({
                show: true,
                title: 'SUCCESS',
                message: 'Registration successful! You can now access your account and complete your booking.'
            });

            const pendingAction = localStorage.getItem('pendingAutoAction');

            setTimeout(() => {
                navigate('/login', {
                    state: {
                        prefilledUsername: userData.username,
                        prefilledPassword: userData.password,
                        from: pendingAction === 'save_and_pay' ? '/invoice' : '/'
                    }
                });
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '0.95rem',
        marginTop: '8px',
        outline: 'none',
        transition: 'border-color 0.3s'
    };

    const labelStyle = {
        fontWeight: '600',
        fontSize: '0.9rem',
        color: '#444',
        display: 'block'
    };

    return (
        <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
            <Navbar />
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '80px 20px'
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '50px 40px',
                    borderRadius: '15px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                    width: '100%',
                    maxWidth: '520px'
                }}>
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '2.5rem',
                        marginBottom: '40px',
                        fontFamily: "'Playfair Display', serif",
                        color: '#111'
                    }}>Join EVENTRA</h2>

                    {error && (
                        <div style={{
                            backgroundColor: '#fff1f0',
                            color: '#cf1322',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '25px',
                            fontSize: '0.85rem',
                            border: '1px solid #ffa39e',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                value={userData.username}
                                onChange={handleChange}
                                placeholder="Alphanumeric & underscores"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={userData.email}
                                onChange={handleChange}
                                placeholder="example@gmail.com"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Phone Number</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select
                                    name="countryCode"
                                    value={userData.countryCode}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, width: '100px' }}
                                >
                                    <option value="+91">+91</option>
                                    <option value="+1">+1</option>
                                    <option value="+44">+44</option>
                                </select>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={userData.phone}
                                    onChange={handleChange}
                                    placeholder="Number"
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={userData.password}
                                onChange={handleChange}
                                placeholder="At least 8 characters"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: '35px' }}>
                            <label style={labelStyle}>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={userData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repeat password"
                                style={inputStyle}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: loading ? '#ccc' : '#111',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}
                        >
                            {loading ? 'Processing...' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9rem', color: '#666' }}>
                        Already part of Eventra? <Link to="/login" style={{ color: '#C4A059', fontWeight: '700', textDecoration: 'none' }}>Login</Link>
                    </div>
                </div>
            </div>
            <CustomAlert
                show={customAlert.show}
                onClose={() => setCustomAlert({ ...customAlert, show: false })}
                title={customAlert.title}
                message={customAlert.message}
            />
        </div>
    );
};

export default RegisterPage;
