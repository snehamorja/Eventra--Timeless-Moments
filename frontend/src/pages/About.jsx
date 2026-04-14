import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
    return (
        <div style={{ backgroundColor: '#F9F4E8', color: '#111', minHeight: '100vh', scrollBehavior: 'smooth' }}>
            <Navbar />

            {/* Page Header */}
            <div style={{
                position: 'relative',
                height: '50vh',
                backgroundImage: 'url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920)',
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
                    backgroundColor: 'rgba(0,0,0,0.7)'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '3px' }}>Our Story</h1>
                    <p style={{ fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '30px', fontFamily: 'Playfair Display' }}>Crafting unforgettable moments since 2010</p>
                </div>
            </div>

            {/* Content Section */}
            <div style={{ padding: '100px 40px', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '80px', marginBottom: '100px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            src="https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&q=80&w=1200"
                            alt="Luxury Event"
                            style={{ width: '100%', height: '600px', objectFit: 'cover', borderRadius: '4px', boxShadow: '20px 20px 0 #C4A059' }}
                        />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1rem', color: '#C4A059', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '20px', fontWeight: '800' }}>The Philosophy</h2>
                        <h3 style={{ fontSize: '3.5rem', fontFamily: 'Playfair Display', color: '#000000ff', marginBottom: '30px', lineHeight: '1.2' }}>Redefining the art of celebration.</h3>
                        <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: '1.8', marginBottom: '25px' }}>
                            Welcome to <strong>EVENTRA Timeless Moments</strong>, where we believe that every event is a unique narrative waiting to be told.
                            Since our inception in 2010, we have dedicated ourselves to the pursuit of excellence in event architecture and experience design.
                        </p>
                        <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: '1.8', marginBottom: '40px' }}>
                            Our team of dedicated planners, designers, and logistical experts work in perfect synchronization to transform your vision
                            into a sensory masterpiece. Whether it's an intimate destination wedding or a grand cultural gala, we handle every detail with precision, grace, and an uncompromising commitment to quality.
                        </p>
                        <div style={{ display: 'flex', gap: '40px' }}>
                            <div>
                                <h4 style={{ fontSize: '2.5rem', color: '#C4A059', margin: 0, fontWeight: '300' }}>15+</h4>
                                <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Years of Legacy</p>
                            </div>
                            <div style={{ width: '1px', background: '#333' }}></div>
                            <div>
                                <h4 style={{ fontSize: '2.5rem', color: '#C4A059', margin: 0, fontWeight: '300' }}>2.5k</h4>
                                <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Events Delivered</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission Section */}
                <div style={{ backgroundColor: '#FDFBF7', padding: '100px 60px', borderRadius: '4px', marginBottom: '100px', textAlign: 'center', border: '1px solid #D1CFBB' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display', marginBottom: '30px', color: '#111' }}>Our Mission</h2>
                        <p style={{ fontSize: '1.4rem', lineHeight: '1.6', fontStyle: 'italic', color: '#C4A059' }}>
                            "To craft extraordinary experiences that resonate through time, blending artisanal creativity with flawless execution."
                        </p>
                    </div>
                </div>

                {/* Values Section */}
                <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                    <h2 style={{ fontSize: '1rem', color: '#C4A059', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '60px', fontWeight: '800' }}>The Principles</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        {[
                            { title: "Artisan Excellence", desc: "Every napkin fold, every lighting cue, and every transition is treated with surgical precision." },
                            { title: "Fluid Creativity", desc: "We push the boundaries of conventional design to create personalized experiences that mirror your soul." },
                            { title: "Absolute Integrity", desc: "Transparency is our foundation. We treat your investment and trust with the highest honor." }
                        ].map((v, i) => (
                            <div key={i} style={{ padding: '60px 40px', background: '#fff', border: '1px solid #D1CFBB', borderRadius: '4px', textAlign: 'left', transition: '0.3s' }}>
                                <div style={{ width: '40px', height: '2px', background: '#C4A059', marginBottom: '30px' }}></div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#111', fontWeight: '800' }}>{v.title}</h3>
                                <p style={{ color: '#666', lineHeight: '1.8' }}>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default About;
