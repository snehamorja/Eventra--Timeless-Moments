import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [winners, setWinners] = React.useState([]);

    React.useEffect(() => {
        const fetchWinners = async () => {
            try {
                const res = await api.get('/sports-registrations/');
                const list = res.data || [];
                const winList = list.filter(r => r.status === 'Winner');
                setWinners(winList);
            } catch (e) {}
        };
        fetchWinners();
    }, []);

    const cards = [
        { title: 'Weddings', icon: '💍', type: 'Wedding', description: 'Plan your dream destination or local wedding.' },
        { title: 'Events', icon: '🎉', type: 'Event', description: 'Corporate galas, parties, and exclusive gatherings.' },
        { title: 'Decorations', icon: '✨', type: 'Decoration', description: 'Exquisite floral and thematic styling for any occasion.' },
        { title: 'Performers', icon: '🎻', type: 'Performer', description: 'Top-tier entertainers, bands, and live music.' },
        { title: 'Venues', icon: '🏰', type: 'Venue', description: 'Access to the world\'s most exclusive locations.' },
        { title: 'Catering', icon: '🍽️', type: 'Catering', description: 'Gourmet dining experiences tailored to your taste.' },
        { title: 'Concerts', icon: '🎸', type: 'Concert', description: 'Legendary live performances and world-class stage setups.' },
        { title: 'Festivals', icon: '🎊', type: 'Festival', description: 'Vibrant cultural celebrations with energetic vibes and decor.' },
        { title: 'Sports', icon: '🏆', type: 'Sports', description: 'Join thrilling tournaments and showcase your athletic skills.' }
    ];

    const handleClick = (type) => {
        if (type === 'Decoration') {
            navigate('/decoration-catalogue');
        } else if (type === 'Concert') {
            navigate('/dashboard', { state: { openService: 'Grand Concerts' } });
        } else if (type === 'Festival') {
            navigate('/dashboard', { state: { openService: 'Cultural Festivals' } });
        } else if (type === 'Sports') {
            navigate('/sports');
        } else {
            navigate('/book-event', { state: { eventType: type } });
        }
    };

    return (
        <div style={{ backgroundColor: '#F9F4E8', minHeight: '100vh', paddingBottom: '80px' }}>
            <Navbar />
            <div style={{ padding: '60px 40px', maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontFamily: 'serif', fontSize: '3.5rem', color: '#1A1A1A', marginBottom: '10px' }}>
                        Your Planning Suite
                    </h1>
                    <p style={{ color: '#666', fontSize: '1.1rem', letterSpacing: '1px' }}>
                        CHOOSE A CATEGORY TO BEGIN YOUR JOURNEY
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => handleClick(card.type)}
                            style={{
                                backgroundColor: '#fff',
                                padding: '50px 30px',
                                borderRadius: '15px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                border: '1px solid rgba(196, 160, 89, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-15px)';
                                e.currentTarget.style.boxShadow = '0 30px 60px rgba(196, 160, 89, 0.15)';
                                e.currentTarget.style.borderColor = '#C4A059';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)';
                                e.currentTarget.style.borderColor = 'rgba(196, 160, 89, 0.1)';
                            }}
                        >
                            <div style={{
                                fontSize: '3.5rem',
                                marginBottom: '25px',
                                width: '100px',
                                height: '100px',
                                backgroundColor: '#F9F4E8',
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {card.icon}
                            </div>
                            <h3 style={{
                                fontSize: '1.8rem',
                                color: '#1A1A1A',
                                fontFamily: 'serif',
                                fontWeight: 'bold',
                                marginBottom: '15px'
                            }}>
                                {card.title}
                            </h3>
                            <p style={{
                                color: '#777',
                                lineHeight: '1.6',
                                fontSize: '0.95rem',
                                padding: '0 20px'
                            }}>
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>
                
                {winners.length > 0 && (
                    <div style={{ marginTop: '100px', padding: '60px 0', background: 'linear-gradient(to right, #F9F4E8 0%, #FFF 50%, #F9F4E8 100%)', borderRadius: '40px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏆</div>
                            <h2 style={{ fontFamily: 'serif', fontSize: '3rem', color: '#1A1A1A', fontWeight: '900' }}>Hall of Champions</h2>
                            <p style={{ color: '#666', letterSpacing: '2px', fontSize: '0.8rem' }}>CELEBRATING OUR TOURNAMENT ELITES</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', padding: '0 20px' }}>
                            {winners.map(w => (
                                <div key={w.id} style={{ 
                                    backgroundColor: '#fff', 
                                    padding: '35px 25px', 
                                    borderRadius: '24px', 
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
                                    border: '1px solid rgba(196, 160, 89, 0.2)'
                                }}>
                                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>🏅</div>
                                    <div style={{ fontSize: '0.7rem', color: '#C4A059', fontWeight: '900', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>{w.sport} CHAMPION</div>
                                    <h3 style={{ fontSize: '1.8rem', color: '#1D3557', marginBottom: '10px', fontFamily: 'serif' }}>{w.team_name || w.player_name || w.username}</h3>
                                    <div style={{ display: 'inline-block', background: '#F9F4E8', padding: '8px 20px', borderRadius: '50px', fontSize: '0.85rem', color: '#888', fontWeight: 'bold' }}>
                                        {w.tournament_name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
