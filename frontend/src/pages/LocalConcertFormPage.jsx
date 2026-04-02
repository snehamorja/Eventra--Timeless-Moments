import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormContext } from '../contexts/FormContext';
import Navbar from '../components/Navbar';
import CustomAlert from '../components/CustomAlert';

const LocalConcertFormPage = () => {
    const navigate = useNavigate();
    const { setFormData } = useContext(FormContext);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '' });

    // --- 1. CONCERT FORM STATE ---
    const [form, setForm] = useState({
        // Artist & Contact Information
        artistName: '',
        bandName: '',
        countryCode: '+91',
        contactNumber: '',
        email: '',

        // Concert Schedule
        numberOfDays: '1',
        concertDates: [''],
        preferredTime: '',
        concertType: {
            'Rock': false, 'Pop': false, 'Jazz': false, 'Classical': false, 'EDM': false, 'Hip-Hop': false
        },

        // Venue Details
        venueName: '',
        venueAddress: '',
        venueType: { Indoor: false, Outdoor: false },
        isInternational: '',

        // Audience Information
        expectedAudience: '',

        // Budget Overview
        approxBudget: '',
        budgetPriority: {
            'Sound System': false, 'Lighting': false, 'Stage Setup': false, 'Security': false
        },

        // Preferences
        concertTheme: '',
        specialRequirements: '',

        // Additional Information
        notes: ''
    });

    const handleChange = (field, value) => {
        // --- STRICT TYPE VALIDATION ---
        // Character only fields
        if (['artistName', 'bandName', 'venueName', 'concertTheme', 'specialRequirements'].includes(field)) {
            const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
            setForm(prev => ({ ...prev, [field]: filteredValue }));
            return;
        }

        // Number only fields with length validation
        if (field === 'contactNumber') {
            const filteredValue = value.replace(/\D/g, '');
            const maxLength = getPhoneMaxLength(form.countryCode);
            if (filteredValue.length <= maxLength) {
                setForm(prev => ({ ...prev, [field]: filteredValue }));
            }
            return;
        }

        if (['expectedAudience', 'approxBudget'].includes(field)) {
            const filteredValue = value.replace(/\D/g, '');
            setForm(prev => ({ ...prev, [field]: filteredValue }));
            return;
        }

        // Handle numberOfDays change - update concertDates array
        if (field === 'numberOfDays') {
            const days = parseInt(value) || 1;
            const newDates = Array(days).fill('').map((_, i) => form.concertDates[i] || '');
            setForm(prev => ({ ...prev, numberOfDays: value, concertDates: newDates }));
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
        const newDates = [...form.concertDates];
        newDates[index] = value;
        setForm(prev => ({ ...prev, concertDates: newDates }));
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

    const handleProceed = () => {
        // Basic validation
        if (!form.artistName || !form.contactNumber) {
            setCustomAlert({
                show: true,
                title: 'REQUIRED',
                message: 'Please fill in at least the Artist Name and Contact Number'
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

        // Validate all dates are filled
        const emptyDates = form.concertDates.filter(d => !d).length;
        if (emptyDates > 0) {
            setCustomAlert({
                show: true,
                title: 'DATES REQUIRED',
                message: `Please fill in all ${form.numberOfDays} concert date(s)`
            });
            return;
        }

        setFormData(form);
        navigate('/event-selection', { state: { category: 'Concerts', basicDetails: form } });
    };

    // --- 2. STYLES (Music/Concert Aesthetic) ---
    const styles = {
        pageWrapper: {
            background: `linear-gradient(rgba(20,20,40,0.85), rgba(20,20,40,0.85)), url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2000&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            fontFamily: '"Raleway", "Segoe UI", sans-serif',
            color: '#E0E0E0',
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
            color: '#FFD700',
            marginBottom: '10px',
            fontFamily: '"Playfair Display", serif',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
        },
        sectionHeading: {
            fontSize: '20px',
            color: '#FF6B6B',
            marginTop: '40px',
            marginBottom: '20px',
            borderBottom: '1px solid #444',
            paddingBottom: '10px',
            fontWeight: '600'
        },
        label: {
            display: 'block',
            fontSize: '15px',
            marginBottom: '8px',
            color: '#E0E0E0',
            fontWeight: '600'
        },
        input: {
            width: '100%',
            padding: '14px 18px',
            backgroundColor: 'rgba(40, 40, 60, 0.8)',
            border: '2px solid #555',
            borderRadius: '8px',
            fontSize: '15px',
            color: '#FFF',
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
            border: '1px solid #FF6B6B',
            borderRadius: '20px',
            padding: '8px 20px',
            color: '#FF6B6B',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s',
            backgroundColor: 'rgba(40,40,60,0.5)'
        },
        pillLabelActive: {
            backgroundColor: '#FF6B6B',
            color: 'white',
            borderColor: '#FF6B6B'
        },

        submitBtn: {
            marginTop: '50px',
            backgroundColor: '#FF6B6B',
            color: 'white',
            padding: '18px 50px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            display: 'block',
            margin: '60px auto 0',
            boxShadow: '0 10px 25px rgba(255, 107, 107, 0.3)',
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
            <Navbar transparent={true} />

            {/* Customization Contact Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD700 100%)',
                padding: '20px',
                textAlign: 'center',
                color: '#fff',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                marginBottom: '20px'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: '700' }}>
                        🎵 Need Custom Concert Planning?
                    </h3>
                    <p style={{ margin: 0, fontSize: '1rem', opacity: 0.95 }}>
                        If you have specific customization requests beyond this form, feel free to email us at{' '}
                        <a href="mailto:concerts@infinityhospitality.com" style={{ color: '#1a1a1a', fontWeight: 'bold', textDecoration: 'underline' }}>
                            concerts@infinityhospitality.com
                        </a>
                        {' '}and we'll create a personalized plan just for you!
                    </p>
                </div>
            </div>

            <div style={styles.container}>
                <div style={styles.headerContainer}>
                    <h1 style={styles.mainHeading}>Concert Details Form</h1>
                    <p style={{ fontSize: '18px', color: '#AAA' }}>Let's create an unforgettable musical experience</p>
                </div>

                {/* 1. ARTIST INFO */}
                <h3 style={styles.sectionHeading}>Artist & Contact</h3>
                <div style={styles.row}>
                    <div style={styles.col}>
                        <label style={styles.label}>Artist Name *</label>
                        <input style={styles.input} placeholder="Letters only" value={form.artistName} onChange={e => handleChange('artistName', e.target.value)} />
                    </div>
                    <div style={styles.col}>
                        <label style={styles.label}>Band/Group Name</label>
                        <input style={styles.input} placeholder="Letters only" value={form.bandName} onChange={e => handleChange('bandName', e.target.value)} />
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
                        <div style={{ fontSize: '0.75rem', color: '#AAA', marginTop: '5px' }}>
                            Enter {getPhoneMaxLength(form.countryCode)} digit phone number
                        </div>
                    </div>
                    <div style={styles.col}>
                        <label style={styles.label}>Email Address *</label>
                        <input style={styles.input} type="email" placeholder="example@gmail.com" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                    </div>
                </div>

                {/* 2. SCHEDULE */}
                <h3 style={styles.sectionHeading}>Concert Schedule</h3>
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
                        <div style={{ fontSize: '0.75rem', color: '#AAA', marginTop: '5px' }}>
                            Enter 1-30 days for your concert event
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>Preferred Time</label>
                        <input
                            style={styles.input}
                            placeholder="e.g., Evening, 7 PM onwards, Night Show"
                            value={form.preferredTime}
                            onChange={e => handleChange('preferredTime', e.target.value)}
                        />
                        <div style={{ fontSize: '0.75rem', color: '#AAA', marginTop: '5px' }}>
                            Type your preferred time or time range
                        </div>
                    </div>
                </div>

                <h3 style={styles.sectionHeading}>Concert Date(s) *</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    {form.concertDates.map((date, index) => (
                        <div key={index}>
                            <label style={styles.label}>Day {index + 1} Date</label>
                            <input
                                style={styles.input}
                                type="date"
                                value={date}
                                onChange={e => handleDateChange(index, e.target.value)}
                                required
                            />
                        </div>
                    ))}
                </div>

                <h3 style={styles.sectionHeading}>Concert Type</h3>
                <div style={styles.checkboxGroup}>
                    {Object.keys(form.concertType).map(type => (
                        <PillCheckbox key={type} label={type} checked={form.concertType[type]} onChange={() => handleCheckboxChange('concertType', type)} />
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
                        <label style={styles.label}>International Concert?</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['Yes', 'No'].map(opt => (
                                <PillCheckbox key={opt} label={opt} checked={form.isInternational === opt} onChange={() => handleChange('isInternational', opt)} />
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
                                    checked={form.venueType[opt]}
                                    onChange={() => handleCheckboxChange('venueType', opt)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- 4. BUDGET & AUDIENCE --- */}
                <h3 style={styles.sectionHeading}>Budget & Audience</h3>
                <div style={styles.row}>
                    <div style={styles.col}>
                        <label style={styles.label}>Expected Audience Count *</label>
                        <input style={styles.input} type="number" placeholder="Numbers only" value={form.expectedAudience} onChange={e => handleChange('expectedAudience', e.target.value)} />
                    </div>
                    <div style={styles.col}>
                        <label style={styles.label}>Approximate Budget (INR)</label>
                        <input style={styles.input} placeholder="Numbers only" value={form.approxBudget} onChange={e => handleChange('approxBudget', e.target.value)} />
                    </div>
                </div>

                <h3 style={styles.sectionHeading}>Budget Priority</h3>
                <div style={styles.checkboxGroup}>
                    {Object.keys(form.budgetPriority).map(priority => (
                        <PillCheckbox key={priority} label={priority} checked={form.budgetPriority[priority]} onChange={() => handleCheckboxChange('budgetPriority', priority)} />
                    ))}
                </div>

                {/* --- 5. PREFERENCES --- */}
                <h3 style={styles.sectionHeading}>Preferences</h3>
                <div style={styles.row}>
                    <div style={styles.col}>
                        <label style={styles.label}>Concert Theme</label>
                        <input style={styles.input} placeholder="Letters only" value={form.concertTheme} onChange={e => handleChange('concertTheme', e.target.value)} />
                    </div>
                    <div style={styles.col}>
                        <label style={styles.label}>Special Requirements</label>
                        <input style={styles.input} placeholder="Letters only" value={form.specialRequirements} onChange={e => handleChange('specialRequirements', e.target.value)} />
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
        </div>
    );
};

export default LocalConcertFormPage;
