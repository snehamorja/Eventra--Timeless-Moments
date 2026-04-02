import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Account'); // Account, Password, Preferences
    const [profileForm, setProfileForm] = useState({ username: '', email: '', phone: '', profile_photo: '' });
    const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile/');
            setUser(res.data);
            setProfileForm({
                username: res.data.username,
                email: res.data.email,
                phone: res.data.phone || '',
                profile_photo: res.data.profile_photo || ''
            });
            setTheme(res.data.theme || 'light');
            if (res.data.theme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch profile");
            navigate('/login');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch('/profile/', { ...profileForm, theme });
            setCustomAlert({ show: true, title: 'SUCCESS', message: 'Your profile has been synchronized successfully!' });
            await fetchProfile();
        } catch (err) {
            console.error(err);
            const errorData = err.response?.data;
            let errMsg = 'We encountered an issue updating your profile.';
            if (errorData) {
                if (typeof errorData === 'object') {
                    // Extract fields like { "email": ["This field must be unique."] }
                    errMsg = Object.entries(errorData)
                        .map(([field, msgs]) => `${field.toUpperCase()}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
                        .join('\n');
                } else if (typeof errorData === 'string') {
                    errMsg = errorData;
                }
            }
            setCustomAlert({ show: true, title: 'UPDATE FAILED', message: errMsg });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setCustomAlert({ show: true, title: 'ERROR', message: 'New passwords do not match!' });
            return;
        }
        try {
            await api.post('/change-password/', passwordForm);
            setCustomAlert({ show: true, title: 'SUCCESS', message: 'Password changed successfully!' });
            setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: err.response?.data?.error || 'Failed to change password.' });
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        try {
            await api.patch('/profile/', { theme: newTheme });
        } catch (e) { console.error("Theme sync failed"); }
    };

    if (loading) return <div style={styles.loading}>Refining Your Identity...</div>;

    return (
        <div style={styles.pageWrapper}>
            <Navbar />
            <div className="container" style={styles.content}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Account Settings</h1>
                    <p style={styles.subtitle}>Manage your profile, security, and application preferences.</p>
                </div>

                <div style={styles.mainLayout}>
                    {/* Sidebar */}
                    <aside style={styles.sidebar}>
                        {['Account', 'Password'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    ...styles.sidebarBtn,
                                    background: activeTab === tab ? 'var(--dark)' : 'transparent',
                                    color: activeTab === tab ? '#fff' : 'var(--gray)'
                                }}
                            >
                                {tab === 'Account' && '👤 '}
                                {tab === 'Password' && '🔐 '}
                                {tab}
                            </button>
                        ))}
                        <hr style={styles.hr} />
                        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={styles.logoutBtn}>🚪 Sign Out</button>
                    </aside>

                    {/* Content */}
                    <div style={styles.contentArea}>
                        {activeTab === 'Account' && (
                            <div className="fade-in">
                                <h2 style={styles.sectionTitle}>Profile Information</h2>
                                <form onSubmit={handleProfileUpdate} style={styles.form}>
                                    <div style={styles.photoSection}>
                                        <div style={styles.avatarWrapper}>
                                            {profileForm.profile_photo ? (
                                                <img src={profileForm.profile_photo} alt="Avatar" style={styles.avatar} />
                                            ) : (
                                                <div style={styles.avatarPlaceholder}>{user.username?.[0].toUpperCase()}</div>
                                            )}
                                        </div>
                                        <div style={styles.photoInfo}>
                                            <h3 style={styles.photoTitle}>Profile Photo</h3>
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                <label style={{ ...styles.saveBtn, margin: 0, padding: '10px 15px', background: '#3B82F6', cursor: 'pointer' }}>
                                                    📁 Upload from Gallery
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        style={{ display: 'none' }} 
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setProfileForm({ ...profileForm, profile_photo: reader.result });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <button 
                                                    type="button"
                                                    onClick={() => setProfileForm({ ...profileForm, profile_photo: '' })}
                                                    style={{ ...styles.saveBtn, margin: 0, padding: '10px 15px', background: '#EF4444' }}
                                                >
                                                    ❌ Remove
                                                </button>
                                            </div>
                                            <p style={styles.hint}>Supports JPG, PNG or GIF. Max size 2MB.</p>
                                        </div>
                                    </div>

                                    <div style={styles.grid}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Full Name / Username</label>
                                            <input 
                                                style={styles.input} 
                                                placeholder="e.g. John Doe"
                                                value={profileForm.username} 
                                                onChange={e => setProfileForm({...profileForm, username: e.target.value})} 
                                            />
                                            <p style={styles.hint}>This is how you will appear to other users.</p>
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Registered Email</label>
                                            <input 
                                                style={styles.input} 
                                                type="email" 
                                                placeholder="name@example.com"
                                                value={profileForm.email} 
                                                onChange={e => setProfileForm({...profileForm, email: e.target.value})} 
                                            />
                                            <p style={styles.hint}>Changing this will update your login credentials.</p>
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Primary Contact Number</label>
                                            <input 
                                                style={styles.input} 
                                                placeholder="+91 XXXXX XXXXX"
                                                value={profileForm.phone} 
                                                onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
                                            />
                                            <p style={styles.hint}>Used for booking confirmations and SOS alerts.</p>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '30px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                                        <button type="submit" disabled={loading} style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }}>
                                            {loading ? 'Synchronizing...' : 'Update Profile Identity'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'Password' && (
                            <div className="fade-in">
                                <h2 style={styles.sectionTitle}>Security Settings</h2>
                                <p style={styles.sectionDesc}>Ensure your account is using a long, random password to stay secure.</p>
                                <form onSubmit={handlePasswordChange} style={styles.form}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Current Password</label>
                                        <input style={styles.input} type="password" required value={passwordForm.old_password} onChange={e => setPasswordForm({...passwordForm, old_password: e.target.value})} />
                                    </div>
                                    <div style={styles.grid}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>New Password</label>
                                            <input style={styles.input} type="password" required value={passwordForm.new_password} onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})} />
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Confirm New Password</label>
                                            <input style={styles.input} type="password" required value={passwordForm.confirm_password} onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})} />
                                        </div>
                                    </div>
                                    <button type="submit" style={styles.saveBtn}>Update Password</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
            <CustomAlert 
                show={customAlert.show} 
                title={customAlert.title} 
                message={customAlert.message} 
                onClose={() => setCustomAlert({...customAlert, show: false})} 
            />
        </div>
    );
};

const styles = {
    pageWrapper: {
        background: 'var(--light)',
        minHeight: '100vh',
    },
    loading: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: '600',
        color: 'var(--primary)'
    },
    content: {
        paddingTop: '120px',
        paddingBottom: '100px',
    },
    header: {
        marginBottom: '50px',
        textAlign: 'center'
    },
    title: {
        fontSize: '2.5rem',
        color: 'var(--dark)',
        marginBottom: '10px'
    },
    subtitle: {
        color: 'var(--gray)',
        fontSize: '1rem'
    },
    mainLayout: {
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '40px',
        background: '#fff',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)'
    },
    sidebar: {
        borderRight: '1px solid var(--border)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    sidebarBtn: {
        textAlign: 'left',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: '0.2s'
    },
    logoutBtn: {
        textAlign: 'left',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#EF4444',
        marginTop: '20px'
    },
    hr: {
        border: 'none',
        borderTop: '1px solid var(--border)',
        margin: '10px 0'
    },
    contentArea: {
        padding: '30px'
    },
    sectionTitle: {
        fontSize: '1.5rem',
        marginBottom: '10px',
        color: 'var(--dark)'
    },
    sectionDesc: {
        color: 'var(--gray)',
        marginBottom: '30px',
        fontSize: '0.9rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px'
    },
    photoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '25px',
        marginBottom: '10px',
        padding: '20px',
        background: 'var(--light)',
        borderRadius: '12px'
    },
    avatarWrapper: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatar: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    avatarPlaceholder: {
        fontSize: '2rem',
        color: '#fff',
        fontWeight: 'bold'
    },
    photoInfo: {
        flex: 1
    },
    photoTitle: {
        fontSize: '1rem',
        marginBottom: '8px'
    },
    hint: {
        fontSize: '0.75rem',
        color: 'var(--gray)',
        marginTop: '5px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--dark)'
    },
    input: {
        padding: '12px 15px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        fontSize: '0.95rem',
        outline: 'none',
        width: '100%'
    },
    saveBtn: {
        background: 'var(--dark)',
        color: '#fff',
        padding: '15px 30px',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        alignSelf: 'flex-start',
        border: 'none',
        marginTop: '10px'
    },
    themeSection: {
        marginTop: '20px'
    },
    themeCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '20px',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: '0.2s'
    },
    themeIcon: {
        fontSize: '2rem'
    },
    themeTitle: {
        fontSize: '1.1rem',
        marginBottom: '4px'
    },
    themeDesc: {
        fontSize: '0.85rem',
        color: 'var(--gray)'
    },
    toggle: {
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        position: 'relative',
        marginLeft: 'auto',
        transition: '0.3s'
    },
    knob: {
        width: '20px',
        height: '20px',
        background: '#fff',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        transition: '0.3s'
    }
};

export default ProfilePage;
