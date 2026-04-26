import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormContext } from '../contexts/FormContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import CustomInquiryModal from '../components/CustomInquiryModal';

const PerformersPage = () => {
  const { formData, setFormData } = useContext(FormContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showInquiry, setShowInquiry] = useState(false);
  const [perfList, setPerfList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getInitialState = () => {
    try {
      if (location.state && (location.state.selectedStyles || location.state.selectedMenu || location.state.selectedPerformer)) {
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
  const eventData = currentState.eventData || {};
  const weddingDetails = eventData.wedding_details || {};
  const selectedEvents = weddingDetails.selectedEvents || [];

  const [selectedPerformer, setSelectedPerformer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await API.get('/performers/');
        setPerfList(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching performers:", err);
        setPerfList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Dynamically group performers by their category
  const categories = [...new Set(perfList.map(p => p.category || 'Other Performers'))];

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
      <img src={p.image} alt={p.name} onClick={() => setSelectedPerformer(p)} style={{ width: '100%', height: 220, objectFit: 'cover', cursor: 'pointer' }} />
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#333' }}>{p.name}</div>
        <p style={{ color: '#888', fontSize: '0.9rem', margin: '10px 0' }}>{p.description || 'Perfect for any celebration.'}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#111' }}>₹{parseFloat(p.price || 0).toLocaleString('en-IN')}</span>
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem', color: '#666' }}>⚡ Harmonizing Talent Profiles...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {categories.map(cat => {
                const categoryPerformers = perfList.filter(p => (p.category || 'Other Performers') === cat);
                if (categoryPerformers.length === 0) return null;
                return (
                  <section key={cat}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', fontFamily: 'serif', textTransform: 'capitalize' }}>
                      {cat}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                      {categoryPerformers.map(renderCard)}
                    </div>
                  </section>
                );
              })}

              {perfList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px', background: '#F9F4E8', borderRadius: 20 }}>
                  <h3>No performers currently listed.</h3>
                  <p>Please check back later or request a specific artist below.</p>
                </div>
              )}
            </div>

            {/* Sticky Summary Sidebar */}
            <aside style={{ height: 'fit-content', position: 'sticky', top: '100px', padding: 30, borderRadius: 20, background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
              <h4 style={{ fontSize: '1.4rem', marginBottom: 20, fontFamily: 'serif' }}>Your Selection</h4>
              <div style={{ minHeight: '100px' }}>
                {selectedPerformer ? (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <img src={selectedPerformer.image} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10, marginBottom: 15 }} />
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedPerformer.name}</div>
                    <div style={{ color: '#C4A059', fontWeight: 900, marginTop: 5 }}>₹{parseFloat(selectedPerformer.price || 0).toLocaleString('en-IN')}</div>
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
        )}
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