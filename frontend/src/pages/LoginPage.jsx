import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import api from '../services/api';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockedUser, setBlockedUser] = useState(localStorage.getItem('blockedUserId') || '');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isAdminMode = location.pathname === '/admin-login';

    // Load persisted timer and prefilled credentials on mount
    useEffect(() => {
        const savedTime = localStorage.getItem('loginBlockTime');
        const savedBlock = localStorage.getItem('isLoginBlocked');
        const savedUser = localStorage.getItem('blockedUserId');

        if (savedTime && savedBlock === 'true' && savedUser) {
            const remaining = parseInt(savedTime, 10);
            if (remaining > 0) {
                setTimeLeft(remaining);
                setBlockedUser(savedUser);
            } else {
                clearBlock();
            }
        }

        if (location.state?.prefilledUsername && location.state?.prefilledPassword) {
            setCredentials({
                username: location.state.prefilledUsername,
                password: location.state.prefilledPassword
            });
        }
    }, [location.state]);

    const clearBlock = () => {
        setIsBlocked(false);
        setBlockedUser('');
        localStorage.removeItem('loginBlockTime');
        localStorage.removeItem('isLoginBlocked');
        localStorage.removeItem('blockedUserId');
    };

    // Countdown Timer logic with persistence
    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    const next = prev - 1;
                    if (next <= 0) {
                        clearBlock();
                        return 0;
                    }
                    localStorage.setItem('loginBlockTime', next.toString());
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Update isBlocked status based on current typed username
    useEffect(() => {
        if (timeLeft > 0 && credentials.username === blockedUser && blockedUser !== '') {
            setIsBlocked(true);
        } else {
            setIsBlocked(false);
        }
    }, [credentials.username, blockedUser, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isBlocked) return;

        setError('');
        setLoading(true);

        try {
            const endpoint = isAdminMode ? '/admin-login/' : '/login/';
            const response = await api.post(endpoint, credentials);

            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            const pendingAction = localStorage.getItem('pendingAutoAction');
            if (pendingAction === 'save_and_pay') {
                navigate('/invoice');
            } else if (isAdminMode) {
                navigate('/admin-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            if (err.response?.status === 403 && err.response?.data?.block_duration) {
                const duration = err.response.data.block_duration;
                setIsBlocked(true);
                setTimeLeft(duration);
                setBlockedUser(credentials.username);
                localStorage.setItem('loginBlockTime', duration.toString());
                localStorage.setItem('isLoginBlocked', 'true');
                localStorage.setItem('blockedUserId', credentials.username);
                setError(err.response.data.error || 'Too many attempts. You are temporarily blocked.');
            } else {
                setError(err.response?.data?.error || 'Invalid credentials');
            }
        } finally {
            setLoading(false);
        }
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
                    maxWidth: '480px'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <Logo size="90px" />
                    </div>
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '2rem',
                        marginBottom: '40px',
                        fontFamily: "'Playfair Display', serif",
                        color: isAdminMode ? '#c5a059' : '#111'
                    }}>{isAdminMode ? 'Admin Portal' : 'Premium Access Login'}</h2>

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
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#444', display: 'block', marginBottom: '8px' }}>Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                value={credentials.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#444', display: 'block', marginBottom: '8px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={credentials.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    style={{
                                        width: '100%',
                                        padding: '12px 15px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'border-color 0.3s'
                                    }}
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '15px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        color: '#888',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        userSelect: 'none'
                                    }}
                                >
                                    {showPassword ? 'HIDE' : 'SHOW'}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isBlocked}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: (loading || isBlocked) ? '#aaaaaa' : '#111',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: (loading || isBlocked) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}
                        >
                            {loading ? 'Processing...' : isBlocked ? `Wait ${formatTime(timeLeft)}` : 'Secure Login'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9rem', color: '#666' }}>
                            Don't have an account? <Link to="/register" style={{ color: '#c5a059', fontWeight: '700', textDecoration: 'none' }}>Sign Up</Link>
                        </div>

                        {!isAdminMode && (
                            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.85rem', color: '#999' }}>
                                Account security managed by Eventra.
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                            <Link
                                to={isAdminMode ? "/login" : "/admin-login"}
                                style={{
                                    color: '#888',
                                    fontSize: '0.85rem',
                                    textDecoration: 'underline',
                                    transition: 'color 0.3s'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#c5a059'}
                                onMouseOut={(e) => e.target.style.color = '#888'}
                            >
                                {isAdminMode ? 'Back to User Login' : 'Administrator Access'}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
