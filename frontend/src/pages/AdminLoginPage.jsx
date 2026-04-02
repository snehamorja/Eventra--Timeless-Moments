import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import api from '../services/api';

const AdminLoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if already logged in
        const token = localStorage.getItem('access_token');
        if (token) {
            // Optional: Validate token with backend, for now assume valid if user clicked login
            // heavily relying on API interceptor to catch invalid tokens
            navigate('/admin-dashboard');
        }
    }, [navigate]);

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsBlocked(false);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const key = name === 'u_val' ? 'username' : 'password';
        setCredentials(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (isBlocked) {
            setError(`Account blocked. Please try again after ${formatTime(timeLeft)}.`);
            return;
        }

        if (!credentials.username || !credentials.password) {
            setError('Please enter both admin fields.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/login/', {
                username: credentials.username,
                password: credentials.password
            });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Use the user info from login response
            const user = response.data.user;

            if (user && (user.is_superuser || user.role === 'ADMIN')) {
                navigate('/admin-dashboard');
            } else {
                setError('Access Denied: You do not have administrator privileges.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }

        } catch (err) {
            console.error("Admin Login Error:", err);
            const data = err.response?.data;
            if (data?.blocked) {
                setIsBlocked(true);
                setTimeLeft(data.seconds_left || 600);
                setError(data.detail);
            } else if (data?.detail) {
                setError(data.detail);
            } else if (!err.response) {
                setError('Connection Error: Please check if backend is running.');
            } else {
                setError('Invalid admin credentials');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
            }}>
                <div style={{
                    backgroundColor: '#1e293b',
                    padding: '50px',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    width: '100%',
                    maxWidth: '420px',
                    border: '1px solid #334155'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{
                            margin: '0 auto 20px auto',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Logo size="70px" />
                        </div>
                        <h2 style={{
                            fontSize: '1.8rem',
                            fontWeight: '800',
                            color: '#fff',
                            margin: 0,
                            letterSpacing: '-0.5px'
                        }}>Authorized Access</h2>
                        <p style={{ color: '#94A3B8', marginTop: '10px' }}>Sign in to Admin Dashboard</p>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#EF4444',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '25px',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center'
                        }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '0.9rem', color: '#E2E8F0' }}>Username or Email</label>
                            <input
                                type="text"
                                name="u_val"
                                value={credentials.username}
                                onChange={handleChange}
                                placeholder="admin@example.com"
                                autoComplete="username"
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '2px solid #334155',
                                    backgroundColor: '#0F172A',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                onBlur={(e) => e.target.style.borderColor = '#334155'}
                            />
                        </div>
                        <div style={{ marginBottom: '35px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '0.9rem', color: '#E2E8F0' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="p_val"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        paddingRight: '50px',
                                        borderRadius: '12px',
                                        border: '2px solid #334155',
                                        backgroundColor: '#0F172A',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '15px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#94A3B8',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: loading ? '#334155' : '#3B82F6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: loading ? 'none' : '0 10px 15px -3px rgba(59, 130, 246, 0.4)'
                            }}
                        >
                            {loading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
