import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';

const EventDetailsExplorer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedId, setSelectedId] = useState(1);
    const [loading, setLoading] = useState(false);

    const eventTypes = [
        {
            id: 1,
            name: 'Imperial Weddings',
            description: 'Experience the magic of luxury weddings tailored to your dreams. From destination beachfront vows to royal palace ceremonies, we handle every detail including catering, decoration, and entertainment.',
            image: '/cat_dest_wedding.png',
            buttonText: 'Plan Your Wedding',
            type: 'Wedding'
        },
        {
            id: 2,
            name: 'Grand Concerts',
            description: 'Electrify your audience with world-class concert planning. From legendary rock bands to soulful orchestral symphonies, we create immersive musical experiences with state-of-the-art sound and light shows.',
            image: 'https://static.wixstatic.com/media/e58806_63c508b8d9bb4472b88ca35878a27b90~mv2.png/v1/fill/w_724,h_482,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/e58806_63c508b8d9bb4472b88ca35878a27b90~mv2.png',
            buttonText: 'See Concerts',
            type: 'Concert'
        },
        {
            id: 3,
            name: 'Cultural Festivals',
            description: 'Celebrate the soul of tradition with grand festival planning. From vibrant Navratri Dandiya to colorful Holi Mahotsav, we manage high-traffic cultural events with energetic vibes and celebratory decor.',
            image: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/201910/bokeh-1879081_960_720.jpeg?size=690:388',
            buttonText: 'Join Festival',
            type: 'Festival'
        },
        {
            id: 4,
            name: 'Elite Sports Events',
            description: 'Unleash the athlete within with professionally managed sports tournaments and marathons. From City Premier Leagues to high-stakes endurance runs, we provide digital scoring, certified officials, and world-class venue management.',
            image: 'https://i.pinimg.com/736x/c7/45/16/c74516012a503eb72f3df428e15e6467.jpg',
            buttonText: 'Compete Now',
            type: 'Sports'
        }
    ];

    useEffect(() => {
        const s = (location && location.state) || {};
        if (s.openService) {
            const target = eventTypes.find(t => t.name.toLowerCase() === s.openService.toLowerCase());
            if (target) {
                setSelectedId(target.id);
            }
        }
    }, [location]);

    const selectedEvent = eventTypes.find(t => t.id === selectedId);

    const handleAction = () => {
        if (!selectedEvent) return;

        if (selectedEvent.type === 'Wedding') {
            navigate('/wedding-details');
        } else if (selectedEvent.type === 'Concert') {
            navigate('/concerts');
        } else if (selectedEvent.type === 'Festival') {
            navigate('/festivals');
        } else if (selectedEvent.type === 'Sports') {
            navigate('/sports');
        } else {
            // Navigate to Event Selection Page for others
            navigate('/event-selection', { state: { category: 'Weddings' } }); // Default fallback
        }
    };

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '100px' }}>
            <Navbar />

            <div style={{ padding: '60px 40px', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-start' }}>

                    {/* Sidebar Container */}
                    <div style={{ flex: '0 0 350px' }}>
                        <h2 style={{
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '3px',
                            color: '#888',
                            marginBottom: '30px',
                            fontWeight: '700'
                        }}>EXCLUSIVE SERVICES</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {eventTypes.map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => setSelectedId(type.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        padding: '24px',
                                        borderRadius: '16px',
                                        backgroundColor: selectedId === type.id ? '#1A1A1A' : '#FAFAFA',
                                        color: selectedId === type.id ? '#fff' : '#1A1A1A',
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        border: '1px solid #eee',
                                        boxShadow: selectedId === type.id ? '0 15px 30px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        backgroundColor: '#ddd'
                                    }}>
                                        <img src={type.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <span style={{
                                        fontWeight: '700',
                                        fontSize: '1.2rem',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {type.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Detail View */}
                    <div style={{ flex: 1, padding: '40px', backgroundColor: '#F9F4E8', borderRadius: '30px', minHeight: '600px', position: 'relative', overflow: 'hidden' }}>
                        {selectedEvent ? (
                            <div key={selectedEvent.id} style={{ animation: 'slideUp 0.6s ease' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                                    <h3 style={{
                                        fontSize: '4rem',
                                        color: '#1A1A1A',
                                        fontFamily: 'serif',
                                        margin: 0
                                    }}>{selectedEvent.name}</h3>
                                    <div style={{ fontSize: '5rem', opacity: '0.1', position: 'absolute', top: '20px', right: '40px' }}>
                                        {selectedEvent.name.charAt(0)}
                                    </div>
                                </div>

                                <div style={{ width: '100%', height: '350px', borderRadius: '20px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                                    <img src={selectedEvent.image} alt={selectedEvent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>

                                <p style={{
                                    fontSize: '1.4rem',
                                    lineHeight: '1.8',
                                    color: '#444',
                                    marginBottom: '50px',
                                    maxWidth: '900px',
                                    fontWeight: '300'
                                }}>{selectedEvent.description}</p>

                                <button
                                    onClick={handleAction}
                                    style={{
                                        padding: '22px 60px',
                                        backgroundColor: '#C4A059',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '50px',
                                        fontSize: '1.2rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: '3px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 10px 30px rgba(196, 160, 89, 0.4)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.08)';
                                        e.currentTarget.style.backgroundColor = '#C4A059';
                                        e.currentTarget.style.filter = 'brightness(1.2)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.backgroundColor = '#C4A059';
                                        e.currentTarget.style.filter = 'brightness(1)';
                                    }}
                                >
                                    {selectedEvent.buttonText}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default EventDetailsExplorer;
