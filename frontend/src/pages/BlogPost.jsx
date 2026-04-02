import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const BlogPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [otherPosts, setOtherPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchPostData = async () => {
            setLoading(true);
            try {
                const [postRes, allRes] = await Promise.all([
                    api.get(`/blogs/${id}/`),
                    api.get('/blogs/')
                ]);
                setPost(postRes.data);
                // Related blogs logic
                setOtherPosts(allRes.data.filter(b => b.is_published && b.id !== parseInt(id)).slice(0, 2));
            } catch (err) {
                console.error("Error fetching blog post:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPostData();
    }, [id]);

    if (loading) {
        return (
            <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
                <Navbar />
                <div style={{ textAlign: 'center', padding: '150px' }}>
                    <h2 style={{ color: '#888', fontFamily: 'serif' }}>Opening the Journal...</h2>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
                <Navbar />
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <h2 style={{ fontFamily: 'serif', marginBottom: '20px' }}>Post Not Found</h2>
                    <button onClick={() => navigate('/blog')} style={{ padding: '10px 25px', background: '#1D3557', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Back to Blog</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <Navbar />

            {/* Header / Banner */}
            <div style={{
                height: '60vh',
                backgroundImage: `url("${post.image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1600'}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
                <div className="container" style={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '0 20px 60px',
                    color: '#fff'
                }}>
                    <span style={{ color: 'var(--color-gold)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px' }}>{new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <h1 style={{ fontSize: '3rem', margin: '0 0 20px 0', fontFamily: 'var(--font-heading)', maxWidth: '800px' }}>{post.title}</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>By {post.author}</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="container" style={{ padding: '80px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <button
                        onClick={() => navigate('/blog')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '40px'
                        }}
                    >
                        &larr; ALL ARTICLES
                    </button>

                    <div
                        style={{
                            fontSize: '1.15rem',
                            lineHeight: '1.9',
                            color: '#4b5563',
                            textAlign: 'justify',
                            letterSpacing: '-0.01em',
                            fontFamily: "'Inter', sans-serif"
                        }}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Related Articles Section */}
                    <div style={{ marginTop: '120px', paddingTop: '60px', borderTop: '1px solid #f1f5f9' }}>
                        <h3 style={{
                            fontSize: '2rem',
                            marginBottom: '50px',
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: '700',
                            color: '#111827'
                        }}>
                            Read More Stories
                        </h3>
                        {otherPosts.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                                {otherPosts.map(other => (
                                    <div
                                        key={other.id}
                                        onClick={() => navigate(`/blog/${other.id}`)}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                            textAlign: 'center'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ overflow: 'hidden', borderRadius: '12px', marginBottom: '20px', backgroundColor: '#f8fafc' }}>
                                            <img src={other.image || 'https://images.unsplash.com/photo-1455390582262-044cdead2777a?auto=format&fit=crop&q=80&w=800'} alt="" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                                        </div>
                                        <h4 style={{
                                            fontSize: '1.4rem',
                                            fontFamily: "'Playfair Display', serif",
                                            fontWeight: '700',
                                            marginBottom: '15px',
                                            color: '#1a1a1a',
                                            lineHeight: '1.3',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1.5px'
                                        }}>
                                            {other.title}
                                        </h4>
                                        <p style={{
                                            fontSize: '0.95rem',
                                            color: '#666',
                                            lineHeight: '1.6',
                                            marginBottom: '20px',
                                            fontFamily: "'Inter', sans-serif"
                                        }}>
                                            {other.content.replace(/<[^>]*>/g, '').substring(0, 60)}...
                                        </p>
                                        <div style={{ width: '30px', height: '1.5px', backgroundColor: '#C4A059', margin: '0 auto' }}></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '10px' }}>No Stories Found</h3>
                                <p style={{ color: '#666', fontFamily: "'Inter', sans-serif" }}>Stay tuned for more updates from our editorial team.</p>
                            </div>
                        )}
                    </div>

                    {/* Share / Footer */}
                    <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>SHARE:</span>
                            <span style={{ color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}>Facebook</span>
                            <span style={{ color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}>Twitter</span>
                            <span style={{ color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}>LinkedIn</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer style={{ padding: '80px 20px', backgroundColor: 'var(--color-dark)', color: '#fff', textAlign: 'center' }}>
                <p style={{ opacity: 0.6 }}>&copy; 2025 EVENTRA Timeless Moments. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default BlogPost;
