import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

const BookingForm = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Incoming state from Event Selection or Previous Steps
    const selectedDecoration = location.state?.selectedDecoration || null;
    const initialType = location.state?.eventType || '';
    const basicDetails = location.state?.basicDetails || {};

    const [loading, setLoading] = useState(false);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '' });

    // --- RESTORED ORIGINAL FIELDS (Couple, Schedule, Venue, Budget) ---
    const [form, setForm] = useState({
        // System Fields
        event_type: initialType,
        event_date: basicDetails.weddingDate || '',
        guests: basicDetails.guestCount || '',
        budget_per_plate: '',
        venue_address: basicDetails.venueAddress || '',

        // Detailed Fields
        brideName: basicDetails.brideName || '',
        groomName: basicDetails.groomName || '',
        primaryContact: basicDetails.primaryContact || '',
        countryCode: basicDetails.countryCode || '+91',
        contactNumber: basicDetails.contactNumber || '',
        email: basicDetails.email || '',

        preferredTime: basicDetails.preferredTime || '',
        numberOfDays: basicDetails.numberOfDays || '',
        eventsRequired: basicDetails.eventsRequired || {
            Mehendi: false, Sangeet: false, Haldi: false, Wedding: false, Reception: false
        },

        venueName: basicDetails.venueName || '',
        venueType: basicDetails.venueType || '',
        isDestinationWedding: basicDetails.isDestinationWedding || 'No',

        isVIPGuests: basicDetails.isVIPGuests || '',
        kidsAttending: basicDetails.kidsAttending || '',

        approxTotalBudget: basicDetails.approxBudget || '',
        budgetPriority: basicDetails.budgetPriority || {
            Decoration: false, Catering: false, Photography: false, Entertainment: false
        },

        weddingTheme: basicDetails.weddingTheme || '',
        colorPreferences: basicDetails.colorPreferences || '',
        culturalRequirements: basicDetails.culturalRequirements || '',

        specialRequests: basicDetails.specialRequests || '',
        accessibilityRequirements: basicDetails.accessibilityRequirements || '',
        notes: basicDetails.notes || ''
    });

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (section, key) => {
        setForm(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: !prev[section][key]
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.event_type || !form.event_date || !form.guests || !form.budget_per_plate || !form.venue_address) {
            setCustomAlert({
                show: true,
                title: 'REQUIRED',
                message: "Please fill in key event details: Event Type, Date, Guests, Per Plate Budget, and Address."
            });
            return;
        }

        setLoading(true);

        const payload = {
            event_type: form.event_type,
            event_date: form.event_date,
            guests: parseInt(form.guests),
            budget: parseFloat(form.budget_per_plate), // Model expects Decimal
            address: `${form.venueName ? form.venueName + ', ' : ''}${form.venue_address}`,
            selected_decoration: selectedDecoration ? selectedDecoration.id : null,
            wedding_details: {
                brideName: form.brideName,
                groomName: form.groomName,
                primaryContact: form.primaryContact,
                contactNumber: form.contactNumber,
                email: form.email,
                schedule: {
                    preferredTime: form.preferredTime,
                    numberOfDays: form.numberOfDays,
                    eventsRequired: form.eventsRequired
                },
                venue: {
                    type: form.venueType,
                    isDestination: form.isDestinationWedding
                },
                guests: {
                    isVIP: form.isVIPGuests,
                    kids: form.kidsAttending
                },
                budget: {
                    approxTotal: form.approxTotalBudget,
                    priorities: form.budgetPriority
                },
                preferences: {
                    theme: form.weddingTheme,
                    colors: form.colorPreferences,
                    culture: form.culturalRequirements
                },
                notes: {
                    special: form.specialRequests,
                    access: form.accessibilityRequirements,
                    general: form.notes
                }
            }
        };

        try {
            const response = await api.post('/bookings/', payload);
            handleBookingRedirect(navigate, { ...payload, budget: form.budget_per_plate }, response.data.id);
        } catch (err) {
            console.error("Booking submission error:", err);
            if (err.response?.status === 401) {
                setCustomAlert({
                    show: true,
                    title: 'EXPIRED',
                    message: 'Your session has expired. Please login again.'
                });
                setTimeout(() => navigate('/login'), 2500);
                return;
            }
            setCustomAlert({
                show: true,
                title: 'FAILED',
                message: "Failed to submit booking. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    // --- EXACT IMAGE 1 CSS ("Ready to Create..." Paper Look) ---
    const styles = {
        // The overall page background - matching the cream from the image
        pageWrapper: {
            backgroundColor: '#ffffff', // The image has a white background for the content area
            minHeight: '100vh',
            fontFamily: '"Times New Roman", Times, serif', // KEY: Serif font
            color: '#000',
            padding: '20px'
        },
        container: {
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#fff' // White paper background
        },
        // The Headers: ALL CAPS, Serif, Dark
        sectionHeader: {
            fontSize: '24px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: '#1a1a1a',
            marginBottom: '15px',
            marginTop: '30px',
            letterSpacing: '1px'
        },
        // The Inputs: Boxy, gray border, white bg
        input: {
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #777', // Darker gray border
            borderRadius: '0px', // Sharp corners
            fontSize: '16px',
            marginBottom: '5px',
            fontFamily: 'Arial, sans-serif' // Inputs often standardized to sans
        },
        // Layout helpers
        row: {
            display: 'flex',
            gap: '30px',
            marginBottom: '10px',
            alignItems: 'center'
        },
        col: {
            flex: 1
        },
        // Radio buttons & Labels
        labelTitle: {
            fontSize: '18px',
            color: '#1a1a1a',
            marginRight: '20px'
        },
        radioLabel: {
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            color: '#1a1a1a'
        },
        radioInput: {
            transform: 'scale(1.2)', // Slightly larger radio buttons
            cursor: 'pointer'
        },
        checkboxItem: {
            fontSize: '16px',
            marginRight: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer'
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <Navbar />

            <div style={styles.container}>
                {/* 1. BASIC INFORMATION */}
                <h2 style={styles.sectionHeader}>BASIC INFORMATION</h2>

                <div style={styles.row}>
                    <div style={styles.col}>
                        <input style={styles.input} placeholder="Bride's Name" value={form.brideName} onChange={e => handleChange('brideName', e.target.value)} />
                    </div>
                    <div style={styles.col}>
                        <input style={styles.input} placeholder="Groom's Name" value={form.groomName} onChange={e => handleChange('groomName', e.target.value)} />
                    </div>
                </div>

                <div style={{ ...styles.row, marginTop: '5px' }}>
                    <span style={styles.labelTitle}>Wedding Location:</span>
                    <label style={styles.radioLabel}>
                        <input type="radio" style={styles.radioInput} checked={form.isDestinationWedding === 'No'} onChange={() => handleChange('isDestinationWedding', 'No')} /> Local
                    </label>
                    <label style={styles.radioLabel}>
                        <input type="radio" style={styles.radioInput} checked={form.isDestinationWedding === 'Yes'} onChange={() => handleChange('isDestinationWedding', 'Yes')} /> Destination
                    </label>
                </div>

                {/* Date styling to match 'dd-mm-yyyy' blocks */}
                <div style={{ marginTop: '10px' }}>
                    <div style={{ width: '200px', marginBottom: '10px' }}>
                        <input type="date" style={styles.input} value={form.event_date} onChange={e => handleChange('event_date', e.target.value)} />
                    </div>
                    <div style={{ width: '200px', marginBottom: '10px' }}>
                        <input type="time" style={styles.input} value={form.preferredTime === 'Morning' ? '09:00' : ''} onChange={e => handleChange('preferredTime', 'Morning')} />
                    </div>
                </div>

                {/* 2. VENUE INFORMATION */}
                <h2 style={styles.sectionHeader}>VENUE INFORMATION</h2>

                <div style={styles.row}>
                    <div style={styles.col}>
                        <input style={styles.input} placeholder="Venue Name" value={form.venueName} onChange={e => handleChange('venueName', e.target.value)} />
                    </div>
                    <div style={{ flex: 2 }}>
                        <input style={styles.input} placeholder="Full Address" value={form.venue_address} onChange={e => handleChange('venue_address', e.target.value)} />
                    </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <div style={{ fontSize: '18px', marginBottom: '8px' }}>Is the venue confirmed?</div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label style={styles.radioLabel}>
                            <input type="radio" style={styles.radioInput} checked={form.venueType === 'Indoor'} onChange={() => handleChange('venueType', 'Indoor')} /> Yes
                        </label>
                        <label style={styles.radioLabel}>
                            <input type="radio" style={styles.radioInput} checked={form.venueType === 'Outdoor'} onChange={() => handleChange('venueType', 'Outdoor')} /> No
                        </label>
                    </div>
                </div>
                <div style={{ marginTop: '15px' }}>
                    <div style={{ fontSize: '18px', marginBottom: '8px' }}>Does the venue have a kitchen?</div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label style={styles.radioLabel}>
                            <input type="radio" style={styles.radioInput} checked={true} readOnly /> Yes
                        </label>
                        <label style={styles.radioLabel}>
                            <input type="radio" style={styles.radioInput} checked={false} readOnly /> No
                        </label>
                    </div>
                </div>

                {/* 3. GUEST INFORMATION */}
                <h2 style={styles.sectionHeader}>GUEST INFORMATION</h2>
                <div style={styles.row}>
                    <div style={styles.col}>
                        <input style={styles.input} placeholder="Guest Count" value={form.guests} onChange={e => handleChange('guests', e.target.value)} />
                    </div>
                    <div style={styles.col}>
                        <input style={styles.input} placeholder="Table Count (Optional)" />
                    </div>
                </div>
                <div style={{ width: '250px', marginTop: '10px' }}>
                    <select style={styles.input}>
                        <option>Plated / Sit-Down</option>
                        <option>Buffet</option>
                    </select>
                </div>


                {/* 4. MENU PREFERENCES (Header Only - Using our Data) */}
                <h2 style={styles.sectionHeader}>MENU PREFERENCES</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <input style={{ ...styles.input, width: '300px' }} placeholder="General Menu Preference" value={form.weddingTheme} onChange={e => handleChange('weddingTheme', e.target.value)} />
                    <span style={{ fontSize: '18px' }}>Dietary Requirements</span>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    {['Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Nut Allergies', 'Other'].map(item => (
                        <label key={item} style={styles.checkboxItem}>
                            <input type="checkbox" /> {item}
                        </label>
                    ))}
                </div>
                <div style={{ width: '200px' }}>
                    <select style={styles.input}>
                        <option>Indian</option>
                        <option>Continental</option>
                    </select>
                </div>


                {/* 5. ADDITIONAL SERVICES (Mapped to our Events) */}
                <h2 style={styles.sectionHeader}>ADDITIONAL SERVICES</h2>
                <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {Object.keys(form.eventsRequired).map(event => (
                        <label key={event} style={styles.checkboxItem}>
                            <input type="checkbox" checked={form.eventsRequired[event]} onChange={() => handleCheckboxChange('eventsRequired', event)} /> {event}
                        </label>
                    ))}
                </div>

                {/* 6. BUDGET INFORMATION */}
                <h2 style={styles.sectionHeader}>BUDGET INFORMATION</h2>
                <div style={{ width: '300px' }}>
                    <input style={styles.input} placeholder="Budget Range (e.g. 1500 per plate)" value={form.budget_per_plate} onChange={e => handleChange('budget_per_plate', e.target.value)} />
                </div>

                {/* 7. CONTACT INFORMATION */}
                <h2 style={styles.sectionHeader}>CONTACT INFORMATION</h2>
                {/* (Keeping it simple to match the image density) */}
                <div style={styles.row}>
                    <div style={styles.col}>
                        <input style={styles.input} placeholder="Contact Name" value={form.primaryContact} onChange={e => handleChange('primaryContact', e.target.value)} />
                    </div>
                    <div style={styles.col}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <select
                                style={{ ...styles.input, width: '100px', marginBottom: 0 }}
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
                                placeholder="Phone Number"
                                value={form.contactNumber}
                                onChange={e => handleChange('contactNumber', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={loading} style={{
                    marginTop: '40px',
                    padding: '12px 40px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: '#EAB308', // Gold
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                    {loading ? 'Submitting...' : 'SUBMIT'}
                </button>

            </div>
            <CustomAlert
                show={customAlert.show}
                onClose={() => setCustomAlert({ ...customAlert, show: false })}
                title={customAlert.title}
                message={customAlert.message}
            />
        </div>
    );
};

const handleBookingRedirect = (navigate, data, bookingId) => {
    // Sanitise budget - extract only digits if user typed something like "500 per plate"
    const cleanBudget = String(data.budget || '0').replace(/[^0-9.]/g, '');

    const bookingData = {
        id: bookingId,
        step: 1,
        guestCount: Number(data.guests) || 1,
        totalBudget: parseFloat(cleanBudget) || 0,
        eventData: data
    };
    localStorage.setItem('ongoing_booking', JSON.stringify(bookingData));
    navigate('/catering', { state: bookingData });
};

export default BookingForm;
