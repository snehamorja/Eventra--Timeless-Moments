import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import Logo from './Logo';

const Navbar = ({ transparent = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('access_token');
    const [user, setUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);


    useEffect(() => {
        if (token) {
            API.get('/profile/')
                .then(res => {
                    if (res.data && res.data.username) {
                        setUser(res.data);
                    }
                })
                .catch(() => setUser(null));
        } else {
            setUser(null);
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setShowProfile(false);
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navItemStyle = (path) => ({
        cursor: 'pointer',
        color: transparent ? (isActive(path) ? '#C4A059' : '#fff') : (isActive(path) ? '#C4A059' : '#111'),
        fontWeight: '700',
        fontSize: '0.85rem',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        transition: 'all 0.3s ease',
        borderBottom: isActive(path) ? '2px solid #C4A059' : '2px solid transparent',
        padding: '5px 0',
        height: 'fit-content'
    });

    return (
        <nav style={{
            backgroundColor: transparent ? 'transparent' : '#F9F4E8',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            borderBottom: transparent ? 'none' : '1px solid #D1CFBB',
            padding: '10px 0',
            transition: 'all 0.3s ease'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 20px'
            }}>
                {/* Navigation Left - Grouped towards center */}
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }} className="nav-left">
                    <span onClick={() => navigate('/')} style={navItemStyle('/')}>Home</span>
                    <span onClick={() => navigate('/about')} style={navItemStyle('/about')}>About Us</span>
                    <span onClick={() => navigate('/gallery')} style={navItemStyle('/gallery')}>Gallery</span>
                </div>

                {/* Centered Logo */}
                <div style={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '0 40px'
                }} onClick={() => navigate('/')}>
                    <Logo size="90px" />
                </div>

                {/* Navigation Right - Grouped towards center */}
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flex: 1, justifyContent: 'flex-start' }} className="nav-right">
                    <span onClick={() => navigate('/blog')} style={navItemStyle('/blog')}>Blog</span>
                    <span onClick={() => navigate('/careers')} style={navItemStyle('/careers')}>Employment</span>

                    {/* Profile Icon with Gold Border (as per screenshot) */}
                    <div style={{ position: 'relative', marginLeft: '10px' }}>
                        <div
                            onClick={() => setShowProfile(!showProfile)}
                            style={{
                                width: '45px',
                                height: '45px',
                                background: '#fff',
                                color: '#C4A059',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontWeight: '700',
                                border: '2px solid #C4A059',
                                transition: 'all 0.3s ease',
                                fontSize: '1.1rem',
                                boxShadow: showProfile ? '0 0 10px rgba(196, 160, 89, 0.2)' : 'none'
                            }}>
                            {user?.profile_photo ? (
                                <img src={user.profile_photo} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : user?.username ? (
                                user.username[0].toUpperCase()
                            ) : (
                                <span style={{ fontSize: '1.4rem' }}>👤</span>
                            )}
                        </div>

                        {showProfile && (
                            <div className="fade-in" style={{
                                position: 'absolute',
                                right: 0,
                                top: '60px',
                                background: 'var(--bg-card, #fff)',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                borderRadius: '12px',
                                width: '220px',
                                overflow: 'hidden',
                                zIndex: 1100,
                                border: '1px solid var(--border, #eee)',
                            }}>
                                {token && user ? (
                                    <div style={{ padding: '8px' }}>
                                        <div style={{ padding: '15px', borderBottom: '1px solid var(--border, #f0f0f0)', marginBottom: '8px', backgroundColor: 'var(--light, #fdfbf7)' }}>
                                            <p style={{ fontSize: '0.65rem', color: '#c5a059', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', marginBottom: '5px' }}>Member Account</p>
                                            <p style={{ fontWeight: '700', color: 'var(--dark, #111)', fontSize: '1.1rem', marginBottom: '2px' }}>{user.username}</p>
                                        </div>

                                        <div
                                            onClick={() => { navigate('/my-bookings'); setShowProfile(false); }}
                                            style={{
                                                padding: '12px 15px',
                                                cursor: 'pointer',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: '0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>📅</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main, #111)' }}>My Bookings</span>
                                        </div>

                                        <div
                                            onClick={() => { navigate('/profile'); setShowProfile(false); }}
                                            style={{
                                                padding: '12px 15px',
                                                cursor: 'pointer',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: '0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--light, #f9f9f9)'}
                                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>⚙️</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main, #111)' }}>Account Settings</span>
                                        </div>

                                        {(user.role === 'ADMIN' || user.is_staff || user.is_superuser) && (
                                            <div
                                                onClick={() => { navigate('/admin-dashboard'); setShowProfile(false); }}
                                                style={{
                                                    padding: '12px 15px',
                                                    cursor: 'pointer',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    transition: '0.2s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--light, #f9f9f9)'}
                                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main, #111)' }}>Admin Center</span>
                                            </div>
                                        )}



                                        <div style={{ height: '1px', backgroundColor: '#eee', margin: '8px 0' }}></div>

                                        <div
                                            onClick={handleLogout}
                                            style={{
                                                padding: '12px 15px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                color: '#ef4444',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: '0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#fff1f1'}
                                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>🚪</span>
                                            <span style={{ fontSize: '0.9rem' }}>Sign Out</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '10px' }}>
                                        <div
                                            onClick={() => { navigate('/login'); setShowProfile(false); }}
                                            style={{ padding: '12px 15px', cursor: 'pointer', fontWeight: '600', borderRadius: '8px' }}
                                            onMouseOver={e => e.target.style.backgroundColor = '#f9f9f9'}
                                            onMouseOut={e => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            Login
                                        </div>
                                        <div
                                            onClick={() => { navigate('/register'); setShowProfile(false); }}
                                            style={{ padding: '12px 15px', cursor: 'pointer', fontWeight: '600', color: '#C4A059', borderRadius: '8px' }}
                                            onMouseOver={e => e.target.style.backgroundColor = '#f9f9f9'}
                                            onMouseOut={e => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            Register
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1200px) {
                    .nav-left, .nav-right { gap: 20px !important; }
                    .nav-left span, .nav-right span { font-size: 0.75rem !important; }
                }
                @media (max-width: 1000px) {
                    .nav-left, .nav-right { display: none !important; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
