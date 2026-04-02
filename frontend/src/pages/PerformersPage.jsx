import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormContext } from '../contexts/FormContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import CustomInquiryModal from '../components/CustomInquiryModal';

const performersData = [
  { id: 'perf1', name: 'Live DJ', image: 'https://i.pinimg.com/236x/5f/b8/05/5fb805a2bc65faccaf2aab4f49fe642a.jpg', price: 15000, details: 'High-energy DJ for dance sets.' },
  { id: 'perf2', name: 'Bollywood Band', image: 'https://artist-man.com/assets2/images/instrumental-band-for-weddings.jpg', price: 25000, details: 'Live band playing Bollywood hits.' },
  { id: 'perf3', name: 'Dance Performance', image: 'https://images.herzindagi.info/image/2022/Dec/wedding-choreography-india.jpg', price: 12000, details: 'Elegant dance performance for special moments.' }
];

const singersData = [
  { id: 'sng1', name: 'Jaysigh Gadhvi', image: 'https://imagesvs.oneindia.com/webp/img/2025/01/jaysinh-gadhavi-1736247845.jpg', price: 100000, details: 'Energetic stage presence.' },
  { id: 'sng2', name: 'Osman Mir', image: 'https://cdn.starclinch.in/artist/osman-mir/osman-mir-4.jpg?width=3840&quality=75&format=webp&flop=false', price: 90000, details: 'Top playback singer — soulful romantic numbers.' },
  { id: 'sng3', name: 'Kinjal Dave', image: 'https://sosimg.sgp1.cdn.digitaloceanspaces.com/artist-gallery/3945146_1706597088.webp', price: 82000, details: 'Renowned vocalist with versatile repertoire.' },
  { id: 'sng4', name: 'Hariom Gadhvi ', image: 'https://usimg.sulekha.io/cdn/events/images/hariom-gadhvi_2024-09-13-07-40-17-282_63.webp', price: 88000, details: 'High-energy performer — perfect for lively sets.' }
];

const PerformersPage = () => {
  const { formData, setFormData } = useContext(FormContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showInquiry, setShowInquiry] = useState(false);

  const getInitialState = () => {
    if (location.state && location.state.selectedStyles) return location.state;
    const saved = localStorage.getItem('ongoing_booking');
    return saved ? JSON.parse(saved) : {};
  };

  const currentState = getInitialState();
  const { selectedEvents = [] } = currentState;

  const [selectedPerformer, setSelectedPerformer] = useState(null);

  useEffect(() => {
    const bookingId = localStorage.getItem("booking_id");
    if (bookingId) {
      API.get(`booking-draft/${bookingId}/`)
        .then(res => {
          if (res.data.performer) {
            const draftPerf = res.data.performer;
            const perfInList = [...performersData, ...singersData].find(p => p.id === draftPerf.performer_id || p.name === draftPerf.performer_name);
            if (perfInList) setSelectedPerformer(perfInList);
          }
        })
        .catch(err => console.error("Error loading performer draft:", err));
    }
  }, []);

  const handleNext = (overridePerformer) => {
    const activePerformer = overridePerformer || selectedPerformer;

    // Update persistent state
    const updatedState = {
      ...currentState,
      selectedPerformer: activePerformer,
      step: 4
    };
    localStorage.setItem('ongoing_booking', JSON.stringify(updatedState));

    navigate('/invoice', { state: updatedState });
  };

  const handleSkip = () => handleNext(null);

  const renderCard = (p) => (
    <div key={p.id} style={{ borderRadius: 15, overflow: 'hidden', border: selectedPerformer?.id === p.id ? '3px solid #C4A059' : '1px solid #eee', background: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}>
      <img src={p.image} alt={p.name} onClick={() => setSelectedPerformer(p)} style={{ width: '100%', height: 180, objectFit: 'cover', cursor: 'pointer' }} />
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#333' }}>{p.name}</div>
        <p style={{ color: '#888', fontSize: '0.9rem', margin: '10px 0' }}>Perfect for wedding ceremonies, sangeet nights, and receptions.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#111' }}>₹{p.price.toLocaleString('en-IN')}</span>
          <button onClick={() => handleNext(p)} style={{ padding: '10px 20px', background: '#C4A059', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Select</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '100px' }}>
      <Navbar />

      <div style={{
        background: 'linear-gradient(135deg, #111 0%, #333 100%)',
        padding: '15px',
        textAlign: 'center',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.95, display: 'inline-block', marginRight: '20px' }}>
            🎤 Want a specific celebrity artist or unique entertainment act?
          </p>
          <button
            onClick={() => setShowInquiry(true)}
            style={{
              background: '#C4A059',
              color: '#fff',
              border: 'none',
              padding: '6px 20px',
              borderRadius: '50px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Request Artist
          </button>
        </div>
      </div>

      <div style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: '#F9F4E8' }}>
        <h1 style={{ fontSize: '3rem', fontFamily: 'serif', color: '#111', marginBottom: '15px' }}>Wedding Performers</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          Discover performers who bring energy and entertainment to your wedding celebrations.
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '60px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <section>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', fontFamily: 'serif' }}>Featured Singers</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {singersData.map(renderCard)}
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', fontFamily: 'serif' }}>Curated Performers</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {performersData.map(renderCard)}
              </div>
            </section>
          </div>

          {/* Sticky Summary Sidebar */}
          <aside style={{ height: 'fit-content', position: 'sticky', top: '100px', padding: 30, borderRadius: 20, background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
            <h4 style={{ fontSize: '1.4rem', marginBottom: 20, fontFamily: 'serif' }}>Your Selection</h4>
            <div style={{ minHeight: '100px' }}>
              {selectedPerformer ? (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <img src={selectedPerformer.image} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10, marginBottom: 15 }} />
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedPerformer.name}</div>
                  <div style={{ color: '#C4A059', fontWeight: 900, marginTop: 5 }}>₹{selectedPerformer.price.toLocaleString('en-IN')}</div>
                </div>
              ) : (
                <div style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>No performer selected</div>
              )}
            </div>

            <button
              onClick={() => handleNext()}
              disabled={!selectedPerformer}
              style={{ marginTop: 30, width: '100%', padding: '15px', background: selectedPerformer ? '#C4A059' : '#ccc', color: '#fff', border: 'none', borderRadius: 10, cursor: selectedPerformer ? 'pointer' : 'not-allowed', fontWeight: 800, fontSize: '1rem', transition: 'all 0.3s' }}
            >
              Confirm Selection
            </button>
            <button onClick={handleSkip} style={{ marginTop: 15, width: '100%', padding: '12px', background: 'transparent', border: '1px solid #ddd', borderRadius: 10, cursor: 'pointer', color: '#666', fontWeight: 600 }}>Skip to Summary</button>
          </aside>

        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <CustomInquiryModal
        isOpen={showInquiry}
        onClose={() => setShowInquiry(false)}
        eventType="Wedding Performer"
      />
    </div>
  );
};

export default PerformersPage;