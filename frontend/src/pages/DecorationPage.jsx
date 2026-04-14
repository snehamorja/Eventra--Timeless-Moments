import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormContext } from '../contexts/FormContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import CustomInquiryModal from '../components/CustomInquiryModal';

const DecorationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showInquiry, setShowInquiry] = useState(false);
  const [decorStyles, setDecorStyles] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const selectedEventTypes = detectedEvents.length > 0 ? detectedEvents : rawEvents.map(e => (typeof e === 'string' ? e.split(' ')[0] : e.name));

  // Selection state (including skips)
  const [eventSelections, setEventSelections] = useState(currentState.eventSelections || {});

  useEffect(() => {
    const fetchDecor = async () => {
        setLoading(true);
        try {
            const res = await API.get('/decorations/');
            setDecorStyles(res.data || []);
        } catch (err) {
            console.error("Error fetching decor:", err);
            setDecorStyles(allDecorStyles);
        } finally {
            setLoading(false);
        }
    };
    fetchDecor();
  }, []);

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

  const totalCost = Object.values(eventSelections).reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
  const isAllAnswered = selectedEventTypes.length > 0 && selectedEventTypes.every(type => eventSelections[type]);

  const handleConfirm = () => {
    // DRAFT MODE: Skip API call, just save locally
    const updatedState = { ...currentState, selectedStyles: eventSelections, totalDecorCost: totalCost, step: 3 };
    localStorage.setItem('ongoing_booking', JSON.stringify(updatedState));
    navigate('/performers', { state: updatedState });
  };

  const getCategoryFromType = (type) => {
    const map = {
        'Wedding': 'Grand Wedding',
        'Sangeet': 'Sangeet Night',
        'Reception': 'Gala Reception'
    };
    if (map[type]) return map[type];
    
    const found = decorStyles.find(d => d.category && d.category.toLowerCase().includes(type.toLowerCase()));
    if (found) return found.category;

    return `${type} Ceremony`;
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
        {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem', color: '#666' }}>🌸 Spreading Petals & Themes...</div>
        ) : (
            selectedEventTypes.length > 0 ? selectedEventTypes.map(type => {
              const categoryName = getCategoryFromType(type);

              // Filter from the dynamic decorStyles
              const options = decorStyles.filter(s => s.category === categoryName || (s.category && s.category.toLowerCase().includes(type.toLowerCase())));
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
