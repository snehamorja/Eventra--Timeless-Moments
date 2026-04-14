import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';



const BillRow = ({ label, value, sub, bold, big, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
        <div>
            <div style={{ fontSize: '0.9rem', fontWeight: bold ? '800' : '500', color: color || '#555' }}>{label}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: '#999' }}>{sub}</div>}
        </div>
        <div style={{ fontSize: big ? '1.1rem' : '0.9rem', fontWeight: bold ? '900' : '600', color: color || '#1a1a1a' }}>
            {value === '-' ? '-' : `₹${(parseFloat(value) || 0).toLocaleString()}`}
        </div>
    </div>
);

const SimpleAdminDashboard = () => {
    const [bookings, setBookings] = useState([]);

    const [jobApplications, setJobApplications] = useState([]);
    const [eventInquiries, setEventInquiries] = useState([]);
    const [users, setUsers] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [decorations, setDecorations] = useState([]);
    const [catering, setCatering] = useState([]);
    const [performers, setPerformers] = useState([]);
    const [deletedItems, setDeletedItems] = useState([]);
    const [concertBookings, setConcertBookings] = useState([]);
    const [festivalBookings, setFestivalBookings] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [concerts, setConcerts] = useState([]);
    const [festivals, setFestivals] = useState([]);
    const [weddingEvents, setWeddingEvents] = useState([]);
    const [viewMaster, setViewMaster] = useState(false);
    const [sportsSubTab, setSportsSubTab] = useState('Registrations'); // Registrations, Tournaments, Fixtures
    const [showCreateFixture, setShowCreateFixture] = useState(false);
    const [fixtureForm, setFixtureForm] = useState({ tournament: '', player1: '', player2: '', player1_tbd_label: '', player2_tbd_label: '', match_date: '', round_number: '1', status: 'Scheduled', winner: '', is_final: false });
    const [editingFixture, setEditingFixture] = useState(null);
    const getTenDaysAgo = () => {
        const d = new Date();
        d.setDate(d.getDate() - 10);
        return d.toISOString().split('T')[0];
    };
    const defaultPastDate = getTenDaysAgo();

    const [showCreateConcert, setShowCreateConcert] = useState(false);
    const [concertForm, setConcertForm] = useState({
        title: '', artist: '', artistBio: '', date: defaultPastDate, time: '18:00', venue: '', city: '', genre: '',
        bannerImage: '', thumbnail: '', description: '', booking_deadline: defaultPastDate,
        popularTracks: '', highlights: '', tickets: '', schedule: '', rules: '', faqs: '', sponsors: ''
    });
    const [editingConcert, setEditingConcert] = useState(null);
    const [showCreateFestival, setShowCreateFestival] = useState(false);
    const [festivalForm, setFestivalForm] = useState({
        name: '', city: '', venue: '', startDate: defaultPastDate, endDate: defaultPastDate, time: '10:00', theme: '', image: '', about: '',
        booking_deadline: defaultPastDate, highlights: '', attractions: '', passes: '', schedule: '', rules: '', faqs: ''
    });
    const [editingFestival, setEditingFestival] = useState(null);
    const [showCreateTournament, setShowCreateTournament] = useState(false);
    const [tournamentForm, setTournamentForm] = useState({ name: '', sport: '', category: 'Team', start_date: '', end_date: '', registration_deadline: '', max_teams: 10, status: 'Registration Open', image: '' });
    const [editingTournament, setEditingTournament] = useState(null);
    const scrollAreaRef = useRef(null);

    const [editingConcertBooking, setEditingConcertBooking] = useState(null);
    const [concertBookingForm, setConcertBookingForm] = useState({ status: 'Confirmed', ticket_type: '', quantity: 1 });
    const [editingFestivalBooking, setEditingFestivalBooking] = useState(null);
    const [festivalBookingForm, setFestivalBookingForm] = useState({ status: 'Confirmed', pass_type: '', quantity: 1 });
    const [editingSportsReg, setEditingSportsReg] = useState(null);
    const [sportsRegForm, setSportsRegForm] = useState({ status: 'Confirmed', team_name: '', player_name: '', registration_type: 'Individual' });

    const [activeTab, setActiveTab] = useState('Overview'); // Changed from Inquiries
    const [globalStats, setGlobalStats] = useState({ 
        pendingEvents: 0, 
        finishedEvents: 0, 
        completedEvents: 0, 
        totalRevenue: 0 
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [weddingSubTab, setWeddingSubTab] = useState('Bookings'); // Bookings, Decor, Catering, Performer
    const [showCreateBlog, setShowCreateBlog] = useState(false);
    const [blogForm, setBlogForm] = useState({ title: '', content: '', image: '', author: 'Admin' });
    const [editingBlog, setEditingBlog] = useState(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const [showCreateGallery, setShowCreateGallery] = useState(false);
    const [galleryForm, setGalleryForm] = useState({ title: '', description: '', image_url: '', category: 'Wedding', is_published: true });
    const [showCreateDecor, setShowCreateDecor] = useState(false);
    const [decorForm, setDecorForm] = useState({ name: '', category: 'Wedding', price: 0, image: '', description: '' });
    const [showCreateCatering, setShowCreateCatering] = useState(false);
    const [cateringForm, setCateringForm] = useState({ name: '', description: '', price_per_plate: 0, image: '' });
    const [editingCatering, setEditingCatering] = useState(null);
    const [showCreatePerformer, setShowCreatePerformer] = useState(false);
    const [performerForm, setPerformerForm] = useState({ name: '', category: 'Singer', price: 0, image: '', description: '' });
    const [editingPerformer, setEditingPerformer] = useState(null);
    const [showCreateWeddingEvent, setShowCreateWeddingEvent] = useState(false);
    const [weddingEventForm, setWeddingEventForm] = useState({ name: '', description: '', image: '', is_visible: true });
    const [editingWeddingEvent, setEditingWeddingEvent] = useState(null);
    const [inspectingBooking, setInspectingBooking] = useState(null);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '', subMessage: '', mode: 'notice', onConfirm: null });
    const [trashFilter, setTrashFilter] = useState('All');
    const [blogFilter, setBlogFilter] = useState('All'); // All, Live, Draft
    const [galleryFilter, setGalleryFilter] = useState('All'); // All, Live, Draft

    const [decorFilter, setDecorFilter] = useState('All');
    const [editingDecor, setEditingDecor] = useState(null);

    // Profile & Settings
    const [profileForm, setProfileForm] = useState({ username: '', email: '', phone: '', profile_photo: '' });
    const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [adminUser, setAdminUser] = useState(null);
    const [showPendingOnly, setShowPendingOnly] = useState(false);



    const navigate = useNavigate();

    const sanitizeError = (err) => {
        let msg = "An unexpected error occurred.";
        if (err.response?.data) {
            if (typeof err.response.data === 'string') {
                msg = err.response.data;
            } else if (err.response.data.detail) {
                msg = err.response.data.detail;
            } else if (err.response.data.message) {
                msg = err.response.data.message;
            } else {
                msg = JSON.stringify(err.response.data);
            }
        } else if (err.message) {
            msg = err.message;
        }

        if (msg.includes('<!DOCTYPE') || msg.includes('<html')) {
            msg = "Server Error (404/500). The requested endpoint was not found or failed.";
        }
        return msg.substring(0, 150);
    };

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(() => fetchAllData(true), 15000);

        // Apply theme on load
        const storedTheme = localStorage.getItem('theme') || 'light';
        if (storedTheme === 'dark') document.body.classList.add('dark-theme');
        else document.body.classList.remove('dark-theme');
        setTheme(storedTheme);

        // Fetch initial profile
        api.get('/profile/').then(res => {
            setAdminUser(res.data);
            setProfileForm({
                username: res.data.username,
                email: res.data.email,
                phone: res.data.phone || '',
                profile_photo: res.data.profile_photo || ''
            });
            if (res.data.theme) {
                setTheme(res.data.theme);
                if (res.data.theme === 'dark') document.body.classList.add('dark-theme');
                else document.body.classList.remove('dark-theme');
            }
        }).catch(err => { console.error("Profile sync error", err); });

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeTab === 'Weddings') {
            const currentData = weddingSubTab === 'Bookings' ? bookings :
                                weddingSubTab === 'Ceremonies' ? weddingEvents : 
                                weddingSubTab === 'Decor' ? decorations :
                                weddingSubTab === 'Catering' ? catering : performers;
            setStats({
                total: currentData.length,
                pending: weddingSubTab === 'Bookings' ? currentData.filter(b => b.status === 'Pending').length : 
                         weddingSubTab === 'Ceremonies' ? currentData.filter(e => !e.is_visible).length : 0,
                approved: weddingSubTab === 'Bookings' ? currentData.filter(b => b.status === 'Approved').length : 
                          weddingSubTab === 'Ceremonies' ? currentData.filter(e => e.is_visible).length : currentData.length,
                revenue: weddingSubTab === 'Bookings' ? currentData.reduce((acc, b) => acc + (parseFloat(b.total_cost) || 0), 0) : 0
            });
        }
        else if (activeTab === 'Employment') {
            setStats({
                total: jobApplications.length,
                pending: jobApplications.filter(j => j.status === 'Applied').length,
                approved: jobApplications.filter(j => j.status === 'Hired').length,
                revenue: 0
            });
        } else if (activeTab === 'Blogs') {
            setStats({
                total: blogs.length,
                pending: blogs.filter(b => !b.is_published).length,
                approved: blogs.filter(b => b.is_published).length,
                revenue: 0
            });
        } else if (activeTab === 'Inquiries') {
            setStats({
                total: eventInquiries.length,
                pending: eventInquiries.filter(i => i.status === 'Pending').length,
                approved: eventInquiries.filter(i => i.status === 'Reviewed').length,
                revenue: 0
            });
        } else if (activeTab === 'Users') {
            setStats({
                total: users.length,
                pending: users.filter(u => u.role === 'ADMIN' || u.is_superuser).length,
                approved: users.filter(u => u.role === 'USER' && !u.is_superuser).length,
                revenue: 0
            });
        } else if (activeTab === 'Gallery') {
            setStats({
                total: gallery.length,
                pending: gallery.filter(g => !g.is_published).length,
                approved: gallery.filter(g => g.is_published).length,
                revenue: 0
            });
        } else if (activeTab === 'Concerts') {
            setStats({
                total: viewMaster ? concerts.length : concertBookings.length,
                pending: viewMaster ? concerts.filter(c => new Date(c.date) > new Date()).length : concertBookings.filter(c => c.status === 'Pending').length,
                approved: viewMaster ? concerts.filter(c => new Date(c.date) <= new Date()).length : concertBookings.filter(c => c.status === 'Confirmed').length,
                revenue: viewMaster ? 0 : concertBookings.reduce((acc, c) => acc + (parseFloat(c.total_price) || 0), 0)
            });
        } else if (activeTab === 'Festivals') {
            setStats({
                total: viewMaster ? festivals.length : festivalBookings.length,
                pending: viewMaster ? festivals.filter(f => new Date(f.startDate) > new Date()).length : festivalBookings.filter(f => f.status === 'Confirmed').length,
                approved: viewMaster ? festivals.filter(f => new Date(f.startDate) <= new Date()).length : festivalBookings.filter(f => f.status === 'Cancelled').length,
                revenue: viewMaster ? 0 : festivalBookings.reduce((acc, f) => acc + (parseFloat(f.total_price) || 0), 0)
            });
        } else if (activeTab === 'Sports') {
            setStats({
                total: sportsSubTab === 'Registrations' ? registrations.length : sportsSubTab === 'Tournaments' ? tournaments.length : fixtures.length,
                pending: sportsSubTab === 'Registrations' ? registrations.filter(r => r.status === 'Confirmed').length : 0,
                approved: sportsSubTab === 'Registrations' ? registrations.filter(r => r.status === 'Winner').length : 0,
                revenue: sportsSubTab === 'Registrations' ? registrations.reduce((acc, r) => acc + (parseFloat(r.price) || 0), 0) : 0
            });
        }
    }, [activeTab, weddingSubTab, bookings, jobApplications, blogs, eventInquiries, users, gallery, decorations, catering, performers]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo(0, 0);
        }
    }, [activeTab, weddingSubTab, sportsSubTab, viewMaster]);

    const fetchAllData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            // Use allSettled so one failing endpoint doesn't block others
            const [res1, res2, res3, res4, res5, res6, res7, res8, res9, res10, res11, res12, res13, res14, res15, res16, res17] = await Promise.allSettled([
                api.get('/bookings/'),
                api.get('/careers/applications/'),
                api.get('/blogs/'),
                api.get('/event-inquiries/list/'),
                api.get('/users/'),
                api.get('/gallery/'),
                api.get('/decorations/'),
                api.get('/catering/'),
                api.get('/performers/'),
                api.get('/concert-bookings/list/'),
                api.get('/festival-bookings/list/'),
                api.get('/tournaments/'),
                api.get('/sports-registrations/'),
                api.get('/fixtures/'),
                api.get('/concerts/?all=true'),
                api.get('/festivals/?all=true'),
                api.get('/wedding-events/?all=true')
            ]);
            if (res1.status === 'fulfilled') setBookings(res1.value.data || []);
            if (res2.status === 'fulfilled') setJobApplications(res2.value.data || []);
            if (res3.status === 'fulfilled') setBlogs(res3.value.data || []);
            if (res4.status === 'fulfilled') setEventInquiries(res4.value.data || []);
            if (res5.status === 'fulfilled') setUsers(res5.value.data || []);
            if (res6.status === 'fulfilled') setGallery(res6.value.data || []);
            if (res7.status === 'fulfilled') setDecorations(res7.value.data || []);
            if (res8.status === 'fulfilled') setCatering(res8.value.data || []);
            if (res9.status === 'fulfilled') setPerformers(res9.value.data || []);
            if (res10.status === 'fulfilled') setConcertBookings(res10.value.data || []);
            if (res11.status === 'fulfilled') setFestivalBookings(res11.value.data || []);
            if (res12.status === 'fulfilled') setTournaments(res12.value.data || []);
            if (res13.status === 'fulfilled') setRegistrations(res13.value.data || []);
            if (res14.status === 'fulfilled') setFixtures(res14.value.data || []);
            if (res15.status === 'fulfilled') setConcerts(res15.value.data || []);
            if (res16.status === 'fulfilled') setFestivals(res16.value.data || []);
            if (res17 && res17.status === 'fulfilled') setWeddingEvents(res17.value.data || []);


            // Fetch Deleted Items for Recycle Bin
            const [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14] = await Promise.allSettled([
                api.get('/bookings/?deleted=true'), api.get('/careers/applications/?deleted=true'),
                api.get('/blogs/?deleted=true'), api.get('/event-inquiries/list/?deleted=true'),
                api.get('/gallery/?deleted=true'), api.get('/decorations/?deleted=true'),
                api.get('/catering/?deleted=true'), api.get('/performers/?deleted=true'),
                api.get('/concert-bookings/list/?deleted=true'), api.get('/festival-bookings/list/?deleted=true'),
                api.get('/tournaments/?deleted=true'), api.get('/concerts/?deleted=true'),
                api.get('/festivals/?deleted=true'), api.get('/sports-registrations/?deleted=true'),
            ]);

            // --- GLOBAL ANALYTICS LOGIC ---
            const allWeddings = res1.status === 'fulfilled' ? res1.value.data || [] : [];
            const allConcerts = res10.status === 'fulfilled' ? res10.value.data || [] : [];
            const allFestivals = res11.status === 'fulfilled' ? res11.value.data || [] : [];
            const allSports = res13.status === 'fulfilled' ? res13.value.data || [] : [];
            const allInquiries = res4.status === 'fulfilled' ? res4.value.data || [] : [];
            const allApps = res2.status === 'fulfilled' ? res2.value.data || [] : [];

            const allEventData = [...allWeddings, ...allConcerts, ...allFestivals, ...allSports];

            const totalRevenue = 
                allWeddings.filter(b => ['approved', 'confirmed'].includes((b.status || '').toLowerCase())).reduce((acc, b) => acc + (parseFloat(b.total_cost) || 0), 0) +
                allConcerts.filter(c => ['confirmed', 'paid'].includes((c.status || '').toLowerCase())).reduce((acc, c) => acc + (parseFloat(c.total_price) || 0), 0) +
                allFestivals.filter(f => ['confirmed', 'paid'].includes((f.status || '').toLowerCase())).reduce((acc, f) => acc + (parseFloat(f.total_price) || 0), 0) +
                allSports.filter(s => ['confirmed', 'paid'].includes((s.status || '').toLowerCase())).reduce((acc, s) => acc + 1000, 0);

            const pendingEvents = allEventData.filter(e => (e.status || '').toLowerCase() === 'pending').length;
            const finishedEvents = allEventData.filter(e => ['approved', 'confirmed', 'paid'].includes((e.status || '').toLowerCase())).length;
            const completedEvents = allEventData.filter(e => (e.status || '').toLowerCase() === 'completed').length;

            setGlobalStats({
                pendingEvents,
                finishedEvents,
                completedEvents,
                totalRevenue: totalRevenue,
                totalUsers: (res5.status === 'fulfilled' ? res5.value.data || [] : []).length,
                activeBlogs: (res3.status === 'fulfilled' ? res3.value.data || [] : []).filter(b => b.is_published).length,
                totalJobs: (res2.status === 'fulfilled' ? res2.value.data || [] : []).length,
                unreviewedInquiries: (res4.status === 'fulfilled' ? res4.value.data || [] : []).filter(i => i.status === 'Pending').length
            });

            const combinedActions = [
                ...allWeddings.map(a => ({ ...a, _label: 'Wedding Booked', _time: a.created_at || a.booking_date, _icon: '💍' })),
                ...allConcerts.map(a => ({ ...a, _label: 'Concert Entry', _time: a.created_at || a.booking_date, _icon: '🎸' })),
                ...allFestivals.map(a => ({ ...a, _label: 'Festival Pass', _time: a.created_at || a.booking_date, _icon: '🎭' })),
                ...allSports.map(a => ({ ...a, _label: 'Sports Entry', _time: a.registered_at || a.date, _icon: '🏆' })),
                ...allInquiries.map(a => ({ ...a, _label: 'New Inquiry', _time: a.created_at, _icon: '📬' })),
                ...(res3.status === 'fulfilled' ? res3.value.data || [] : []).map(a => ({ ...a, _label: 'Blog Post', _time: a.created_at || a.published_at, _icon: '✍️' })),
                ...(res2.status === 'fulfilled' ? res2.value.data || [] : []).map(a => ({ ...a, _label: 'Job Applied', _time: a.applied_at || a.created_at, _icon: '👤' })),
                ...(res6.status === 'fulfilled' ? res6.value.data || [] : []).map(a => ({ ...a, _label: 'Gallery Photo', _time: a.created_at, _icon: '🖼️' }))
            ].sort((a, b) => new Date(b._time) - new Date(a._time)).slice(0, 15);
            setRecentActivity(combinedActions);

            const allDeletedData = [
                ...(d1.status === 'fulfilled' ? d1.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Wedding' })),
                ...(d2.status === 'fulfilled' ? d2.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Job Application' })),
                ...(d3.status === 'fulfilled' ? d3.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Blog' })),
                ...(d4.status === 'fulfilled' ? d4.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Inquiry' })),
                ...(d5.status === 'fulfilled' ? d5.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Gallery' })),
                ...(d6.status === 'fulfilled' ? d6.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Decor' })),
                ...(d7.status === 'fulfilled' ? d7.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Catering' })),
                ...(d8.status === 'fulfilled' ? d8.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Entertainment' })),
                ...(d9.status === 'fulfilled' ? d9.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Concert' })),
                ...(d10.status === 'fulfilled' ? d10.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Festival' })),
                ...(d11.status === 'fulfilled' ? d11.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Tournament' })),
                ...(d12.status === 'fulfilled' ? d12.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Concert Master' })),
                ...(d13.status === 'fulfilled' ? d13.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Festival Master' })),
                ...(d14.status === 'fulfilled' ? d14.value.data || [] : []).map(i => ({ ...i, _deletedType: 'Sports Registration' })),
            ];
            setDeletedItems(allDeletedData);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // --- AUTO-SAVE LOGIC ---




    const calculateWeddingStats = (weddings) => {
        setStats({
            total: weddings.length,
            pending: weddings.filter(b => b.status === 'Pending').length,
            approved: weddings.filter(b => b.status === 'Approved').length,
            revenue: weddings.reduce((acc, curr) => acc + (parseFloat(curr.total_cost) || 0), 0)
        });
    };



    const handleStatusUpdate = async (id, newStatus) => {
        setCustomAlert({
            show: true,
            title: 'VERIFY',
            message: `Update this booking to ${newStatus}?`,
            mode: 'confirm',
            onConfirm: async () => {
                setCustomAlert({ show: false });
                try {
                    await api.patch(`/admin/bookings/${id}/status/`, { status: newStatus });
                    fetchAllData();
                } catch (error) {
                    setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(error) });
                }
            }
        });
    };

    const handleJobStatus = async (id, newStatus) => {
        try {
            await api.patch(`/careers/applications/${id}/`, { status: newStatus });
            fetchAllData();
        } catch (error) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(error) });
        }
    };

    const handleDeleteItem = async (type, id) => {
        setCustomAlert({
            show: true,
            title: 'RECYCLE BIN',
            message: 'Move this record to Recycle Bin?',
            mode: 'confirm',
            onConfirm: async () => {
                setCustomAlert({ show: false });
                try {
                    let path = "";
                    if (type === 'wedding') path = `bookings/${id}/`;
                    else if (type === 'job') path = `careers/applications/${id}/`;
                    else if (type === 'blog') path = `blogs/${id}/`;
                    else if (type === 'gallery') path = `gallery/${id}/`;
                    else if (type === 'inquiry') path = `event-inquiries/${id}/`;
                    else if (type === 'decoration') path = `decorations/${id}/`;
                    else if (type === 'concert') path = `concert-bookings/${id}/`;
                    else if (type === 'festival') path = `festival-bookings/${id}/`;
                    else if (type === 'sports') path = `sports-registrations/${id}/`;
                    else if (type === 'concert_master') path = `concerts/${id}/`;
                    else if (type === 'festival_master') path = `festivals/${id}/`;
                    else if (type === 'wedding-event') path = `wedding-events/${id}/`;
                    else if (type === 'tournament') path = `tournaments/${id}/`;

                    await api.delete(path);
                    fetchAllData();
                    setCustomAlert({ show: true, title: 'DELETED', message: 'Record removed successfully.' });
                } catch (err) {
                    setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
                }
            }
        });
    };

    const handleToggleVisibility = async (type, item) => {
        try {
            let path = "";
            if (type === 'concert') path = `concerts/${item.id}/`;
            else if (type === 'festival') path = `festivals/${item.id}/`;
            else if (type === 'wedding-event') path = `wedding-events/${item.id}/`;
            
            await api.patch(path, { is_visible: !item.is_visible });
            fetchAllData();
            setCustomAlert({ 
                show: true, 
                title: 'UPDATED', 
                message: `Event is now ${!item.is_visible ? 'VISIBLE' : 'HIDDEN'} to users.` 
            });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleRestoreItem = async (item) => {
        const typeMap = {
            'Wedding': 'wedding',
            'Job Application': 'job',
            'Blog': 'blog',
            'Gallery': 'gallery',
            'Inquiry': 'inquiry',
            'Decor': 'decoration',
            'Catering': 'catering',
            'Entertainment': 'performers',
            'Concert': 'concert',
            'Festival': 'festival',
            'Tournament': 'tournament',
            'Concert Master': 'concert-master',
            'Festival Master': 'festival-master',
            'Sports Registration': 'sports-registration',
            'Wedding Event': 'wedding-event'
        };

        const backendType = typeMap[item._deletedType];

        setCustomAlert({
            show: true,
            title: 'RESTORE',
            message: `Bring this ${item._deletedType} back to active records?`,
            mode: 'confirm',
            onConfirm: async () => {
                setCustomAlert({ show: false });
                try {
                    await api.post(`/admin/restore/${item.id}/`, { type: backendType });
                    fetchAllData();
                    setCustomAlert({ show: true, title: 'RESTORED', message: 'Record has been moved back successfully.' });
                } catch (err) {
                    setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
                }
            }
        });
    };



    const handleBlogSubmit = async () => {
        try {
            if (editingBlog) await api.put(`/blogs/${editingBlog.id}/`, blogForm);
            else await api.post('/blogs/', blogForm);
            setShowCreateBlog(false);
            setEditingBlog(null);
            setBlogForm({ title: '', content: '', image: '', author: 'Admin' });
            fetchAllData();
            setCustomAlert({ show: true, title: 'SUCCESS', message: 'Blog updated!' });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleTogglePublish = async (blog) => {
        try {
            await api.patch(`/blogs/${blog.id}/`, { is_published: !blog.is_published });
            fetchAllData();
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleToggleGalleryPublish = async (item) => {
        try {
            await api.patch(`/gallery/${item.id}/`, { is_published: !item.is_published });
            fetchAllData();
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleGallerySubmit = async () => {
        try {
            await api.post('/gallery/', galleryForm);
            setShowCreateGallery(false);
            setGalleryForm({ title: '', description: '', image_url: '', category: 'Wedding', is_published: true });
            fetchAllData();
            setCustomAlert({ show: true, title: 'SUCCESS', message: 'Gallery updated!' });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleDecorSubmit = async () => {
        try {
            if (editingDecor) {
                await api.put(`/decorations/${editingDecor.id}/`, decorForm);
            } else {
                await api.post('/decorations/', decorForm);
            }
            setShowCreateDecor(false);
            setEditingDecor(null);
            setDecorForm({ name: '', category: 'Wedding', price: 0, image: '', description: '' });
            fetchAllData();
            setCustomAlert({ show: true, title: 'SUCCESS', message: editingDecor ? 'Decoration updated!' : 'Decoration added!' });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleEditDecor = (d) => {
        setEditingDecor(d);
        setDecorForm({ ...d });
        setShowCreateDecor(true);
    };

    const handleCateringSubmit = async () => {
        try {
            if (editingCatering) await api.put(`/catering/${editingCatering.id}/`, cateringForm);
            else await api.post('/catering/', cateringForm);
            setShowCreateCatering(false);
            setEditingCatering(null);
            setCateringForm({ name: '', description: '', price_per_plate: 0, image: '' });
            fetchAllData();
            setCustomAlert({ show: true, title: 'SUCCESS', message: 'Catering updated!' });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handlePerformerSubmit = async () => {
        try {
            if (editingPerformer) await api.put(`/performers/${editingPerformer.id}/`, performerForm);
            else await api.post('/performers/', performerForm);
            setShowCreatePerformer(false);
            setEditingPerformer(null);
            setPerformerForm({ name: '', category: 'Singer', price: 0, image: '', description: '' });
            fetchAllData();
            setCustomAlert({ show: true, title: 'SUCCESS', message: 'Entertainment updated!' });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleWeddingEventSubmit = async () => {
        try {
            if (editingWeddingEvent) await api.put(`/wedding-events/${editingWeddingEvent.id}/`, weddingEventForm);
            else await api.post('/wedding-events/', weddingEventForm);
            setShowCreateWeddingEvent(false);
            setEditingWeddingEvent(null);
            setWeddingEventForm({ name: '', description: '', image: '', is_visible: true });
            fetchAllData();
            setCustomAlert({ show: true, title: 'SUCCESS', message: 'Wedding Details updated!' });
        } catch (err) { setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) }); }
    };

    const handleConcertBookingUpdate = async () => {
        try {
            await api.patch(`/concert-bookings/${editingConcertBooking.id}/`, concertBookingForm);
            setEditingConcertBooking(null);
            fetchAllData();
            setCustomAlert({ show: true, title: 'UPDATED', message: 'Concert booking updated.' });
        } catch (err) { setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) }); }
    };

    const handleFestivalBookingUpdate = async () => {
        try {
            await api.patch(`/festival-bookings/${editingFestivalBooking.id}/`, festivalBookingForm);
            setEditingFestivalBooking(null);
            fetchAllData();
            setCustomAlert({ show: true, title: 'UPDATED', message: 'Festival booking updated.' });
        } catch (err) { setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) }); }
    };

    const handleSportsRegUpdate = async () => {
        try {
            await api.patch(`/sports-registrations/${editingSportsReg.id}/`, sportsRegForm);
            setEditingSportsReg(null);
            fetchAllData();
            setCustomAlert({ show: true, title: 'UPDATED', message: 'Registration updated.' });
        } catch (err) { setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) }); }
    };

    const handleFixtureSubmit = async () => {
        try {
            const tournamentId = editingFixture ? editingFixture.tournament : fixtureForm.tournament;
            const tourney = tournaments.find(t => t.id === parseInt(tournamentId));

            if (!tourney) {
                setCustomAlert({ show: true, title: 'ERROR', message: "Tournament not found." });
                return;
            }

            const startDate = new Date(tourney.start_date || tourney.date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = tourney.end_date ? new Date(tourney.end_date) : startDate;
            endDate.setHours(0, 0, 0, 0);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
 
            if (today < startDate || today > endDate) {
                setCustomAlert({ 
                    show: true, 
                    title: 'RESTRICTED', 
                    message: `Action not allowed. This tournament occurs on ${tourney.start_date || tourney.date}.`,
                    subMessage: 'Matches can only be recorded or scheduled on the tournament date(s).'
                });
                return;
            }

            if (editingFixture) {
                await api.patch(`/fixtures/${editingFixture.id}/`, fixtureForm);
            } else {
                await api.post('/fixtures/', fixtureForm);
            }

            if (fixtureForm.is_final && fixtureForm.winner) {
                // Determine winner and runner up
                const winnerId = fixtureForm.winner;
                const loserId = parseInt(fixtureForm.player1) === parseInt(winnerId) ? fixtureForm.player2 : fixtureForm.player1;

                // Update Tournament status
                await api.patch(`/tournaments/${tournamentId}/`, { status: 'Completed' });

                // Update Winner Status
                await api.patch(`/sports-registrations/${winnerId}/`, { status: 'Winner' });

                // Update Runner-Up Status (if loser is a real registration)
                if (loserId) {
                    await api.patch(`/sports-registrations/${loserId}/`, { status: 'Runner Up' });
                }
            }

            setShowCreateFixture(false);
            setEditingFixture(null);
            fetchAllData();
            setCustomAlert({ show: true, title: 'SUCCESS', message: editingFixture ? 'Match result updated.' : 'Match scheduled.' });
        } catch (err) { setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) }); }
    };

    const handleConcertSubmit = async () => {
        try {
            const parseSimpleList = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
            const parseSimplePairs = (str) => {
                const obj = {};
                str.split(',').forEach(pair => {
                    const [k, v] = pair.split(':').map(s => s.trim());
                    if (k && v) obj[k] = v;
                });
                return obj;
            };
            const parsePipeList = (str, keys) => {
                return str.split('\n').map(line => {
                    const parts = line.split('|').map(s => s.trim());
                    const obj = {};
                    keys.forEach((k, i) => { obj[k] = parts[i] || ''; });
                    return obj;
                }).filter(o => Object.values(o).some(Boolean));
            };

            const payload = {
                ...concertForm,
                popularTracks: parseSimpleList(concertForm.popularTracks),
                highlights: parseSimplePairs(concertForm.highlights),
                tickets: parsePipeList(concertForm.tickets, ['type', 'price']),
                schedule: parsePipeList(concertForm.schedule, ['time', 'act']),
                rules: parseSimpleList(concertForm.rules),
                faqs: parsePipeList(concertForm.faqs, ['q', 'a']),
                sponsors: parsePipeList(concertForm.sponsors, ['name', 'logo'])
            };

            if (editingConcert) await api.put(`/concerts/${editingConcert.id}/`, payload);
            else await api.post('/concerts/', payload);
            setShowCreateConcert(false);
            setEditingConcert(null);
            setConcertForm({
                title: '', artist: '', artistBio: '', date: defaultPastDate, time: '18:00', venue: '', city: '', genre: '',
                bannerImage: '', thumbnail: '', description: '', booking_deadline: defaultPastDate,
                popularTracks: '', highlights: '', tickets: '', schedule: '', rules: '', faqs: '', sponsors: ''
            });
            fetchAllData();
            setCustomAlert({ show: true, title: 'SUCCESS', message: editingConcert ? 'Concert updated!' : 'Concert created!' });
        } catch (err) { setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) }); }
    };

    const handleFestivalSubmit = async () => {
        // Validate mandatory fields
        const required = ['name', 'city', 'venue', 'startDate', 'endDate', 'time', 'image', 'about', 'passes', 'highlights'];
        const missing = required.filter(f => !festivalForm[f] || festivalForm[f].toString().trim() === '');
        if (missing.length > 0) {
            setCustomAlert({ show: true, title: 'MISSING FIELDS', message: `Please fill in: ${missing.join(', ')}`, mode: 'notice' });
            return;
        }

        try {
            const parseSimpleList = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
            const parsePipeList = (str, keys) => {
                if (!str || !str.trim()) return [];
                return str.split('\n').map(line => {
                    const parts = line.split('|').map(s => s.trim());
                    const obj = {};
                    keys.forEach((k, i) => { obj[k] = parts[i] || ''; });
                    return obj;
                }).filter(o => Object.values(o).some(Boolean));
            };

            // highlights: each line = "icon | label | detail"
            const highlightsRaw = festivalForm.highlights || '';
            const highlights = highlightsRaw.split('\n').map(line => {
                const parts = line.split('|').map(s => s.trim());
                return { icon: parts[0] || '🎉', label: parts[1] || '', detail: parts[2] || '' };
            }).filter(h => h.label);

            // attractions: each line = "image | name | description"
            const attractions = parsePipeList(festivalForm.attractions, ['image', 'name', 'description']);

            // passes: each line = "type | price | benefits | days"
            const passes = parsePipeList(festivalForm.passes, ['type', 'price', 'benefits', 'days']);

            // schedule: each line = "day | event"
            const schedule = parsePipeList(festivalForm.schedule, ['day', 'event']);

            // rules: comma separated
            const rules = parseSimpleList(festivalForm.rules);

            // faqs: each line = "question | answer"
            const faqs = parsePipeList(festivalForm.faqs, ['question', 'answer']);

            const payload = {
                ...festivalForm,
                highlights,
                attractions,
                passes,
                schedule,
                rules,
                faqs
            };

            if (editingFestival) await api.put(`/festivals/${editingFestival.id}/`, payload);
            else await api.post('/festivals/', payload);
            setShowCreateFestival(false);
            setEditingFestival(null);
            setFestivalForm({
                name: '', city: '', venue: '', startDate: defaultPastDate, endDate: defaultPastDate, theme: '', image: '', about: '',
                time: '10:00', booking_deadline: defaultPastDate,
                highlights: '', attractions: '', passes: '', schedule: '', rules: '', faqs: ''
            });
            fetchAllData();
            // Navigate to festivals page to see the result
            navigate('/festivals');
        } catch (err) { setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) }); }
    };

    const handleTournamentSubmit = async () => {
        try {
            if (!tournamentForm.start_date || !tournamentForm.registration_deadline) {
                setCustomAlert({ show: true, title: 'MISSING DATES', message: 'Please set both the start date and registration deadline.' });
                return;
            }

            const start = new Date(tournamentForm.start_date);
            const deadline = new Date(tournamentForm.registration_deadline);
            
            // Calculate 10 days before start
            const tenDaysBefore = new Date(start);
            tenDaysBefore.setDate(tenDaysBefore.getDate() - 10);

            if (deadline > tenDaysBefore) {
                setCustomAlert({ 
                    show: true, 
                    title: 'INVALID DEADLINE', 
                    message: 'The registration deadline must be at least 10 days BEFORE the tournament start date.',
                    subMessage: `For a tournament starting on ${tournamentForm.start_date}, the deadline must be on or before ${tenDaysBefore.toISOString().split('T')[0]}.`
                });
                return;
            }

            if (editingTournament) await api.put(`/tournaments/${editingTournament.id}/`, tournamentForm);
            else await api.post('/tournaments/', tournamentForm);
            setShowCreateTournament(false);
            setEditingTournament(null);
            fetchAllData(); // Added fetchAllData to refresh list
            setCustomAlert({ show: true, title: 'SUCCESS', message: editingTournament ? 'Tournament updated!' : 'Tournament created!' });
        } catch (err) { setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) }); }
    };

    const handleProfileUpdate = async () => {
        try {
            await api.patch('/profile/', { ...profileForm, theme });
            setCustomAlert({ show: true, title: 'SUCCESS', message: 'Admin profile updated!' });
        } catch (err) { setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) }); }
    };

    const handlePasswordChange = async () => {
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setCustomAlert({ show: true, title: 'ERROR', message: 'Passwords do not match!' });
            return;
        }
        try {
            await api.post('/change-password/', passwordForm);
            setCustomAlert({ show: true, title: 'SUCCESS', message: 'Admin password changed!' });
            setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
        } catch (err) { setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) }); }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        setTheme(newTheme);
        if (newTheme === 'dark') document.body.classList.add('dark-theme');
        else document.body.classList.remove('dark-theme');
        
        try {
            await api.patch('/profile/', { theme: newTheme });
        } catch (e) {
            console.error("Theme sync failed in dashboard");
        }
    };



    return (
        <div style={layoutStyles.dashboardWrapper} className="admin-dashboard">
            <aside style={layoutStyles.sidebar}>
                <div style={layoutStyles.logoSection}>
                    <div style={layoutStyles.logoCircle}>EM</div>
                    <span style={layoutStyles.logoText}>ELITE ADMIN</span>
                </div>

                <nav style={layoutStyles.nav}>
                    {[
                        { id: 'Overview', icon: '💎' },
                        { id: 'Inquiries', icon: '✨' },
                        { id: 'Weddings', icon: '💍' },
                        { id: 'Concerts', icon: '🎸' },
                        { id: 'Festivals', icon: '🎭' },
                        { id: 'Sports', icon: '🏆' },
                        { id: 'Employment', icon: '💼' },
                        { id: 'Users', icon: '👥' },
                        { id: 'Blogs', icon: '📝' },
                        { id: 'Gallery', icon: '🖼️' },
                        { id: 'Profile', icon: '👤' },
                        { id: 'Trash', icon: '🗑️' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); }}
                            style={{
                                ...layoutStyles.navItem,
                                background: activeTab === item.id ? '#1D3557' : 'transparent',
                                color: activeTab === item.id ? '#fff' : '#A0AEC0'
                            }}
                        >
                            <span>{item.icon}</span>
                            <span style={{ fontWeight: '600' }}>{item.id === 'Employment' ? 'Careers' : item.id === 'Trash' ? 'Recycle Bin' : item.id}</span>
                        </button>
                    ))}
                </nav>

                <div style={layoutStyles.sidebarFooter}>
                    <button onClick={() => { localStorage.clear(); navigate('/admin-login'); }} style={layoutStyles.signOutBtn}>🚪 Sign Out</button>
                </div>
            </aside>

            <main style={layoutStyles.mainContent}>
                <header style={layoutStyles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h1 style={layoutStyles.headerTitle}>{activeTab === 'Employment' ? 'Careers' : activeTab} Management</h1>
                        {/* Status Pulse for Admin */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', padding: '5px 12px', borderRadius: '50px' }}>
                            <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 8px #10B981' }}></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#10B981', textTransform: 'uppercase' }}>Live System</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={layoutStyles.userBadge}>
                            <div style={layoutStyles.userAvatar}>
                                {adminUser?.profile_photo ? (
                                    <img src={adminUser.profile_photo} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover' }} />
                                ) : (
                                    adminUser?.username ? adminUser.username[0].toUpperCase() : 'A'
                                )}
                            </div>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--dark, #0F172A)' }}>{adminUser?.username || 'Super Admin'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray, #718096)' }}>{adminUser?.role || 'Staff Control'}</div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => { localStorage.clear(); navigate('/admin-login'); }} 
                            style={{ 
                                ...layoutStyles.actionBtnAlt, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                border: '1px solid #EF444450', 
                                color: '#EF4444',
                                fontSize: '0.8rem',
                                padding: '8px 15px'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#fff'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#EF4444'; }}
                        >
                            🚪 LOGOUT
                        </button>
                    </div>
                </header>

                <div style={layoutStyles.scrollArea} ref={scrollAreaRef}>
                    {activeTab === 'Profile' ? (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ ...layoutStyles.card, padding: '40px' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--dark, #0F172A)', marginBottom: '30px' }}>Account Settings</h2>
                                
                                <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', alignItems: 'center', background: 'var(--light, #f8fafc)', padding: '30px', borderRadius: '15px' }}>
                                    <div style={{ ...layoutStyles.userAvatar, width: '100px', height: '100px', fontSize: '2.5rem', borderRadius: '25%' }}>
                                        {profileForm.profile_photo ? (
                                            <img src={profileForm.profile_photo} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '25%', objectFit: 'cover' }} />
                                        ) : (
                                            adminUser?.username ? adminUser.username[0].toUpperCase() : 'A'
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '800' }}>Admin Identity</h3>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <label style={{ ...layoutStyles.actionBtnPrimary, padding: '10px 15px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                                📁 Upload From Gallery
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
                                            <button onClick={() => setProfileForm({...profileForm, profile_photo: ''})} style={{ ...layoutStyles.actionBtnAlt, padding: '10px 15px', color: '#EF4444', borderColor: '#EF4444' }}>Remove</button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                    <div><label style={labelStyle}>Staff ID / Username</label><input style={inputStyle} value={profileForm.username} onChange={e => setProfileForm({...profileForm, username: e.target.value})} /></div>
                                    <div><label style={labelStyle}>Official Email</label><input style={inputStyle} value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} /></div>
                                    <div><label style={labelStyle}>Direct Phone</label><input style={inputStyle} value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} /></div>
                                </div>

                                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(59, 130, 246, 0.1)', marginBottom: '30px' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '15px' }}>Security (Password Change)</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                        <input type="password" style={inputStyle} placeholder="Current Password" value={passwordForm.old_password} onChange={e => setPasswordForm({...passwordForm, old_password: e.target.value})} />
                                        <input type="password" style={inputStyle} placeholder="New Password" value={passwordForm.new_password} onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})} />
                                        <input type="password" style={inputStyle} placeholder="Confirm New" value={passwordForm.confirm_password} onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})} />
                                    </div>
                                    <button onClick={handlePasswordChange} style={{ ...layoutStyles.actionBtnPrimary, padding: '10px 15px', fontSize: '0.85rem', marginTop: '15px', background: '#0F172A' }}>Update Security Credentials</button>
                                </div>

                                <button onClick={handleProfileUpdate} style={{ ...layoutStyles.actionBtnPrimary, width: '100%', padding: '18px', fontSize: '1.1rem' }}>Save All Admin Profile Changes</button>
                            </div>
                        </div>
                    ) : (
                        <>
                    {activeTab === 'Overview' ? (
                        <div style={{ ...layoutStyles.statsGrid, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                            <div onClick={() => setShowPendingOnly(!showPendingOnly)} style={{ cursor: 'pointer' }}>
                                <StatCard title="Global Pending" value={globalStats.pendingEvents} color="#EF4444" icon="⏳" />
                            </div>
                            <StatCard title="Approved Bookings" value={globalStats.finishedEvents} color="#38BDF8" icon="✅" />
                            <StatCard title="Total Revenue" value={globalStats.totalRevenue} color="#F59E0B" icon="💰" isCurrency />
                            <StatCard title="Active Users" value={globalStats.totalUsers} color="#8B5CF6" icon="👥" />
                            <StatCard title="Total Jobs" value={globalStats.totalJobs} color="#10B981" icon="💼" />
                            <StatCard title="Live Blogs" value={globalStats.activeBlogs} color="#EC4899" icon="✍️" />
                        </div>
                    ) : (
                        <div style={layoutStyles.statsGrid}>
                            <StatCard
                                title={activeTab === 'Blogs' ? "Total Blogs" : activeTab === 'Users' ? "Total Accounts" : "Total Records"}
                                value={stats.total}
                                color="#3B82F6"
                                icon="📊"
                            />
                            <StatCard
                                title={activeTab === 'Blogs' ? "Drafts" : "Pending Actions"}
                                value={stats.pending}
                                color="#F59E0B"
                                icon="⏳"
                            />
                            <StatCard
                                title={activeTab === 'Blogs' ? "Live Posts" : "Approved Items"}
                                value={stats.approved}
                                color="#10B981"
                                icon="🏆"
                            />
                            <StatCard
                                title="Tab Revenue"
                                value={stats.revenue}
                                color="#EF4444"
                                icon="💰"
                                isCurrency
                            />
                        </div>
                    )}


                    {activeTab === 'Overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: showPendingOnly ? '1fr' : '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div style={layoutStyles.card}>
                                <div style={layoutStyles.cardHeader}>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>
                                        {showPendingOnly ? '🚨 ALL PENDING ACTIONS' : 'PLATFORM PULSE (ALL ACTIVITY)'}
                                    </h2>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                        {showPendingOnly ? 'Records awaiting approval' : 'Last 10 Recent Actions'}
                                    </span>
                                    {showPendingOnly && <button onClick={() => setShowPendingOnly(false)} style={{ background: '#eee', border: 'none', padding: '5px 12px', borderRadius: '15px', cursor: 'pointer' }}>Close List</button>}
                                </div>
                                <div style={{ padding: '20px' }}>
                                    {(showPendingOnly ? recentActivity.filter(a => a.status === 'Pending') : recentActivity.slice(0, 10)).length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No recent activity to show.</div>
                                    ) : (showPendingOnly ? recentActivity.filter(a => a.status === 'Pending') : recentActivity.slice(0, 10)).map((act, idx) => (
                                        <div key={idx} style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            padding: '12px 15px', 
                                            borderBottom: idx < recentActivity.length - 1 ? '1px solid #f0f0f0' : 'none',
                                            transition: '0.2s'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ fontSize: '1.5rem' }}>{act._icon}</div>
                                                <div>
                                                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{act._label}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{act.username || act.full_name || 'System'} • {new Date(act._time).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10B981' }}>
                                                {act.total_price || act.total_cost ? `₹${(act.total_price || act.total_cost).toLocaleString()}` : 'NEW'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {!showPendingOnly && (
                                <div style={{ ...layoutStyles.card, background: 'linear-gradient(135deg, #1D3557 0%, #111 100%)', color: '#fff' }}>
                                    <div style={{ padding: '25px' }}>
                                        <h3 style={{ fontSize: '1.4rem', marginBottom: '25px', fontWeight: '900', borderBottom: '2px solid rgba(196, 160, 89, 0.3)', paddingBottom: '10px' }}>Quick Tips</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                                <div style={{ fontWeight: '900', color: '#38BDF8', fontSize: '0.7rem', marginBottom: '2px' }}>TIPS (T for Task)</div>
                                                <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.9 }}>Use the "Recycle Bin" to restore any accidentally deleted bookings immediately.</p>
                                            </div>
                                            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                                <div style={{ fontWeight: '900', color: '#A855F7', fontSize: '0.7rem', marginBottom: '2px' }}>INFO (I for Insight)</div>
                                                <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.9 }}>"Master Events" allow you to manage core details for festivals and concerts in one go.</p>
                                            </div>
                                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                <div style={{ fontWeight: '900', color: '#10B981', fontSize: '0.7rem', marginBottom: '2px' }}>PULSE (P for Performance)</div>
                                                <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.9 }}>The activity pulse feed now shows your top 10 most recent administrative actions.</p>
                                            </div>
                                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                                <div style={{ fontWeight: '900', color: '#F59E0B', fontSize: '0.7rem', marginBottom: '2px' }}>SETUP (S for Success)</div>
                                                <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.9 }}>Check your "Global Pending" card to quickly view all items awaiting your approval.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => navigate('/')} style={{ marginTop: '20px', width: '100%', padding: '12px', borderRadius: '10px', background: '#C4A059', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Visit Live Site</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab !== 'Overview' && (
                        <div style={layoutStyles.card}>
                            <div style={layoutStyles.cardHeader}>
                                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                                    {activeTab === 'Trash' ? 'RECYCLE BIN' :
                                        activeTab === 'Weddings' ? `WEDDING ${weddingSubTab.toUpperCase()}` :
                                            activeTab.toUpperCase() + ' LEDGER'}
                                </h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {activeTab === 'Weddings' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['Bookings', 'Ceremonies', 'Decor', 'Catering', 'Performer'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    setWeddingSubTab(tab);
                                                    if (tab === 'Ceremonies') {
                                                        setViewMaster(true);
                                                    } else {
                                                        setViewMaster(false);
                                                    }
                                                }}
                                                style={{
                                                    ...layoutStyles.actionBtnAlt,
                                                    background: weddingSubTab === tab ? '#1D3557' : '#f0f0f0',
                                                    color: weddingSubTab === tab ? '#fff' : '#555',
                                                    border: 'none'
                                                }}
                                            >
                                                {tab === 'Ceremonies' ? 'Wedding Details' : tab}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'Trash' && (
                                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                                        {['All', 'Wedding', 'Job Application', 'Blog', 'Inquiry', 'Decor', 'Gallery', 'Concert', 'Festival', 'Tournament', 'Sports Registration'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setTrashFilter(f)}
                                                style={{
                                                    ...layoutStyles.actionBtnAlt,
                                                    background: trashFilter === f ? '#C4A059' : '#f0f0f0',
                                                    color: trashFilter === f ? '#fff' : '#555',
                                                    border: 'none',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'Blogs' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['All', 'Live', 'Draft'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setBlogFilter(f)}
                                                style={{
                                                    ...layoutStyles.actionBtnAlt,
                                                    background: blogFilter === f ? '#3B82F6' : '#f0f0f0',
                                                    color: blogFilter === f ? '#fff' : '#555',
                                                    border: 'none',
                                                    padding: '8px 16px'
                                                }}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                        <button onClick={() => { setShowCreateBlog(true); setEditingBlog(null); setBlogForm({ title: '', content: '', image: '', author: 'Admin', is_published: true }); }} style={layoutStyles.actionBtnPrimary}>+ Write Blog</button>
                                    </div>
                                )}
                                {activeTab === 'Decorations' && (
                                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                        {['All', 'Wedding', 'Sangeet', 'Mehendi', 'Haldi', 'Reception'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setDecorFilter(f)}
                                                style={{
                                                    ...layoutStyles.actionBtnAlt,
                                                    background: decorFilter === f ? '#3B82F6' : '#f0f0f0',
                                                    color: decorFilter === f ? '#fff' : '#555',
                                                    border: 'none',
                                                    padding: '8px 16px'
                                                }}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                        <button onClick={() => { setEditingDecor(null); setDecorForm({ name: '', category: 'Wedding', price: 0, image: '', description: '' }); setShowCreateDecor(true); }} style={{ ...layoutStyles.actionBtnPrimary, marginLeft: 'auto' }}>+ Add Decor</button>
                                    </div>
                                )}
                                {activeTab === 'Gallery' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['All', 'Live', 'Draft'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setGalleryFilter(f)}
                                                style={{
                                                    ...layoutStyles.actionBtnAlt,
                                                    background: galleryFilter === f ? '#10B981' : '#f0f0f0',
                                                    color: galleryFilter === f ? '#fff' : '#555',
                                                    border: 'none',
                                                    padding: '8px 16px'
                                                }}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                        <button onClick={() => setShowCreateGallery(true)} style={{ ...layoutStyles.actionBtnPrimary, marginLeft: 'auto' }}>+ Add Photo</button>
                                    </div>
                                )}
                                {(activeTab === 'Concerts' || activeTab === 'Festivals') && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setViewMaster(false)} style={{ ...layoutStyles.actionBtnAlt, background: !viewMaster ? '#1D3557' : '#f0f0f0', color: !viewMaster ? '#fff' : '#555' }}>Bookings</button>
                                        <button onClick={() => setViewMaster(true)} style={{ ...layoutStyles.actionBtnAlt, background: viewMaster ? '#1D3557' : '#f0f0f0', color: viewMaster ? '#fff' : '#555' }}>Master Events</button>
                                        {viewMaster && (
                                            <button onClick={() => {
                                                if (activeTab === 'Concerts') {
                                                    setEditingConcert(null);
                                                    setConcertForm({
                                                        title: '', artist: '', artistBio: '', date: defaultPastDate, time: '18:00', venue: '', city: '', genre: '',
                                                        bannerImage: '', thumbnail: '', description: '', booking_deadline: defaultPastDate,
                                                        popularTracks: '', highlights: '', tickets: '', schedule: '', rules: '', faqs: '', sponsors: ''
                                                    });
                                                    setShowCreateConcert(true);
                                                } else {
                                                    setEditingFestival(null);
                                                    setFestivalForm({
                                                        name: '', city: '', venue: '', startDate: defaultPastDate, endDate: defaultPastDate, theme: '', image: '', about: '',
                                                        time: '10:00', booking_deadline: defaultPastDate,
                                                        highlights: '', attractions: '', passes: '', schedule: '', rules: '', faqs: ''
                                                    });
                                                    setShowCreateFestival(true);
                                                }
                                            }} style={layoutStyles.actionBtnPrimary}>
                                                {activeTab === 'Concerts' ? '+ New Concert' : '+ New Festival'}
                                            </button>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'Sports' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setSportsSubTab('Registrations')} style={{ ...layoutStyles.actionBtnAlt, background: sportsSubTab === 'Registrations' ? '#1D3557' : '#f0f0f0', color: sportsSubTab === 'Registrations' ? '#fff' : '#555' }}>Registrations</button>
                                        <button onClick={() => setSportsSubTab('Tournaments')} style={{ ...layoutStyles.actionBtnAlt, background: sportsSubTab === 'Tournaments' ? '#1D3557' : '#f0f0f0', color: sportsSubTab === 'Tournaments' ? '#fff' : '#555' }}>Tournaments</button>
                                        <button onClick={() => setSportsSubTab('Fixtures')} style={{ ...layoutStyles.actionBtnAlt, background: sportsSubTab === 'Fixtures' ? '#1D3557' : '#f0f0f0', color: sportsSubTab === 'Fixtures' ? '#fff' : '#555' }}>Fixtures (Matches)</button>
                                        {sportsSubTab === 'Fixtures' && <button onClick={() => { setEditingFixture(null); setFixtureForm({ tournament: '', player1: '', player2: '', match_date: '', round_number: '1', status: 'Scheduled' }); setShowCreateFixture(true); }} style={layoutStyles.actionBtnPrimary}>+ Create Match</button>}
                                        {sportsSubTab === 'Tournaments' && <button onClick={() => { setEditingTournament(null); setTournamentForm({ name: '', sport: '', category: 'Team', start_date: '', end_date: '', registration_deadline: '', max_teams: 10, status: 'Registration Open', image: '' }); setShowCreateTournament(true); }} style={layoutStyles.actionBtnPrimary}>+ New Tournament</button>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={layoutStyles.table}>
                                <thead style={layoutStyles.thead}>
                                    {activeTab === 'Blogs' ? (
                                        <tr><th style={thStyle}>Date</th><th style={thStyle}>Title</th><th style={thStyle}>Author</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                    ) : activeTab === 'Employment' ? (
                                        <tr><th style={thStyle}>Date</th><th style={thStyle}>Applicant</th><th style={thStyle}>Role</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                    ) : activeTab === 'Inquiries' ? (
                                        <tr><th style={thStyle}>Date</th><th style={thStyle}>Inquiry Type</th><th style={thStyle}>Client</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                    ) : activeTab === 'Users' ? (
                                        <tr><th style={thStyle}>Username</th><th style={thStyle}>Role</th><th style={thStyle}>Email</th><th style={thStyle}>Phone</th></tr>
                                    ) : activeTab === 'Gallery' ? (
                                        <tr><th style={thStyle}>Title</th><th style={thStyle}>Category</th><th style={thStyle}>Preview</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                    ) : (activeTab === 'Weddings' && weddingSubTab === 'Decor') ? (
                                        <tr><th style={thStyle}>Name</th><th style={thStyle}>Category</th><th style={thStyle}>Price</th><th style={thStyle}>Preview</th><th style={thStyle}>Action</th></tr>
                                    ) : (activeTab === 'Weddings' && weddingSubTab === 'Catering') ? (
                                        <tr><th style={thStyle}>Package Name</th><th style={thStyle}>Price/Plate</th><th style={thStyle}>Preview</th><th style={thStyle}>Action</th></tr>
                                    ) : (activeTab === 'Weddings' && weddingSubTab === 'Performer') ? (
                                        <tr><th style={thStyle}>Performer</th><th style={thStyle}>Category</th><th style={thStyle}>Base Price</th><th style={thStyle}>Preview</th><th style={thStyle}>Action</th></tr>
                                    ) : activeTab === 'Concerts' ? (
                                        viewMaster ? (
                                            <tr><th style={thStyle}>Date</th><th style={thStyle}>Concert Name</th><th style={thStyle}>Artist</th><th style={thStyle}>City</th><th style={thStyle}>Action</th></tr>
                                        ) : (
                                            <tr><th style={thStyle}>Date</th><th style={thStyle}>Event</th><th style={thStyle}>User</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                        )
                                    ) : activeTab === 'Festivals' ? (
                                        viewMaster ? (
                                            <tr><th style={thStyle}>Start Date</th><th style={thStyle}>Festival Name</th><th style={thStyle}>Theme</th><th style={thStyle}>City</th><th style={thStyle}>Action</th></tr>
                                        ) : (
                                            <tr><th style={thStyle}>Date</th><th style={thStyle}>Festival</th><th style={thStyle}>User</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                        )
                                    ) : activeTab === 'Sports' ? (
                                        sportsSubTab === 'Tournaments' ? (
                                            <tr><th style={thStyle}>Date</th><th style={thStyle}>Tournament</th><th style={thStyle}>Sport</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                        ) : sportsSubTab === 'Fixtures' ? (
                                            <tr><th style={thStyle}>Match Date</th><th style={thStyle}>P1 / Team1</th><th style={thStyle}>P2 / Team2</th><th style={thStyle}>Winner</th><th style={thStyle}>Status</th><th style={thStyle}>T. Status</th><th style={thStyle}>Action</th></tr>
                                        ) : (
                                            <tr><th style={thStyle}>Date</th><th style={thStyle}>Player/Team</th><th style={thStyle}>Tournament</th><th style={thStyle}>Players</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                        )
                                    ) : (activeTab === 'Weddings' && weddingSubTab === 'Ceremonies') ? (
                                        <tr><th style={thStyle}>Ceremony Name</th><th style={thStyle}>Description</th><th style={thStyle}>Image URL</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                    ) : activeTab === 'Trash' ? (
                                        <tr><th style={thStyle}>Date</th><th style={thStyle}>Type</th><th style={thStyle}>Title/Owner</th><th style={thStyle}>Original Status</th><th style={thStyle}>Action</th></tr>
                                    ) : (
                                        <tr><th style={thStyle}>ID</th><th style={thStyle}>Client</th><th style={thStyle}>Date</th><th style={thStyle}>Total</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                    )}
                                </thead>
                                <tbody>
                                    {activeTab === 'Weddings' && weddingSubTab === 'Bookings' && bookings.map(b => {
                                        const eventDate = new Date(b.event_date);
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const isCompleted = eventDate < today && b.status === 'Approved';

                                        return (
                                            <tr key={b.id} style={layoutStyles.tr}>
                                                <td style={tdStyle}>#WED-{b.id}</td>
                                                <td style={tdStyle}><strong>{b.username}</strong></td>
                                                <td style={tdStyle}>{b.event_date}</td>
                                                <td style={tdStyle}>₹{parseFloat(b.total_cost || 0).toLocaleString()}</td>
                                                <td style={tdStyle}>
                                                    <span style={{
                                                        ...statusBadge,
                                                        background: isCompleted ? '#3B82F620' : (b.status === 'Approved' ? '#10B98120' : (b.status === 'Rejected' ? '#EF444420' : '#F59E0B20')),
                                                        color: isCompleted ? '#3B82F6' : (b.status === 'Approved' ? '#10B981' : (b.status === 'Rejected' ? '#EF4444' : '#F59E0B'))
                                                    }}>
                                                        {isCompleted ? '✅ Completed' : b.status}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <button onClick={() => setInspectingBooking({ ...b, _type: 'wedding' })} style={actionBtn}>Inspect</button>
                                                    <button onClick={() => handleDeleteItem('wedding', b.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {activeTab === 'Weddings' && weddingSubTab === 'Decor' && (
                                        <>
                                            <tr style={{ background: '#f8fafc' }}>
                                                <td colSpan="5" style={{ padding: '15px 25px' }}>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        {['All', 'Wedding', 'Sangeet', 'Mehendi', 'Haldi', 'Reception'].map(f => (
                                                            <button key={f} onClick={() => setDecorFilter(f)} style={{ ...layoutStyles.actionBtnAlt, background: decorFilter === f ? '#3B82F6' : '#fff', color: decorFilter === f ? '#fff' : '#555', padding: '6px 12px', fontSize: '11px' }}>{f}</button>
                                                        ))}
                                                        <button onClick={() => { setEditingDecor(null); setDecorForm({ name: '', category: 'Wedding', price: 0, image: '', description: '' }); setShowCreateDecor(true); }} style={{ ...layoutStyles.actionBtnPrimary, marginLeft: 'auto', padding: '8px 16px', fontSize: '11px' }}>+ Add Decor</button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {decorations.filter(d => decorFilter === 'All' || d.category === decorFilter).map(d => (
                                                <tr key={d.id} style={layoutStyles.tr}>
                                                    <td style={tdStyle}><strong>{d.name}</strong></td>
                                                    <td style={tdStyle}>{d.category}</td>
                                                    <td style={tdStyle}>₹{parseFloat(d.price).toLocaleString()}</td>
                                                    <td style={tdStyle}>{d.image ? <img src={d.image} alt={d.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /> : 'No Image'}</td>
                                                    <td style={tdStyle}>
                                                        <button onClick={() => handleEditDecor(d)} style={{ ...actionBtn, background: '#8B5CF6' }}>Edit</button>
                                                        <button onClick={() => handleDeleteItem('decoration', d.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}

                                    {activeTab === 'Weddings' && weddingSubTab === 'Catering' && (
                                        <>
                                            <tr style={{ background: '#f8fafc' }}>
                                                <td colSpan="4" style={{ padding: '15px 25px' }}>
                                                    <button onClick={() => { setEditingCatering(null); setCateringForm({ name: '', description: '', price_per_plate: 0, image: '' }); setShowCreateCatering(true); }} style={{ ...layoutStyles.actionBtnPrimary, marginLeft: 'auto', display: 'block', padding: '8px 16px', fontSize: '11px' }}>+ Add Catering Service</button>
                                                </td>
                                            </tr>
                                            {catering.map(c => (
                                                <tr key={c.id} style={layoutStyles.tr}>
                                                    <td style={tdStyle}><strong>{c.name}</strong></td>
                                                    <td style={tdStyle}>₹{parseFloat(c.price_per_plate).toLocaleString()}</td>
                                                    <td style={tdStyle}>{c.image ? <img src={c.image} alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /> : 'No Image'}</td>
                                                    <td style={tdStyle}>
                                                        <button onClick={() => { setEditingCatering(c); setCateringForm(c); setShowCreateCatering(true); }} style={{ ...actionBtn, background: '#8B5CF6' }}>Edit</button>
                                                        <button onClick={() => handleDeleteItem('catering', c.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}

                                    {activeTab === 'Weddings' && weddingSubTab === 'Performer' && (
                                        <>
                                            <tr style={{ background: '#f8fafc' }}>
                                                <td colSpan="5" style={{ padding: '15px 25px' }}>
                                                    <button onClick={() => { setEditingPerformer(null); setPerformerForm({ name: '', category: 'Singer', price: 0, image: '', description: '' }); setShowCreatePerformer(true); }} style={{ ...layoutStyles.actionBtnPrimary, marginLeft: 'auto', display: 'block', padding: '8px 16px', fontSize: '11px' }}>+ Add Entertainment</button>
                                                </td>
                                            </tr>
                                            {performers.map(p => (
                                                <tr key={p.id} style={layoutStyles.tr}>
                                                    <td style={tdStyle}><strong>{p.name}</strong></td>
                                                    <td style={tdStyle}>{p.category}</td>
                                                    <td style={tdStyle}>₹{parseFloat(p.price).toLocaleString()}</td>
                                                    <td style={tdStyle}>{p.image ? <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /> : 'No Image'}</td>
                                                    <td style={tdStyle}>
                                                        <button onClick={() => { setEditingPerformer(p); setPerformerForm(p); setShowCreatePerformer(true); }} style={{ ...actionBtn, background: '#8B5CF6' }}>Edit</button>
                                                        <button onClick={() => handleDeleteItem('performer', p.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                    {activeTab === 'Weddings' && weddingSubTab === 'Ceremonies' && (
                                        <>
                                            <tr style={{ background: '#f8fafc' }}>
                                                <td colSpan="5" style={{ padding: '15px 25px' }}>
                                                    <button onClick={() => { setEditingWeddingEvent(null); setWeddingEventForm({ name: '', description: '', image: '', is_visible: true }); setShowCreateWeddingEvent(true); }} style={{ ...layoutStyles.actionBtnPrimary, marginLeft: 'auto', display: 'block', padding: '8px 16px', fontSize: '11px' }}>+ Add New Ceremony Type</button>
                                                </td>
                                            </tr>
                                            {weddingEvents.map(e => (
                                                <tr key={e.id} style={layoutStyles.tr}>
                                                    <td style={tdStyle}><strong>{e.name}</strong></td>
                                                    <td style={tdStyle}>{e.description ? (e.description.substring(0, 50) + '...') : 'No description'}</td>
                                                    <td style={tdStyle}>{e.image ? <img src={e.image} alt={e.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /> : 'No Image'}</td>
                                                    <td style={tdStyle}>
                                                        <span style={{
                                                            ...statusBadge,
                                                            background: e.is_visible ? '#10B98120' : '#F59E0B20',
                                                            color: e.is_visible ? '#10B981' : '#F59E0B'
                                                        }}>
                                                            {e.is_visible ? 'Visible' : 'Hidden'}
                                                        </span>
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <button onClick={() => { 
                                                            setEditingWeddingEvent(e); 
                                                            setWeddingEventForm({
                                                                name: e.name,
                                                                description: e.description,
                                                                image: e.image || '',
                                                                is_visible: e.is_visible
                                                            }); 
                                                            setShowCreateWeddingEvent(true); 
                                                        }} style={{ ...actionBtn, background: '#8B5CF6' }}>Edit</button>
                                                        <button onClick={() => handleToggleVisibility('wedding-event', e)} style={{ ...actionBtn, background: e.is_visible ? '#10B981' : '#F59E0B', marginLeft: '5px' }}>{e.is_visible ? '👁️' : '🙈'}</button>
                                                        <button onClick={() => handleDeleteItem('wedding-event', e.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}


                                    {activeTab === 'Employment' && jobApplications.map(j => {
                                        const isAutoRejected = j.status === 'Auto-Rejected';
                                        return (
                                            <tr key={j.id} style={layoutStyles.tr}>
                                                <td style={tdStyle}>{new Date(j.applied_at).toLocaleDateString()}</td>
                                                <td style={tdStyle}><strong>{j.full_name}</strong></td>
                                                <td style={tdStyle}>{j.position}</td>
                                                <td style={tdStyle}>
                                                    <span style={{
                                                        ...statusBadge,
                                                        background: isAutoRejected ? '#EF444420' : (j.status === 'Hired' ? '#10B98120' : (j.status === 'Rejected' ? '#EF444420' : '#F59E0B20')),
                                                        color: isAutoRejected ? '#EF4444' : (j.status === 'Hired' ? '#10B981' : (j.status === 'Rejected' ? '#EF4444' : '#F59E0B'))
                                                    }}>
                                                        {isAutoRejected ? '⏰ Auto-Rejected' : j.status}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <button
                                                        onClick={() => !isAutoRejected && setInspectingBooking({ ...j, _type: 'job' })}
                                                        style={{ ...actionBtn, opacity: isAutoRejected ? 0.4 : 1, cursor: isAutoRejected ? 'not-allowed' : 'pointer' }}
                                                        title={isAutoRejected ? 'Auto-rejected after 7 days — cannot hire' : 'Review application'}
                                                    >Review</button>
                                                    <button onClick={() => handleDeleteItem('job', j.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {activeTab === 'Blogs' && blogs
                                        .filter(b => blogFilter === 'All' || (blogFilter === 'Draft' ? !b.is_published : b.is_published))
                                        .map(b => (
                                            <tr key={b.id} style={layoutStyles.tr}>
                                                <td style={tdStyle}>{new Date(b.created_at).toLocaleDateString()}</td>
                                                <td style={tdStyle}><strong>{b.title}</strong></td>
                                                <td style={tdStyle}>{b.author}</td>
                                                <td style={tdStyle}>
                                                    <span style={{
                                                        ...statusBadge,
                                                        background: b.is_published ? '#10B98120' : '#F59E0B20',
                                                        color: b.is_published ? '#10B981' : '#F59E0B'
                                                    }}>
                                                        {b.is_published ? '🌐 Live' : '📝 Draft'}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <button onClick={() => handleTogglePublish(b)} style={actionBtn}>{b.is_published ? 'Unpublish' : 'Publish'}</button>
                                                    <button onClick={() => { setEditingBlog(b); setBlogForm(b); setShowCreateBlog(true); }} style={{ ...actionBtn, background: '#8B5CF6', marginLeft: '5px' }}>Edit</button>
                                                    <button onClick={() => handleDeleteItem('blog', b.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    {activeTab === 'Inquiries' && eventInquiries.map(i => (
                                        <tr key={i.id} style={layoutStyles.tr}>
                                            <td style={tdStyle}>{new Date(i.created_at).toLocaleDateString()}</td>
                                            <td style={tdStyle}><strong>{i.event_type}</strong></td>
                                            <td style={tdStyle}>{i.contact_name}</td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    ...statusBadge,
                                                    background: i.status === 'Reviewed' ? '#10B98120' : '#F59E0B20',
                                                    color: i.status === 'Reviewed' ? '#10B981' : '#F59E0B'
                                                }}>
                                                    {i.status}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <button onClick={() => setInspectingBooking({ ...i, _type: 'inquiry' })} style={actionBtn}>View</button>
                                                <button onClick={() => handleDeleteItem('inquiry', i.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {activeTab === 'Users' && users.map(u => (
                                        <tr key={u.id} style={layoutStyles.tr}>
                                            <td style={tdStyle}><strong>{u.username}</strong></td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    ...statusBadge,
                                                    background: (u.role === 'ADMIN' || u.is_superuser) ? '#8B5CF620' : '#3B82F620',
                                                    color: (u.role === 'ADMIN' || u.is_superuser) ? '#8B5CF6' : '#3B82F6'
                                                }}>
                                                    {u.is_superuser ? 'ADMIN (Super)' : u.role}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>{u.email}</td>
                                            <td style={tdStyle}>{u.phone || 'N/A'}</td>
                                        </tr>
                                    ))}
                                    {activeTab === 'Gallery' && gallery
                                        .filter(g => galleryFilter === 'All' || (galleryFilter === 'Draft' ? !g.is_published : g.is_published))
                                        .map(g => (
                                            <tr key={g.id} style={layoutStyles.tr}>
                                                <td style={tdStyle}><strong>{g.title}</strong></td>
                                                <td style={tdStyle}>{g.category}</td>
                                                <td style={tdStyle}>
                                                    {(g.image || g.image_url) ? (
                                                        <img src={g.image || g.image_url} alt={g.title} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'contain' }} />
                                                    ) : 'No Image'}
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{
                                                        ...statusBadge,
                                                        background: g.is_published ? '#10B98120' : '#F59E0B20',
                                                        color: g.is_published ? '#10B981' : '#F59E0B'
                                                    }}>
                                                        {g.is_published ? 'Live' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <button onClick={() => handleToggleGalleryPublish(g)} style={actionBtn}>{g.is_published ? 'Hide' : 'Show'}</button>
                                                    <button onClick={() => handleDeleteItem('gallery', g.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    {activeTab === 'Decorations' && decorations
                                        .filter(d => decorFilter === 'All' || d.category === decorFilter)
                                        .map(d => (
                                            <tr key={d.id} style={layoutStyles.tr}>
                                                <td style={tdStyle}><strong>{d.name}</strong></td>
                                                <td style={tdStyle}>{d.category}</td>
                                                <td style={tdStyle}>₹{parseFloat(d.price).toLocaleString()}</td>
                                                <td style={tdStyle}>
                                                    {d.image ? (
                                                        <img src={d.image} alt={d.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                                    ) : 'No Image'}
                                                </td>
                                                <td style={tdStyle}>
                                                    <button onClick={() => handleEditDecor(d)} style={{ ...actionBtn, background: '#8B5CF6' }}>Edit</button>
                                                    <button onClick={() => handleDeleteItem('decoration', d.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                </td>
                                            </tr>
                                        ))}

                                    {activeTab === 'Concerts' && (viewMaster ? concerts : concertBookings).map(c => (
                                        <tr key={c.id} style={layoutStyles.tr}>
                                            <td style={tdStyle}>{c.date || c.event_date}</td>
                                            <td style={tdStyle}><strong>{c.title || c.concert_title}</strong></td>
                                            <td style={tdStyle}>{viewMaster ? c.artist : (c.username || 'User')}</td>
                                            <td style={tdStyle}>
                                                {viewMaster ? (c.city) : (
                                                    <span style={{
                                                        ...statusBadge,
                                                        background: c.status === 'Confirmed' ? '#10B98120' : '#F59E0B20',
                                                        color: c.status === 'Confirmed' ? '#10B981' : '#F59E0B'
                                                    }}>{c.status}</span>
                                                )}
                                            </td>
                                            <td style={tdStyle}>
                                                {viewMaster ? (
                                                    <>
                                                        <button onClick={() => {
                                                            setEditingConcert(c);
                                                            setConcertForm({
                                                                ...c,
                                                                popularTracks: (c.popularTracks || []).join(', '),
                                                                highlights: Object.entries(c.highlights || {}).map(([k, v]) => `${k}:${v}`).join(', '),
                                                                tickets: (c.tickets || []).map(t => `${t.type}|${t.price}`).join('\n'),
                                                                schedule: (c.schedule || []).map(s => `${s.time}|${s.act}`).join('\n'),
                                                                rules: (c.rules || []).join(', '),
                                                                faqs: (c.faqs || []).map(f => `${f.q}|${f.a}`).join('\n'),
                                                                sponsors: (c.sponsors || []).map(s => `${s.name}|${s.logo}`).join('\n')
                                                            });
                                                            setShowCreateConcert(true);
                                                        }} style={{ ...actionBtn, background: '#8B5CF6' }}>Edit</button>
                                                        <button onClick={() => handleToggleVisibility('concert', c)} style={{ ...actionBtn, background: c.is_visible ? '#10B981' : '#F59E0B', marginLeft: '5px' }}>
                                                            {c.is_visible ? 'Show 👁️' : 'Hide 🙈'}
                                                        </button>
                                                        <button onClick={() => handleDeleteItem('concert_master', c.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => setInspectingBooking({ ...c, _type: 'concert' })} style={actionBtn}>View</button>
                                                        <button onClick={() => { setEditingConcertBooking(c); setConcertBookingForm({ status: c.status, ticket_type: c.ticket_type, quantity: c.quantity }); }} style={{ ...actionBtn, background: '#8B5CF6', marginLeft: '5px' }}>Edit</button>
                                                        <button onClick={() => handleDeleteItem('concert', c.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}

                                    {activeTab === 'Festivals' && (viewMaster ? festivals : festivalBookings).map(f => (
                                        <tr key={f.id} style={layoutStyles.tr}>
                                            <td style={tdStyle}>{f.startDate || f.booking_date}</td>
                                            <td style={tdStyle}><strong>{f.name || f.festival_name}</strong></td>
                                            <td style={tdStyle}>{viewMaster ? f.theme : (f.username || 'User')}</td>
                                            <td style={tdStyle}>
                                                {viewMaster ? (f.city) : (
                                                    <span style={{
                                                        ...statusBadge,
                                                        background: f.status === 'Confirmed' ? '#10B98120' : '#EF444420',
                                                        color: f.status === 'Confirmed' ? '#10B981' : '#EF4444'
                                                    }}>{f.status}</span>
                                                )}
                                            </td>
                                            <td style={tdStyle}>
                                                {viewMaster ? (
                                                    <>
                                                        <button onClick={() => {
                                                            setEditingFestival(f);
                                                            setFestivalForm({
                                                                ...f,
                                                                highlights: (f.highlights || []).map(h => `${h.icon} | ${h.label} | ${h.detail}`).join('\n'),
                                                                attractions: (f.attractions || []).map(a => `${a.name}|${a.description}`).join('\n'),
                                                                passes: (f.passes || []).map(p => `${p.type}|${p.price}|${p.benefits}|${p.days}`).join('\n'),
                                                                schedule: (f.schedule || []).map(s => `${s.day}|${s.event}`).join('\n'),
                                                                rules: (f.rules || []).join(', '),
                                                                faqs: (f.faqs || []).map(q => `${q.question}|${q.answer}`).join('\n')
                                                            });
                                                            setShowCreateFestival(true);
                                                        }} style={{ ...actionBtn, background: '#8B5CF6' }}>Edit</button>
                                                        <button onClick={() => handleToggleVisibility('festival', f)} style={{ ...actionBtn, background: f.is_visible ? '#10B981' : '#F59E0B', marginLeft: '5px' }}>
                                                            {f.is_visible ? 'Show 👁️' : 'Hide 🙈'}
                                                        </button>
                                                        <button onClick={() => handleDeleteItem('festival_master', f.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => setInspectingBooking({ ...f, _type: 'festival' })} style={actionBtn}>View</button>
                                                        <button onClick={() => { setEditingFestivalBooking(f); setFestivalBookingForm({ status: f.status, pass_type: f.pass_type, quantity: f.quantity }); }} style={{ ...actionBtn, background: '#8B5CF6', marginLeft: '5px' }}>Edit</button>
                                                        <button onClick={() => handleDeleteItem('festival', f.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}

                                    {activeTab === 'Sports' && (sportsSubTab === 'Tournaments' ? tournaments : sportsSubTab === 'Fixtures' ? fixtures : registrations).map(r => (
                                        <tr key={r.id} style={layoutStyles.tr}>
                                            <td style={tdStyle}>{sportsSubTab === 'Tournaments' ? `${r.start_date}${r.end_date ? ' to ' + r.end_date : ''}` : (r.date || r.registered_at || r.match_date)}</td>
                                            <td style={tdStyle}>
                                                <strong>{sportsSubTab === 'Fixtures' ? r.player1_name : (r.name || r.team_name || r.player_name || r.username)}</strong>
                                            </td>
                                            <td style={tdStyle}>
                                                {sportsSubTab === 'Fixtures' ? r.player2_name : (r.sport || r.tournament_name || 'Individual')}
                                            </td>
                                            {sportsSubTab === 'Registrations' && (
                                                <td style={{ ...tdStyle, minWidth: '150px' }}>
                                                    <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                                                        <div style={{ color: '#3B82F6', fontWeight: '800', marginBottom: '2px' }}>
                                                            SQUAD ({r.players?.length || 0}):
                                                        </div>
                                                        <div style={{ color: '#1E293B', fontWeight: '600' }}>
                                                            {r.players?.length > 0 ? r.players.join(', ') : 'No players listed'}
                                                        </div>
                                                        
                                                        {r.substitutes?.length > 0 && (
                                                            <div style={{ marginTop: '5px', borderTop: '1px dashed #E2E8F0', paddingTop: '3px' }}>
                                                                <div style={{ color: '#64748B', fontWeight: '800', fontSize: '0.7rem' }}>
                                                                    SUBS ({r.substitutes.length}):
                                                                </div>
                                                                <div style={{ color: '#64748B' }}>
                                                                    {r.substitutes.join(', ')}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            <td style={tdStyle}>
                                                {sportsSubTab === 'Fixtures' ? (
                                                    <span style={{ fontWeight: 'bold', color: '#10B981' }}>{r.winner_name || 'TBD'}</span>
                                                ) : sportsSubTab === 'Registrations' && (r.status === 'Winner' || r.status === 'Semi-Finalist') ? (
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ ...statusBadge, background: '#10B98120', color: '#10B981' }}>{r.status}</div>
                                                        <div style={{ fontSize: '0.75rem', marginTop: '5px', fontWeight: '800', color: r.prize_status === 'Paid' ? '#10B981' : '#F59E0B' }}>
                                                            {r.prize_status}: ₹{r.winning_amount}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{
                                                        ...statusBadge,
                                                        background: (r.status === 'Confirmed' || r.status === 'Registration Open' || r.status === 'Winner') ? '#10B98120' : '#F59E0B20',
                                                        color: (r.status === 'Confirmed' || r.status === 'Registration Open' || r.status === 'Winner') ? '#10B981' : '#F59E0B'
                                                    }}>{r.status}</span>
                                                )}
                                            </td>
                                            {sportsSubTab === 'Fixtures' && (
                                                <td style={tdStyle}>
                                                    {(() => {
                                                        const tourney = tournaments.find(t => t.id === r.tournament);
                                                        return (
                                                            <span style={{ 
                                                                fontSize: '0.7rem', 
                                                                color: tourney?.status === 'Completed' ? '#10B981' : '#6B7280',
                                                                fontWeight: '800'
                                                            }}>
                                                                {tourney?.status.toUpperCase()}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                            )}
                                            <td style={tdStyle}>
                                                {sportsSubTab === 'Fixtures' ? (
                                                    <>
                                                        <button onClick={() => { 
                                                            setEditingFixture(r); 
                                                            setFixtureForm({ 
                                                                tournament: r.tournament,
                                                                player1: r.player1 || '',
                                                                player2: r.player2 || '',
                                                                player1_tbd_label: r.player1_tbd_label || '',
                                                                player2_tbd_label: r.player2_tbd_label || '',
                                                                winner: r.winner || '', 
                                                                status: r.status,
                                                                match_date: r.match_date ? r.match_date.slice(0, 16) : ''
                                                            }); 
                                                            setShowCreateFixture(true); 
                                                        }} style={{ ...actionBtn, background: '#8B5CF6' }}>Edit/Result</button>
                                                        <button onClick={async () => { await api.delete(`/fixtures/${r.id}/`); fetchAllData(); }} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </>
                                                ) : sportsSubTab === 'Tournaments' ? (
                                                    <>
                                                        <button onClick={() => { setEditingTournament(r); setTournamentForm({ ...r }); setShowCreateTournament(true); }} style={{ ...actionBtn, background: '#8B5CF6' }}>Edit</button>
                                                        <button onClick={() => handleDeleteItem('tournament', r.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => setInspectingBooking({ ...r, _type: 'sports' })} style={actionBtn}>View</button>
                                                        <button onClick={() => { 
                                                            setEditingSportsReg(r); 
                                                            setSportsRegForm({ 
                                                                status: r.status, 
                                                                team_name: r.team_name || '', 
                                                                player_name: r.player_name || '', 
                                                                registration_type: r.registration_type,
                                                                winning_amount: r.winning_amount || 0,
                                                                prize_status: r.prize_status || 'Pending'
                                                            }); 
                                                        }} style={{ ...actionBtn, background: '#8B5CF6', marginLeft: '5px' }}>Edit</button>
                                                        <button onClick={() => handleDeleteItem('sports', r.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {activeTab === 'Trash' && deletedItems
                                        .filter(item => trashFilter === 'All' || item._deletedType === trashFilter)
                                        .map((item, idx) => (
                                            <tr key={`${item.id}-${idx}`} style={layoutStyles.tr}>
                                                <td style={tdStyle}>{new Date(item.booking_date || item.created_at || item.applied_at || item.registration_date).toLocaleDateString()}</td>
                                                <td style={tdStyle}><span style={{ ...statusBadge, background: '#eee', color: '#666' }}>{item._deletedType}</span></td>
                                                <td style={tdStyle}>
                                                    <strong>{item.username || item.full_name || item.title || item.name || item.team_name || item.player_name || 'N/A'}</strong>
                                                </td>
                                                <td style={tdStyle}>{item.status || (item.is_published ? 'Published' : 'Draft')}</td>
                                                <td style={tdStyle}>
                                                    <button onClick={() => handleRestoreItem(item)} style={{ ...layoutStyles.actionBtnPrimary, padding: '5px 12px', fontSize: '0.75rem' }}>Restore</button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        </div>
                    )}
                    </>
                )}
                </div>
            </main>

            {/* Modals restored with premium layout */}
            {
                inspectingBooking && (
                    <div style={layoutStyles.modalOverlay} onClick={() => setInspectingBooking(null)}>
                        <div style={layoutStyles.modalContent} onClick={e => e.stopPropagation()}>
                            <div style={layoutStyles.modalHeader}>
                                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>{inspectingBooking._type.toUpperCase()} INVOICE</h2>
                                <button onClick={() => setInspectingBooking(null)} style={layoutStyles.closeBtn}>&times;</button>
                            </div>
                            <div style={layoutStyles.modalBody}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                                    <div><label style={labelStyle}>Client / Couple</label><p style={textValueStyle}>
                                        {inspectingBooking._type === 'wedding' && inspectingBooking.wedding_details?.brideName
                                            ? `${inspectingBooking.wedding_details.brideName} & ${inspectingBooking.wedding_details.groomName}`
                                            : (inspectingBooking.username || inspectingBooking.full_name || 'Individual Client')}
                                    </p></div>
                                    <div><label style={labelStyle}>Contact Point</label><p style={textValueStyle}>{inspectingBooking.user_email || inspectingBooking.phone || inspectingBooking.email || inspectingBooking.contact_phone || inspectingBooking.contact_email}</p></div>
                                </div>

                                {inspectingBooking._type === 'inquiry' && (
                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '15px' }}>
                                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>✨ Inquiry Details</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Event Type:</span> <br /> <strong>{inspectingBooking.event_type}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Event Date:</span> <br /> <strong>{inspectingBooking.event_date}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Location Type:</span> <br /> <strong>{inspectingBooking.location_type}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Venue:</span> <br /> <strong>{inspectingBooking.venue_name || 'N/A'}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Guests:</span> <br /> <strong>{inspectingBooking.guests}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Style:</span> <br /> <strong>{inspectingBooking.service_style}</strong></div>
                                        </div>
                                        {inspectingBooking.cuisine_preferences && (
                                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#718096' }}>Preferences:</span>
                                                <p style={{ marginTop: '5px', fontSize: '0.85rem' }}>{inspectingBooking.cuisine_preferences}</p>
                                            </div>
                                        )}
                                        {inspectingBooking.internal_notes && (
                                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#718096' }}>Notes:</span>
                                                <p style={{ marginTop: '5px', fontSize: '0.85rem' }}>{inspectingBooking.internal_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {inspectingBooking._type === 'wedding' && (
                                    <>
                                        <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '15px', border: '1px solid #eee', marginBottom: '20px' }}>
                                            <h4 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}><span>✨</span> Financial Breakdown</h4>
                                            <BillRow label="Catering Services" sub={inspectingBooking.catering_package || 'Standard Package'} value={inspectingBooking.catering_price} />
                                            <BillRow label="Decor & Ambiance" sub={inspectingBooking.decoration_name || 'Standard Decor'} value={inspectingBooking.decoration_price} />
                                            <BillRow label="Live Performers" sub={inspectingBooking.performer_name || 'None Selected'} value={inspectingBooking.performer_price} />
                                            <div style={{ borderTop: '1px dashed #ddd', margin: '10px 0' }}></div>
                                            <BillRow label="Subtotal" value={inspectingBooking.total_cost} bold />
                                            <BillRow label="Advance Paid" value={inspectingBooking.advance_amount} color="#10B981" />
                                            <BillRow label="Balance Remaining" value={inspectingBooking.balance_amount} color="#F59E0B" />
                                            <div style={{ borderTop: '2px solid #ddd', marginTop: '10px', paddingTop: '10px' }}>
                                                <BillRow label="GRAND TOTAL" value={inspectingBooking.total_cost} bold big color="#EF4444" />
                                            </div>
                                            <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 'bold', color: inspectingBooking.payment_status === 'Fully Paid' ? '#10B981' : '#F59E0B' }}>
                                                Payment Status: {inspectingBooking.payment_status}
                                            </div>
                                        </div>
                                        <div style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '15px' }}>
                                            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>✨ Event Scope</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                                <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Event Type:</span> <br /> <strong>{inspectingBooking.event_type || 'Wedding'}</strong></div>
                                                <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Wedding Date:</span> <br /> <strong>{inspectingBooking.wedding_details?.weddingDate || inspectingBooking.event_date}</strong></div>
                                                <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Venue:</span> <br /> <strong>{inspectingBooking.wedding_details?.venueName || 'Imperial Hall'}</strong></div>
                                                <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Destination:</span> <br /> <strong>{inspectingBooking.wedding_details?.isDestinationWedding || 'No'}</strong></div>
                                                <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Guests:</span> <br /> <strong>{inspectingBooking.guests || inspectingBooking.wedding_details?.guestCount}</strong></div>
                                                <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Theme:</span> <br /> <strong>{inspectingBooking.wedding_details?.weddingTheme || 'Classic Royal'}</strong></div>
                                            </div>
                                            {inspectingBooking.wedding_details?.notes && (
                                                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>Custom Requests:</span>
                                                    <p style={{ marginTop: '5px', fontSize: '0.85rem' }}>{inspectingBooking.wedding_details.notes}</p>
                                                </div>
                                            )}

                                            {/* 7-Day Auto Reject Warning */}
                                            {inspectingBooking.status === 'Pending' && (
                                                <div style={{
                                                    marginTop: '15px',
                                                    padding: '10px 15px',
                                                    background: '#FFFBEB',
                                                    borderLeft: '4px solid #F59E0B',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: '900', color: '#92400E' }}>⚠️ ACTION REQUIRED</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                                                        This booking was received on {new Date(inspectingBooking.booking_date).toLocaleDateString()}.
                                                        Must be Approved or Rejected within 7 days otherwise it will be auto-rejected.
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '15px', marginTop: '20px' }}>
                                            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>✨ Thematic Details</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                                <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Color Palette:</span> <br /> <strong>{inspectingBooking.wedding_details?.colorPreferences || 'TBD'}</strong></div>
                                                <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Cultural/Special:</span> <br /> <strong>{inspectingBooking.wedding_details?.culturalRequirements || 'None'}</strong></div>
                                            </div>

                                            {inspectingBooking.wedding_details?.eventsRequired && (
                                                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>Required Events:</span>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                                        {Object.entries(inspectingBooking.wedding_details.eventsRequired)
                                                            .filter(([_, value]) => value === true)
                                                            .map(([key]) => (
                                                                <span key={key} style={{ padding: '4px 12px', background: '#C4A05920', color: '#C4A059', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                                    {key}
                                                                </span>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {inspectingBooking._type === 'concert' && (
                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '15px' }}>
                                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>✨ ADVANCED EVENT SPECIFICATIONS</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Event:</span> <br /> <strong>{inspectingBooking.concert_title}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Artist:</span> <br /> <strong>{inspectingBooking.artist_name}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Venue:</span> <br /> <strong>{inspectingBooking.venue}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Date/Time:</span> <br /> <strong>{inspectingBooking.event_date} at {inspectingBooking.event_time}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Ticket Type:</span> <br /> <strong>{inspectingBooking.ticket_type}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Quantity:</span> <br /> <strong>{inspectingBooking.quantity}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Total Price:</span> <br /> <strong>₹{parseFloat(inspectingBooking.total_price).toLocaleString()}</strong></div>
                                        </div>
                                    </div>
                                )}

                                {inspectingBooking._type === 'festival' && (
                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '15px' }}>
                                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>✨ ADVANCED EVENT SPECIFICATIONS</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Festival:</span> <br /> <strong>{inspectingBooking.festival_name}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Venue:</span> <br /> <strong>{inspectingBooking.venue}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Pass Type:</span> <br /> <strong>{inspectingBooking.pass_type}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Quantity:</span> <br /> <strong>{inspectingBooking.quantity}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Total Price:</span> <br /> <strong>₹{parseFloat(inspectingBooking.total_price).toLocaleString()}</strong></div>
                                        </div>
                                    </div>
                                )}

                                {inspectingBooking._type === 'sports' && (
                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '15px' }}>
                                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>✨ Registration Details</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Player:</span> <br /> <strong>{inspectingBooking.full_name}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Sport/Tourney:</span> <br /> <strong>{inspectingBooking.tournament_name || 'Individual'}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Category:</span> <br /> <strong>{inspectingBooking.category}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Age:</span> <br /> <strong>{inspectingBooking.age}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Team Name:</span> <br /> <strong>{inspectingBooking.team_name || 'N/A'}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Amount Paid:</span> <br /> <strong>₹{parseFloat(inspectingBooking.price).toLocaleString()}</strong></div>
                                        </div>

                                        {(inspectingBooking.players?.length > 0 || inspectingBooking.substitutes?.length > 0) && (
                                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
                                                {inspectingBooking.players?.length > 0 && (
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '800' }}>Active Squad:</span>
                                                        <div style={{ fontSize: '0.9rem', color: '#1A202C', marginTop: '5px' }}>
                                                            {inspectingBooking.players.join(', ')}
                                                        </div>
                                                    </div>
                                                )}
                                                {inspectingBooking.substitutes?.length > 0 && (
                                                    <div>
                                                        <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '800' }}>Substitutes:</span>
                                                        <div style={{ fontSize: '0.9rem', color: '#1A202C', marginTop: '5px' }}>
                                                            {inspectingBooking.substitutes.join(', ')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {inspectingBooking._type === 'job' && (
                                    <>
                                        <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                                            <label style={labelStyle}>Cover Letter / Message</label>
                                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#1A202C' }}>{inspectingBooking.message}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                            {inspectingBooking.status !== 'Auto-Rejected' && (
                                                <button onClick={() => handleJobStatus(inspectingBooking.id, 'Hired')} style={{ ...manageBtnStyle, background: '#10B981', flex: 1 }}>Hired</button>
                                            )}
                                            <button onClick={() => handleJobStatus(inspectingBooking.id, 'Rejected')} style={{ ...manageBtnStyle, background: '#EF4444', flex: 1 }}>Reject</button>
                                        </div>
                                    </>
                                )}

                                <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                                    {['Pending', 'Confirmed'].includes(inspectingBooking.status) && inspectingBooking._type === 'wedding' && (
                                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                            <button onClick={() => handleStatusUpdate(inspectingBooking.id, 'Approved')} style={{ ...manageBtnStyle, background: '#10B981', flex: 1 }}>Approve & Verify</button>
                                            <button onClick={() => handleStatusUpdate(inspectingBooking.id, 'Rejected')} style={{ ...manageBtnStyle, background: '#EF4444', flex: 1 }}>Reject Booking</button>
                                        </div>
                                    )}
                                    {inspectingBooking.status !== 'Cancelled' && inspectingBooking._type === 'wedding' && inspectingBooking.status !== 'Pending' && (
                                        <button onClick={() => handleStatusUpdate(inspectingBooking.id, 'Cancelled')} style={{ ...manageBtnStyle, background: '#1A202C', flex: 1 }}>Cancel Record</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div >
                )
            }

            {
                showCreateBlog && (
                    <div style={layoutStyles.modalOverlay} onClick={() => setShowCreateBlog(false)}>
                        <div style={{ ...layoutStyles.modalContent, maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                            <div style={layoutStyles.modalHeader}>
                                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>{editingBlog ? 'EDIT STORY' : 'PUBLISH NEW STORY'}</h2>
                                <button onClick={() => setShowCreateBlog(false)} style={layoutStyles.closeBtn}>&times;</button>
                            </div>
                            <div style={{ ...layoutStyles.modalBody, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div><label style={labelStyle}>Headline</label><input style={inputStyle} value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} /></div>
                                    <div><label style={labelStyle}>Author</label><input style={inputStyle} value={blogForm.author} onChange={e => setBlogForm({ ...blogForm, author: e.target.value })} /></div>
                                </div>
                                <div><label style={labelStyle}>Cover Image URL</label><input style={inputStyle} value={blogForm.image} onChange={e => setBlogForm({ ...blogForm, image: e.target.value })} /></div>
                                <div><label style={labelStyle}>Content</label><textarea style={{ ...inputStyle, minHeight: '300px', resize: 'vertical' }} value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} /></div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button onClick={() => { setBlogForm({ ...blogForm, is_published: true }); setTimeout(handleBlogSubmit, 100); }} style={{ ...layoutStyles.actionBtnPrimary, padding: '18px', flex: 2, background: '#10B981', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>🚀 PUBLISH NOW</button>
                                    <button onClick={() => { setBlogForm({ ...blogForm, is_published: false }); setTimeout(handleBlogSubmit, 100); }} style={{ ...layoutStyles.actionBtnPrimary, padding: '18px', flex: 1, background: '#F59E0B', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>💾 SAVE AS DRAFT</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showCreateGallery && (
                    <div style={layoutStyles.modalOverlay} onClick={() => setShowCreateGallery(false)}>
                        <div style={{ ...layoutStyles.modalContent, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                            <div style={layoutStyles.modalHeader}>
                                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>ADD TO GALLERY</h2>
                                <button onClick={() => setShowCreateGallery(false)} style={layoutStyles.closeBtn}>&times;</button>
                            </div>
                            <div style={{ ...layoutStyles.modalBody, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div><label style={labelStyle}>Title</label><input style={inputStyle} value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} /></div>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select style={inputStyle} value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}>
                                        <option value="Wedding">Wedding</option>
                                        <option value="Sangeet">Sangeet</option>
                                        <option value="Mehendi">Mehendi</option>
                                        <option value="Reception">Reception</option>
                                        <option value="Decor">Decor</option>
                                    </select>
                                </div>
                                <div><label style={labelStyle}>Image URL</label><input style={inputStyle} value={galleryForm.image_url} onChange={e => setGalleryForm({ ...galleryForm, image_url: e.target.value })} /></div>
                                <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, minHeight: '100px' }} value={galleryForm.description} onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })} /></div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button onClick={() => { setGalleryForm({ ...galleryForm, is_published: true }); setTimeout(handleGallerySubmit, 100); }} style={{ ...layoutStyles.actionBtnPrimary, padding: '18px', flex: 2, background: '#10B981' }}>🚀 UPLOAD LIVE</button>
                                    <button onClick={() => { setGalleryForm({ ...galleryForm, is_published: false }); setTimeout(handleGallerySubmit, 100); }} style={{ ...layoutStyles.actionBtnPrimary, padding: '18px', flex: 1, background: '#F59E0B' }}>💾 SAVE AS DRAFT</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showCreateDecor && (
                    <div style={layoutStyles.modalOverlay} onClick={() => setShowCreateDecor(false)}>
                        <div style={{ ...layoutStyles.modalContent, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                            <div style={layoutStyles.modalHeader}>
                                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>{editingDecor ? 'EDIT DECORATION' : 'NEW DECORATION OPTION'}</h2>
                                <button onClick={() => setShowCreateDecor(false)} style={layoutStyles.closeBtn}>&times;</button>
                            </div>
                            <div style={{ ...layoutStyles.modalBody, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div><label style={labelStyle}>Option Name</label><input style={inputStyle} placeholder="e.g. Royal Gold Sangeet" value={decorForm.name} onChange={e => setDecorForm({ ...decorForm, name: e.target.value })} /></div>
                                    <div>
                                        <label style={labelStyle}>Event Type</label>
                                        <select style={inputStyle} value={decorForm.category} onChange={e => setDecorForm({ ...decorForm, category: e.target.value })}>
                                            <option value="Wedding">Wedding</option>
                                            <option value="Sangeet">Sangeet</option>
                                            <option value="Mehendi">Mehendi</option>
                                            <option value="Haldi">Haldi</option>
                                            <option value="Reception">Reception</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div><label style={labelStyle}>Price (₹)</label><input type="number" style={inputStyle} value={decorForm.price} onChange={e => setDecorForm({ ...decorForm, price: e.target.value })} /></div>
                                    <div><label style={labelStyle}>Preview URL</label><input style={inputStyle} value={decorForm.image} onChange={e => setDecorForm({ ...decorForm, image: e.target.value })} /></div>
                                </div>
                                <div><label style={labelStyle}>Description / Details</label><textarea style={{ ...inputStyle, minHeight: '100px' }} value={decorForm.description} onChange={e => setDecorForm({ ...decorForm, description: e.target.value })} /></div>
                                <button onClick={handleDecorSubmit} style={{ ...layoutStyles.actionBtnPrimary, padding: '18px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}> {editingDecor ? 'Update Decoration' : '🚀 ADD DECORATION OPTION'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showCreateCatering && (
                    <div style={layoutStyles.modalOverlay} onClick={() => setShowCreateCatering(false)}>
                        <div style={{ ...layoutStyles.modalContent, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                            <div style={layoutStyles.modalHeader}>
                                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>{editingCatering ? 'EDIT CATERING' : 'NEW CATERING SERVICE'}</h2>
                                <button onClick={() => setShowCreateCatering(false)} style={layoutStyles.closeBtn}>&times;</button>
                            </div>
                            <div style={{ ...layoutStyles.modalBody, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div><label style={labelStyle}>Package Name</label><input style={inputStyle} value={cateringForm.name} onChange={e => setCateringForm({ ...cateringForm, name: e.target.value })} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div><label style={labelStyle}>Price per Plate (₹)</label><input type="number" style={inputStyle} value={cateringForm.price_per_plate} onChange={e => setCateringForm({ ...cateringForm, price_per_plate: e.target.value })} /></div>
                                    <div><label style={labelStyle}>Preview URL</label><input style={inputStyle} value={cateringForm.image} onChange={e => setCateringForm({ ...cateringForm, image: e.target.value })} /></div>
                                </div>
                                <div><label style={labelStyle}>Description / Menu Highlights</label><textarea style={{ ...inputStyle, minHeight: '100px' }} value={cateringForm.description} onChange={e => setCateringForm({ ...cateringForm, description: e.target.value })} /></div>
                                <button onClick={handleCateringSubmit} style={{ ...layoutStyles.actionBtnPrimary, padding: '18px', background: '#10B981' }}> {editingCatering ? 'Update Catering' : '🚀 ADD CATERING OPTION'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showCreatePerformer && (
                    <div style={layoutStyles.modalOverlay} onClick={() => setShowCreatePerformer(false)}>
                        <div style={{ ...layoutStyles.modalContent, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                            <div style={layoutStyles.modalHeader}>
                                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>{editingPerformer ? 'EDIT ENTERTAINMENT' : 'NEW ENTERTAINMENT OPTION'}</h2>
                                <button onClick={() => setShowCreatePerformer(false)} style={layoutStyles.closeBtn}>&times;</button>
                            </div>
                            <div style={{ ...layoutStyles.modalBody, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div><label style={labelStyle}>Performer Name</label><input style={inputStyle} value={performerForm.name} onChange={e => setPerformerForm({ ...performerForm, name: e.target.value })} /></div>
                                    <div>
                                        <label style={labelStyle}>Category</label>
                                        <select style={inputStyle} value={performerForm.category} onChange={e => setPerformerForm({ ...performerForm, category: e.target.value })}>
                                            <option value="Singer">Singer</option>
                                            <option value="DJ">DJ</option>
                                            <option value="Dance Troupe">Dance Troupe</option>
                                            <option value="MC/Anchor">MC/Anchor</option>
                                            <option value="Live Band">Live Band</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div><label style={labelStyle}>Base Price (₹)</label><input type="number" style={inputStyle} value={performerForm.price} onChange={e => setPerformerForm({ ...performerForm, price: e.target.value })} /></div>
                                    <div><label style={labelStyle}>Preview URL</label><input style={inputStyle} value={performerForm.image} onChange={e => setPerformerForm({ ...performerForm, image: e.target.value })} /></div>
                                </div>
                                <div><label style={labelStyle}>Description / Bio</label><textarea style={{ ...inputStyle, minHeight: '100px' }} value={performerForm.description} onChange={e => setPerformerForm({ ...performerForm, description: e.target.value })} /></div>
                                <button onClick={handlePerformerSubmit} style={{ ...layoutStyles.actionBtnPrimary, padding: '18px', background: '#8B5CF6' }}> {editingPerformer ? 'Update Entertainment' : '🚀 ADD ENTERTAINMENT'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {editingConcertBooking && (
                <div style={layoutStyles.modalOverlay} onClick={() => setEditingConcertBooking(null)}>
                    <div style={{ ...layoutStyles.modalContent, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div style={layoutStyles.modalHeader}>
                            <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>EDIT CONCERT BOOKING</h2>
                            <button onClick={() => setEditingConcertBooking(null)} style={layoutStyles.closeBtn}>&times;</button>
                        </div>
                        <div style={layoutStyles.modalBody}>
                            <p style={{ marginBottom: '20px' }}>Booking ID: <strong>#{editingConcertBooking.id}</strong> | {editingConcertBooking.concert_title}</p>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Status</label>
                                <select style={inputStyle} value={concertBookingForm.status} onChange={e => setConcertBookingForm({ ...concertBookingForm, status: e.target.value })}>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Ticket Type</label>
                                <input style={inputStyle} value={concertBookingForm.ticket_type} onChange={e => setConcertBookingForm({ ...concertBookingForm, ticket_type: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={labelStyle}>Quantity</label>
                                <input type="number" style={inputStyle} value={concertBookingForm.quantity} onChange={e => setConcertBookingForm({ ...concertBookingForm, quantity: e.target.value })} />
                            </div>
                            <button onClick={handleConcertBookingUpdate} style={{ ...layoutStyles.actionBtnPrimary, width: '100%', padding: '15px' }}>Update Booking</button>
                        </div>
                    </div>
                </div>
            )}

            {editingFestivalBooking && (
                <div style={layoutStyles.modalOverlay} onClick={() => setEditingFestivalBooking(null)}>
                    <div style={{ ...layoutStyles.modalContent, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div style={layoutStyles.modalHeader}>
                            <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>EDIT FESTIVAL BOOKING</h2>
                            <button onClick={() => setEditingFestivalBooking(null)} style={layoutStyles.closeBtn}>&times;</button>
                        </div>
                        <div style={layoutStyles.modalBody}>
                            <p style={{ marginBottom: '20px' }}>Booking ID: <strong>#{editingFestivalBooking.id}</strong> | {editingFestivalBooking.festival_name}</p>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Status</label>
                                <select style={inputStyle} value={festivalBookingForm.status} onChange={e => setFestivalBookingForm({ ...festivalBookingForm, status: e.target.value })}>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Pass Type</label>
                                <input style={inputStyle} value={festivalBookingForm.pass_type} onChange={e => setFestivalBookingForm({ ...festivalBookingForm, pass_type: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={labelStyle}>Quantity</label>
                                <input type="number" style={inputStyle} value={festivalBookingForm.quantity} onChange={e => setFestivalBookingForm({ ...festivalBookingForm, quantity: e.target.value })} />
                            </div>
                            <button onClick={handleFestivalBookingUpdate} style={{ ...layoutStyles.actionBtnPrimary, width: '100%', padding: '15px' }}>Update Booking</button>
                        </div>
                    </div>
                </div>
            )}

            {editingSportsReg && (
                <div style={layoutStyles.modalOverlay} onClick={() => setEditingSportsReg(null)}>
                    <div style={{ ...layoutStyles.modalContent, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div style={layoutStyles.modalHeader}>
                            <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>EDIT SPORTS REGISTRATION</h2>
                            <button onClick={() => setEditingSportsReg(null)} style={layoutStyles.closeBtn}>&times;</button>
                        </div>
                        <div style={layoutStyles.modalBody}>
                            <p style={{ marginBottom: '20px' }}>Reg ID: <strong>#{editingSportsReg.id}</strong> | {editingSportsReg.tournament_name}</p>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Status</label>
                                <select style={inputStyle} value={sportsRegForm.status} onChange={e => setSportsRegForm({ ...sportsRegForm, status: e.target.value })}>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Winner">Winner</option>
                                    <option value="Runner Up">Runner Up (2nd)</option>
                                    <option value="Semi-Finalist">Semi-Finalist</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            {editingSportsReg.registration_type === 'Team' ? (
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={labelStyle}>Team Name</label>
                                    <input style={inputStyle} value={sportsRegForm.team_name} onChange={e => setSportsRegForm({ ...sportsRegForm, team_name: e.target.value })} />
                                </div>
                            ) : (
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={labelStyle}>Player Name</label>
                                    <input style={inputStyle} value={sportsRegForm.player_name} onChange={e => setSportsRegForm({ ...sportsRegForm, player_name: e.target.value })} />
                                </div>
                            )}

                            {(sportsRegForm.status === 'Winner' || sportsRegForm.status === 'Semi-Finalist') && (
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>🏆 PRIZE & PAYOUT</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={labelStyle}>Payout Amount (₹)</label>
                                            <input type="number" style={inputStyle} value={sportsRegForm.winning_amount || 0} onChange={e => setSportsRegForm({ ...sportsRegForm, winning_amount: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Payout Status</label>
                                            <select style={inputStyle} value={sportsRegForm.prize_status || 'Pending'} onChange={e => setSportsRegForm({ ...sportsRegForm, prize_status: e.target.value })}>
                                                <option value="Pending">Pending</option>
                                                <option value="Paid">Paid</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button onClick={handleSportsRegUpdate} style={{ ...layoutStyles.actionBtnPrimary, width: '100%', padding: '15px' }}>Update Registration</button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateFixture && (
                <div style={layoutStyles.modalOverlay} onClick={() => { setShowCreateFixture(false); setEditingFixture(null); }}>
                    <div style={{ ...layoutStyles.modalContent, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div style={layoutStyles.modalHeader}>
                            <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>{editingFixture ? 'UPDATE MATCH RESULT' : 'SCHEDULE NEW MATCH'}</h2>
                            <button onClick={() => { setShowCreateFixture(false); setEditingFixture(null); }} style={layoutStyles.closeBtn}>&times;</button>
                        </div>
                        <div style={layoutStyles.modalBody}>
                            {editingFixture ? (
                                <div>
                                    <p style={{ marginBottom: '15px' }}>Match: <strong>{editingFixture.player1_name} VS {editingFixture.player2_name}</strong></p>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={labelStyle}>Match Winner</label>
                                        <select style={inputStyle} value={fixtureForm.winner} onChange={e => setFixtureForm({ ...fixtureForm, winner: e.target.value })}>
                                            <option value="">Select Winner</option>
                                            <option value={editingFixture.player1}>{editingFixture.player1_name}</option>
                                            <option value={editingFixture.player2}>{editingFixture.player2_name}</option>
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input 
                                            type="checkbox" 
                                            id="isFinalUpdate" 
                                            checked={fixtureForm.is_final} 
                                            onChange={e => setFixtureForm({ ...fixtureForm, is_final: e.target.checked })} 
                                        />
                                        <label htmlFor="isFinalUpdate" style={{ ...labelStyle, marginBottom: 0, color: '#E63946', fontWeight: '900' }}>
                                            THIS IS THE FINAL MATCH (Concludes Tournament)
                                        </label>
                                    </div>
                                    <div style={{ marginBottom: '25px' }}>
                                        <label style={labelStyle}>Status</label>
                                        <select style={inputStyle} value={fixtureForm.status} onChange={e => setFixtureForm({ ...fixtureForm, status: e.target.value })}>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={labelStyle}>Tournament</label>
                                        <select style={inputStyle} value={fixtureForm.tournament} onChange={e => setFixtureForm({ ...fixtureForm, tournament: e.target.value })}>
                                            <option value="">Select Tournament</option>
                                            {tournaments.filter(t => t.status !== 'Completed').map(t => <option key={t.id} value={t.id}>{t.name} ({t.status})</option>)}
                                        </select>
                                        {fixtureForm.tournament && tournaments.find(t => t.id === parseInt(fixtureForm.tournament))?.status === 'Completed' && (
                                            <div style={{ color: '#E63946', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '5px' }}>
                                                ⚠️ This tournament is already COMPLETED.
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={labelStyle}>Side 1 (Team/Player)</label>
                                        <select disabled={!fixtureForm.tournament} style={inputStyle} value={fixtureForm.player1} onChange={e => setFixtureForm({ ...fixtureForm, player1: e.target.value })}>
                                            <option value="">Select Participant</option>
                                            {registrations.filter(r => r.tournament === parseInt(fixtureForm.tournament)).map(r => <option key={r.id} value={r.id}>{r.team_name || r.player_name || r.username}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={labelStyle}>Side 2 (Team/Player)</label>
                                        <select disabled={!fixtureForm.tournament} style={inputStyle} value={fixtureForm.player2} onChange={e => setFixtureForm({ ...fixtureForm, player2: e.target.value })}>
                                            <option value="">Select Participant</option>
                                            {registrations.filter(r => r.tournament === parseInt(fixtureForm.tournament) && r.id != fixtureForm.player1).map(r => <option key={r.id} value={r.id}>{r.team_name || r.player_name || r.username}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                        <div>
                                            <label style={labelStyle}>OR P1 TBD Label</label>
                                            <input placeholder="e.g. Winner of Match #1" style={inputStyle} value={fixtureForm.player1_tbd_label} onChange={e => setFixtureForm({ ...fixtureForm, player1_tbd_label: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>OR P2 TBD Label</label>
                                            <input placeholder="e.g. Winner of Match #2" style={inputStyle} value={fixtureForm.player2_tbd_label} onChange={e => setFixtureForm({ ...fixtureForm, player2_tbd_label: e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input 
                                            type="checkbox" 
                                            id="isFinalCreate" 
                                            checked={fixtureForm.is_final} 
                                            onChange={e => setFixtureForm({ ...fixtureForm, is_final: e.target.checked })} 
                                        />
                                        <label htmlFor="isFinalCreate" style={{ ...labelStyle, marginBottom: 0, color: '#E63946', fontWeight: '900' }}>
                                            SCHEDULE AS FINAL MATCH
                                        </label>
                                    </div>
                                    <div style={{ marginBottom: '25px' }}>
                                        <label style={labelStyle}>Match Date/Time</label>
                                        {(() => {
                                            const selectedT = tournaments.find(t => Number(t.id) === Number(fixtureForm.tournament));
                                            return (
                                                <input 
                                                    type="datetime-local" 
                                                    style={inputStyle} 
                                                    min={selectedT?.start_date ? `${selectedT.start_date}T00:00` : ''}
                                                    max={selectedT?.end_date ? `${selectedT.end_date}T23:59` : ''}
                                                    value={fixtureForm.match_date} 
                                                    onChange={e => setFixtureForm({ ...fixtureForm, match_date: e.target.value })} 
                                                />
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                            <button onClick={handleFixtureSubmit} style={{ ...layoutStyles.actionBtnPrimary, width: '100%', padding: '15px' }}>{editingFixture ? 'Save Result' : 'Schedule Match'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateConcert && (
                <div style={layoutStyles.modalOverlay} onClick={() => setShowCreateConcert(false)}>
                    <div style={{ ...layoutStyles.modalContent, maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
                        <div style={layoutStyles.modalHeader}>
                            <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>{editingConcert ? 'EDIT CONCERT' : 'NEW CONCERT'}</h2>
                            <button onClick={() => setShowCreateConcert(false)} style={layoutStyles.closeBtn}>&times;</button>
                        </div>
                        <div style={{ ...layoutStyles.modalBody, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div><label style={labelStyle}>Concert Title</label><input style={inputStyle} value={concertForm.title} onChange={e => setConcertForm({ ...concertForm, title: e.target.value })} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>Artist</label><input style={inputStyle} value={concertForm.artist} onChange={e => setConcertForm({ ...concertForm, artist: e.target.value })} /></div>
                                <div><label style={labelStyle}>Genre</label><input style={inputStyle} value={concertForm.genre} onChange={e => setConcertForm({ ...concertForm, genre: e.target.value })} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>Date</label><input type="date" style={inputStyle} value={concertForm.date} onChange={e => setConcertForm({ ...concertForm, date: e.target.value })} /></div>
                                <div><label style={labelStyle}>Time</label><input placeholder="e.g. 7:00 PM" style={inputStyle} value={concertForm.time} onChange={e => setConcertForm({ ...concertForm, time: e.target.value })} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>City</label><input style={inputStyle} value={concertForm.city} onChange={e => setConcertForm({ ...concertForm, city: e.target.value })} /></div>
                                <div><label style={labelStyle}>Venue</label><input style={inputStyle} value={concertForm.venue} onChange={e => setConcertForm({ ...concertForm, venue: e.target.value })} /></div>
                            </div>
                            <div><label style={labelStyle}>Artist Biography</label><textarea style={{ ...inputStyle, minHeight: '60px' }} value={concertForm.artistBio} onChange={e => setConcertForm({ ...concertForm, artistBio: e.target.value })} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>Banner Image URL</label><input style={inputStyle} value={concertForm.bannerImage} onChange={e => setConcertForm({ ...concertForm, bannerImage: e.target.value })} /></div>
                                <div><label style={labelStyle}>Thumbnail URL</label><input style={inputStyle} value={concertForm.thumbnail} onChange={e => setConcertForm({ ...concertForm, thumbnail: e.target.value })} /></div>
                            </div>
                            <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, minHeight: '80px' }} value={concertForm.description} onChange={e => setConcertForm({ ...concertForm, description: e.target.value })} /></div>

                            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />
                            <h3 style={{ fontSize: '0.8rem', marginBottom: '15px', color: '#1D3557', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>✨</span> ADVANCED EVENT SPECIFICATIONS (SIMPLE TEXT)
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>Booking Deadline</label><input type="date" style={inputStyle} value={concertForm.booking_deadline} onChange={e => setConcertForm({ ...concertForm, booking_deadline: e.target.value })} /></div>
                                <div><label style={labelStyle}>Popular Tracks (Comma separated)</label><textarea style={{ ...inputStyle, minHeight: '60px' }} value={concertForm.popularTracks} onChange={e => setConcertForm({ ...concertForm, popularTracks: e.target.value })} placeholder='Track 1, Track 2' /></div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>Highlights (Key:Value, Key:Value)</label><textarea style={{ ...inputStyle, minHeight: '60px' }} value={concertForm.highlights} onChange={e => setConcertForm({ ...concertForm, highlights: e.target.value })} placeholder='Duration: 2h, Stage: Main' /></div>
                                <div><label style={labelStyle}>Tickets (Type | Price per line)</label><textarea style={{ ...inputStyle, minHeight: '60px' }} value={concertForm.tickets} onChange={e => setConcertForm({ ...concertForm, tickets: e.target.value })} placeholder='General | 500&#10;VIP | 1500' /></div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>Schedule (Time | Act per line)</label><textarea style={{ ...inputStyle, minHeight: '60px' }} value={concertForm.schedule} onChange={e => setConcertForm({ ...concertForm, schedule: e.target.value })} placeholder='7 PM | Opening&#10;8 PM | Main' /></div>
                                <div><label style={labelStyle}>Rules (Comma separated)</label><textarea style={{ ...inputStyle, minHeight: '60px' }} value={concertForm.rules} onChange={e => setConcertForm({ ...concertForm, rules: e.target.value })} placeholder='No Smoking, No Outside Food' /></div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>FAQs (Question | Answer per line)</label><textarea style={{ ...inputStyle, minHeight: '60px' }} value={concertForm.faqs} onChange={e => setConcertForm({ ...concertForm, faqs: e.target.value })} placeholder='Parking? | Yes&#10;Camera? | No' /></div>
                                <div><label style={labelStyle}>Sponsors (Name | Logo URL per line)</label><textarea style={{ ...inputStyle, minHeight: '60px' }} value={concertForm.sponsors} onChange={e => setConcertForm({ ...concertForm, sponsors: e.target.value })} placeholder='Brand | http://logo.url' /></div>
                            </div>

                            <button onClick={handleConcertSubmit} style={{ ...layoutStyles.actionBtnPrimary, padding: '15px', marginTop: '20px' }}>{editingConcert ? 'Save All Changes' : 'Create Concert'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateFestival && (
                <div style={layoutStyles.modalOverlay} onClick={() => setShowCreateFestival(false)}>
                    <div style={{ ...layoutStyles.modalContent, maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
                        <div style={layoutStyles.modalHeader}>
                            <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900' }}>{editingFestival ? 'EDIT FESTIVAL' : 'NEW FESTIVAL'}</h2>
                            <button onClick={() => setShowCreateFestival(false)} style={layoutStyles.closeBtn}>&times;</button>
                        </div>
                        <div style={{ ...layoutStyles.modalBody, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {/* Required Fields Banner */}
                            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '10px 18px', fontSize: '12px', color: '#C2410C', fontWeight: '700' }}>
                                Fields marked with <span style={{ color: '#EF4444' }}>*</span> are required to publish the festival.
                            </div>

                            {/* MANDATORY SECTION */}
                            <div><label style={labelStyle}>Festival Name <span style={{ color: '#EF4444' }}>*</span></label><input style={inputStyle} placeholder='e.g. Holi Neon Bash' value={festivalForm.name} onChange={e => setFestivalForm({ ...festivalForm, name: e.target.value })} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>City <span style={{ color: '#EF4444' }}>*</span></label><input style={inputStyle} placeholder='e.g. Jaipur' value={festivalForm.city} onChange={e => setFestivalForm({ ...festivalForm, city: e.target.value })} /></div>
                                <div><label style={labelStyle}>Venue <span style={{ color: '#EF4444' }}>*</span></label><input style={inputStyle} placeholder='e.g. Polo Ground' value={festivalForm.venue} onChange={e => setFestivalForm({ ...festivalForm, venue: e.target.value })} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>Start Date <span style={{ color: '#EF4444' }}>*</span></label><input type="date" style={inputStyle} value={festivalForm.startDate} onChange={e => setFestivalForm({ ...festivalForm, startDate: e.target.value })} /></div>
                                <div><label style={labelStyle}>End Date <span style={{ color: '#EF4444' }}>*</span></label><input type="date" style={inputStyle} value={festivalForm.endDate} onChange={e => setFestivalForm({ ...festivalForm, endDate: e.target.value })} /></div>
                            </div>
                            <div><label style={labelStyle}>Festival Banner Image URL <span style={{ color: '#EF4444' }}>*</span></label><input style={inputStyle} placeholder='https://...' value={festivalForm.image} onChange={e => setFestivalForm({ ...festivalForm, image: e.target.value })} /></div>
                            <div><label style={labelStyle}>About Festival <span style={{ color: '#EF4444' }}>*</span></label><textarea style={{ ...inputStyle, minHeight: '80px' }} placeholder='Describe the festival experience...' value={festivalForm.about} onChange={e => setFestivalForm({ ...festivalForm, about: e.target.value })} /></div>
                            <div>
                                <label style={labelStyle}>Event Time (e.g. 5:00 PM onwards) <span style={{ color: '#EF4444' }}>*</span></label>
                                <input style={inputStyle} placeholder='e.g. 6:00 PM' value={festivalForm.time} onChange={e => setFestivalForm({ ...festivalForm, time: e.target.value })} />
                            </div>
                            <div>
                                <label style={labelStyle}>Highlights <span style={{ color: '#EF4444' }}>*</span> — icon | label | detail (one per line)</label>
                                <textarea style={{ ...inputStyle, minHeight: '80px' }} value={festivalForm.highlights} onChange={e => setFestivalForm({ ...festivalForm, highlights: e.target.value })} placeholder={'🎵 | Live Music | 50+ Artists\n🍜 | Food Court | 200 Stalls\n🎪 | Activities | Fun for All'} />
                            </div>
                            <div>
                                <label style={labelStyle}>Passes <span style={{ color: '#EF4444' }}>*</span> — type | price | benefits | days (one per line)</label>
                                <textarea style={{ ...inputStyle, minHeight: '80px' }} value={festivalForm.passes} onChange={e => setFestivalForm({ ...festivalForm, passes: e.target.value })} placeholder={'Day Pass | 1000 | Entry + Food | 1 Day\nWeekend Pass | 2500 | All Access | 2 Days'} />
                            </div>

                            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #eee' }} />
                            <h3 style={{ fontSize: '0.75rem', marginBottom: '5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>
                                <span>✨</span> Optional Details — Enhance the festival page
                            </h3>
                            <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '5px' }}>These sections are optional but enhance the user-facing festival detail page.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>Theme (Style)</label><input style={inputStyle} placeholder='e.g. Cultural Heritage' value={festivalForm.theme} onChange={e => setFestivalForm({ ...festivalForm, theme: e.target.value })} /></div>
                                <div><label style={labelStyle}>Booking Deadline</label><input type="date" style={inputStyle} value={festivalForm.booking_deadline} onChange={e => setFestivalForm({ ...festivalForm, booking_deadline: e.target.value })} /></div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={labelStyle}>Signature Experiences — image | name | description (one per line)</label>
                                    <textarea style={{ ...inputStyle, minHeight: '80px' }} value={festivalForm.attractions} onChange={e => setFestivalForm({ ...festivalForm, attractions: e.target.value })} placeholder={'https://img.url | Ferris Wheel | Enjoy panoramic views\nhttps://img.url | Food Zone | 200+ cuisine stalls'} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Celebration Program — day | event (one per line)</label>
                                    <textarea style={{ ...inputStyle, minHeight: '80px' }} value={festivalForm.schedule} onChange={e => setFestivalForm({ ...festivalForm, schedule: e.target.value })} placeholder={'Day 1 | Opening Ceremony & Music\nDay 2 | Cultural Dance & Food Fest'} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                <div>
                                    <label style={labelStyle}>Rules & Guidelines (comma separated)</label>
                                    <textarea style={{ ...inputStyle, minHeight: '80px' }} value={festivalForm.rules} onChange={e => setFestivalForm({ ...festivalForm, rules: e.target.value })} placeholder={'No outside food, No smoking, Carry valid ID'} />
                                </div>
                            </div>

                            <div><label style={labelStyle}>FAQs — question | answer (one per line)</label><textarea style={{ ...inputStyle, minHeight: '70px' }} value={festivalForm.faqs} onChange={e => setFestivalForm({ ...festivalForm, faqs: e.target.value })} placeholder={'Is it pet friendly? | No\nIs parking available? | Yes, free parking'} /></div>

                            <button onClick={handleFestivalSubmit} style={{ ...layoutStyles.actionBtnPrimary, padding: '15px', marginTop: '20px' }}>{editingFestival ? 'Save All Changes' : 'Create Festival'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateTournament && (
                <div style={layoutStyles.modalOverlay} onClick={() => setShowCreateTournament(false)}>
                    <div style={{ ...layoutStyles.modalContent, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div style={layoutStyles.modalHeader}>
                            <h2 style={{ fontSize: '0.85rem', margin: 0, fontWeight: '900' }}>{editingTournament ? 'EDIT TOURNAMENT' : 'NEW TOURNAMENT'}</h2>
                            <button onClick={() => setShowCreateTournament(false)} style={layoutStyles.closeBtn}>&times;</button>
                        </div>
                        <div style={{ ...layoutStyles.modalBody, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div><label style={labelStyle}>Tournament Name</label><input style={inputStyle} value={tournamentForm.name} onChange={e => setTournamentForm({ ...tournamentForm, name: e.target.value })} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select style={inputStyle} value={tournamentForm.category} onChange={e => setTournamentForm({ ...tournamentForm, category: e.target.value, sport: '' })}>
                                        <option value="Team">Team Game</option>
                                        <option value="Individual">Solo / Individual</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Select Sport</label>
                                    <select style={inputStyle} value={tournamentForm.sport} onChange={e => setTournamentForm({ ...tournamentForm, sport: e.target.value })}>
                                        <option value="">-- Select Sport --</option>
                                        {tournamentForm.category === 'Team' ? (
                                            <>
                                                <option value="Cricket">Cricket (11+2)</option>
                                                <option value="Football">Football (11+5)</option>
                                                <option value="Volleyball">Volleyball (6+2)</option>
                                                <option value="Polo">Polo (4+2)</option>
                                                <option value="Kabaddi">Kabaddi (7+5)</option>
                                                <option value="Relay Race">Relay Race</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Archery">Archery</option>
                                                <option value="Boxing">Boxing</option>
                                                <option value="Tennis">Tennis</option>
                                                <option value="chess">Chess</option>
                                                <option value="badminton">Badminton</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={labelStyle}>Start Date</label><input type="date" style={inputStyle} value={tournamentForm.start_date} onChange={e => setTournamentForm({ ...tournamentForm, start_date: e.target.value })} /></div>
                                <div><label style={labelStyle}>End Date</label><input type="date" style={inputStyle} value={tournamentForm.end_date} onChange={e => setTournamentForm({ ...tournamentForm, end_date: e.target.value })} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={labelStyle}>Reg Deadline</label>
                                    <input 
                                        type="date" 
                                        style={inputStyle} 
                                        max={tournamentForm.start_date ? (() => {
                                            const d = new Date(tournamentForm.start_date);
                                            d.setDate(d.getDate() - 10);
                                            return d.toISOString().split('T')[0];
                                        })() : undefined}
                                        value={tournamentForm.registration_deadline} 
                                        onChange={e => setTournamentForm({ ...tournamentForm, registration_deadline: e.target.value })} 
                                    />
                                </div>
                                <div><label style={labelStyle}>Max Teams/Participants</label><input type="number" style={inputStyle} value={tournamentForm.max_teams} onChange={e => setTournamentForm({ ...tournamentForm, max_teams: e.target.value })} /></div>
                            </div>
                            <div>
                                <label style={labelStyle}>Status</label>
                                <select style={inputStyle} value={tournamentForm.status} onChange={e => setTournamentForm({ ...tournamentForm, status: e.target.value })}>
                                    <option value="Registration Open">Registration Open</option>
                                    <option value="Registration Closed">Registration Closed</option>
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Full/Closed">Full/Closed</option>
                                </select>
                            </div>
                            <div><label style={labelStyle}>Tournament Image URL</label><input style={inputStyle} value={tournamentForm.image} onChange={e => setTournamentForm({ ...tournamentForm, image: e.target.value })} /></div>
                            <button onClick={handleTournamentSubmit} style={{ ...layoutStyles.actionBtnPrimary, padding: '15px' }}>{editingTournament ? 'Save Changes' : 'Create Tournament'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateWeddingEvent && (
                <div style={layoutStyles.modalOverlay} onClick={() => setShowCreateWeddingEvent(false)}>
                    <div style={{ ...layoutStyles.modalContent, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div style={layoutStyles.modalHeader}>
                            <h2 style={{ fontSize: '0.85rem', margin: 0, fontWeight: '900' }}>{editingWeddingEvent ? 'EDIT CEREMONY TYPE' : 'ADD NEW CEREMONY'}</h2>
                            <button onClick={() => setShowCreateWeddingEvent(false)} style={layoutStyles.closeBtn}>&times;</button>
                        </div>
                        <div style={{ ...layoutStyles.modalBody, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Ceremony Name (e.g., Sangeet, Mehendi)</label>
                                <input style={inputStyle} value={weddingEventForm.name} onChange={e => setWeddingEventForm({ ...weddingEventForm, name: e.target.value })} placeholder="Enter ceremony name..." />
                            </div>
                            <div>
                                <label style={labelStyle}>Description / What's Included</label>
                                <textarea style={{ ...inputStyle, minHeight: '100px' }} value={weddingEventForm.description} onChange={e => setWeddingEventForm({ ...weddingEventForm, description: e.target.value })} placeholder="Describe the ceremony details..." />
                            </div>
                             <div>
                                <label style={labelStyle}>Cover Image URL</label>
                                <input style={inputStyle} value={weddingEventForm.image} onChange={e => setWeddingEventForm({ ...weddingEventForm, image: e.target.value })} placeholder="https://..." />
                            </div>
                            


                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--light, #f8fafc)', padding: '15px', borderRadius: '12px' }}>
                                <input type="checkbox" id="ceremony_visible" checked={weddingEventForm.is_visible} onChange={e => setWeddingEventForm({ ...weddingEventForm, is_visible: e.target.checked })} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                <label htmlFor="ceremony_visible" style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>Visible to users on website</label>
                            </div>
                            <button onClick={handleWeddingEventSubmit} style={{ ...layoutStyles.actionBtnPrimary, padding: '15px', background: '#0F172A' }}>
                                {editingWeddingEvent ? 'Update Ceremony' : 'Save Ceremony Type'}
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
        </div >
    );
};

const layoutStyles = {
    dashboardWrapper: { display: 'flex', height: '100vh', backgroundColor: 'var(--bg-main, #F0F2F5)', fontFamily: 'Inter, sans-serif', overflow: 'hidden' },
    sidebar: { width: '280px', backgroundColor: '#0F172A', color: '#fff', display: 'flex', flexDirection: 'column', padding: '30px 20px', flexShrink: 0 },
    logoSection: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '50px', padding: '0 10px' },
    logoCircle: { width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 10px 15px -3px rgba(30,64,175,0.4)' },
    logoText: { fontSize: '1.3rem', fontWeight: '900', letterSpacing: '1px', color: '#F8FAFC' },
    nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    navItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', textAlign: 'left', transition: '0.2s all ease', fontSize: '1.05rem', fontWeight: '700' },
    sidebarFooter: { borderTop: '1px solid #1E293B', paddingTop: '20px' },
    signOutBtn: { width: '100%', padding: '14px', background: '#EF444415', color: '#EF4444', border: '1px solid #EF444430', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', transition: '0.3s' },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { height: '85px', backgroundColor: 'var(--bg-card, #fff)', borderBottom: '1px solid var(--border, #E2E8F0)', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
    headerTitle: { fontSize: '1.6rem', fontWeight: '900', color: 'var(--dark, #0F172A)', letterSpacing: '-0.5px' },
    userBadge: { display: 'flex', alignItems: 'center', gap: '15px' },
    userAvatar: { width: '45px', height: '45px', borderRadius: '14px', backgroundColor: 'var(--light, #F1F5F9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: 'var(--dark, #1E293B)', border: '1px solid var(--border, #E2E8F0)' },
    scrollArea: { flex: 1, overflowY: 'auto', padding: '40px', scrollBehavior: 'smooth' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' },
    card: { backgroundColor: 'var(--bg-card, #fff)', borderRadius: '20px', border: '1px solid var(--border, #E2E8F0)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', overflow: 'hidden' },
    cardHeader: { padding: '24px 30px', borderBottom: '1px solid var(--border, #F1F5F9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card, #fff)' },
    actionBtnPrimary: { padding: '12px 24px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '1rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' },
    actionBtnAlt: { padding: '12px 24px', background: 'var(--light, #F8FAFC)', color: 'var(--gray, #475569)', border: '1px solid var(--border, #E2E8F0)', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '1rem' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: 'var(--light, #F8FAFC)' },
    tr: { borderBottom: '1px solid var(--border, #F1F5F9)', transition: '0.2s' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' },
    modalContent: { backgroundColor: 'var(--bg-card, #fff)', width: '100%', maxWidth: '650px', borderRadius: '24px', overflowY: 'auto', maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', color: 'var(--text-main, #334155)' },
    modalHeader: { padding: '25px 35px', borderBottom: '1px solid var(--border, #F1F5F9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--light, #F8FAFC)' },
    modalBody: { padding: '35px' },
    closeBtn: { fontSize: '1.8rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray, #94A3B8)', fontWeight: '300' }
};

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--gray, #64748B)', marginBottom: '8px' };
const textValueStyle = { margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--dark, #0F172A)' };
const statusBadge = { padding: '5px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' };
const actionBtn = { padding: '8px 16px', border: 'none', borderRadius: '8px', background: '#0F172A', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '800' };
const thStyle = { padding: '14px 18px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '900', color: 'var(--gray, #64748B)', textTransform: 'uppercase', letterSpacing: '1px' };
const tdStyle = { padding: '16px 18px', fontSize: '1rem', color: 'var(--text-main, #334155)' };
const inputStyle = { width: '100%', padding: '12px 16px', fontSize: '1rem', borderRadius: '8px', border: '1px solid var(--border, #E2E8F0)', outline: 'none', background: 'var(--light, #F8FAFC)', fontWeight: '600', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', color: 'var(--text-main, #334155)' };
const manageBtnStyle = { padding: '12px', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', transition: '0.3s' };

const StatCard = ({ title, value, color, icon, isCurrency, onClick }) => (
    <div
        onClick={onClick}
        style={{
            backgroundColor: 'var(--bg-card, #fff)',
            padding: '25px',
            borderRadius: '22px',
            border: '1px solid var(--border, #E2E8F0)',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)',
            borderTop: `6px solid ${color}`,
            cursor: onClick ? 'pointer' : 'default',
            transition: '0.2s transform ease',
            transform: onClick ? 'scale(1)' : 'none',
            color: 'var(--text-main, #0F172A)'
        }}
        onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'scale(1.02)')}
        onMouseLeave={e => onClick && (e.currentTarget.style.transform = 'scale(1)')}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
                <div style={{ color: 'var(--gray, #64748B)', fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--dark, #0F172A)' }}>
                    {value === '-' ? '-' : isCurrency ? `₹${(parseFloat(value) || 0).toLocaleString()}` : value}
                </div>
            </div>
            <div style={{ fontSize: '2.2rem', opacity: 0.8 }}>{icon}</div>
        </div>
    </div>
);

export default SimpleAdminDashboard;
