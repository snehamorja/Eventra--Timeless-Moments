import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

/* ─── helpers ──────────────────────────────────────────────── */
const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };

const isPastDate = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < today();
};

const TAB_ICONS = { Weddings: '💍', Concerts: '🎸', Festivals: '🎊', Sports: '🏆' };
const TAB_COLORS = { Weddings: '#C4A059', Concerts: '#6366F1', Festivals: '#EC4899', Sports: '#10B981' };

/* ─── small HistoryCard with expand ────────────────────────── */
const HistoryCard = ({ b, color, onInvoice }) => {
    const [open, setOpen] = useState(false);

    const title =
        b.event_type || b.concert_title || b.festival_name ||
        b.tournament_name || 'Booking';
    const sub =
        b.artist_name ? `Artist: ${b.artist_name}` :
        b.pass_type   ? `Pass: ${b.pass_type}` :
        b.sport       ? `Sport: ${b.sport}` :
        b.event_date  ? `Date: ${new Date(b.event_date).toDateString()}` : '';
    const amount = parseFloat(b.total_cost || b.total_price || b.price || 0);
    const status = b.status || 'Completed';

    const statusColor =
        status === 'Approved' || status === 'Confirmed' || status === 'Winner' ? '#10B981' :
        status === 'Rejected' || status === 'Cancelled' || status === 'Eliminated' ? '#EF4444' :
        status === 'Runner Up' ? '#6366F1' : '#94A3B8';

    return (
        <div style={{
            background: '#fff',
            borderRadius: '14px',
            marginBottom: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            border: `1px solid #f0f0f0`,
            borderLeft: `5px solid ${color}`,
            overflow: 'hidden',
            transition: 'box-shadow 0.2s'
        }}>
            {/* Header row – always visible */}
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 20px', cursor: 'pointer', userSelect: 'none'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: color + '15', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.2rem'
                    }}>
                        {b.type === 'wedding' ? '💍' : b.type === 'concert' ? '🎸' :
                         b.type === 'festival' ? '🎊' : '🏆'}
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', color: '#111', fontSize: '0.98rem' }}>{title}</div>
                        {sub && <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '2px' }}>{sub}</div>}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem',
                        fontWeight: '800', background: statusColor + '18', color: statusColor
                    }}>{status.toUpperCase()}</span>
                    <span style={{ fontWeight: '800', color: '#111', fontSize: '0.95rem' }}>
                        ₹{amount.toLocaleString()}
                    </span>
                    <span style={{ color: color, fontSize: '1rem', fontWeight: '700' }}>
                        {open ? '▲' : '▼'}
                    </span>
                </div>
            </div>

            {/* Expanded detail */}
            {open && (
                <div style={{
                    borderTop: '1px solid #f4f4f4', padding: '20px 24px',
                    background: '#FAFAFA', animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '14px', marginBottom: '16px'
                    }}>
                        {b.event_date && (
                            <Detail label="Event Date" value={new Date(b.event_date).toDateString()} />
                        )}
                        {b.booking_date && (
                            <Detail label="Booked On" value={new Date(b.booking_date).toLocaleDateString()} />
                        )}
                        {b.guests && <Detail label="Guests" value={b.guests} />}
                        {b.quantity && <Detail label="Tickets / Passes" value={b.quantity} />}
                        {b.ticket_type && <Detail label="Ticket Type" value={b.ticket_type} />}
                        {b.pass_type && <Detail label="Pass Type" value={b.pass_type} />}
                        {b.catering_package && <Detail label="Catering" value={b.catering_package} />}
                        {b.decoration_name && <Detail label="Decoration" value={b.decoration_name} />}
                        {b.performer_name && <Detail label="Performer" value={b.performer_name} />}
                        {b.registration_type && <Detail label="Reg. Type" value={b.registration_type} />}
                        {b.team_name && <Detail label="Team" value={b.team_name} />}
                        {b.player_name && <Detail label="Player" value={b.player_name} />}
                        {b.sport && <Detail label="Sport" value={b.sport} />}
                        {b.total_cost && <Detail label="Total Cost" value={`₹${parseFloat(b.total_cost).toLocaleString()}`} />}
                        {b.total_price && <Detail label="Total Paid" value={`₹${parseFloat(b.total_price).toLocaleString()}`} />}
                        {b.advance_amount > 0 && <Detail label="Advance Paid" value={`₹${parseFloat(b.advance_amount).toLocaleString()}`} />}
                        {b.balance_amount > 0 && <Detail label="Balance Due" value={`₹${parseFloat(b.balance_amount).toLocaleString()}`} />}
                        {b.payment_status && <Detail label="Payment" value={b.payment_status} />}
                    </div>

                    {/* Wedding specific */}
                    {b.type === 'wedding' && b.wedding_details && (
                        <div style={{
                            background: '#FFF9F0', border: '1px solid #F0E0C0',
                            borderRadius: '10px', padding: '14px 16px', marginBottom: '14px'
                        }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#C4A059', letterSpacing: '2px', marginBottom: '10px' }}>WEDDING DETAILS</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '0.85rem', color: '#555' }}>
                                {b.wedding_details.brideName && <div><strong>Bride:</strong> {b.wedding_details.brideName}</div>}
                                {b.wedding_details.groomName && <div><strong>Groom:</strong> {b.wedding_details.groomName}</div>}
                                {b.wedding_details.venueName && <div><strong>Venue:</strong> {b.wedding_details.venueName}</div>}
                                {b.wedding_details.weddingTheme && <div><strong>Theme:</strong> {b.wedding_details.weddingTheme}</div>}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => onInvoice(b)}
                        style={{
                            padding: '9px 22px', borderRadius: '8px', border: 'none',
                            background: color, color: '#fff', fontWeight: '800',
                            fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.5px'
                        }}>
                        🧾 View Invoice
                    </button>
                </div>
            )}
        </div>
    );
};

const Detail = ({ label, value }) => (
    <div>
        <div style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a1a', marginTop: '3px' }}>{value}</div>
    </div>
);

/* ─── MAIN COMPONENT ────────────────────────────────────────── */
const MyBookingsPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'Weddings');
    const [viewMode, setViewMode] = useState('upcoming');   // 'upcoming' | 'history'
    const [bookings, setBookings] = useState([]);
    const [sportsBookings, setSportsBookings] = useState([]);
    const [allFixtures, setAllFixtures] = useState([]);
    const [allSportsRegs, setAllSportsRegs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInvoice, setShowInvoice] = useState(null);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '', mode: 'notice', onConfirm: null });

    const tabs = ['Weddings', 'Concerts', 'Festivals', 'Sports'];

    useEffect(() => { fetchAllBookings(); }, []);

    // Reset to upcoming when tab changes
    useEffect(() => { setViewMode('upcoming'); }, [activeTab]);

    const fetchAllBookings = async () => {
        setLoading(true);
        try {
            const [wRes, cRes, fRes, sRes, fiRes] = await Promise.all([
                api.get('/bookings/'),
                api.get('/concert-bookings/list/'),
                api.get('/festival-bookings/list/'),
                api.get('/sports-registrations/'),
                api.get('/fixtures/')
            ]);
            const weddings  = wRes.data.map(b => ({ ...b, type: 'wedding' }));
            const concerts  = cRes.data.map(b => ({ ...b, type: 'concert' }));
            const festivals = fRes.data.map(b => ({ ...b, type: 'festival' }));
            const combined  = [...weddings, ...concerts, ...festivals]
                .sort((a, b) => new Date(b.created_at || b.booking_date) - new Date(a.created_at || a.booking_date));
            setBookings(combined);

            const sRegData = sRes.data || [];
            setAllSportsRegs(sRegData);
            setSportsBookings(sRegData.map(s => ({ ...s, type: 'sports' })));
            setAllFixtures(fiRes?.data || []);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelItem = async (type, id) => {
        setCustomAlert({
            show: true, title: 'CONFIRM',
            message: 'Are you sure you want to cancel? Refunds may take 5-7 days.',
            mode: 'confirm',
            onConfirm: async () => {
                setCustomAlert({ show: false });
                try {
                    const ep = type === 'wedding' ? `/bookings/${id}/` :
                               type === 'concert' ? `/concert-bookings/${id}/` :
                               type === 'festival' ? `/festival-bookings/${id}/` : '';
                    if (ep) {
                        await api.delete(ep);
                        fetchAllBookings();
                        setCustomAlert({ show: true, title: 'SUCCESS', message: 'Booking cancelled.', mode: 'notice' });
                    }
                } catch {
                    setCustomAlert({ show: true, title: 'ERROR', message: 'Failed to cancel.', mode: 'notice' });
                }
            }
        });
    };

    /* ─── filter helpers ──────────────────── */
    const isPast = (b) => {
        if (b.type === 'wedding')  return isPastDate(b.event_date) || ['Rejected','Cancelled','Approved'].includes(b.status);
        if (b.type === 'concert')  return isPastDate(b.event_date) || b.status === 'Cancelled';
        if (b.type === 'festival') return ['Cancelled'].includes(b.status);
        return false;
    };

    const isSportsPast = (s) =>
        ['Winner','Runner Up','Eliminated','Cancelled'].includes(s.status);

    // raw lists for current tab
    const tabBookings = bookings.filter(b =>
        activeTab === 'Weddings'  ? b.type === 'wedding'  :
        activeTab === 'Concerts'  ? b.type === 'concert'  :
        activeTab === 'Festivals' ? b.type === 'festival' : false
    );

    const upcomingList = activeTab === 'Sports'
        ? sportsBookings.filter(s => !isSportsPast(s))
        : tabBookings.filter(b => !isPast(b));

    const historyList = activeTab === 'Sports'
        ? sportsBookings.filter(isSportsPast)
        : tabBookings.filter(isPast);

    const displayList = viewMode === 'history' ? historyList : upcomingList;

    const color = TAB_COLORS[activeTab];
    const icon  = TAB_ICONS[activeTab];

    /* ─── styles ──────────────────────────── */
    const cardStyle = {
        background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: `5px solid ${color}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    };
    const btnBase = {
        padding: '8px 18px', borderRadius: '8px', border: 'none',
        fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s'
    };

    return (
        <div style={{ background: '#F9F4E8', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
            <Navbar />

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>

                {/* Page title */}
                <h1 style={{ fontSize: '2.8rem', fontWeight: '900', color: '#1a1a1a',
                    fontFamily: 'Playfair Display, serif', marginBottom: '8px' }}>
                    My Bookings
                </h1>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '36px' }}>
                    Track your upcoming events and browse your past booking history.
                </p>

                {/* ── Tab bar ────────────────────── */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px',
                    flexWrap: 'wrap', alignItems: 'center' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                ...btnBase,
                                padding: '10px 22px',
                                background: activeTab === tab ? TAB_COLORS[tab] : '#fff',
                                color: activeTab === tab ? '#fff' : '#555',
                                boxShadow: activeTab === tab ? `0 4px 14px ${TAB_COLORS[tab]}40` : '0 2px 8px rgba(0,0,0,0.06)',
                                border: activeTab === tab ? 'none' : '1px solid #e8e8e8',
                                fontSize: '0.95rem'
                            }}>
                            {TAB_ICONS[tab]} {tab}
                        </button>
                    ))}
                </div>

                {/* ── Upcoming / History toggle ─── */}
                <div style={{ display: 'flex', gap: '0', marginBottom: '28px',
                    border: `1px solid ${color}30`, borderRadius: '10px',
                    width: 'fit-content', overflow: 'hidden' }}>
                    {['upcoming', 'history'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            style={{
                                padding: '10px 28px', border: 'none', cursor: 'pointer',
                                fontWeight: '800', fontSize: '0.88rem', letterSpacing: '0.5px',
                                transition: '0.2s',
                                background: viewMode === mode ? color : '#fff',
                                color: viewMode === mode ? '#fff' : '#888',
                            }}>
                            {mode === 'upcoming' ? '📅 Upcoming' : '📋 History'}
                            {mode === 'history' && historyList.length > 0 && (
                                <span style={{
                                    marginLeft: '7px', background: viewMode === 'history' ? 'rgba(255,255,255,0.3)' : color,
                                    color: '#fff', borderRadius: '10px', padding: '1px 8px', fontSize: '0.75rem'
                                }}>{historyList.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Content ──────────────────────── */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
                        Loading your bookings...
                    </div>
                ) : (
                    <div>
                        {/* ── HISTORY VIEW ──────────────────── */}
                        {viewMode === 'history' && (
                            <>
                                {historyList.length === 0 ? (
                                    <EmptyState icon={icon} label="No past bookings yet."
                                        sub={`Your completed ${activeTab.toLowerCase()} will appear here.`} />
                                ) : (
                                    <>
                                        <div style={{ fontSize: '0.8rem', color: '#aaa',
                                            fontWeight: '700', letterSpacing: '2px',
                                            marginBottom: '16px', textTransform: 'uppercase' }}>
                                            {historyList.length} Past {activeTab === 'Sports' ? 'Registration' : 'Booking'}{historyList.length > 1 ? 's' : ''}
                                        </div>
                                        {historyList.map(b => (
                                            <HistoryCard
                                                key={b.id}
                                                b={b}
                                                color={color}
                                                onInvoice={setShowInvoice}
                                            />
                                        ))}
                                    </>
                                )}
                            </>
                        )}

                        {/* ── UPCOMING VIEW — Weddings / Concerts / Festivals ── */}
                        {viewMode === 'upcoming' && activeTab !== 'Sports' && (
                            upcomingList.length === 0 ? (
                                <EmptyState icon={icon}
                                    label={`No upcoming ${activeTab.toLowerCase()} bookings.`}
                                    sub={`Browse ${activeTab.toLowerCase()} and book your next experience!`} />
                            ) : (
                                upcomingList.map(b => {
                                    const title = b.event_type || b.concert_title || b.festival_name || 'Booking';
                                    const date  = b.event_date ? new Date(b.event_date).toDateString() : 'TBD';
                                    const amt   = parseFloat(b.total_cost || b.total_price || 0);
                                    const statusColor =
                                        b.status === 'Approved' || b.status === 'Confirmed' ? '#10B981' :
                                        b.status === 'Pending' ? '#F59E0B' : '#94A3B8';
                                    return (
                                        <div key={b.id} style={cardStyle}>
                                            <div>
                                                <h3 style={{ fontSize: '1.3rem', margin: '0 0 5px 0', color: '#1a1a1a' }}>
                                                    {icon} {title}
                                                </h3>
                                                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>
                                                    📅 {date}
                                                </p>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <span style={{ background: statusColor + '20', color: statusColor,
                                                        padding: '4px 10px', borderRadius: '6px',
                                                        fontSize: '0.8rem', fontWeight: '800' }}>
                                                        {b.status || 'Confirmed'}
                                                    </span>
                                                    <span style={{ background: '#FFF7ED', color: '#C4A059',
                                                        padding: '4px 10px', borderRadius: '6px',
                                                        fontSize: '0.8rem', fontWeight: '800' }}>
                                                        ₹{amt.toLocaleString()}
                                                    </span>
                                                    {b.type === 'concert' && b.ticket_type && (
                                                        <span style={{ background: '#EEF2FF', color: '#6366F1',
                                                            padding: '4px 10px', borderRadius: '6px',
                                                            fontSize: '0.8rem', fontWeight: '700' }}>
                                                            {b.ticket_type} × {b.quantity}
                                                        </span>
                                                    )}
                                                    {b.type === 'festival' && b.pass_type && (
                                                        <span style={{ background: '#FDF2F8', color: '#EC4899',
                                                            padding: '4px 10px', borderRadius: '6px',
                                                            fontSize: '0.8rem', fontWeight: '700' }}>
                                                            {b.pass_type} × {b.quantity}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <button onClick={() => setShowInvoice(b)}
                                                    style={{ ...btnBase, background: color, color: '#fff' }}>
                                                    🧾 Invoice
                                                </button>
                                                {b.status === 'Confirmed' && (
                                                    <button onClick={() => handleCancelItem(b.type, b.id)}
                                                        style={{ ...btnBase, background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5' }}>
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )
                        )}

                        {/* ── UPCOMING VIEW — Sports ──────────── */}
                        {viewMode === 'upcoming' && activeTab === 'Sports' && (
                            upcomingList.length === 0 ? (
                                <EmptyState icon="🏆" label="No active sports registrations."
                                    sub="Join a tournament from the Sports page!" />
                            ) : (
                                upcomingList.map(s => (
                                    <SportsCard key={s.id} s={s} allSportsRegs={allSportsRegs}
                                        allFixtures={allFixtures} onInvoice={setShowInvoice} />
                                ))
                            )
                        )}
                    </div>
                )}
            </div>

            {/* ── Invoice Modal ───────────────────────────── */}
            {showInvoice && (
                <InvoiceModal booking={showInvoice} onClose={() => setShowInvoice(null)} />
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

/* ─── Sports card ─────────────────────────────────────────── */
const SportsCard = ({ s, allSportsRegs, allFixtures, onInvoice }) => {
    const tournamentPool = allSportsRegs.filter(r => r.tournament === s.tournament && r.status !== 'Cancelled');
    const totalPool = tournamentPool.reduce((acc, r) => acc + parseFloat(r.price || 0), 0);

    const statusColor =
        s.status === 'Winner' ? '#10B981' :
        s.status === 'Runner Up' ? '#6366F1' :
        s.status === 'Eliminated' ? '#94A3B8' :
        s.status === 'Cancelled' ? '#EF4444' : '#10B981';

    return (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '22px',
            marginBottom: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            borderLeft: '5px solid #10B981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h3 style={{ fontSize: '1.3rem', margin: '0 0 4px 0', color: '#1a1a1a' }}>
                        🏆 {s.tournament_name}
                    </h3>
                    {s.sport && <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px' }}>{s.sport}</div>}
                    <span style={{ background: statusColor + '18', color: statusColor,
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>
                        {s.status.toUpperCase()}
                    </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '4px' }}>Registration Fee</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#111' }}>
                        ₹{parseFloat(s.price).toLocaleString()}
                    </div>
                    <button onClick={() => onInvoice({ ...s, type: 'sports' })}
                        style={{ marginTop: '8px', padding: '7px 16px', borderRadius: '7px',
                            border: 'none', background: '#10B981', color: '#fff',
                            fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                        🧾 Invoice
                    </button>
                </div>
            </div>

            {/* Team / Player info */}
            <div style={{ marginTop: '14px', padding: '14px', background: '#F9FAFB',
                borderRadius: '10px', fontSize: '0.88rem', color: '#444' }}>
                {s.registration_type === 'Team' ? (
                    <>
                        <div><strong>Team:</strong> {s.team_name}</div>
                        <div><strong>Captain:</strong> {s.captain_name}</div>
                        {Array.isArray(s.players) && s.players.length > 0 && (
                            <div><strong>Squad:</strong> {s.players.join(', ')}</div>
                        )}
                    </>
                ) : (
                    <div><strong>Participant:</strong> {s.player_name || s.username}</div>
                )}
            </div>

            {/* Winner reward */}
            {s.status === 'Winner' && (
                <div style={{ marginTop: '14px', padding: '14px', background: '#DCFCE7',
                    borderRadius: '10px', border: '1px solid #10B981' }}>
                    <div style={{ color: '#047857', fontWeight: '900' }}>🏆 Champion Reward</div>
                    <div style={{ fontSize: '1.3rem', color: '#064E3B', fontWeight: '900', marginTop: '6px' }}>
                        ₹{(parseFloat(s.price) + totalPool * 0.5).toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─── Empty state ─────────────────────────────────────────── */
const EmptyState = ({ icon, label, sub }) => (
    <div style={{ textAlign: 'center', padding: '70px 20px', background: '#fff',
        borderRadius: '16px', color: '#888', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '14px' }}>{icon}</div>
        <h3 style={{ fontSize: '1.2rem', color: '#444', marginBottom: '8px' }}>{label}</h3>
        <p style={{ fontSize: '0.9rem' }}>{sub}</p>
    </div>
);

/* ─── Invoice Modal ───────────────────────────────────────── */
const InvoiceModal = ({ booking: b, onClose }) => {
    const color = TAB_COLORS[
        b.type === 'wedding' ? 'Weddings' :
        b.type === 'concert' ? 'Concerts' :
        b.type === 'festival' ? 'Festivals' : 'Sports'
    ];
    const title =
        b.event_type || b.concert_title || b.festival_name ||
        (b.tournament_name ? `${b.tournament_name} Registration` : 'Booking');
    const amt = parseFloat(b.total_cost || b.total_price || b.price || 0);

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '20px', backdropFilter: 'blur(6px)' }}>
            <div style={{ background: '#fff', width: '100%', maxWidth: '700px',
                maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px',
                position: 'relative', padding: '40px', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
                <button onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '20px',
                        background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>
                    ✕
                </button>

                <div id="printable-invoice">
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '30px',
                        borderBottom: `3px solid ${color}`, paddingBottom: '20px' }}>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem',
                            color: color, margin: '0 0 4px 0' }}>EVENTRA</h2>
                        <div style={{ fontSize: '0.7rem', color: '#aaa', letterSpacing: '3px',
                            textTransform: 'uppercase' }}>Official Booking Invoice</div>
                    </div>

                    {/* Meta grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase',
                                letterSpacing: '1px', marginBottom: '6px' }}>Booking Reference</div>
                            <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#111' }}>
                                #BK-{b.id}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase',
                                letterSpacing: '1px', marginBottom: '6px' }}>Date Issued</div>
                            <div style={{ fontWeight: '700', color: '#111' }}>{new Date().toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Line items */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                        <thead>
                            <tr style={{ background: color + '12' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem',
                                    color: color, fontWeight: '900', letterSpacing: '1px',
                                    textTransform: 'uppercase', borderBottom: `2px solid ${color}30` }}>
                                    Description
                                </th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.8rem',
                                    color: color, fontWeight: '900', letterSpacing: '1px',
                                    textTransform: 'uppercase', borderBottom: `2px solid ${color}30` }}>
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ fontWeight: '800', color: '#111' }}>{title}</div>
                                    {b.event_date && (
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                                            📅 {new Date(b.event_date).toDateString()}
                                        </div>
                                    )}
                                    {(b.ticket_type || b.pass_type) && (
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                            Type: {b.ticket_type || b.pass_type}
                                            {b.quantity && ` × ${b.quantity}`}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'right',
                                    fontWeight: '800', color: '#111', borderBottom: '1px solid #f1f5f9' }}>
                                    ₹{amt.toLocaleString()}
                                </td>
                            </tr>
                            {b.catering_package && (
                                <tr>
                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#555', fontSize: '0.9rem' }}>
                                        Catering: {b.catering_package}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #f1f5f9', fontWeight: '700' }}>
                                        ₹{parseFloat(b.catering_price || 0).toLocaleString()}
                                    </td>
                                </tr>
                            )}
                            {b.decoration_name && (
                                <tr>
                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#555', fontSize: '0.9rem' }}>
                                        Decoration: {b.decoration_name}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #f1f5f9', fontWeight: '700' }}>
                                        ₹{parseFloat(b.decoration_price || 0).toLocaleString()}
                                    </td>
                                </tr>
                            )}
                            {b.performer_name && (
                                <tr>
                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#555', fontSize: '0.9rem' }}>
                                        Performer: {b.performer_name}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #f1f5f9', fontWeight: '700' }}>
                                        ₹{parseFloat(b.performer_price || 0).toLocaleString()}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Total */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ minWidth: '260px' }}>
                            {b.advance_amount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between',
                                    marginBottom: '8px', fontSize: '0.9rem', color: '#10B981' }}>
                                    <span>Advance Paid</span>
                                    <span>₹{parseFloat(b.advance_amount).toLocaleString()}</span>
                                </div>
                            )}
                            {b.balance_amount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between',
                                    marginBottom: '8px', fontSize: '0.9rem', color: '#EF4444' }}>
                                    <span>Balance Due</span>
                                    <span>₹{parseFloat(b.balance_amount).toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between',
                                borderTop: `2px solid ${color}`, paddingTop: '12px',
                                fontWeight: '900', fontSize: '1.2rem', color: '#111' }}>
                                <span>Grand Total</span>
                                <span style={{ color }}>₹{amt.toLocaleString()}</span>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '6px',
                                fontSize: '0.75rem', color: '#aaa', fontWeight: '700' }}>
                                Payment: {b.payment_status || 'Paid'}
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '40px', color: '#ccc', fontSize: '0.72rem' }}>
                        <div>Thank you for choosing Eventra – Timeless Moments</div>
                        <div>Surat, Gujarat | +91 84697 45000 | eventra@gmail.com</div>
                    </div>
                </div>

                {/* Print button */}
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button
                        onClick={() => {
                            const content = document.getElementById('printable-invoice').innerHTML;
                            const win = window.open('', '', 'height=700,width=900');
                            win.document.write('<html><head><title>Invoice</title><style>body{font-family:sans-serif;padding:30px}</style></head><body>');
                            win.document.write(content);
                            win.document.write('</body></html>');
                            win.document.close();
                            win.print();
                        }}
                        style={{ padding: '12px 30px', borderRadius: '10px', border: 'none',
                            background: color, color: '#fff', fontWeight: '900',
                            fontSize: '0.95rem', cursor: 'pointer', boxShadow: `0 4px 14px ${color}40` }}>
                        🖨️ Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyBookingsPage;
