import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormContext } from '../contexts/FormContext';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const performersData = [
  { id: 'perf1', name: 'Live DJ', image: 'https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=800&q=60', price: 15000 },
  { id: 'perf2', name: 'Bollywood Band', image: 'https://images.unsplash.com/photo-1515165562835-c6f7b9cfc5d7?auto=format&fit=crop&w=800&q=60', price: 25000 },
  { id: 'perf3', name: 'Classical Ensemble', image: 'https://images.unsplash.com/photo-1530530827908-3b6f917b36cc?auto=format&fit=crop&w=800&q=60', price: 12000 }
];

const cateringData = [
  { id: 'cat1', name: 'Buffet - Local', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=60', price: 40000 },
  { id: 'cat2', name: 'Plated - Premium', image: 'https://images.unsplash.com/photo-1555992336-03a23c4dbb11?auto=format&fit=crop&w=800&q=60', price: 75000 },
  { id: 'cat3', name: 'Live Counters', image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=60', price: 60000 }
];

const ServicesPage = () => {
  const { formData, setFormData } = useContext(FormContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedOptions = {}, decorationsTotal = 0, selectedEvents = [], passedForm = null } = location.state || {};

  const [selectedPerformer, setSelectedPerformer] = useState(null);
  const [selectedCatering, setSelectedCatering] = useState(null);

  useEffect(() => {
    // if this page was reached without decoration selections, allow proceeding but warn
    // (no hard redirect - user may want to pick services independently)
  }, []);

  const performersPrice = selectedPerformer ? selectedPerformer.price : 0;
  const cateringPrice = selectedCatering ? selectedCatering.price : 0;
  const servicesTotal = performersPrice + cateringPrice;
  const grandTotal = decorationsTotal + servicesTotal;

  const handleFinish = () => {
    const updated = {
      ...(passedForm || formData || {}),
      decorations: selectedOptions,
      services: {
        performer: selectedPerformer,
        catering: selectedCatering,
        servicesTotal
      }
    };
    if (setFormData) setFormData(updated);

    // Navigate to dashboard and open Performers section
    navigate('/dashboard', { state: { openService: 'Performers' } });
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '80px auto 40px', padding: '0 20px', minHeight: 'calc(100vh - 400px)' }}>
        <h2 style={{ color: '#C4A059', fontWeight: '900', fontSize: '2.5rem', marginBottom: '10px' }}>Select Services</h2>
        <p style={{ color: '#666', marginBottom: '40px' }}>Elevate your event with our curated list of performers and culinary packages.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, marginTop: 20 }}>
          <div>
            <section style={{ marginBottom: 40 }}>
              <h3 style={{ marginBottom: 20, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '1px' }}>Performers</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {performersData.map(p => (
                  <div key={p.id} onClick={() => setSelectedPerformer(p)} style={{ cursor: 'pointer', borderRadius: 15, overflow: 'hidden', border: selectedPerformer && selectedPerformer.id === p.id ? '2px solid #C4A059' : '1px solid #eee', background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: '0.3s' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                    <div style={{ padding: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{p.name}</div>
                        <div style={{ color: '#888', fontSize: 13 }}>Artist Package</div>
                      </div>
                      <div style={{ fontWeight: 900, color: '#C4A059' }}>₹{p.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 style={{ marginBottom: 20, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '1px' }}>Catering Selection</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {cateringData.map(c => (
                  <div key={c.id} onClick={() => setSelectedCatering(c)} style={{ cursor: 'pointer', borderRadius: 15, overflow: 'hidden', border: selectedCatering && selectedCatering.id === c.id ? '2px solid #C4A059' : '1px solid #eee', background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: '0.3s' }}>
                    <img src={c.image} alt={c.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                    <div style={{ padding: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{c.name}</div>
                        <div style={{ color: '#888', fontSize: 13 }}>Gourmet Menu</div>
                      </div>
                      <div style={{ fontWeight: 900, color: '#C4A059' }}>₹{c.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside style={{ position: 'sticky', top: '120px', padding: 30, borderRadius: 20, background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #eee', height: 'fit-content' }}>
            <h4 style={{ marginTop: 0, fontSize: '1.4rem', fontWeight: '900', marginBottom: '20px' }}>Inquiry Details</h4>
            <div style={{ marginBottom: 25, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#888' }}>Decorations</span>
                <span style={{ fontWeight: 'bold' }}>₹{decorationsTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#888' }}>Performance</span>
                <span style={{ fontWeight: 'bold' }}>₹{performersPrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#888' }}>Catering</span>
                <span style={{ fontWeight: 'bold' }}>₹{cateringPrice.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ paddingTop: '20px', borderTop: '2px solid #f8fafc', marginBottom: 25 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900' }}>TOTAL</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#C4A059' }}>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={handleFinish} disabled={!selectedPerformer && !selectedCatering} style={{ padding: '18px', background: '#1a202c', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', width: '100%', fontWeight: '900', fontSize: '1rem', transition: '0.3s' }}>{!selectedPerformer && !selectedCatering ? 'CHOOSE SERVICES' : 'CONFIRM SELECTION'}</button>
            <button onClick={()=>navigate('/dashboard')} style={{ marginTop: 15, background: 'none', border: '1px solid #eee', padding: '12px', width: '100%', borderRadius: '12px', cursor: 'pointer', color: '#888', fontWeight: '700', fontSize: '0.85rem' }}>SKIP FOR NOW</button>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServicesPage;
