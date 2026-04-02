import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

const Blog = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await api.get('/blogs/');
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setBlogs(data);
            } catch (err) {
                console.error("Failed to fetch blogs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '0' }}>
            <Navbar />

            {/* Premium Header */}
            <div style={{
                backgroundColor: 'var(--dark)',
                padding: 'min(150px, 15vh) 20px',
                textAlign: 'center',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'url(https://images.unsplash.com/photo-1455390582262-044cdead2777a?auto=format&fit=crop&q=80&w=1920)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.2,
                    zIndex: 0
                }}></div>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ letterSpacing: '8px', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '20px', fontWeight: '700' }}>The Journal</p>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                        marginBottom: '30px',
                        fontWeight: '300',
                        letterSpacing: '10px'
                    }}>INSIGHTS</h1>
                    <div style={{ width: '80px', height: '2px', backgroundColor: 'var(--primary)', margin: '0 auto 30px' }}></div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
                        Exploring the intersection of luxury, art, and the celebration of life.
                    </p>
                </div>
            </div>

            {/* Editorial Grid */}
            <section style={{ padding: '100px 0' }}>
                <div className="container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--gray)' }}>Curating the journal...</div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                            gap: '50px'
                        }}>
                            {blogs.map((post, index) => (
                                <article key={post.id} className="fade-in" style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: 'var(--shadow-md)',
                                    transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                    cursor: 'pointer',
                                    animationDelay: `${index * 0.1}s`,
                                    border: '1px solid #f0f0f0'
                                }}
                                    onClick={() => navigate(`/blog/${post.id}`)}
                                    onMouseOver={e => {
                                        e.currentTarget.style.transform = 'translateY(-12px)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    }}
                                >
                                    <div style={{ height: '300px', overflow: 'hidden' }}>
                                        <img
                                            src={post.image || 'https://images.unsplash.com/photo-1455390582262-044cdead2777a?auto=format&fit=crop&q=80&w=800'}
                                            alt={post.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ padding: '40px 30px' }}>
                                        <p style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px' }}>
                                            {post.category || 'Lifestyle'}
                                        </p>
                                        <h2 style={{
                                            fontSize: '1.6rem',
                                            marginBottom: '20px',
                                            fontFamily: "'Playfair Display', serif",
                                            lineHeight: '1.3',
                                            color: 'var(--dark)'
                                        }}>
                                            {post.title}
                                        </h2>
                                        <p style={{ color: 'var(--gray)', fontSize: '0.95rem', lineHeight: '1.8', marginBottom: '30px' }}>
                                            {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {new Date(post.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>Read Article</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {!loading && blogs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <p style={{ fontSize: '1.2rem', color: 'var(--gray)', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
                                We are currently preparing new stories for the journal. Invitation only.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Blog;
