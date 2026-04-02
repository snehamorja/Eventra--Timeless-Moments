import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../services/api';

const Gallery = () => {
    const location = useLocation();
    const [filter, setFilter] = useState((location.state && location.state.filter) || 'All');
    const [cols, setCols] = useState(3);
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await API.get('gallery/');
                setGalleryItems(response.data);
            } catch (error) {
                console.error("Error fetching gallery:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setCols(1);
            else if (window.innerWidth < 1024) setCols(2);
            else setCols(3);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Stable heights based on ID to avoid flicker on re-renders while staying "random"
    const getItemHeight = (id) => {
        const heights = [220, 280, 320, 360, 400];
        return heights[id % heights.length];
    };

    const categories = ['All', 'Sports', 'Concerts & Entertainment', 'Festivals', 'Decoration', 'Performer', 'DJ Party'];

    const filteredItems = React.useMemo(() => {
        if (!galleryItems.length) return [];

        let items = [];
        if (filter !== 'All') {
            items = galleryItems.filter(item => item.category === filter);
        } else {
            // ALL TAB LOGIC → Pick balanced selection then shuffle
            const categoryMap = {};
            const result = [];

            galleryItems.forEach(item => {
                const cat = item.category || 'Other';
                if (!categoryMap[cat]) {
                    categoryMap[cat] = [];
                }
                if (categoryMap[cat].length < 10) { // Increased limit for back-end items
                    categoryMap[cat].push(item);
                    result.push(item);
                }
            });
            // Fisher-Yates Shuffle for "Uneven" placement
            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]];
            }
            items = result;
        }
        return items;
    }, [filter, galleryItems]);

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <Navbar />

            {/* Header */}
            <div style={{
                backgroundColor: '#111',
                padding: '100px 40px',
                textAlign: 'center',
                color: '#fff',
                borderBottom: '1px solid #c5a059'
            }}>
                <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '4rem',
                    marginBottom: '15px',
                    fontWeight: '300',
                    letterSpacing: '5px'
                }}>GALLERY</h1>
                <div style={{
                    width: '60px',
                    height: '2px',
                    backgroundColor: '#c5a059',
                    margin: '0 auto 20px'
                }}></div>
                <p style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: '#888',
                    fontSize: '1rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                }}>A collection of moments curated by EVENTRA</p>
            </div>

            {/* Filter Navigation */}
            <div style={{ padding: '40px 20px', backgroundColor: '#fff' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '20px',
                    marginBottom: '50px'
                }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            style={{
                                padding: '8px 0',
                                border: 'none',
                                background: 'none',
                                color: filter === cat ? '#c5a059' : '#111',
                                borderBottom: filter === cat ? '2px solid #c5a059' : '2px solid transparent',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Masonry Layout */}
                <div style={{
                    columnCount: cols,
                    columnGap: '20px',
                    padding: '0 10px',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    {filteredItems.map(item => (
                        <div key={item.id} style={{
                            breakInside: 'avoid',
                            marginBottom: '20px',
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            transition: 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                            border: '1px solid #eee'
                        }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <img
                                src={item.image_url ? item.image_url : (item.image?.startsWith('http') ? item.image : `http://localhost:8000${item.image}`)}
                                alt={item.title}
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&q=60&w=800';
                                }}
                                style={{
                                    width: '100%',
                                    display: 'block',
                                    height: 'auto',
                                    minHeight: getItemHeight(item.id), // Staggering the heights
                                    objectFit: 'cover'
                                }}
                            />

                            <div style={{
                                padding: '15px',
                                backgroundColor: '#fff',
                            }}>
                                <h4 style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Playfair Display', serif",
                                    letterSpacing: '0.5px'
                                }}>{item.title}</h4>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.7rem',
                                    color: '#999',
                                    textTransform: 'uppercase',
                                    fontWeight: '500'
                                }}>
                                    <span>{item.category}</span>
                                    <span>{item.description}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Gallery;
