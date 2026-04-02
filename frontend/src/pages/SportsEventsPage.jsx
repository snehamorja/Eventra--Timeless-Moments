import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

const SportsEventsPage = () => {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [regType, setRegType] = useState('team');
    const [isRegistered, setIsRegistered] = useState(false);
    const [showTicket, setShowTicket] = useState(false);
    // New state to track if there are any fixtures for the selected tournament
    const [hasFixtures, setHasFixtures] = useState(false);
    const [allFixtures, setAllFixtures] = useState([]);
    const [allRegistrations, setAllRegistrations] = useState([]);
    const [showPayment, setShowPayment] = useState(false);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '', subMessage: '', type: '' });

    const [filterMode, setFilterMode] = useState('All');

    // Sport Rules for dynamic fields
    const sportConfigs = {
        'Cricket': { players: 11, subs: 2, price: 5000, isTeam: true },
        'Polo': { players: 4, subs: 2, price: 8000, isTeam: true },
        'Football': { players: 11, subs: 5, price: 4500, isTeam: true },
        'Volleyball': { players: 6, subs: 2, price: 3000, isTeam: true },
        'Kabaddi': { players: 7, subs: 5, price: 2500, isTeam: true },
        'Snookers': { players: 3, subs: 1, price: 2000, isTeam: true },
        'Archery': { players: 1, subs: 0, price: 1500, isTeam: false },
        'Boxing': { players: 1, subs: 0, price: 2000, isTeam: false },
        'Tennis': { players: 1, subs: 0, price: 3000, isTeam: false },
        'chess': { players: 1, subs: 0, price: 500, isTeam: false },
        'badminton': { players: 1, subs: 0, price: 800, isTeam: false },
        'tennis': { players: 1, subs: 0, price: 1000, isTeam: false },
        'Relay Race': { players: 2, subs: 1, price: 2000, isTeam: true }
    };

    const calculateDaysRemaining = (startDate) => {
        const today = new Date();
        const start = new Date(startDate);
        const diffTime = start - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredTournaments = tournaments.filter(t => {
        // Remove past tournaments
        const startDate = new Date(t.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) return false;

        if (filterMode === 'All') return true;
        const config = sportConfigs[t.sport];
        if (!config) return true; // Default to show if unknown
        return filterMode === 'Team' ? config.isTeam : !config.isTeam;
    });

    useEffect(() => {
        // If the current tournament is now filtered out or null, pick a new one
        const isStillValid = selectedTournament && filteredTournaments.find(t => t.id === selectedTournament.id);
        
        if (filteredTournaments.length > 0 && (!selectedTournament || !isStillValid)) {
            const first = filteredTournaments[0];
            setSelectedTournament(first);
            
            const config = sportConfigs[first.sport] || { players: 1, subs: 0, price: 1000, isTeam: false };
            const autoRegType = config.isTeam ? 'team' : 'participant';
            setRegType(autoRegType);
            setFormData(prev => ({
                ...prev,
                players: Array(config.players).fill(''),
                substitutes: Array(config.subs).fill('')
            }));
        }
    }, [filteredTournaments, selectedTournament]);

    const [formData, setFormData] = useState({
        teamName: '',
        captainName: '',
        players: [],
        substitutes: [],
        pName: '',
        pAge: '',
        contact: '',
        countryCode: '+91',
        experienceLevel: 'None',
    });

    useEffect(() => {
        if (selectedTournament) {
            const config = sportConfigs[selectedTournament.sport] || { players: 1, subs: 0, price: 1000, isTeam: false };
            const autoRegType = config.isTeam ? 'team' : 'participant';
            setRegType(autoRegType);
            setFormData(prev => ({
                ...prev,
                players: Array(config.players).fill(''),
                substitutes: Array(config.subs).fill('')
            }));
        }
    }, [selectedTournament]);

    useEffect(() => {
        const pending = localStorage.getItem('pendingSportsReg');
        if (pending && !!localStorage.getItem('access_token')) {
            try {
                const data = JSON.parse(pending);
                setSelectedTournament(data.tournament);
                setFormData(data.formData);
                setRegType(data.regType);

                const autoAction = localStorage.getItem('pendingAutoAction');
                if (autoAction === 'open_payment') {
                    setShowPayment(true);
                    localStorage.removeItem('pendingAutoAction');
                }
                localStorage.removeItem('pendingSportsReg');
            } catch (e) {
                localStorage.removeItem('pendingSportsReg');
            }
        }
    }, [navigate]);

    useEffect(() => {
        fetchTournaments();
        fetchRegistrations();
        fetchFixtures();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const res = await api.get('/sports-registrations/');
            setAllRegistrations(res.data || []);
        } catch (e) { console.error("Failed to load regs"); }
    };

    const fetchFixtures = async () => {
        try {
            const res = await api.get('/fixtures/');
            setAllFixtures(res.data || []);
        } catch (e) { console.error("Failed to load fixtures"); }
    };

    // Check for fixtures from API data
    useEffect(() => {
        if (isRegistered && selectedTournament) {
            const exists = allFixtures.some(f => f.tournament === selectedTournament.id);
            setHasFixtures(exists);
        }
    }, [isRegistered, selectedTournament, allFixtures]);

    const fetchTournaments = async () => {
        try {
            const res = await api.get('/tournaments/');
            setTournaments(res.data || []);
        } catch (err) {
            console.error("Failed to fetch tournaments");
        }
    };

    const handleSelectTourney = (t) => {
        // Winner / Completion Check Logic
        const tRegs = allRegistrations.filter(r => Number(r.tournament) === Number(t.id));
        const winnerObj = tRegs.find(r => r.status === 'Winner');
        const activeCount = tRegs.filter(r => r.status !== 'Eliminated' && r.status !== 'Cancelled').length;
        const tFix = allFixtures.filter(f => Number(f.tournament) === Number(t.id));

        // Duplicate Check
        const userEmail = localStorage.getItem('user_email');
        const isAlreadyRegistered = allRegistrations.some(r => 
            Number(r.tournament) === Number(t.id) && 
            r.email === userEmail && 
            r.status !== 'Cancelled'
        );

        if (isAlreadyRegistered) {
            setCustomAlert({
                show: true,
                title: 'ALREADY REGISTERED',
                message: 'You have already registered for this tournament.',
                subMessage: 'Each user can only register once per championship.',
                type: 'ERROR'
            });
            return;
        }

        const isDone = t.status === 'Completed' || winnerObj || (activeCount === 1 && tFix.length > 0);

        if (isDone) {
            const finalWinner = winnerObj || (activeCount === 1 ? tRegs.find(r => r.status !== 'Eliminated' && r.status !== 'Cancelled') : null);
            const winnerName = finalWinner ? (finalWinner.team_name || finalWinner.player_name || finalWinner.username) : 'TBD';

            // Show a professional notice
            setCustomAlert({
                show: true,
                title: 'CONCLUDED',
                message: `Champion: ${winnerName}`,
                subMessage: 'This tournament has finished. Registration is now closed.',
                type: 'CONCLUDED'
            });
            return;
        }

        // Deadline Check
        if (t.registration_deadline) {
            const deadlineDate = new Date(t.registration_deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            deadlineDate.setHours(0, 0, 0, 0);

            if (today > deadlineDate) {
                setCustomAlert({
                    show: true,
                    title: 'CLOSED',
                    message: `DEADLINE PASSED: ${t.registration_deadline}`,
                    subMessage: 'You can no longer register for this event.',
                    type: 'CLOSED'
                });
                return;
            }
        }

        setSelectedTournament(t);
        const config = sportConfigs[t.sport] || { players: 1, subs: 0, price: 1000, isTeam: false };
        const autoRegType = config.isTeam ? 'team' : 'participant';
        setRegType(autoRegType);

        setFormData({
            ...formData,
            players: Array(config.players).fill(''),
            substitutes: Array(config.subs).fill('')
        });
        window.scrollTo({ top: 600, behavior: 'smooth' });
    };

    const checkAuth = () => {
        return !!localStorage.getItem('access_token');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setShowPayment(true);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const completePayment = async () => {
        if (isSubmitting) return;
        if (!checkAuth()) {
            setCustomAlert({
                show: true,
                title: 'AUTH REQUIRED',
                message: 'Please login to proceed.',
                subMessage: 'Secure access is required for tournament registration.',
                type: 'AUTH'
            });
            return;
        }

        if (formData.countryCode === '+91' && formData.contact.length !== 10) {
            setCustomAlert({
                show: true,
                title: 'INVALID PHONE',
                message: 'Phone number must be exactly 10 digits for +91.',
                type: 'ERROR'
            });
            return;
        }

        const userEmail = localStorage.getItem('user_email');
        const isDuplicate = allRegistrations.some(r => 
            Number(r.tournament) === Number(selectedTournament.id) && 
            r.email === userEmail && 
            r.status !== 'Cancelled'
        );

        if (isDuplicate) {
            setCustomAlert({
                show: true,
                title: 'ALREADY REGISTERED',
                message: 'You have already secured a spot in this tournament.',
                subMessage: 'Multiple registrations are not permitted per user.',
                type: 'ERROR'
            });
            setShowPayment(false);
            return;
        }

        setIsSubmitting(true);
        const config = sportConfigs[selectedTournament.sport] || { price: 1000 };
        const registrationData = {
            tournament: selectedTournament.id,
            registration_type: regType === 'team' ? 'Team' : 'Individual',
            team_name: formData.teamName || null,
            captain_name: formData.captainName || null,
            player_name: formData.pName || null,
            full_name: regType === 'team' ? (formData.captainName || "Team Captain") : (formData.pName || "Participant"),
            phone: `${formData.countryCode}${formData.contact}`,
            age: formData.pAge ? parseInt(formData.pAge) : 18,
            email: localStorage.getItem('user_email') || "user@example.com", // Fallback if not in localStorage
            players: formData.players,
            substitutes: formData.substitutes,
            price: config.price,
            status: 'Confirmed'
        };

        try {
            const res = await api.post('/sports-registrations/', registrationData);
            setIsRegistered(true);
            setShowPayment(false);
            setCustomAlert({
                show: true,
                title: 'SUCCESS',
                message: 'Registration Confirmed!',
                subMessage: 'See you on the field, Champion.',
                type: 'SUCCESS'
            });
        } catch (err) {
            setCustomAlert({
                show: true,
                title: 'ERROR',
                message: 'Registration Failed.',
                subMessage: err.response?.data?.message || 'Please check your connection and try again.',
                type: 'ERROR'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <Navbar />

            <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
                {/* SIDEBAR */}
                <div style={{ 
                    flex: '0 0 400px', 
                    borderRight: '1px solid #eee', 
                    height: 'calc(100vh - 80px)', 
                    overflowY: 'auto',
                    backgroundColor: '#fff',
                    position: 'sticky',
                    top: '80px',
                    padding: '30px 20px'
                }}>
                    <div style={{ marginBottom: '30px' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1D3557', margin: 0 }}>CHAMPIONSHIPS</h1>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                            {['All', 'Team', 'Solo'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setFilterMode(mode)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '50px',
                                        border: '1px solid #eee',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        backgroundColor: filterMode === mode ? '#E63946' : '#fff',
                                        color: filterMode === mode ? '#fff' : '#888'
                                    }}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {filteredTournaments.length > 0 ? filteredTournaments.map(t => {
                            const tRegs = allRegistrations.filter(r => Number(r.tournament) === Number(t.id));
                            const winner = tRegs.find(r => r.status === 'Winner');
                            const activeCount = tRegs.filter(r => r.status !== 'Eliminated' && r.status !== 'Cancelled').length;
                            const tFix = allFixtures.filter(f => Number(f.tournament) === Number(t.id));
                            const isDone = t.status === 'Completed' || winner || (activeCount === 1 && tFix.length > 0);
                            
                            return (
                                <div 
                                    key={t.id} 
                                    onClick={() => handleSelectTourney(t)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '15px',
                                        borderRadius: '16px',
                                        border: selectedTournament?.id === t.id ? '2px solid #E63946' : '1px solid #eee',
                                        backgroundColor: selectedTournament?.id === t.id ? '#FEF2F2' : '#fff',
                                        transition: '0.3s'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div style={{ width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                            <img src={t.image || "https://img.freepik.com/free-vector/sport-equipment-concept_1284-13034.jpg?semt=ais_hybrid&w=740&q=80"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#E63946', letterSpacing: '1px' }}>{t.sport.toUpperCase()}</div>
                                            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1D3557' }}>{t.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>{t.date}</div>
                                        </div>
                                    </div>
                                    {isDone && (
                                        <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#D97706', fontWeight: '900', background: '#FEF3C7', padding: '4px 10px', borderRadius: '50px', display: 'inline-block' }}>🏆 CONCLUDED</div>
                                    )}
                                </div>
                            );
                        }) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No {filterMode} Tournaments</div>
                        )}
                    </div>
                </div>

                {/* MAIN CONTENT Area */}
                <div style={{ flex: 1, backgroundColor: '#fff', minHeight: 'calc(100vh - 80px)' }}>
                    {selectedTournament ? (
                        <div style={{ animation: 'fadeIn 0.5s ease' }}>
                            {/* HERO SECTION FOR TOURNAMENT */}
                            <div style={{ position: 'relative', height: '45vh', overflow: 'hidden' }}>
                                <img src={selectedTournament.image || "https://img.freepik.com/free-vector/sport-equipment-concept_1284-13034.jpg?semt=ais_hybrid&w=740&q=80"} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} alt="" />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #fff 10%, transparent 100%)' }} />
                                <div style={{ position: 'absolute', bottom: '40px', left: '40px' }}>
                                    <div style={{ background: '#E63946', color: '#fff', padding: '6px 20px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '15px' }}>{selectedTournament.sport.toUpperCase()} MAJOR</div>
                                    <h1 style={{ fontSize: '4rem', color: '#1D3557', fontWeight: '900', margin: 0 }}>{selectedTournament.name}</h1>
                                </div>
                            </div>

                            <div style={{ padding: '0 40px 100px' }}>
                                {isRegistered ? (
                                    <div style={{ marginTop: '40px', padding: '60px', background: '#1D3557', borderRadius: '30px', color: '#fff', textAlign: 'center' }}>
                                        <h2 style={{ fontSize: '2.5rem' }}>Welcome to {selectedTournament.name}!</h2>
                                        <p>You are officially registered. Lead your way to victory.</p>
                                        <button onClick={() => navigate('/my-bookings', { state: { tab: 'Sports' } })} style={{ marginTop: '30px', padding: '15px 40px', background: '#E63946', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>View Brackets</button>
                                    </div>
                                ) : (
                                    <section style={{ maxWidth: '800px' }}>
                                        {/* PREMIUM SUMMARY BAR */}
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: '0', 
                                            margin: '40px 0', 
                                            background: '#111', 
                                            borderRadius: '20px', 
                                            overflow: 'hidden',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div style={{ flex: 1, padding: '25px 35px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#888', fontWeight: '900', letterSpacing: '2px', marginBottom: '8px' }}>VENUE</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff', fontFamily: 'Playfair Display, serif' }}>{selectedTournament.venue || 'Olympic Stadium'}</div>
                                            </div>
                                            <div style={{ flex: 1, padding: '25px 35px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#888', fontWeight: '900', letterSpacing: '2px', marginBottom: '8px' }}>DEADLINE</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#E63946', fontFamily: 'Playfair Display, serif' }}>{selectedTournament.registration_deadline}</div>
                                            </div>
                                        </div>

                                        {/* CONDITIONAL RENDERING: WINNER BLOC OR REGISTRATION FORM */}
                                        {selectedTournament.status === 'Completed' ? (
                                            <div style={{ 
                                                marginTop: '40px', 
                                                padding: '40px', 
                                                background: 'linear-gradient(135deg, #1D3557 0%, #111 100%)', 
                                                borderRadius: '24px', 
                                                color: '#fff',
                                                textAlign: 'center',
                                                border: '2px solid #C4A059',
                                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                            }}>
                                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏆</div>
                                                <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#C4A059', marginBottom: '10px' }}>CHAMPION ANNOUNCED</h2>
                                                <p style={{ color: '#aaa', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '30px' }}>THE QUEST FOR GLORY HAS CONCLUDED</p>
                                                
                                                {(() => {
                                                    const winner = allRegistrations.find(r => Number(r.tournament) === Number(selectedTournament.id) && r.status === 'Winner');
                                                    if (winner) {
                                                        return (
                                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '15px', border: '1px solid rgba(196, 160, 89, 0.3)' }}>
                                                                <div style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'serif' }}>{winner.team_name || winner.player_name || winner.username}</div>
                                                                <div style={{ marginTop: '10px', fontSize: '1rem', color: '#C4A059', fontWeight: 'bold' }}>OFFICIAL {selectedTournament.sport.toUpperCase()} CHAMPION</div>
                                                            </div>
                                                        );
                                                    }
                                                    return <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>Winner details are being finalized by the officials.</div>;
                                                })()}
                                                
                                                <button 
                                                    onClick={() => navigate('/dashboard')} 
                                                    style={{ 
                                                        marginTop: '30px', 
                                                        padding: '12px 30px', 
                                                        background: 'transparent', 
                                                        border: '1px solid #fff', 
                                                        color: '#fff', 
                                                        borderRadius: '30px', 
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    View All Champions
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <h2 style={styles.sectionHeadingAlt}>Complete Your Registration</h2>
                                                <form onSubmit={handleFormSubmit} style={styles.regCard}>
                                                    {regType === 'team' ? (
                                                        <>
                                                            <div style={styles.row}>
                                                                <div style={styles.inputGroup}><label style={styles.label}>Team Name</label><input style={styles.input} required value={formData.teamName} onChange={e => setFormData({ ...formData, teamName: e.target.value })} /></div>
                                                                <div style={styles.inputGroup}><label style={styles.label}>Captain Name</label><input style={styles.input} required value={formData.captainName} onChange={e => setFormData({ ...formData, captainName: e.target.value })} /></div>
                                                            </div>
                                                            <h3 style={styles.subHeading}>Active Squad ({formData.players.length} Players)</h3>
                                                            <div style={styles.squadGrid}>
                                                                {formData.players.map((p, i) => (
                                                                    <input 
                                                                        key={i} 
                                                                        style={styles.input} 
                                                                        placeholder={`Active Player ${i + 1}`} 
                                                                        required 
                                                                        value={p}
                                                                        onChange={e => {
                                                                            const np = [...formData.players]; 
                                                                            np[i] = e.target.value; 
                                                                            setFormData({ ...formData, players: np });
                                                                        }} 
                                                                    />
                                                                ))}
                                                            </div>

                                                            {formData.substitutes.length > 0 && (
                                                                <>
                                                                    <h3 style={styles.subHeading}>Substitutes ({formData.substitutes.length})</h3>
                                                                    <div style={styles.squadGrid}>
                                                                        {formData.substitutes.map((s, i) => (
                                                                            <input 
                                                                                key={i} 
                                                                                style={styles.input} 
                                                                                placeholder={`Substitute ${i + 1}`} 
                                                                                required 
                                                                                value={s}
                                                                                onChange={e => {
                                                                                    const ns = [...formData.substitutes]; 
                                                                                    ns[i] = e.target.value; 
                                                                                    setFormData({ ...formData, substitutes: ns });
                                                                                }} 
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div style={styles.row}>
                                                            <div style={styles.inputGroup}><label style={styles.label}>Full Name</label><input style={styles.input} required value={formData.pName} onChange={e => setFormData({ ...formData, pName: e.target.value })} /></div>
                                                            <div style={styles.inputGroup}><label style={styles.label}>Age</label><input style={styles.input} type="number" required value={formData.pAge} onChange={e => setFormData({ ...formData, pAge: e.target.value })} /></div>
                                                        </div>
                                                    )}

                                                    <div style={styles.row}>
                                                        <div style={styles.inputGroup}>
                                                            <label style={styles.label}>Pro Level</label>
                                                            <select style={styles.select} value={formData.experienceLevel} onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}>
                                                                <option>None</option><option>District</option><option>State</option><option>National</option><option>International</option>
                                                            </select>
                                                        </div>
                                                        <div style={styles.inputGroup}>
                                                            <label style={styles.label}>Contact</label>
                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                <select 
                                                                    style={{ ...styles.select, width: '100px', flexShrink: 0 }} 
                                                                    value={formData.countryCode} 
                                                                    onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                                                                >
                                                                    <option value="+91">+91 (IN)</option>
                                                                    <option value="+1">+1 (US)</option>
                                                                    <option value="+44">+44 (UK)</option>
                                                                    <option value="+61">+61 (AU)</option>
                                                                    <option value="+86">+86 (CN)</option>
                                                                    <option value="+971">+971 (UAE)</option>
                                                                </select>
                                                                <input 
                                                                    style={styles.input} 
                                                                    placeholder="Phone Number"
                                                                    required 
                                                                    type="tel"
                                                                    maxLength={formData.countryCode === '+91' ? 10 : 15}
                                                                    value={formData.contact}
                                                                    onChange={e => {
                                                                        const val = e.target.value.replace(/\D/g, '');
                                                                        if (formData.countryCode === '+91') {
                                                                            if (val.length <= 10) setFormData({ ...formData, contact: val });
                                                                        } else {
                                                                            if (val.length <= 15) setFormData({ ...formData, contact: val });
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {(() => {
                                                        const currentRegs = allRegistrations.filter(r => Number(r.tournament) === Number(selectedTournament.id) && !r.is_deleted).length;
                                                        const isFull = currentRegs >= (selectedTournament.max_teams || 10) || selectedTournament.status === 'Full/Closed' || selectedTournament.status === 'Registration Closed' || selectedTournament.status === 'Completed';
                                                        
                                                        return (
                                                            <button 
                                                                type="submit" 
                                                                disabled={isFull}
                                                                style={{
                                                                    ...styles.submitBtn,
                                                                    background: isFull ? '#ccc' : styles.submitBtn.background,
                                                                    cursor: isFull ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                {selectedTournament.status === 'Completed' ? 'TOURNAMENT CONCLUDED 🏆' : 
                                                                    isFull ? 'REGISTRATION FULL / CLOSED' : 
                                                                    `PROCEED TO PAYMENT (₹${sportConfigs[selectedTournament.sport]?.price || 1000})`}
                                                            </button>
                                                        );
                                                    })()}
                                                </form>
                                            </>
                                        )}
                                    </section>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🏅</div>
                                <h2 style={{ fontWeight: '900', color: '#1D3557' }}>Select a Championship</h2>
                                <p>Join the elite league of professional athletes.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showPayment && (
                <div style={styles.modalOverlay}>
                    <div style={styles.paymentCard}>
                        {!checkAuth() ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔐</div>
                                <h2 style={{ color: '#1D3557', marginBottom: '10px' }}>Authentication Required</h2>
                                <p style={{ color: '#666', marginBottom: '30px' }}>To secure your spot and process the payment, please log in to your account or create a new one.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <button
                                        onClick={() => {
                                            const saveState = { tournament: selectedTournament, formData, regType };
                                            localStorage.setItem('pendingSportsReg', JSON.stringify(saveState));
                                            localStorage.setItem('pendingNavigation', JSON.stringify({ to: '/sports' }));
                                            localStorage.setItem('pendingAutoAction', 'open_payment');
                                            navigate('/login');
                                        }}
                                        style={{ ...styles.confirmBtn, background: '#1D3557' }}
                                    >
                                        Login to Proceed
                                    </button>
                                    <button
                                        onClick={() => {
                                            const saveState = { tournament: selectedTournament, formData, regType };
                                            localStorage.setItem('pendingSportsReg', JSON.stringify(saveState));
                                            localStorage.setItem('pendingNavigation', JSON.stringify({ to: '/sports' }));
                                            localStorage.setItem('pendingAutoAction', 'open_payment');
                                            navigate('/register');
                                        }}
                                        style={{ ...styles.confirmBtn, background: '#E63946' }}
                                    >
                                        Sign Up Now
                                    </button>
                                    <button
                                        onClick={() => setShowPayment(false)}
                                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', marginTop: '10px' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <h2 style={{ color: '#E63946', marginBottom: '10px' }}>Verified Payment Gate</h2>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '30px' }}>Secure UPI Gateway for {selectedTournament.name}</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ padding: '15px', background: '#fff', border: '1px solid #eee', borderRadius: '15px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=sports@upi&pn=ImperialSports&am=${sportConfigs[selectedTournament.sport]?.price || 1000}&cu=INR`} 
                                            alt="QR" 
                                            style={{ width: '150px' }}
                                        />
                                    </div>
                                    <div style={{ textAlign: 'left', width: '100%', background: '#f9f9f9', padding: '20px', borderRadius: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ color: '#888' }}>Event:</span>
                                            <span style={{ fontWeight: 'bold' }}>{selectedTournament.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                                            <span style={{ color: '#1D3557', fontWeight: 'bold' }}>Total:</span>
                                            <span style={{ color: '#E63946', fontWeight: '900' }}>₹{sportConfigs[selectedTournament.sport]?.price || 1000}</span>
                                        </div>
                                    </div>
                                    
                                    <button onClick={completePayment} disabled={isSubmitting} style={{ ...styles.confirmBtn, background: isSubmitting ? '#9CA3AF' : '#10B981', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                                        {isSubmitting ? 'PROCESSING...' : 'I HAVE PAID SUCCESSFULLY'}
                                    </button>
                                    <button onClick={() => setShowPayment(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase' }}>Cancel Transaction</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CustomAlert
                show={customAlert.show}
                onClose={() => setCustomAlert({ ...customAlert, show: false })}
                title={customAlert.title}
                message={customAlert.message}
                subMessage={customAlert.subMessage}
            />
            <Footer />
        </div>
    );
};

const styles = {
    pageWrapper: { backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" },
    hero: { height: '50vh', backgroundImage: 'url("https://img.freepik.com/free-vector/sport-equipment-concept_1284-13034.jpg?semt=ais_hybrid&w=740&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' },
    heroOverlay: { height: '100%', width: '100%', background: 'linear-gradient(rgba(29, 53, 87, 0.9), rgba(29, 53, 87, 0.7))', display: 'flex', alignItems: 'center', padding: '0 10%' },
    heroContent: { color: '#fff', maxWidth: '700px' },
    sportTag: { background: '#E63946', display: 'inline-block', padding: '6px 20px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '20px' },
    heroTitle: { fontSize: '4rem', margin: '0 0 20px 0', textTransform: 'uppercase', fontWeight: '900' },
    heroSub: { fontSize: '1.2rem', opacity: 0.9, marginBottom: '40px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' },
    sectionHeadingAlt: { fontSize: '2rem', color: '#1D3557', marginBottom: '30px', fontWeight: '900' },
    tourneyCard: { position: 'relative', background: '#fff', padding: '30px', borderRadius: '20px', cursor: 'pointer', transition: '0.3s', border: '2px solid transparent', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', overflow: 'hidden' },
    tourneyCardActive: { position: 'relative', background: '#fff', padding: '30px', borderRadius: '20px', cursor: 'pointer', border: '2px solid #E63946', boxShadow: '0 10px 30px rgba(230, 57, 70, 0.2)', overflow: 'hidden' },
    regSection: { background: '#fff', padding: '50px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' },
    regCard: { maxWidth: '800px', margin: '0 auto' },
    regToggleContainer: { display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' },
    toggleBtn: { padding: '12px 40px', borderRadius: '50px', border: '2px solid #eee', background: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#888' },
    toggleBtnActive: { padding: '12px 40px', borderRadius: '50px', border: '2px solid #E63946', background: '#E63946', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
    row: { display: 'flex', gap: '20px', marginBottom: '25px' },
    inputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.9rem', fontWeight: 'bold', color: '#1D3557' },
    input: { padding: '15px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '1rem', outline: 'none' },
    select: { padding: '15px', border: '1px solid #ddd', borderRadius: '10px', background: '#fff', fontSize: '1rem' },
    subHeading: { fontSize: '1.2rem', color: '#1D3557', margin: '30px 0 20px 0', fontWeight: 'bold' },
    squadGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' },
    submitBtn: { width: '100%', padding: '22px', background: '#1D3557', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', marginTop: '40px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    paymentCard: { background: '#fff', padding: '40px', borderRadius: '25px', maxWidth: '500px', width: '90%' },
    paymentGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' },
    confirmBtn: { width: '100%', padding: '15px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }
};

export default SportsEventsPage;
