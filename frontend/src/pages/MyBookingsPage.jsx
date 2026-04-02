import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

const MyBookingsPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'Weddings');
    const [bookings, setBookings] = useState([]);
    const [sportsBookings, setSportsBookings] = useState([]);
    const [allFixtures, setAllFixtures] = useState([]);
    const [allSportsRegs, setAllSportsRegs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInvoice, setShowInvoice] = useState(null); // stores the booking object for invoice
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '', mode: 'notice', onConfirm: null });

    const tabs = ['Weddings', 'Concerts', 'Festivals', 'Sports'];

    useEffect(() => {
        fetchAllBookings();
    }, []);

    const fetchAllBookings = async () => {
        setLoading(true);
        try {
            // Fetch all types of bookings in parallel for a realistic experience
            const [wRes, cRes, fRes, sRes, fiRes] = await Promise.all([
                api.get('/bookings/'),
                api.get('/concert-bookings/'),
                api.get('/festival-bookings/'),
                api.get('/sports-registrations/'),
                api.get('/fixtures/')
            ]);

            const weddings = wRes.data.map(b => ({ ...b, type: 'wedding' }));
            const concerts = cRes.data.map(b => ({ ...b, type: 'concert' }));
            const festivals = fRes.data.map(b => ({ ...b, type: 'festival' }));
            const fixtures = fiRes?.data || [];
            
            const combined = [...weddings, ...concerts, ...festivals]
                .sort((a, b) => new Date(b.created_at || b.booking_date) - new Date(a.created_at || a.booking_date));

            setBookings(combined);
            const sRegData = sRes.data || [];
            setAllSportsRegs(sRegData);
            setSportsBookings(sRegData.filter(s => s.email === localStorage.getItem('user_email')).map(s => ({ ...s, type: 'sports' })));
            setAllFixtures(fixtures);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelItem = async (type, id) => {
        setCustomAlert({
            show: true,
            title: 'CONFIRM',
            message: 'Are you sure you want to cancel? Refunds may take 5-7 days.',
            mode: 'confirm',
            onConfirm: async () => {
                setCustomAlert({ show: false });
                try {
                    let endpoint = '';
                    if (type === 'wedding') endpoint = `/bookings/${id}/`;
                    if (type === 'concert') endpoint = `/concert-bookings/${id}/`;
                    if (type === 'festival') endpoint = `/festival-bookings/${id}/`;

                    if (endpoint) {
                        await api.delete(endpoint);
                        setCustomAlert({
                            show: true,
                            title: 'SUCCESS',
                            message: 'Booking cancelled successfully.',
                            mode: 'notice'
                        });
                        fetchAllBookings();
                    }
                } catch (err) {
                    setCustomAlert({
                        show: true,
                        title: 'ERROR',
                        message: 'Failed to cancel.',
                        mode: 'notice'
                    });
                }
            }
        });
    };

    const cardStyle = {
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        borderLeft: '6px solid #1D3557',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const actionBtnStyle = {
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        background: '#EF4444',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        marginLeft: '10px'
    };

    const invoiceBtnStyle = {
        ...actionBtnStyle,
        background: '#1D3557',
    };

    // Filter displayed bookings based on activeTab
    const displayedBookings = bookings.filter(b => {
        if (activeTab === 'Weddings') return b.type === 'wedding';
        if (activeTab === 'Concerts') return b.type === 'concert';
        if (activeTab === 'Festivals') return b.type === 'festival';
        return false;
    });

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
            <Navbar />
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1D3557', marginBottom: '30px' }}>My Bookings</h1>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '50px',
                                border: 'none',
                                background: activeTab === tab ? '#1D3557' : 'transparent',
                                color: activeTab === tab ? '#fff' : '#64748b',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: '0.3s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>Loading your history...</div>
                ) : (
                    <div>
                        {activeTab !== 'Sports' && (
                            displayedBookings.length > 0 ? (
                                displayedBookings.map(b => (
                                    <div key={b.id} style={cardStyle}>
                                        <div>
                                            <h3 style={{ fontSize: '1.4rem', margin: '0 0 5px 0', color: '#1a1a1a' }}>
                                                {b.event_type || b.concert_name || b.festival_name || 'Event Booking'}
                                            </h3>
                                            <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                                                📅 {b.event_date ? new Date(b.event_date).toDateString() : 'Date TBD'}
                                            </p>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <span style={{ background: '#e2e8f0', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>
                                                    {b.status || 'Confirmed'}
                                                </span>
                                                <span style={{ background: '#fff7ed', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', color: '#c2410c' }}>
                                                    ₹{(b.total_cost || b.price || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <button onClick={() => setShowInvoice(b)} style={invoiceBtnStyle}>Invoice</button>
                                            {b.status === 'Confirmed' && <button onClick={() => handleCancelItem(b.type, b.id)} style={actionBtnStyle}>Cancel</button>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', color: '#888' }}>
                                    <h3>No {activeTab} bookings found.</h3>
                                </div>
                            )
                        )}

                        {activeTab === 'Sports' && (
                            sportsBookings.length > 0 ? (
                                sportsBookings.map(s => (
                                    <div key={s.id} style={{ ...cardStyle, display: 'block', borderLeft: s.status === 'Cancelled' ? '6px solid #EF4444' : (s.status === 'Eliminated' ? '6px solid #888' : '6px solid #1D3557') }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.3rem', margin: '0 0 5px 0', color: '#1a1a1a' }}>{s.tournament_name || s.tournamentName}</h3>
                                                {s.sport && <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>{s.sport}</div>}

                                                {/* Status Logic */}
                                                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    {(() => {
                                                        const tournamentPool = allSportsRegs.filter(r => r.tournament === s.tournament && r.status !== 'Cancelled');
                                                        const totalPool = tournamentPool.reduce((acc, r) => acc + parseFloat(r.price || 0), 0);
                                                        
                                                        if (s.status === 'Winner') {
                                                            const bonus = totalPool * 0.50; // 50% for winner
                                                            return (
                                                                <div style={{ marginTop: '10px', padding: '15px', background: '#DCFCE7', borderRadius: '12px', border: '1px solid #10B981' }}>
                                                                    <div style={{ color: '#047857', fontWeight: 'bold', fontSize: '1rem' }}>🏆 CHAMPION REWARD</div>
                                                                    <div style={{ fontSize: '1.4rem', color: '#064E3B', marginTop: '10px', fontWeight: '900' }}>
                                                                        ₹{(parseFloat(s.price || 0) + bonus).toLocaleString()}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.8rem', color: '#059669', borderTop: '1px solid rgba(16, 185, 129, 0.2)', marginTop: '10px', paddingTop: '10px' }}>
                                                                        <div>• Reg. Refund: ₹{parseFloat(s.price).toLocaleString()}</div>
                                                                        <div>• Winner Bonus (50% of ₹{totalPool.toLocaleString()}): ₹{bonus.toLocaleString()}</div>
                                                                    </div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '10px', opacity: 0.8 }}>
                                                                        Payment initiates in approx. 12 hours to your registered account.
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        if (s.status === 'Semi-Finalist') {
                                                            const bonus = totalPool * 0.20; // 20% for semifinalist
                                                            return (
                                                                <div style={{ marginTop: '10px', padding: '15px', background: '#FEF3C7', borderRadius: '12px', border: '1px solid #F59E0B' }}>
                                                                    <div style={{ color: '#B45309', fontWeight: 'bold', fontSize: '1rem' }}>🥉 SEMI-FINALIST REWARD</div>
                                                                    <div style={{ fontSize: '1.4rem', color: '#78350F', marginTop: '10px', fontWeight: '900' }}>
                                                                        ₹{(parseFloat(s.price || 0) + bonus).toLocaleString()}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.8rem', color: '#92400E', borderTop: '1px solid rgba(245, 158, 11, 0.2)', marginTop: '10px', paddingTop: '10px' }}>
                                                                        <div>• Reg. Refund: ₹{parseFloat(s.price).toLocaleString()}</div>
                                                                        <div>• SF Bonus (20% of ₹{totalPool.toLocaleString()}): ₹{bonus.toLocaleString()}</div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        if (s.status === 'Runner Up') {
                                                            return (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F1F5F9', padding: '10px 15px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                                                                    <div style={{ fontSize: '1.2rem' }}>🥈</div>
                                                                    <div>
                                                                        <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#475569', letterSpacing: '1px' }}>RUNNER UP</div>
                                                                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#1D3557' }}>{s.team_name || s.player_name || s.username}</div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        if (s.status === 'Eliminated') return <span style={{ color: '#6B7280' }}>ELIMINATED</span>;
                                                        if (s.status === 'Cancelled') return <span style={{ color: '#EF4444' }}>CANCELLED</span>;

                                                        return <span style={{ color: '#1D3557' }}>STATUS: {s.status.toUpperCase()}</span>;
                                                    })()}
                                                </div>

                                                {/* Details Section */}
                                                <div style={{ marginTop: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', fontSize: '0.9rem' }}>
                                                    {s.registration_type === 'Team' ? (
                                                        <>
                                                            <div style={{ marginBottom: '5px' }}><strong>Team Name:</strong> {s.team_name}</div>
                                                            <div style={{ marginBottom: '5px' }}><strong>Captain:</strong> {s.captain_name}</div>
                                                            <div style={{ color: '#555' }}>
                                                                <strong>Squad:</strong> {Array.isArray(s.players) ? s.players.join(', ') : s.players}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div><strong>Participant:</strong> {s.player_name || s.username}</div>
                                                    )}
                                                </div>

                                                {/* Fixtures Section */}
                                                {allFixtures.filter(f => 
                                                    f.tournament === s.tournament && 
                                                    (f.team1 === (s.team_name || s.player_name) || f.team2 === (s.team_name || s.player_name))
                                                ).length > 0 && (
                                                    <div style={{ marginTop: '15px' }}>
                                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#1D3557', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Upcoming Matches & Results</h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            {allFixtures.filter(f => 
                                                                f.tournament === s.tournament && 
                                                                (f.team1 === (s.team_name || s.player_name) || f.team2 === (s.team_name || s.player_name))
                                                            ).map(m => (
                                                                <div key={m.id} style={{ padding: '10px', background: '#fff', borderRadius: '6px', border: '1px solid #f0f0f0', fontSize: '0.85rem' }}>
                                                                    <div style={{ display: 'flex', justifySelf: 'space-between', fontWeight: 'bold' }}>
                                                                        <span>{m.team1} vs {m.team2}</span>
                                                                        <span style={{ marginLeft: 'auto', color: m.status === 'Finished' ? '#10B981' : '#3B82F6' }}>{m.status}</span>
                                                                    </div>
                                                                    <div style={{ color: '#666', marginTop: '4px' }}>
                                                                        📅 {m.match_date} at {m.match_time} ● {m.venue}
                                                                    </div>
                                                                    {m.status === 'Finished' && (
                                                                        <div style={{ marginTop: '5px', color: '#111', fontWeight: 'bold' }}>
                                                                            Result: {m.score1} - {m.score2} {m.winner && `(${m.winner} Won)`}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#444', marginBottom: '5px' }}>Registration Fee</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111' }}>₹{parseFloat(s.price).toLocaleString()}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '5px', marginBottom: '10px' }}>Successfully Paid</div>
                                                <button onClick={() => setShowInvoice({ ...s, type: 'sports' })} style={invoiceBtnStyle}>View Invoice</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', color: '#888' }}>
                                    <h3>No active sports registrations.</h3>
                                    <p>Join a tournament from the Sports page!</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* Invoice Modal Overlay */}
            {showInvoice && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '15px', position: 'relative', padding: '40px' }}>
                        <button onClick={() => setShowInvoice(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>

                        {/* Printable Content */}
                        <div id="printable-invoice">
                            <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
                                <h2 style={{ fontFamily: 'serif', fontSize: '2rem', letterSpacing: '2px', color: '#1D3557' }}>EVENTRA-TIMELESS MOMENTS</h2>
                                <p style={{ fontSize: '0.8rem', color: '#777', textTransform: 'uppercase' }}>Official Booking Invoice</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                        {showInvoice.type === 'wedding' ? 'Billed For (Couple):' : 'Billed To:'}
                                    </h4>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        {showInvoice.type === 'wedding' && showInvoice.wedding_details?.brideName
                                            ? `${showInvoice.wedding_details.brideName} & ${showInvoice.wedding_details.groomName}`
                                            : (showInvoice.username || showInvoice.full_name || 'Individual Client')}
                                    </p>
                                    <p style={{ margin: '5px 0 0 0', color: '#555', fontSize: '0.9rem' }}>{showInvoice.user_email || showInvoice.email || ''}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>Invoice Details:</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>ID:</strong> #BK-{showInvoice.id || 'N/A'}</p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}><strong>Status:</strong> <span style={{ color: showInvoice.status === 'Cancelled' ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>{showInvoice.status || 'Confirmed'}</span></p>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                        <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Description</th>
                                        <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {showInvoice.type === 'wedding' && (
                                        <>
                                            <tr>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <div style={{ fontWeight: 'bold' }}>Catering: {showInvoice.catering_package || 'Standard'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#777' }}>Comprehensive food & beverage services</div>
                                                </td>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>₹{parseFloat(showInvoice.catering_price || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <div style={{ fontWeight: 'bold' }}>Decoration: {showInvoice.decoration_name || 'Standard'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#777' }}>Thematic venue styling & flower arrangements</div>
                                                </td>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>₹{parseFloat(showInvoice.decoration_price || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <div style={{ fontWeight: 'bold' }}>Entertainment: {showInvoice.performer_name || 'Dj/Music'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#777' }}>Live music or performance sets</div>
                                                </td>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>₹{parseFloat(showInvoice.performer_price || 0).toLocaleString()}</td>
                                            </tr>
                                        </>
                                    )}

                                    {showInvoice.type !== 'wedding' && (
                                        <tr>
                                            <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                                    {showInvoice.type === 'sports' ? `Tournament Registration: ${showInvoice.tournament_name}` : (showInvoice.event_type || showInvoice.concert_title || showInvoice.festival_name)}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                                    Type: {showInvoice.ticket_type || showInvoice.pass_type || showInvoice.registration_type || 'Booking'}
                                                    {showInvoice.quantity && ` | Qty: ${showInvoice.quantity}`}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                    Date: {showInvoice.event_date ? new Date(showInvoice.event_date).toDateString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 'bold' }}>
                                                ₹{parseFloat(showInvoice.total_cost || showInvoice.total_price || showInvoice.price || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    )}

                                    {(showInvoice.cancellation_fee > 0) && (
                                        <tr>
                                            <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#EF4444' }}>Cancellation Fee (20% + Tax)</td>
                                            <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#EF4444' }}>+ ₹{parseFloat(showInvoice.cancellation_fee).toLocaleString()}</td>
                                        </tr>
                                    )}
                                    {(showInvoice.refund_amount > 0) && (
                                        <tr>
                                            <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#10B981' }}>Refund Issued</td>
                                            <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#10B981' }}>- ₹{parseFloat(showInvoice.refund_amount).toLocaleString()}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px' }}>
                                        <h5 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Event Highlights:</h5>
                                        {showInvoice.type === 'wedding' ? (
                                            <div style={{ fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <div><strong>Theme:</strong> {showInvoice.wedding_details?.weddingTheme || 'Classic'}</div>
                                                <div><strong>Guests:</strong> {showInvoice.guests || showInvoice.wedding_details?.guestCount}</div>
                                                <div><strong>Venue:</strong> {showInvoice.wedding_details?.venueName || 'Imperial'}</div>
                                                <div><strong>Destination:</strong> {showInvoice.wedding_details?.isDestinationWedding || 'No'}</div>
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <strong>Events:</strong> {Object.entries(showInvoice.wedding_details?.eventsRequired || {})
                                                        .filter(([_, v]) => v)
                                                        .map(([k]) => k).join(', ') || 'N/A'}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <div><strong>Artist/Festival:</strong> {showInvoice.artist_name || showInvoice.festival_name || showInvoice.tournament_name}</div>
                                                <div><strong>Category:</strong> {showInvoice.ticket_type || showInvoice.pass_type || showInvoice.sport}</div>
                                                {showInvoice.type === 'sports' && (
                                                    <div style={{ marginTop: '5px' }}>
                                                        <strong>Squad:</strong> {Array.isArray(showInvoice.players) ? showInvoice.players.join(', ') : (showInvoice.team_name || 'N/A')}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '20px', background: '#F8F4E1', borderRadius: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                                            <span>Subtotal</span>
                                            <span>₹{parseFloat(showInvoice.total_cost || showInvoice.total_price || showInvoice.price || 0).toLocaleString()}</span>
                                        </div>
                                        {showInvoice.type === 'sports' && showInvoice.status === 'Winner' && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#10B981', fontWeight: 'bold' }}>
                                                <span>🏆 Winning Prize</span>
                                                <span>+ ₹{parseFloat(showInvoice.winning_amount || 0).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {showInvoice.advance_amount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#047857' }}>
                                                <span>Advance Paid</span>
                                                <span>₹{parseFloat(showInvoice.advance_amount).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '10px', fontWeight: '900', fontSize: '1.2rem', color: '#1D3557' }}>
                                            <span>Total Net</span>
                                            <span>
                                                ₹{(
                                                    parseFloat(showInvoice.total_cost || showInvoice.total_price || showInvoice.advance_amount || showInvoice.price || 0) +
                                                    (showInvoice.status === 'Winner' ? parseFloat(showInvoice.winning_amount || 0) : 0)
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        {showInvoice.balance_amount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#c2410c', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                <span>Pending Balance</span>
                                                <span>₹{parseFloat(showInvoice.balance_amount).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b' }}>
                                            Payment Status: {showInvoice.payment_status || 'Paid'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '60px', color: '#aaa', fontSize: '0.75rem' }}>
                                <p>Thank you for choosing Eventra – Timeless Moments. This is a computer generated invoice.</p>
                                <p>Eventra – Timeless Moments | Surat, Gujarat | +91 84697 45000</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <button
                                onClick={() => {
                                    const content = document.getElementById('printable-invoice').innerHTML;
                                    const win = window.open('', '', 'height=700,width=900');
                                    win.document.write('<html><head><title>Invoice</title><style>body { font-family: sans-serif; }</style></head><body>');
                                    win.document.write(content);
                                    win.document.write('</body></html>');
                                    win.document.close();
                                    win.print();
                                }}
                                style={{ ...invoiceBtnStyle, padding: '12px 30px' }}
                            >
                                🖨️ Print Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CustomAlert
                show={customAlert.show}
                onClose={() => setCustomAlert({ ...customAlert, show: false })}
                onConfirm={customAlert.onConfirm}
                title={customAlert.title}
                message={customAlert.message}
                mode={customAlert.mode}
            />
        </div>
    );
};

export default MyBookingsPage;
