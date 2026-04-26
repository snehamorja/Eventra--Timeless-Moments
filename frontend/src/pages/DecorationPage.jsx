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
    try {
      if (location.state && (location.state.selectedStyles || location.state.selectedMenu || location.state.eventData)) {
        return location.state;
      }
      const saved = localStorage.getItem('ongoing_booking');
      return saved ? (JSON.parse(saved) || {}) : {};
    } catch (e) {
      console.error("State recovery failed:", e);
      return {};
    }
  };

  const currentState = getInitialState() || {};
  const { eventData = {} } = currentState;

  // ROBUST EXTRACTION
  const weddingDetails = eventData.wedding_details || {};
  const eventsRequired = weddingDetails.eventsRequired || eventData.eventsRequired || {};
  const rawEvents = weddingDetails.selectedEventTypes || [];

  // HELPER: Extract core ceremony name (e.g. "Engagement" from "Engagement - Forever Begins")
  const cleanCeremony = (e) => {
    if (!e) return "";
    const name = typeof e === 'string' ? e : (e.name || "");
    // Split by any dash (en-dash, em-dash, hyphen) or parenthesis or "Ceremony" 
    const cleaned = name.split(/[-–—(]/)[0].split(/ceremony/i)[0].trim();
    return cleaned;
  };

  const [eventSelections, setEventSelections] = useState(currentState.selectedStyles || {});
  const [ceremonies, setCeremonies] = useState([]);

  // DYNAMICALLY CALCULATE SELECTED EVENTS
  // We filter against the actual ceremonies list to purge old/legacy data from localStorage
  const availableNames = ceremonies.map(c => c.name);
  
  const validatedDetected = Object.keys(eventsRequired)
    .filter(key => eventsRequired[key] === true)
    .filter(key => availableNames.includes(key));

  const seenCore = new Set();
  const sourceList = validatedDetected.length > 0 ? validatedDetected : rawEvents;

  const selectedEventTypes = sourceList
    .filter(name => {
      const core = cleanCeremony(name);
      if (seenCore.has(core)) return false;
      seenCore.add(core);
      return true;
    })
    .filter(Boolean);

  useEffect(() => {
    const fetchDecorData = async () => {
      setLoading(true);
      try {
        const [decorRes, ceremonyRes] = await Promise.all([
          API.get('/decorations/'),
          API.get('/wedding-events/')
        ]);
        setDecorStyles(Array.isArray(decorRes.data) ? decorRes.data : []);
        setCeremonies(Array.isArray(ceremonyRes.data) ? ceremonyRes.data.filter(c => c.is_visible) : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setDecorStyles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDecorData();
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
    const updatedState = { ...currentState, selectedStyles: eventSelections, totalDecorCost: totalCost, step: 3 };
    localStorage.setItem('ongoing_booking', JSON.stringify(updatedState));
    navigate('/performers', { state: updatedState });
  };

  const getCategoryFromType = (type) => {
    if (!type) return 'Wedding Ceremony';
    const core = cleanCeremony(type);
    
    // Check if the ceremony exists in our fetched list and get its exact name
    const foundCeremony = ceremonies.find(c => c.name.toLowerCase() === type.toLowerCase());
    const effectiveName = foundCeremony ? foundCeremony.name : type;

    // Try matching with full name first, then core name
    const exactMatch = decorStyles.find(d => d.category && (
      d.category.toLowerCase() === effectiveName.toLowerCase() ||
      d.category.toLowerCase() === core.toLowerCase()
    ));
    if (exactMatch) return exactMatch.category;

    const ceremonyMatch = decorStyles.find(d => d.category && (
      d.category.toLowerCase() === `${effectiveName.toLowerCase()} ceremony` ||
      d.category.toLowerCase() === `${core.toLowerCase()} ceremony`
    ));
    if (ceremonyMatch) return ceremonyMatch.category;

    // Special cases
    const specialNames = ['sangeet night', 'gala reception', 'grand wedding', 'haldi', 'mehndi'];
    const specialMatch = decorStyles.find(d => d.category && 
      specialNames.some(sn => d.category.toLowerCase().includes(sn)) && 
      (d.category.toLowerCase().includes(core.toLowerCase()))
    );
    
    if (specialMatch) return specialMatch.category;

    return `${core} Ceremony`;
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
            const coreName = cleanCeremony(type);
            const categoryName = getCategoryFromType(type);

            // Filter from the dynamic decorStyles using the core name
            const options = decorStyles.filter(s => {
              if (!s.category) return false;
              const catLower = s.category.toLowerCase();
              const coreLower = coreName.toLowerCase();
              return catLower === categoryName.toLowerCase() || 
                     catLower.includes(coreLower) || 
                     coreLower.includes(catLower);
            });
            const currentSelection = eventSelections[type];

            return (
              <section key={type} style={{ marginBottom: 100, borderBottom: '1px solid #f0f0f0', paddingBottom: 60 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <h2 style={{ fontSize: '2.8rem', fontFamily: 'serif', margin: 0 }}>{type}</h2>
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
                          <img
                            src={decor.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'}
                            style={{ width: '100%', height: 280, objectFit: 'cover' }}
                          />
                          <div style={{ padding: 30, background: isSelected ? '#F9F4E8' : '#fff' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 8 }}>{decor.name}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: 900, color: '#C4A059', fontSize: '1.6rem' }}>₹{parseFloat(decor.price || 0).toLocaleString()}</div>
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
            )
        }) : (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
              <h2 style={{ fontFamily: 'serif' }}>No Ceremonies Found</h2>
              <p style={{ color: '#666', marginBottom: 40 }}>It looks like you haven't selected any ceremonies in the previous step.</p>
              <button onClick={() => navigate('/book-event')} style={{ padding: '18px 50px', background: '#111', color: '#fff', border: 'none', borderRadius: 50, fontWeight: 800, cursor: 'pointer' }}>Go to Booking Form</button>
            </div>
          ))}
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
