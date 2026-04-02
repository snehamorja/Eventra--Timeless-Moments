import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormContext } from '../contexts/FormContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import CustomInquiryModal from '../components/CustomInquiryModal';

const allDecorStyles = [
  // --- HALDI CEREMONY (6 OPTIONS) ---
  { id: 'hal1', type: 'Haldi Ceremony', name: 'Sunny Marigold Oasis', price: 15000, image: 'https://i.pinimg.com/1200x/ad/4e/da/ad4eda2ce1d9878d5c75a15e0b59fbee.jpg' },
  { id: 'hal2', type: 'Haldi Ceremony', name: 'Classic Yellow Drapes', price: 25000, image: 'https://i.pinimg.com/1200x/46/ab/aa/46abaa841d27d491531c0f346c5a5ba7.jpg' },
  { id: 'hal3', type: 'Haldi Ceremony', name: 'Floral Genda Phool Gala', price: 35000, image: 'https://i.pinimg.com/736x/40/58/a9/4058a910599dd466c2c2234af3f73ec8.jpg' },
  { id: 'hal4', type: 'Haldi Ceremony', name: 'Contemporary Minimal Haldi', price: 45000, image: 'https://cdn0.weddingwire.in/article/8567/original/1280/png/117658-haldi-decoration-marriage-colours.jpeg' },
  { id: 'hal5', type: 'Haldi Ceremony', name: 'Royal Rajwadi Haldi', price: 75000, image: 'https://i.pinimg.com/1200x/eb/14/c9/eb14c92174acadbbd65c4a15ac85405a.jpg' },
  { id: 'hal6', type: 'Haldi Ceremony', name: 'Luxury Exotic Floral Haldi', price: 125000, image: 'https://i.pinimg.com/736x/be/35/5c/be355cb6eb0e64f6069e91d3210d8be9.jpg' },

  // --- MEHENDI CEREMONY (6 OPTIONS) ---
  { id: 'meh1', type: 'Mehendi Ceremony', name: 'Bohemian Backyard Mehendi', price: 18000, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDHebW2TS5OI9GaDfjHPKZ56ND1bzxk-eGpQ&s' },
  { id: 'meh2', type: 'Mehendi Ceremony', name: 'Rainbow Drapes Theme', price: 28000, image: 'https://i.pinimg.com/236x/42/02/b1/4202b1cac7642050fd7cde7b7d3d2855.jpg' },
  { id: 'meh3', type: 'Mehendi Ceremony', name: 'Traditional Henna Lounge', price: 38000, image: 'https://i.pinimg.com/736x/e5/ad/84/e5ad840325f74553b626455a60f1da23.jpg' },
  { id: 'meh4', type: 'Mehendi Ceremony', name: 'Vintage Umbrella Garden', price: 55000, image: 'https://i.pinimg.com/1200x/bb/85/cf/bb85cf9451733e922fffb4fa264b71ad.jpg' },
  { id: 'meh5', type: 'Mehendi Ceremony', name: 'Moroccan Oasis Mehndi', price: 85000, image: 'https://i.pinimg.com/1200x/38/86/05/3886052ee5c6e3aa83557a63bfbdc3b6.jpg' },
  { id: 'meh6', type: 'Mehendi Ceremony', name: 'Imperial Floral Henna', price: 135000, image: 'https://i.pinimg.com/736x/83/41/d4/8341d4334c60b4dc4dcbb269f454b2ee.jpg' },

  // --- SANGEET NIGHT (6 OPTIONS) ---
  { id: 'san1', type: 'Sangeet Night', name: 'Vibrant Dance & Beats Stage', price: 25000, image: 'https://i.pinimg.com/1200x/81/19/0c/81190c1293e65882d68c4beff29e2aed.jpg' },
  { id: 'san2', type: 'Sangeet Night', name: 'Neon Party Vibe', price: 75000, image: 'https://i.pinimg.com/736x/d4/72/e9/d472e9a9a805b745f8fc5e87277060f0.jpg' },
  { id: 'san3', type: 'Sangeet Night', name: 'Bollywood Disco Gala', price: 85000, image: 'https://i.pinimg.com/1200x/12/ea/1c/12ea1cdd9c8ddc1eb4685223168b28f4.jpg' },
  { id: 'san4', type: 'Sangeet Night', name: 'Elegant Jazz Lounge', price: 15000, image: 'https://i.pinimg.com/1200x/29/ab/bc/29abbc365d601a9d13f01f22ab05e778.jpg' },
  { id: 'san5', type: 'Sangeet Night', name: 'Grand LED Concert Stage', price: 275000, image: 'https://i.pinimg.com/1200x/fe/86/89/fe86890fcacacf34427bb5e164448b98.jpg' },
  { id: 'san6', type: 'Sangeet Night', name: 'Ultra-Luxury Starry Night', price: 310000, image: 'https://i.pinimg.com/736x/36/26/71/36267198c23ec3e6b4d8e4ada3a6c5df.jpg' },

  // --- GRAND WEDDING (6 OPTIONS) ---
  { id: 'wed7', type: 'Grand Wedding', name: 'Modern Glass Mandap', price: 65000, image: 'https://i.pinimg.com/736x/8a/52/7f/8a527fb4c519297753e97ee30169b580.jpg' },
  { id: 'wed1', type: 'Grand Wedding', name: 'Temple Theme Mandap', price: 75000, image: 'https://i.pinimg.com/736x/d2/45/3d/d2453da4c2f91b535a3eda56c1f8b3c0.jpg' },
  { id: 'wed2', type: 'Grand Wedding', name: 'Sacred Fire Lounge', price: 35000, image: 'https://i.pinimg.com/736x/79/5e/51/795e518eb39ce4accaaadb874e022f64.jpg' },
  { id: 'wed3', type: 'Grand Wedding', name: 'White & Gold Royal Mandap', price: 40000, image: 'https://i.pinimg.com/736x/89/77/a4/8977a4fac5bd0b875107f1918c1c1674.jpg' },
  { id: 'wed4', type: 'Grand Wedding', name: 'Exotic Rose Garden Wedding', price: 110000, image: 'https://i.pinimg.com/736x/e8/f9/75/e8f975bab61e39ad2dbcdac822ac50b6.jpg' },
  { id: 'wed5', type: 'Grand Wedding', name: 'Royal Rajwadi Mandap', price: 150000, image: 'https://i.pinimg.com/736x/17/24/72/172472c99e09785f6d0fda251c2606ab.jpg' },
  { id: 'wed6', type: 'Grand Wedding', name: 'Palace Heritage Wedding', price: 170000, image: 'https://i.pinimg.com/736x/3b/dd/fd/3bddfdb1d64bd9b414ba8e607d0e37e0.jpg' },

  // --- GALA RECEPTION (6 OPTIONS) ---
  { id: 'rec1', type: 'Gala Reception', name: 'Modern Mirror Stage', price: 60000, image: 'https://i.pinimg.com/736x/7f/75/0c/7f750cecbcacb48126cf0ab65cda76fb.jpg' },
  { id: 'rec2', type: 'Gala Reception', name: 'Elegant Chandelier Hall', price: 100000, image: 'https://i.pinimg.com/736x/b5/46/69/b54669413c6a34c8dd5742454ef92839.jpg' },
  { id: 'rec3', type: 'Gala Reception', name: 'Enchanted Forest Vibe', price: 125000, image: 'https://i.pinimg.com/736x/f0/b2/09/f0b2091cc0c680e320ca5d429c338b02.jpg' },
  { id: 'rec4', type: 'Gala Reception', name: 'Minimal Luxe White', price: 180000, image: 'https://i.pinimg.com/1200x/e2/71/14/e27114ebeb2d2ec24a4467a0c30177f8.jpg' },
  { id: 'rec5', type: 'Gala Reception', name: 'Grand Crystal Ball Stage', price: 275000, image: 'https://i.pinimg.com/1200x/e8/8f/67/e88f67b8e3ad5a40a44497b2cffb4f53.jpg' },
  { id: 'rec6', type: 'Gala Reception', name: 'Diamond Royal Splendor', price: 550000, image: 'https://i.pinimg.com/1200x/58/cd/9f/58cd9ff81773f66073213cf9568a825a.jpg' }
];

const budgetTiers = [
  { id: 'basic', label: 'Basic', range: '₹10,000 – ₹30,000', min: 0, max: 30000 },
  { id: 'standard', label: 'Standard', range: '₹30,000 – ₹60,000', min: 30001, max: 60000 },
  { id: 'premium', label: 'Premium', range: '₹60,000 – ₹1,20,000', min: 60001, max: 120000 },
  { id: 'luxury', label: 'Luxury', range: '₹1,20,000+', min: 120001, max: 9999999 },
];

const DecorationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showInquiry, setShowInquiry] = useState(false);

  const getInitialState = () => {
    if (location.state && location.state.selectedMenu) return location.state;
    const saved = localStorage.getItem('ongoing_booking');
    return saved ? JSON.parse(saved) : {};
  };

  const currentState = getInitialState();
  const { eventData = {} } = currentState;

  // ROBUST EXTRACTION: Look in eventData or deeply in wedding_details
  const weddingDetails = eventData.wedding_details || {};
  const eventsRequired = weddingDetails.eventsRequired || eventData.eventsRequired || {};

  // Also check selectedEventTypes if it's already a flat list from EventSelectionPage
  const rawEvents = weddingDetails.selectedEventTypes || [];

  // Combine all sources to find which ceremonies were selected
  const detectedEvents = Object.keys(eventsRequired).filter(key => eventsRequired[key] === true);

  // Normalize names (Mehendi -> Mehendi Ceremony, etc.)
  const selectedEventTypes = detectedEvents.length > 0 ? detectedEvents : rawEvents.map(e => e.split(' ')[0]);

  // Selection state (including skips)
  const [eventSelections, setEventSelections] = useState(currentState.eventSelections || {});

  const handleSelectDecor = (type, decor) => {
    setEventSelections(prev => ({
      ...prev,
      [type]: decor
    }));
  };

  const handleSkip = (type) => {
    setEventSelections(prev => ({
      ...prev,
      [type]: { skipped: true, name: 'Skipped', price: 0 }
    }));
  };

  const totalCost = Object.values(eventSelections).reduce((sum, s) => sum + (s.price || 0), 0);
  const isAllAnswered = selectedEventTypes.length > 0 && selectedEventTypes.every(type => eventSelections[type]);

  const handleConfirm = () => {
    // DRAFT MODE: Skip API call, just save locally
    const updatedState = { ...currentState, selectedStyles: eventSelections, totalDecorCost: totalCost, step: 3 };
    localStorage.setItem('ongoing_booking', JSON.stringify(updatedState));
    navigate('/performers', { state: updatedState });
  };

  const typeMap = {
    'Mehendi': 'Mehendi Ceremony',
    'Haldi': 'Haldi Ceremony',
    'Sangeet': 'Sangeet Night',
    'Wedding': 'Grand Wedding',
    'Reception': 'Gala Reception',
    'mehendi': 'Mehendi Ceremony',
    'haldi': 'Haldi Ceremony',
    'sangeet': 'Sangeet Night',
    'wedding': 'Grand Wedding',
    'reception': 'Gala Reception'
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '160px' }}>
      <Navbar />

      <div style={{
        background: 'linear-gradient(135deg, #457B9D 0%, #1D3557 100%)',
        padding: '15px',
        textAlign: 'center',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(69, 123, 157, 0.3)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.95, display: 'inline-block', marginRight: '20px' }}>
            🌸 Looking for a unique theme or specific flower arrangements?
          </p>
          <button
            onClick={() => setShowInquiry(true)}
            style={{
              background: '#fff',
              color: '#1D3557',
              border: 'none',
              padding: '6px 20px',
              borderRadius: '50px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Custom Decor Plan
          </button>
        </div>
      </div>

      <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#F9F4E8', borderBottom: '1px solid #EAE2D1' }}>
        <h2 style={{ fontSize: '2.8rem', fontFamily: 'serif', color: '#111', marginBottom: '15px', letterSpacing: '-1px' }}>
          ✨ Curate Your Wedding Vision
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          <span 
            onMouseOver={e => e.target.style.color = '#111'}
            onMouseOut={e => e.target.style.color = '#C4A059'}
            style={{ color: '#C4A059', fontWeight: '700', transition: '0.3s ease', cursor: 'default' }}
          >Explore</span> our hand-picked collection of bespoke decorations.
          Select the perfect designs for each of your ceremonies to create your dream celebration.
        </p>
      </div>

      {/* 2. CEREMONY GRID */}
      <div style={{ maxWidth: 1400, margin: '60px auto', padding: '0 20px' }}>
        {selectedEventTypes.length > 0 ? selectedEventTypes.map(type => {
          const categoryName = typeMap[type] || 'Grand Wedding';

          // NO FILTER: Show all options for this ceremony category
          const options = allDecorStyles.filter(s => s.type === categoryName);
          const currentSelection = eventSelections[type];

          return (
            <section key={type} style={{ marginBottom: 100, borderBottom: '1px solid #f0f0f0', paddingBottom: 60 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <h2 style={{ fontSize: '2.8rem', fontFamily: 'serif', margin: 0 }}>{type} Ceremony</h2>
                  {currentSelection && !currentSelection.skipped && <span style={{ background: '#10B981', color: '#fff', padding: '5px 15px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 800 }}>✓ SELECTED</span>}
                </div>
                <div
                  onClick={() => handleSkip(type)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px 25px',
                    borderRadius: 50, border: '1px solid #111', background: currentSelection?.skipped ? '#111' : 'transparent',
                    color: currentSelection?.skipped ? '#fff' : '#111', transition: '0.3s'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{currentSelection?.skipped ? '☑️' : '⬜️'}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Skip This Decoration</span>
                </div>
              </div>

              {options.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 40 }}>
                  {options.map(decor => {
                    const isSelected = currentSelection?.id === decor.id;
                    return (
                      <div
                        key={decor.id}
                        onClick={() => handleSelectDecor(type, decor)}
                        style={{
                          borderRadius: 24, overflow: 'hidden', border: isSelected ? '5px solid #C4A059' : '1px solid #eee',
                          cursor: 'pointer', transition: '0.4s all ease', transform: isSelected ? 'translateY(-15px)' : 'none',
                          boxShadow: isSelected ? '0 30px 60px rgba(196, 160, 89, 0.25)' : '0 10px 30px rgba(0,0,0,0.05)',
                          position: 'relative'
                        }}
                      >
                        <img src={decor.image} style={{ width: '100%', height: 280, objectFit: 'cover' }} />
                        <div style={{ padding: 30, background: isSelected ? '#F9F4E8' : '#fff' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 8 }}>{decor.name}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 900, color: '#C4A059', fontSize: '1.6rem' }}>₹{decor.price.toLocaleString()}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>Choice Decor</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: '#f5f5f5', padding: '80px', textAlign: 'center', borderRadius: 30, border: '2px dashed #ddd' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 20 }}>🔍</div>
                  <h3 style={{ color: '#888', marginBottom: 10 }}>No Designs Available</h3>
                  <p style={{ color: '#aaa' }}>We reached out to our vendors, but we don't have designs for {type} currently available.</p>
                </div>
              )}
            </section>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <h2 style={{ fontFamily: 'serif' }}>No Ceremonies Found</h2>
            <p style={{ color: '#666', marginBottom: 40 }}>It looks like you haven't selected any ceremonies in the previous step.</p>
            <button onClick={() => navigate('/book-event')} style={{ padding: '18px 50px', background: '#111', color: '#fff', border: 'none', borderRadius: 50, fontWeight: 800, cursor: 'pointer' }}>Go to Booking Form</button>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', padding: '25px 60px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 60, boxShadow: '0 30px 80px rgba(0,0,0,0.4)', zIndex: 1001, border: '1px solid #333' }}>
        <div style={{ borderRight: '1px solid #333', paddingRight: 40 }}>
          <div style={{ fontSize: '0.75rem', color: '#C4A059', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>Cart Summary</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>₹{totalCost.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#666' }}>Est. Total</span></div>
        </div>
        <button onClick={handleConfirm} disabled={!isAllAnswered} style={{ background: isAllAnswered ? '#C4A059' : '#333', color: '#fff', border: 'none', padding: '18px 50px', borderRadius: 50, fontWeight: 800, fontSize: '1rem', cursor: isAllAnswered ? 'pointer' : 'not-allowed', transition: '0.3s' }}>
          {isAllAnswered ? 'Select Musical Performers →' : 'Select or Skip Each Event to Continue'}
        </button>
      </div>
      <CustomInquiryModal
        isOpen={showInquiry}
        onClose={() => setShowInquiry(false)}
        eventType="Wedding Decoration"
      />
    </div>
  );
};

export default DecorationPage;
