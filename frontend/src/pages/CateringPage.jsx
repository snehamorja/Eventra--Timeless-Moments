import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import CustomInquiryModal from '../components/CustomInquiryModal';

const CateringPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showInquiry, setShowInquiry] = useState(false);
  const [cateringList, setCateringList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatering = async () => {
        setLoading(true);
        try {
            const res = await API.get('/catering/');
            setCateringList(res.data || []);
        } catch (err) {
            console.error("Error fetching catering:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchCatering();
  }, []);

  const getInitialState = () => {
    if (location.state && location.state.guestCount) return location.state;
    const saved = localStorage.getItem('ongoing_booking');
    try {
      return saved ? (JSON.parse(saved) || {}) : {};
    } catch (e) {
      return {};
    }
  };

  const currentState = getInitialState() || {};
  const rawBudget = currentState.totalBudget ||
    currentState.budget_per_plate ||
    (currentState.eventData && currentState.eventData.budget) || 0;

  const totalBudget = parseFloat(rawBudget);
  const guestCount = parseInt(currentState.guestCount) || 1;

  // STRICT FILTER: Only show menus within the user's budget (0 to totalBudget)
  const filterCeiling = totalBudget > 0 ? totalBudget : 10000;
  const filteredMenus = cateringList.filter(m => (m.price_per_plate || m.price) <= filterCeiling);

  const handleSelect = (menu) => {
    const totalCateringCost = (menu.price_per_plate || menu.price || 0) * guestCount;
    const updatedState = {
      ...currentState,
      selectedMenu: menu,
      totalCateringCost: totalCateringCost,
      step: 2
    };
    localStorage.setItem('ongoing_booking', JSON.stringify(updatedState));
    navigate('/decoration', { state: updatedState });
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '100px' }}>
      <Navbar />

      <div style={{
        background: 'linear-gradient(135deg, #C4A059 0%, #D4B67C 100%)',
        padding: '15px',
        textAlign: 'center',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(196, 160, 89, 0.3)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.95, display: 'inline-block', marginRight: '20px' }}>
            🍽️ Want a fully bespoke menu or have dietary preferences?
          </p>
          <button
            onClick={() => setShowInquiry(true)}
            style={{
              background: '#fff',
              color: '#C4A059',
              border: 'none',
              padding: '6px 20px',
              borderRadius: '50px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Custom Menu Request
          </button>
        </div>
      </div>

      <div style={{ padding: '90px 20px', textAlign: 'center', backgroundColor: '#F9F4E8', borderBottom: '1px solid #EAE2D1' }}>
        <h1 style={{ fontSize: '3.5rem', fontFamily: 'serif', color: '#111', marginBottom: '20px' }}>
          💰 Choose Your Catering Menu <span style={{ color: '#C4A059' }}>(As Per Your Budget)</span>
        </h1>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '1.25rem', color: '#444', marginBottom: '10px', lineHeight: '1.6' }}>
            We respect your budget. Based on your selected budget of <strong>₹{totalBudget.toLocaleString()} / plate</strong>,
            we are showing only the menus that match your requirement.
          </p>

          <p style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic' }}>
            Note: Menus exceeding your budget will not be shown. This helps you plan without overspending.
          </p>
        </div>

        {totalBudget > 0 && (
          <div style={{
            marginTop: '30px',
            background: '#C4A059',
            color: '#fff',
            display: 'inline-block',
            padding: '10px 30px',
            borderRadius: '50px',
            fontWeight: 'bold',
            boxShadow: '0 10px 20px rgba(196, 160, 89, 0.2)'
          }}>
            🎯 TARGET BUDGET: ₹{totalBudget.toLocaleString()} / Plate
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1200, margin: '60px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '0 10px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#666' }}>
            {loading ? 'Finding menus...' : (
                <>Found <strong>{filteredMenus.length}</strong> menus within your limit</>
            )}
          </div>
          {totalBudget > 0 && cateringList.length > filteredMenus.length && (
            <div style={{ fontSize: '0.85rem', color: '#999', background: '#f5f5f5', padding: '5px 15px', borderRadius: '50px' }}>
              ℹ️ {cateringList.length - filteredMenus.length} expensive menus hidden
            </div>
          )}
        </div>

        {loading ? (
            <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.5rem', color: '#C4A059' }}>👨‍🍳 Boiling the Water for Your Feast...</div>
        ) : filteredMenus.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 40 }}>
            {filteredMenus.map(m => {
              const matchesExactly = totalBudget > 0 && (m.price_per_plate || m.price) === totalBudget;

              return (
                <div
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    border: matchesExactly ? '4px solid #C4A059' : '1px solid #eee',
                    background: '#fff',
                    boxShadow: matchesExactly ? '0 20px 40px rgba(196, 160, 89, 0.2)' : '0 10px 30px rgba(0,0,0,0.05)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    animation: 'fadeIn 0.5s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-15px)';
                    if (!matchesExactly) e.currentTarget.style.borderColor = '#C4A059';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    if (!matchesExactly) e.currentTarget.style.borderColor = '#eee';
                  }}
                >
                  {/* STATUS BADGE */}
                  {totalBudget > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      background: matchesExactly ? '#C4A059' : '#111',
                      color: '#fff',
                      padding: '5px 15px',
                      borderRadius: 50,
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      zIndex: 10,
                      boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                    }}>
                      {matchesExactly ? '🎯 BEST MATCH' : `💰 VALUE OPTION`}
                    </div>
                  )}

                  <img src={m.image} alt={m.name} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                  <div style={{ padding: 25 }}>
                    <div style={{ color: '#888', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '1px' }}>{m.tag || 'Selection Menu'}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#111', marginBottom: 10 }}>{m.name}</div>
                    <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 25, lineHeight: '1.5' }}>{m.description}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                      <div>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900 }}>₹{parseFloat(m.price_per_plate || m.price || 0).toLocaleString('en-IN')}</span>
                        <span style={{ color: '#999', fontSize: '0.8rem', marginLeft: 5 }}>/ plate</span>
                      </div>
                      <div style={{ color: '#C4A059', fontWeight: 'bold', fontSize: '0.9rem' }}>Select Menu →</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <h2 style={{ fontFamily: 'serif' }}>No menus found under ₹{totalBudget.toLocaleString()}</h2>
            <button onClick={() => navigate(-1)} style={{ marginTop: '30px', padding: '15px 40px', background: '#C4A059', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>Change Budget</button>
          </div>
        )}
      </div>
      <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
      <CustomInquiryModal
        isOpen={showInquiry}
        onClose={() => setShowInquiry(false)}
        eventType="Wedding Catering"
      />
    </div>
  );
};

export default CateringPage;
