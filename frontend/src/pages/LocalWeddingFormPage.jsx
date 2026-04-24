import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormContext } from '../contexts/FormContext';
import Navbar from '../components/Navbar';
import CustomAlert from '../components/CustomAlert';
import CustomInquiryModal from '../components/CustomInquiryModal';
import API from '../services/api';

const LocalWeddingFormPage = () => {
  const navigate = useNavigate();
  const { setFormData } = useContext(FormContext);
  const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '' });
  const [showInquiry, setShowInquiry] = useState(false);

  // --- Min date: 30 days from today ---
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 30); // Use 30 days consistently
    return minDate.toISOString().split('T')[0]; // YYYY-MM-DD
  };
  const minDate = getMinDate();

  const isDateTooSoon = (dateStr) => {
    if (!dateStr) return false;
    return dateStr < minDate;
  };

  const [ceremonies, setCeremonies] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. RESTORED FULL CONTENT STATE WITH AUTO-DRAFT ---
  const [form, setForm] = useState(() => {
    const defaultData = {
      brideName: '',
      groomName: '',
      contactNumber: '',
      countryCode: '+91',
      email: '',
      numberOfDays: '1',
      preferredTime: '',
      weddingDates: [''],
      eventsRequired: {}, 
      venueName: '',
      venueAddress: '',
      venueType: { Indoor: false, Outdoor: false },
      isDestinationWedding: '',
      approxBudget: '',
      budgetPriority: { Decoration: false, Catering: false, Photography: false, Entertainment: false },
      guestCount: '',
      weddingTheme: '',
      colorPreferences: '',
      culturalRequirements: '',
      notes: ''
    };

    const saved = localStorage.getItem('ongoing_booking');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedWedding = parsed.eventData?.wedding_details || {};
        return { ...defaultData, ...savedWedding };
      } catch (e) {
        console.error("Failed to parse saved draft", e);
      }
    }
    return defaultData;
  });

  useEffect(() => {
    const fetchCeremonies = async () => {
        try {
            const res = await API.get('/wedding-events/');
            const data = res.data || [];
            const visible = data.filter(c => c.is_visible);
            setCeremonies(visible);
            
            // Sync eventsRequired with new ceremonies (preserve existing selections)
            setForm(prev => {
                const newEventsRequired = { ...prev.eventsRequired };
                visible.forEach(c => {
                    if (newEventsRequired[c.name] === undefined) {
                        newEventsRequired[c.name] = false;
                    }
                });
                return { ...prev, eventsRequired: newEventsRequired };
            });
        } catch (err) {
            console.error("Error fetching ceremonies:", err);
            // Fallback
            const fallback = ["Mehendi", "Sangeet", "Haldi", "Wedding"];
            setForm(prev => {
                const newEventsRequired = { ...prev.eventsRequired };
                fallback.forEach(f => {
                    if (newEventsRequired[f] === undefined) newEventsRequired[f] = false;
                });
                return { ...prev, eventsRequired: newEventsRequired };
            });
        } finally {
            setLoading(false);
        }
    };
    fetchCeremonies();
  }, []);

  // Auto-save draft to local storage whenever form changes
  useEffect(() => {
    localStorage.setItem('wedding_form_draft', JSON.stringify(form));
  }, [form]);

  const handleChange = (field, value) => {
    // --- STRICT TYPE VALIDATION ---
    // Character only fields
    if (['brideName', 'groomName', 'venueName', 'weddingTheme', 'colorPreferences', 'culturalRequirements'].includes(field)) {
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
      setForm(prev => ({ ...prev, [field]: filteredValue }));
      return;
    }

    // Number only fields with length validation
    if (field === 'contactNumber') {
      const filteredValue = value.replace(/\D/g, '');
      // Get max length based on country code
      const maxLength = getPhoneMaxLength(form.countryCode);
      if (filteredValue.length <= maxLength) {
        setForm(prev => ({ ...prev, [field]: filteredValue }));
      }
      return;
    }

    if (['guestCount', 'approxBudget'].includes(field)) {
      const filteredValue = value.replace(/\D/g, '');
      setForm(prev => ({ ...prev, [field]: filteredValue }));
      return;
    }

    // Handle numberOfDays change - update weddingDates array
    if (field === 'numberOfDays') {
      const days = parseInt(value) || 1;
      const newDates = Array(days).fill('').map((_, i) => form.weddingDates[i] || '');
      setForm(prev => ({ ...prev, numberOfDays: value, weddingDates: newDates }));
      return;
    }

    setForm(prev => ({ ...prev, [field]: value }));
  };

  const getPhoneMaxLength = (countryCode) => {
    const lengths = {
      '+91': 10,  // India
      '+1': 10,   // USA/Canada
      '+44': 10,  // UK
      '+61': 9,   // Australia
      '+81': 10,  // Japan
      '+86': 11,  // China
      '+33': 9,   // France
      '+49': 11,  // Germany
      '+971': 9,  // UAE
      '+65': 8,   // Singapore
    };
    return lengths[countryCode] || 10;
  };

  const validatePhoneNumber = () => {
    const requiredLength = getPhoneMaxLength(form.countryCode);
    return form.contactNumber.length === requiredLength;
  };

  const handleDateChange = (index, value) => {
    const newDates = [...form.weddingDates];
    newDates[index] = value;
    setForm(prev => ({ ...prev, weddingDates: newDates }));
  };

  const handleCheckboxChange = (section, key) => {
    setForm(prev => {
      const currentSection = prev[section] || {};
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [key]: !currentSection[key]
        }
      };
    });
  };

  const handleProceed = () => {
    // Basic validation
    if (!form.brideName || !form.contactNumber || !form.email) {
      setCustomAlert({
        show: true,
        title: 'REQUIRED',
        message: 'Please fill in Bride Name, Contact Number, and Email'
      });
      return;
    }

    // --- Gmail Validation ---
    if (!form.email.toLowerCase().endsWith('@gmail.com')) {
      setCustomAlert({
        show: true,
        title: 'GMAIL ONLY',
        message: 'A valid @gmail.com email address is required.'
      });
      return;
    }

    // Validate phone number length
    if (!validatePhoneNumber()) {
      const requiredLength = getPhoneMaxLength(form.countryCode);
      setCustomAlert({
        show: true,
        title: 'INVALID PHONE',
        message: `Contact number must be exactly ${requiredLength} digits for ${form.countryCode}`
      });
      return;
    }

    // Validate all dates are filled and valid
    const emptyDates = form.weddingDates.filter(d => !d).length;
    if (emptyDates > 0) {
      setCustomAlert({
        show: true,
        title: 'DATES REQUIRED',
        message: `Please fill in all ${form.numberOfDays} wedding date(s)`
      });
      return;
    }

    // Check all dates are at least 1 month away
    const tooSoonDate = form.weddingDates.find(d => isDateTooSoon(d));
    if (tooSoonDate) {
      setCustomAlert({
        show: true,
        title: '❌ DATE NOT AVAILABLE',
        message: `Wedding dates must be at least 1 month from today.\nEarliest available date: ${minDate}\n\nPlease select a later date to proceed.`
      });
      return;
    }

    // --- CALCULATE SELECTED EVENTS ---
    const selectedEvents = ceremonies.filter(c => form.eventsRequired[c.name]);
    const selectedEventTypes = selectedEvents.map(e => e.name);

    if (selectedEvents.length === 0) {
      setCustomAlert({
        show: true,
        title: 'EVENTS REQUIRED',
        message: 'Please select at least one ceremony to continue (e.g., Wedding, Sangeet).'
      });
      return;
    }

    // --- PREPARE PAYLOAD ---
    const safeDate = form.weddingDates[0] || new Date().toISOString().split('T')[0];
    const safeGuests = parseInt(form.guestCount) || 50;

    const payload = {
      event_type: 'Weddings',
      event_date: safeDate,
      guests: safeGuests,
      budget: parseFloat(form.approxBudget) || 0,
      address: form.venueName ? `${form.venueName}, ${form.venueAddress}` : (form.venueAddress || "TBD"),
      wedding_details: {
        ...form,
        selectedEvents: selectedEvents,
        selectedEventTypes: selectedEventTypes
      }
    };

    const bookingData = {
      id: null,
      step: 1,
      guestCount: payload.guests,
      totalBudget: payload.budget,
      eventData: payload
    };

    // Save to local storage for persistence
    localStorage.setItem('ongoing_booking', JSON.stringify(bookingData));
    setFormData(form);
    
    // Navigate directly to Catering (Menu Selection)
    navigate('/catering', { state: bookingData });
  };

  // --- 2. STYLES (Pink/Purple Floral Aesthetic from Image) ---
  const styles = {
    pageWrapper: {
      background: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url('https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=2000&auto=format&fit=crop')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      fontFamily: '"Raleway", "Segoe UI", sans-serif',
      color: '#5D405C',
      paddingBottom: '60px'
    },
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '40px 20px',
    },
    headerContainer: {
      textAlign: 'center',
      marginBottom: '50px'
    },
    mainHeading: {
      fontSize: '42px',
      fontWeight: '300',
      color: '#5D405C',
      marginBottom: '10px',
      fontFamily: '"Playfair Display", serif'
    },
    sectionHeading: {
      fontSize: '20px',
      color: '#9C4B86',
      marginTop: '40px',
      marginBottom: '20px',
      borderBottom: '1px solid #e0cce0',
      paddingBottom: '10px',
      fontWeight: '600'
    },
    label: {
      display: 'block',
      fontSize: '15px',
      marginBottom: '8px',
      color: '#5D405C',
      fontWeight: '600'
    },
    input: {
      width: '100%',
      padding: '14px 18px',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      border: '2px solid #D4B2CA', // Softer pink border
      borderRadius: '8px',
      fontSize: '15px',
      color: '#4A3049',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.3s',
      marginBottom: '15px'
    },
    row: {
      display: 'flex',
      gap: '20px',
      marginBottom: '5px'
    },
    col: { flex: 1 },

    // Custom Controls
    checkboxGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      marginBottom: '15px'
    },
    pillLabel: {
      border: '1px solid #9C4B86',
      borderRadius: '20px',
      padding: '8px 20px',
      color: '#9C4B86',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s',
      backgroundColor: 'rgba(255,255,255,0.5)'
    },
    pillLabelActive: {
      backgroundColor: '#9C4B86',
      color: 'white',
      borderColor: '#9C4B86'
    },

    submitBtn: {
      marginTop: '50px',
      backgroundColor: '#9C4B86',
      color: 'white',
      padding: '18px 50px',
      fontSize: '18px',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      display: 'block',
      margin: '60px auto 0',
      boxShadow: '0 10px 25px rgba(156, 75, 134, 0.3)',
      fontWeight: 'bold',
      letterSpacing: '1px',
      transition: 'transform 0.2s'
    }
  };

  // Helper for Pill Checkboxes
  const PillCheckbox = ({ label, checked, onChange }) => (
    <label style={checked ? { ...styles.pillLabel, ...styles.pillLabelActive } : styles.pillLabel}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      {label}
    </label>
  );

  return (
    <div style={styles.pageWrapper}>
      <Navbar transparent={false} />

      {/* Customization Contact Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #9C4B86 0%, #D4A5C3 100%)',
        padding: '20px',
        textAlign: 'center',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(156, 75, 134, 0.3)',
        marginBottom: '20px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: '700' }}>
            ✨ Need Custom Wedding Planning?
          </h3>
          <p style={{ margin: 0, fontSize: '1rem', opacity: 0.95 }}>
            If you have specific customization requests beyond this form, we're here to help!
          </p>
          <button
            onClick={() => setShowInquiry(true)}
            style={{
              marginTop: '15px',
              background: '#FFD700',
              color: '#111',
              border: 'none',
              padding: '10px 25px',
              borderRadius: '50px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            ✨ Request Custom Plan
          </button>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.headerContainer}>
          <h1 style={styles.mainHeading}>Wedding Details Form</h1>
          <p style={{ fontSize: '18px', color: '#886' }}>Let's craft your perfect celebration together</p>
        </div>

        {/* 1. COUPLE INFO */}
        <h3 style={styles.sectionHeading}>Couple & Contact</h3>
        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Bride's Name *</label>
            <input style={styles.input} placeholder="Letters only" value={form.brideName} onChange={e => handleChange('brideName', e.target.value)} />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Groom's Name *</label>
            <input style={styles.input} placeholder="Letters only" value={form.groomName} onChange={e => handleChange('groomName', e.target.value)} />
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Contact Number *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                style={{ ...styles.input, width: '120px', marginBottom: 0 }}
                value={form.countryCode}
                onChange={e => handleChange('countryCode', e.target.value)}
              >
                <option value="+91">India +91</option>
                <option value="+1">USA +1</option>
                <option value="+44">UK +44</option>
                <option value="+61">Australia +61</option>
                <option value="+81">Japan +81</option>
                <option value="+86">China +86</option>
                <option value="+33">France +33</option>
                <option value="+49">Germany +49</option>
                <option value="+971">UAE +971</option>
                <option value="+65">Singapore +65</option>
              </select>
              <input
                style={{ ...styles.input, flex: 1, marginBottom: 0 }}
                placeholder={`${getPhoneMaxLength(form.countryCode)} digits`}
                value={form.contactNumber}
                onChange={e => handleChange('contactNumber', e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
              Enter {getPhoneMaxLength(form.countryCode)} digit phone number
            </div>
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Email Address *</label>
            <input style={styles.input} type="email" placeholder="example@gmail.com" value={form.email} onChange={e => handleChange('email', e.target.value)} />
          </div>
        </div>

        {/* 2. SCHEDULE */}
        <h3 style={styles.sectionHeading}>Wedding Schedule</h3>
        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Total Days *</label>
            <input
              style={styles.input}
              type="number"
              min="1"
              max="30"
              placeholder="Enter number of days (e.g., 1, 2, 3, 4, 5...)"
              value={form.numberOfDays}
              onChange={e => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) > 0 && parseInt(value) <= 30)) {
                  handleChange('numberOfDays', value || '1');
                }
              }}
            />
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
              Enter 1-30 days for your wedding celebration
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Preferred Time</label>
            <input
              style={styles.input}
              placeholder="e.g., Morning, Evening, 6 PM onwards, Full Day"
              value={form.preferredTime}
              onChange={e => handleChange('preferredTime', e.target.value)}
            />
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
              Type your preferred time or time range
            </div>
          </div>
        </div>

        <h3 style={styles.sectionHeading}>Wedding Date(s) *</h3>
        <p style={{ fontSize: '0.85rem', color: '#886', marginBottom: '15px', marginTop: '-10px' }}>
          📅 Wedding dates must be at least <strong>1 month from today</strong>. Earliest: <strong>{minDate}</strong>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {form.weddingDates.map((date, index) => (
            <div key={index}>
              <label style={styles.label}>Day {index + 1} Date</label>
              <input
                style={{
                  ...styles.input,
                  borderColor: isDateTooSoon(date) ? '#e53e3e' : '#D4B2CA',
                  background: isDateTooSoon(date) ? '#fff5f5' : 'rgba(255,255,255,0.6)'
                }}
                type="date"
                min={minDate}
                value={date}
                onChange={e => handleDateChange(index, e.target.value)}
                required
              />
              {isDateTooSoon(date) && (
                <div style={{ color: '#e53e3e', fontSize: '0.78rem', marginTop: '-10px', marginBottom: '8px', fontWeight: '600' }}>
                  ❌ Not Available — must be after {minDate}
                </div>
              )}
            </div>
          ))}
        </div>

        <h3 style={styles.sectionHeading}>Events Required</h3>
        <div style={styles.checkboxGroup}>
          {Object.keys(form.eventsRequired).map(event => (
            <PillCheckbox key={event} label={event} checked={form.eventsRequired[event]} onChange={() => handleCheckboxChange('eventsRequired', event)} />
          ))}
        </div>

        {/* --- 3. VENUE DETAILS --- */}
        <h3 style={styles.sectionHeading}>Venue Details</h3>
        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Venue Name (if decided)</label>
            <input style={styles.input} placeholder="Letters only" value={form.venueName} onChange={e => handleChange('venueName', e.target.value)} />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Venue City / Address</label>
            <input style={styles.input} value={form.venueAddress} onChange={e => handleChange('venueAddress', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
          <div>
            <label style={styles.label}>Destination Wedding?</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Yes', 'No'].map(opt => (
                <PillCheckbox key={opt} label={opt} checked={form.isDestinationWedding === opt} onChange={() => handleChange('isDestinationWedding', opt)} />
              ))}
            </div>
          </div>
          <div>
            <label style={styles.label}>Venue Type (Select all that apply)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Indoor', 'Outdoor'].map(opt => (
                <PillCheckbox
                  key={opt}
                  label={opt}
                  checked={(form.venueType || {})[opt]}
                  onChange={() => handleCheckboxChange('venueType', opt)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- 4. BUDGET & GUESTS --- */}
        <h3 style={styles.sectionHeading}>Budget & Guests</h3>
        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Estimated Guest Count *</label>
            <input style={styles.input} type="number" placeholder="Numbers only" value={form.guestCount} onChange={e => handleChange('guestCount', e.target.value)} />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Menu Budget Range</label>
            <input style={styles.input} placeholder="Numbers only (INR) Per Plate" value={form.approxBudget} onChange={e => handleChange('approxBudget', e.target.value)} />
          </div>
        </div>


        <h3 style={styles.sectionHeading}>Final Notes</h3>
        <textarea
          style={{ ...styles.input, height: '100px', fontFamily: 'inherit' }}
          placeholder="Any special requests?"
          value={form.notes}
          onChange={e => handleChange('notes', e.target.value)}
        />

        <button onClick={handleProceed} style={styles.submitBtn}>
          Proceed to Selection
        </button>

      </div>
      <CustomAlert
        show={customAlert.show}
        onClose={() => setCustomAlert({ ...customAlert, show: false })}
        title={customAlert.title}
        message={customAlert.message}
      />
      <CustomInquiryModal
        isOpen={showInquiry}
        onClose={() => setShowInquiry(false)}
        eventType="Wedding"
      />
    </div>
  );
};

export default LocalWeddingFormPage;
