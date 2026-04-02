import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const DecorationCatalogue = () => {
    const [decorations, setDecorations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDecorations = async () => {
            try {
                const res = await api.get('/decorations/');
                setDecorations(res.data);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDecorations();
    }, []);

    const handleSelect = (decor) => {
        navigate('/book-event', { state: { selectedDecoration: decor } });
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading Decorations...</div>;

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ padding: '80px 40px', maxWidth: '1400px', margin: '0 auto' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '15px', fontFamily: 'serif', fontSize: '3.5rem' }}>Decoration Catalogue</h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '60px', fontSize: '1.2rem' }}>Choose a theme for your special event.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
                    {decorations.map(decor => (
                        <div key={decor.id} style={{
                            border: '1px solid #eee',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease'
                        }}>
                            <img src={decor.image} alt={decor.name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                            <div style={{ padding: '25px' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', fontFamily: 'serif' }}>{decor.name}</h3>
                                <p style={{ color: '#888', marginBottom: '20px', fontSize: '0.9rem', lineHeight: '1.6' }}>{decor.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#C4A059' }}>₹{parseFloat(decor.price).toLocaleString()}</span>
                                    <button
                                        onClick={() => handleSelect(decor)}
                                        style={{
                                            padding: '12px 25px',
                                            backgroundColor: '#1A1A1A',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '50px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Select
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {decorations.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', marginTop: '100px', color: '#888' }}>
                        No decorations found. Admin needs to add some in the Django backend.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DecorationCatalogue;
