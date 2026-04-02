import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CustomInquiryModal from '../components/CustomInquiryModal';

const cateringData = [
  { id: 1, name: 'Basic High Tea', tag: '🥬 Veg • Snacks', price: 150, image: 'https://superbcatering.com.au/wp-content/uploads/2020/04/buffet-dinner-01.jpg', description: 'Simple tea, coffee and assorted indian snacks.' },
  { id: 2, name: 'Street Food Gala', tag: '🥬 Veg • Chaat', price: 350, image: 'https://tse1.mm.bing.net/th/id/OIP.16E5a2KxF1ddPHlyZc1p0wHaHa?pid=Api&P=0&h=180', description: 'Interactive stalls with pani puri, pav bhaji and more.' },
  { id: 3, name: 'Standard Indian Buffet', tag: '🥬 Veg • North Indian', price: 500, image: 'https://media.istockphoto.com/id/650655146/photo/catering-food-wedding-event-table.jpg?s=612x612&w=0&k=20&c=ATGYgW8bM_559jJ5aUNO4HlJqpkOWUmNNMMflx5kajo=', description: 'Standard menu with 2 mains, 1 dessert and assorted breads.' },
  { id: 4, name: 'Heritage Gujarati Thali', tag: '🥬 Veg • Gujarati', price: 800, image: 'https://www.shaadidukaan.com/vogue/wp-content/uploads/2019/10/1540978205thali-banner.jpg', description: 'A rich spread of traditional Gujarati heritage dishes.' },
  { id: 5, name: 'Royal Indian Feast', tag: '🥬 Veg • Multi-Cuisine', price: 1200, image: 'https://blog.venuelook.com/wp-content/uploads/2025/03/Traditional-Wedding-Catering-Menus-Across-India.jpg', description: 'A grand spread of royal Indian delicacies for your special day.' },
  { id: 6, name: 'Continental Luxe', tag: '🥬 Veg • Western', price: 1800, image: 'https://worldcuisinesfactory.com/wp-content/IMAGES/home-page/banner-home-page-02.webp', description: 'Premium international cuisines with refined gourmet service.' },
  { id: 7, name: 'Grand Emperor Menu', tag: '🥬 Veg • Fusion', price: 2500, image: 'https://s3-media0.fl.yelpcdn.com/bphoto/JDZn3EmWyqd23vNN2jM4Xg/1000s.jpg', description: 'The ultimate luxury dining experience with vintage service.' },
  {
    id: 8,
    name: 'Royal South Indian Wedding Feast',
    tag: '🥬 Veg • South Indian',
    price: 950,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHiqWwWgd3_NhYcQrQ0fmF7YZ_8hMfdxnpNQ&s',
    description: 'Traditional wedding-style dosa, idli, vada, sambhar, rasam and coconut chutneys.'
  },
  {
    id: 9,
    name: 'Punjabi Shaadi Da Swad',
    tag: '🥬 Veg • Punjabi',
    price: 750,
    image: 'https://shwetainthekitchen.com/wp-content/uploads/2019/11/IMG_6934_1-scaled.jpg',
    description: 'Wedding-special Punjabi curries, dal makhani, butter naan and jeera rice.'
  },
  {
    id: 10,
    name: 'Italian Live Wedding Counter',
    tag: '🥬 Veg • Italian',
    price: 900,
    image: 'https://www.babulcaterer.com/wp-content/uploads/2025/01/kolkata-live-catering-babul-caterer.jpg',
    description: 'Live pizza and pasta counters with premium toppings for wedding guests.'
  },
  {
    id: 11,
    name: 'Mexican Wedding Fiesta',
    tag: '🥬 Veg • Mexican',
    price: 1050,
    image: 'https://thumbs.dreamstime.com/b/colorful-mexican-food-buffet-featuring-tacos-tamales-nachos-sides-blue-table-keywords-enchiladas-showing-424541176.jpg',
    description: 'Colorful Mexican spread with tacos, nachos, enchiladas and wedding-style presentation.'
  },
  {
    id: 12,
    name: 'Pan-Asian Royal Wedding Spread',
    tag: '🥬 Veg • Asian',
    price: 700,
    image: 'https://images.immediate.co.uk/production/volatile/sites/30/2023/12/StickyOrangeTofuVegNoodles-68d71f9.jpg?quality=90&resize=556,505',
    description: 'Premium Asian wedding menu with noodles, fried rice, dim sums and stir-fries.'
  },
  {
    id: 13,
    name: 'Grand Wedding Dessert Bazaar',
    tag: '🥬 Veg • Desserts',
    price: 850,
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEipY-3HpbqRmMR6GK6ZFzHZw06kOX0MlREYhsF0ziX9uz3LJ4_lPbhqZ-3jYaKXHqB6kAvWnmQrVi5JUpgjPsVWxbXcVmrqfi7lNxomEk9iOsBeuHKerP9rPGDOHoJjF7FYRkrvUC1Jhyk/s1600/992.jpg',
    description: 'Wedding dessert counters featuring Indian sweets, kulfi, waffles and pastries.'
  },
  {
    id: 14,
    name: 'Kids Wedding Treat Menu',
    tag: '🥬 Veg • Kids',
    price: 450,
    image: 'https://www.peanutblossom.com/wp-content/uploads/2023/10/dinnerideasforkids.jpg',
    description: 'Kid-friendly wedding menu with simple snacks, sweets and fun presentation.'
  }
];

const CateringPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showInquiry, setShowInquiry] = useState(false);

  const getInitialState = () => {
    if (location.state && location.state.guestCount) return location.state;
    const saved = localStorage.getItem('ongoing_booking');
    return saved ? JSON.parse(saved) : {};
  };

  const currentState = getInitialState();
  const rawBudget = currentState.totalBudget ||
    currentState.budget_per_plate ||
    (currentState.eventData && currentState.eventData.budget) || 0;

  const totalBudget = parseFloat(rawBudget);
  const guestCount = parseInt(currentState.guestCount) || 1;

  // STRICT FILTER: Only show menus within the user's budget (0 to totalBudget)
  const filterCeiling = totalBudget > 0 ? totalBudget : 10000;
  const filteredMenus = cateringData.filter(m => m.price <= filterCeiling);

  const handleSelect = (menu) => {
    const totalCateringCost = menu.price * guestCount;
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
            Found <strong>{filteredMenus.length}</strong> menus within your limit
          </div>
          {totalBudget > 0 && cateringData.length > filteredMenus.length && (
            <div style={{ fontSize: '0.85rem', color: '#999', background: '#f5f5f5', padding: '5px 15px', borderRadius: '50px' }}>
              ℹ️ {cateringData.length - filteredMenus.length} expensive menus hidden
            </div>
          )}
        </div>

        {filteredMenus.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 40 }}>
            {filteredMenus.map(m => {
              const matchesExactly = totalBudget > 0 && m.price === totalBudget;

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
                    <div style={{ color: '#888', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '1px' }}>{m.tag}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#111', marginBottom: 10 }}>{m.name}</div>
                    <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 25, lineHeight: '1.5' }}>{m.description}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                      <div>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900 }}>₹{m.price.toLocaleString('en-IN')}</span>
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
