import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
    const navigate = useNavigate();
    const [latestBlogs, setLatestBlogs] = useState([]);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const res = await API.get('/blogs/');
                let blogs = [];
                if (Array.isArray(res.data)) {
                    blogs = res.data;
                } else if (res.data.results) {
                    blogs = res.data.results;
                }
                setLatestBlogs(blogs.slice(0, 3));
            } catch (err) {
                console.error("Home data fetch error", err);
            }
        };
        fetchLatest();
    }, []);

    const categories = [
        {
            id: 1,
            title: "Destination Weddings",
            image: "https://spectrumudaipur.com/wp-content/uploads/2022/06/wedding2-20-12-2019.jpg",
            description: "Experience the magic of love in breathtaking locations."
        },
        {
            id: 3,
            title: "Performers",
            image: "/cat_performers.png",
            description: "Top-tier singers, bands, and entertainers for your event."
        },
        {
            id: 4,
            title: "Exquisite Catering",
            image: "/cat_catering.png",
            description: "Gourmet dining experiences tailored to your taste."
        },
        {
            id: 5,
            title: "Luxury Venues",
            image: "/hero_bg.png",
            description: "Access to the most exclusive ballrooms and halls."
        },
        {
            id: 6,
            title: "Decor & Styling",
            image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
            description: "Transforming spaces with elegant floral and design."
        },
    ];

    return (
        <div style={{ backgroundColor: '#F9F4E8', color: '#111', minHeight: '100vh', scrollBehavior: 'smooth' }}>
            <Navbar />

            {/* Hero Section */}
            <header style={{
                position: 'relative',
                height: '100vh',
                backgroundImage: 'url(/hero_bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                textAlign: 'center'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)'
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 6rem)',
                        fontFamily: "'Playfair Display', serif",
                        letterSpacing: '15px',
                        fontWeight: '700',
                        color: '#fff',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        // Brightening letter shadow
                        textShadow: '0 0 15px rgba(255, 255, 255, 0.6), 2px 4px 10px rgba(0, 0, 0, 0.5)'
                    }}>EVENTRA</h1>
                    <p style={{
                        fontSize: '1.2rem',
                        letterSpacing: '8px',
                        textTransform: 'uppercase',
                        color: '#fff',
                        marginBottom: '40px',
                        fontWeight: '400',
                        // Brightening letter shadow
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.4), 2px 4px 10px rgba(0, 0, 0, 0.5)'
                    }}>Timeless Moments</p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <button
                            className="btn-primary"
                            style={{
                                background: 'linear-gradient(135deg, #C4A059 0%, #9A7B3F 100%)',
                                border: 'none',
                                padding: '15px 45px',
                                color: '#fff',
                                borderRadius: '50px',
                                textTransform: 'uppercase',
                                fontWeight: '900',
                                letterSpacing: '3px',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                boxShadow: '0 10px 30px rgba(196, 160, 89, 0.4)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 15px 45px rgba(196, 160, 89, 0.7)';
                                e.currentTarget.style.filter = 'brightness(1.2)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(196, 160, 89, 0.4)';
                                e.currentTarget.style.filter = 'brightness(1)';
                            }}
                            onClick={() => navigate('/dashboard')}
                        >
                            Explore
                        </button>
                        <button
                            style={{
                                backgroundColor: 'transparent',
                                border: '2px solid #fff',
                                color: '#fff',
                                padding: '15px 40px',
                                borderRadius: '50px',
                                textTransform: 'uppercase',
                                fontWeight: '700',
                                letterSpacing: '2px',
                                cursor: 'pointer',
                                transition: 'all 0.4s ease'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#fff'; }}
                            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </header>

            {/* Services Section */}
            <div style={{ padding: '100px 40px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#F9F4E8' }}>
                <div id="services" style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '3.5rem', marginBottom: '20px', fontFamily: "'Playfair Display', serif", color: '#111' }}>Bespoke Services</h2>
                    <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '1.2rem' }}>Curated experiences for every occasion, crafted with precision and elegance.</p>
                </div>

                <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <div key={cat.id} style={{ width: '350px', transition: 'transform 0.4s ease' }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-15px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>

                            <div style={{ height: '280px', overflow: 'hidden', borderRadius: '15px 15px 0 0', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                                <img src={cat.image} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>

                            <div style={{ padding: '30px 20px', backgroundColor: '#fff', borderRadius: '0 0 15px 15px', textAlign: 'center', border: '1px solid #eee', borderTop: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#111', letterSpacing: '0.5px' }}>{cat.title}</h3>
                                <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6' }}>{cat.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* Brand Philosophy - REALISTIC TOUCH */}
            <div style={{ padding: '150px 40px', backgroundColor: '#fff' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <h4 style={{ color: '#C4A059', letterSpacing: '5px', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '30px' }}>Our Philosophy</h4>
                    <h2 style={{ fontSize: '3.5rem', fontFamily: 'Playfair Display, serif', lineHeight: '1.3', marginBottom: '40px', color: '#111' }}>Crafting legacies, one moment at a time.</h2>
                    <p style={{ fontSize: '1.4rem', color: '#555', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
                        At Eventra, we believe that an event is not just a date on the calendar. It is a symphony of emotions, a canvas of dreams, and a testament to heritage. We blend timeless elegance with modern precision to ensure your celebration is nothing short of legendary.
                    </p>
                    <div style={{ marginTop: '60px', width: '2px', height: '100px', background: 'linear-gradient(to bottom, #C4A059, transparent)', margin: '60px auto' }}></div>
                </div>
            </div>

            {/* Latest Stories Section */}
            <div style={{ backgroundColor: '#F9F4E8', padding: '120px 40px', borderTop: '2px solid #D1CFBB' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px' }}>
                        <div>
                            <h2 style={{ fontSize: '3.5rem', marginBottom: '15px', fontFamily: "'Playfair Display', serif", fontWeight: '700', color: '#111' }}>Latest Stories</h2>
                            <p style={{ color: '#666', margin: 0, fontSize: '1.2rem' }}>Discover news and insights from our event experts.</p>
                        </div>
                        <button onClick={() => navigate('/blog')} style={{ background: 'none', border: 'none', color: '#c5a059', fontWeight: '800', cursor: 'pointer', borderBottom: '2px solid', textTransform: 'uppercase', letterSpacing: '1px' }}>VIEW ALL ARTICLES &rarr;</button>
                    </div>

                    <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {latestBlogs.map(post => (
                            <div key={post.id} onClick={() => navigate(`/blog/${post.id}`)} style={{ cursor: 'pointer', width: '400px', backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 50px rgba(0,0,0,0.05)', transition: 'transform 0.4s', border: '1px solid #eee' }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-12px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ height: '280px', overflow: 'hidden' }}>
                                    <img src={post.image || 'https://images.unsplash.com/photo-1455390582262-044cdead2777a?auto=format&fit=crop&q=80&w=800'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '40px 30px', textAlign: 'center' }}>
                                    <h3 style={{
                                        fontSize: '1.6rem',
                                        margin: '0 0 20px 0',
                                        lineHeight: '1.3',
                                        fontFamily: "'Playfair Display', serif",
                                        fontWeight: '700',
                                        color: '#111'
                                    }}>
                                        {post.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '1rem',
                                        color: '#666',
                                        lineHeight: '1.7',
                                        marginBottom: '20px'
                                    }}>
                                        {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                    </p>
                                    <div style={{ width: '40px', height: '2px', backgroundColor: '#C4A059', margin: '0 auto' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section - NEW ADDITION */}
            <div style={{ backgroundColor: '#fff', padding: '150px 40px' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '3rem', fontFamily: 'Playfair Display, serif', marginBottom: '80px' }}>Words From Our Clients</h2>
                    <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[
                            { name: "Ananya Mehta", text: "Eventra transformed our wedding into a fairy tale. Every detail was handled with such grace and precision.", role: "Bride, Udaipur Destination" },
                            { name: "Vikram Shah", text: "The most professional team I've ever worked with for our corporate gala. Truly exceptional service.", role: "CEO, Tech Horizon" },
                            { name: "Priya Das", text: "Their cultural festival management is world-class. They respect tradition while bringing modern flair.", role: "Cultural Arts Director" }
                        ].map((t, i) => (
                            <div key={i} style={{ width: '380px', padding: '50px', backgroundColor: '#fdfbf7', borderRadius: '30px', textAlign: 'left', border: '1px solid #f0f0f0' }}>
                                <div style={{ fontSize: '3rem', color: '#C4A059', marginBottom: '20px', lineHeight: '1' }}>&ldquo;</div>
                                <p style={{ fontSize: '1.1rem', color: '#111', lineHeight: '1.8', fontStyle: 'italic', marginBottom: '30px' }}>{t.text}</p>
                                <div>
                                    <div style={{ fontWeight: '900', color: '#111' }}>{t.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Home;
