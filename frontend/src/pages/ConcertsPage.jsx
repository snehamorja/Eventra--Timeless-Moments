import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

// --- RICH DATA STRUCTURE ---
const ConcertsPage = () => {
    const [concertList, setConcertList] = useState([]);
    const [selectedConcert, setSelectedConcert] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchConcerts();
        window.scrollTo(0, 0);

        const pending = localStorage.getItem('pendingConcertReg');
        if (pending && !!localStorage.getItem('access_token')) {
            try {
                const data = JSON.parse(pending);
                setSelectedConcert(data.concert);
                window.pendingConcertCounts = data.counts;
                localStorage.removeItem('pendingConcertReg');
            } catch (e) {
                localStorage.removeItem('pendingConcertReg');
            }
        }
    }, []);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredConcerts = concertList.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (filteredConcerts.length > 0 && !selectedConcert) {
            setSelectedConcert(filteredConcerts[0]);
        }
    }, [filteredConcerts, selectedConcert]);

    const fetchConcerts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/concerts/');
            setConcertList(res.data);
            if (res.data.length > 0 && !selectedConcert) {
                setSelectedConcert(res.data[0]);
            }
        } catch (error) {
            console.error("Failed to load concerts", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F9F4E8', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
            <Navbar />

            <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
                {/* SIDEBAR LIST */}
                <div style={{
                    flex: '0 0 380px',
                    borderRight: '1px solid #D1CFBB',
                    height: 'calc(100vh - 80px)',
                    overflowY: 'auto',
                    backgroundColor: '#F9F4E8',
                    position: 'sticky',
                    top: '80px',
                    padding: '30px 20px'
                }}>
                    <div style={{ marginBottom: '30px', paddingLeft: '10px' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#111', margin: 0 }}>CONCERTS</h1>
                        <p style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '5px' }}>Live Experiences & Beyond</p>
                    </div>

                    {/* SEARCH BOX */}
                    <div style={{ marginBottom: '25px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Find a concert or artist..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: '1px solid #eee',
                                backgroundColor: '#f9f9f9',
                                outline: 'none',
                                fontSize: '0.9rem',
                                transition: '0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#111'}
                            onBlur={(e) => e.target.style.borderColor = '#eee'}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>
                        ) : filteredConcerts.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedConcert(c)}
                                style={{
                                    display: 'flex',
                                    gap: '15px',
                                    padding: '15px',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: selectedConcert?.id === c.id ? '#1a1a1a' : 'transparent',
                                    border: selectedConcert?.id === c.id ? '1px solid #1a1a1a' : '1px solid #eee',
                                    boxShadow: selectedConcert?.id === c.id ? '0 8px 20px rgba(0,0,0,0.1)' : 'none',
                                    color: selectedConcert?.id === c.id ? '#fff' : '#111'
                                }}
                            >
                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {c.bannerImage || c.thumbnail ? (
                                        <img src={c.bannerImage || c.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '1.5rem' }}>🎸</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: '800' }}>{c.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: selectedConcert?.id === c.id ? '#aaa' : '#888', marginTop: '4px' }}>{c.artist}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#C4A059', fontWeight: '900', marginTop: '5px' }}>{c.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div style={{ flex: 1, padding: '0', backgroundColor: '#F9F4E8' }}>
                    {selectedConcert ? (
                        <ConcertDetailView key={selectedConcert.id} concert={selectedConcert} />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎸</div>
                                <h2>Select a concert to feel the vibe</h2>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

const ConcertDetailView = ({ concert }) => {
    const navigate = useNavigate();
    const [counts, setCounts] = useState(() => {
        if (window.pendingConcertCounts) {
            const saved = window.pendingConcertCounts;
            delete window.pendingConcertCounts;
            return saved;
        }
        return concert.tickets.reduce((acc, t) => ({ ...acc, [t.type]: 0 }), {});
    });
    const [showConfirm, setShowConfirm] = useState(!!window.pendingConcertCounts); // If we restored counts, maybe show modal?
    const [showPayment, setShowPayment] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '', subMessage: '' });

    useEffect(() => {
        // Auto-open payment if flag is set
        const autoAction = localStorage.getItem('pendingAutoAction');
        if (autoAction === 'open_payment') {
            localStorage.removeItem('pendingAutoAction');
            if (Object.values(counts).some(v => v > 0)) {
                const ticketType = Object.keys(counts).find(k => counts[k] > 0);
                const ticket = concert.tickets.find(t => t.type === ticketType);
                if (ticket) {
                    setBookingData({ ...ticket, quantity: counts[ticketType] });
                    setShowPayment(true);
                }
            }
        }
    }, [counts, concert.tickets]);

    const checkDeadline = () => {
        if (!concert.booking_deadline) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(concert.booking_deadline);
        return today > deadline;
    };

    const updateCount = (type, val, available) => {
        // Check Deadline First
        if (val > 0 && checkDeadline()) {
            setCustomAlert({ show: true, title: 'OOPS!', message: 'You missed the event, all tickets booked.' });
            return;
        }

        const current = counts[type] || 0;
        const newCount = current + val;

        // Block if going below 0 or above available
        if (newCount < 0) return;
        if (val > 0 && newCount > available) {
            setCustomAlert({ show: true, title: 'LIMIT REACHED', message: `Only ${available} tickets available.` });
            return;
        }

        setCounts(prev => ({ ...prev, [type]: newCount }));
    };

    const handlePreBook = (ticket) => {
        if (counts[ticket.type] === 0) return;
        setBookingData({ ...ticket, quantity: counts[ticket.type] });
        setShowConfirm(true);
    };

    const confirmBooking = () => {
        setShowConfirm(false);
        setShowPayment(true);
    };

    const checkAuth = () => {
        return !!localStorage.getItem('access_token');
    };

    const finalizePayment = async () => {
        if (!checkAuth()) {
            setCustomAlert({
                show: true,
                title: 'AUTH REQUIRED',
                message: "Please login to proceed with booking."
            });
            return;
        }

        try {
            const totalPrice = bookingData.price * bookingData.quantity;
            await api.post('concert-bookings/', {
                concert_title: concert.title,
                artist_name: concert.artist,
                event_date: concert.date,
                ticket_type: bookingData.type,
                quantity: bookingData.quantity,
                total_price: totalPrice
            });
            setCustomAlert({
                show: true,
                title: 'SUCCESS',
                message: 'Payment Successful!',
                subMessage: 'Your spot is secured. Check your email for confirmation.'
            });
            setShowPayment(false);
            setShowConfirm(false);
            setTimeout(() => window.location.reload(), 3000);
        } catch (error) {
            console.error(error);
            setCustomAlert({
                show: true,
                title: 'FAILED',
                message: 'Payment Failed',
                subMessage: 'Please check your connection and try again.'
            });
        }
    };

    return (
        <div style={{ backgroundColor: '#F9F4E8', minHeight: '100vh', color: '#1a1a1a', fontFamily: 'Montserrat, sans-serif' }}>
            {/* HERO */}
            <div style={{ position: 'relative', height: '60vh', overflow: 'hidden', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {concert.bannerImage ? (
                    <img src={concert.bannerImage} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} alt="" />
                ) : (
                    <div style={{ fontSize: '8rem', opacity: 0.2 }}>🎸</div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #F9F4E8 0%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 60, left: '5%', right: '5%', color: '#111' }}>
                    <h2 style={{ fontSize: '1.8rem', color: '#C4A059', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '10px' }}>{concert.artist}</h2>
                    <h1 style={{ fontSize: '4.5rem', fontFamily: 'Playfair Display, serif', margin: 0, letterSpacing: '-2px', fontWeight: '900' }}>{concert.title}</h1>
                    <div style={{ marginTop: '20px', color: '#555', display: 'flex', gap: '40px', fontWeight: '600' }}>
                        <span>🕒 {concert.time}</span>
                        <span>📍 {concert.venue}</span>
                        <span>📅 {concert.date}</span>
                    </div>
                </div>
            </div>

            {/* HIGHLIGHTS STRIP */}
            <div style={{
                background: 'transparent',
                padding: '40px 50px',
            }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${Object.keys(concert.highlights).length}, 1fr)`, 
                    gap: '20px', 
                    maxWidth: '1200px', 
                    margin: '0 auto' 
                }}>
                    {Object.entries(concert.highlights).map(([k, v], i, arr) => (
                        <div key={k} style={{
                            textAlign: 'center',
                            padding: '25px 15px',
                            borderRight: i < arr.length - 1 ? '1px solid rgba(196,160,89,0.2)' : 'none',
                        }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>🎵</div>
                            <div style={{ 
                                color: '#8B7355', 
                                fontSize: '0.65rem', 
                                textTransform: 'uppercase', 
                                letterSpacing: '3px', 
                                fontWeight: '800',
                                marginBottom: '8px'
                            }}>{k.toUpperCase()}</div>
                            <div style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '800', 
                                color: '#1a1a1a', 
                                fontFamily: 'Playfair Display, serif'
                            }}>{v}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '80px', marginBottom: '100px' }}>
                    <div>
                        <h3 style={sectionTitleStyle}>About the Concert</h3>
                        <p style={{ fontSize: '1.3rem', lineHeight: '1.8', color: '#555', fontWeight: '300' }}>{concert.description}</p>

                        <div style={{ marginTop: '80px' }}>
                            <h3 style={sectionTitleStyle}>Event Schedule</h3>
                            <div style={{ borderLeft: '2px solid #C4A059', paddingLeft: '30px' }}>
                                {concert.schedule.map(s => (
                                    <div key={s.id} style={{ marginBottom: '30px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-41px', top: '5px', width: '20px', height: '20px', borderRadius: '50%', background: '#C4A059', border: '5px solid #fff' }} />
                                        <div style={{ fontWeight: '700', fontSize: '1.2rem' }}>{s.time}</div>
                                        <div style={{ color: '#666', textTransform: 'uppercase', fontSize: '0.8rem' }}>{s.event}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '80px' }}>
                            <h3 style={sectionTitleStyle}>Rules & Safety</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {concert.rules.map((r, i) => (
                                    <li key={i} style={{ padding: '15px 0', borderBottom: '1px solid #f0f0f0', color: '#666', display: 'flex', gap: '15px' }}>
                                        <span style={{ color: '#C4A059' }}>•</span> {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div style={{ position: 'sticky', top: '40px', alignSelf: 'start' }}>
                        <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #D1CFBB' }}>
                            <h3 style={{ fontSize: '1.6rem', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '25px', fontFamily: 'Playfair Display, serif' }}>Artist Profile</h3>
                            <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '15px', marginBottom: '25px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {concert.artistImage || concert.bannerImage || concert.thumbnail ? (
                                    <img src={concert.artistImage || concert.bannerImage || concert.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.3)' }} alt="" />
                                ) : (
                                    <span style={{ fontSize: '4rem' }}>👤</span>
                                )}
                            </div>
                            <h4 style={{ fontSize: '1.6rem', color: '#C4A059', marginBottom: '10px' }}>{concert.artist}</h4>
                            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.9rem' }}>{concert.artistBio}</p>
                            <h5 style={{ fontSize: '0.9rem', color: '#aaa', margin: '25px 0 10px', fontWeight: '800' }}>SIGNATURE TRACKS</h5>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {concert.popularTracks?.map((t, idx) => (
                                    <span key={idx} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #ddd', borderRadius: '50px', fontSize: '0.8rem', color: '#555' }}>{t.title || t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TICKETS SECTION */}
                <div id="booking" style={{ marginBottom: '100px' }}>
                    <h3 style={{ ...sectionTitleStyle, textAlign: 'center' }}>Choose Your Experience</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                        {concert.tickets.map(t => {
                            const isSoldOut = t.sold >= t.total;
                            return (
                                <div key={t.type} style={{
                                    background: '#fff',
                                    padding: '50px 40px',
                                    borderRadius: '32px',
                                    border: counts[t.type] > 0 ? '2px solid #C4A059' : '1px solid #eee',
                                    textAlign: 'center',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                    opacity: isSoldOut ? 0.6 : 1
                                }}>
                                    <div style={{ fontSize: '0.9rem', color: '#C4A059', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>{t.type}</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: '900', margin: '20px 0', color: '#1a1a1a', fontFamily: 'Playfair Display, serif' }}>₹{t.price}</div>
                                    <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '30px', minHeight: '40px' }}>{t.benefits}</div>

                                    {isSoldOut ? (
                                        <div style={{ color: '#ff4d4d', fontWeight: 'bold', border: '1px solid #ff4d4d', padding: '15px' }}>FULLY BOOKED</div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                                                <button onClick={() => updateCount(t.type, -1, t.total - (t.sold || 0))} style={counterButtonStyle}>−</button>
                                                <span style={{ fontSize: '1.6rem', width: '40px', fontWeight: '700' }}>{counts[t.type] || 0}</span>
                                                <button onClick={() => updateCount(t.type, 1, t.total - (t.sold || 0))} style={counterButtonStyle}>+</button>
                                            </div>
                                            <button
                                                onClick={() => handlePreBook(t)}
                                                disabled={counts[t.type] === 0}
                                                style={{
                                                    width: '100%',
                                                    padding: '18px',
                                                    borderRadius: '12px',
                                                    background: counts[t.type] > 0 ? '#1a1a1a' : '#ddd',
                                                    color: '#fff',
                                                    border: 'none',
                                                    fontWeight: '800',
                                                    cursor: counts[t.type] > 0 ? 'pointer' : 'default',
                                                    fontSize: '0.9rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px'
                                                }}>
                                                {counts[t.type] > 0 ? `Pay ₹${(t.price * counts[t.type]).toLocaleString()}` : 'Select Tickets'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FAQS */}
                <div style={{ textAlign: 'center' }}>
                    <h3 style={sectionTitleStyle}>Frequently Asked Questions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', textAlign: 'left', marginTop: '40px' }}>
                        {concert.faqs?.map((f, i) => (
                            <div key={i} style={{ padding: '30px', background: '#fff', borderRadius: '20px', border: '1px solid #E8E2D4' }}>
                                <div style={{ color: '#1a1a1a', fontWeight: '700', marginBottom: '10px' }}>{f.question || f.q}</div>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>{f.answer || f.a}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PAYMENT MODAL WITH AUTH GATE */}
            {(showConfirm || showPayment) && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        {!checkAuth() ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '25px' }}>🔐</div>
                                <h2 style={{ fontSize: '2.2rem', fontFamily: 'Playfair Display, serif', color: '#1a1a1a', marginBottom: '15px' }}>Authentication Required</h2>
                                <p style={{ color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>Please login or create an account to secure your tickets and complete the payment process.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <button
                                        onClick={() => {
                                            const saveState = { concert, counts };
                                            localStorage.setItem('pendingConcertReg', JSON.stringify(saveState));
                                            localStorage.setItem('pendingNavigation', JSON.stringify({ to: '/concerts' }));
                                            localStorage.setItem('pendingAutoAction', 'open_payment');
                                            navigate('/login');
                                        }}
                                        style={payButtonStyle}
                                    >
                                        Login to Continue
                                    </button>
                                    <button
                                        onClick={() => {
                                            const saveState = { concert, counts };
                                            localStorage.setItem('pendingConcertReg', JSON.stringify(saveState));
                                            localStorage.setItem('pendingNavigation', JSON.stringify({ to: '/concerts' }));
                                            navigate('/register');
                                        }}
                                        style={{ ...payButtonStyle, background: '#1a1a1a', color: '#fff' }}
                                    >
                                        Create New Account
                                    </button>
                                    <button
                                        onClick={() => { setShowPayment(false); setShowConfirm(false); }}
                                        style={{ marginTop: '20px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', color: '#C4A059', marginBottom: '10px' }}>Payment Gateway</h2>
                                <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px' }}>Secure UPI Checkout</div>

                                <div style={{ background: '#f9f9f9', border: '1px solid #f0f0f0', borderRadius: '24px', padding: '30px', textAlign: 'center', marginBottom: '30px' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 'bold', marginBottom: '15px' }}>SCAN QR TO PAY</div>
                                        <div style={{ background: '#fff', padding: '15px', display: 'inline-block', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=eventadmin@upi&pn=ImperialEvents&am=${bookingData?.price * bookingData?.quantity}&cu=INR`}
                                                alt="QR Code"
                                                style={{ width: '150px', height: '150px', filter: 'contrast(1.2)' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '20px 0' }}>
                                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                                        <span style={{ fontSize: '0.7rem', color: '#ccc', fontWeight: 'bold' }}>OR USE UPI ID</span>
                                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                                    </div>

                                    <div style={{ textAlign: 'left' }}>
                                        <label style={inputLabelStyle}>ENTER YOUR UPI ID</label>
                                        <input
                                            type="text"
                                            placeholder="username@bank"
                                            style={{ ...inputFieldStyle, textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', background: '#EEF2FF', border: 'none' }}
                                        />
                                    </div>
                                </div>

                                <button onClick={finalizePayment} style={payButtonStyle}>
                                    VERIFY & PAY ₹{(bookingData?.price * bookingData?.quantity || 0).toLocaleString()}
                                </button>

                                <button onClick={() => setShowPayment(false)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                                    Go Back
                                </button>
                            </>
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
        </div>
    );
};

// --- STYLES ---
const sectionTitleStyle = { fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', marginBottom: '40px', color: '#1a1a1a', borderLeft: '5px solid #C4A059', paddingLeft: '20px' };
const counterButtonStyle = { width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' };
const modalContentStyle = { background: '#fff', padding: '60px', borderRadius: '25px', width: '90%', maxWidth: '600px', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' };

// Payment Modal Specific Styles (Matching Image)
const inputLabelStyle = { display: 'block', fontSize: '10px', color: '#aaa', letterSpacing: '2px', marginBottom: '10px', fontWeight: 'bold' };
const inputFieldStyle = { width: '100%', padding: '18px', border: '1px solid #eee', borderRadius: '12px', boxSizing: 'border-box', outline: 'none' };
const inputFieldBlueStyle = { width: '100%', padding: '18px', border: 'none', borderRadius: '12px', background: '#EEF2FF', boxSizing: 'border-box', outline: 'none' };
const payButtonStyle = { width: '100%', padding: '22px', background: '#C4A059', color: '#000', border: 'none', borderRadius: '15px', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' };

export default ConcertsPage;
