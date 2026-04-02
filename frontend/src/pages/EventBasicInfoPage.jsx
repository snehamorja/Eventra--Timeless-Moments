import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FormContext } from '../contexts/FormContext';
import API from '../services/api';
import CustomAlert from '../components/CustomAlert';
import CustomInquiryModal from '../components/CustomInquiryModal';

const EventBasicInfoPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { formData, setFormData } = useContext(FormContext);
    const { eventType } = location.state || {};
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '' });
    const [showInquiry, setShowInquiry] = useState(false);

    const [details, setDetails] = useState({
        eventName: eventType?.name || '',
        basePrice: eventType?.basePrice || 0,
        eventDate: '',
        startTime: '',
        endTime: '',
        venueName: '',
        venueAddress: '',
        locationType: 'Indoor',
        guestCount: '',
        guestType: 'Mixed',
        eventPurpose: '',
        preferredTheme: 'Modern',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        specialInstructions: ''
    });

    useEffect(() => {
        // Load from draft if available
        const savedDraft = localStorage.getItem('event_basic_draft');
        if (savedDraft) {
            setDetails(prev => ({ ...prev, ...JSON.parse(savedDraft) }));
        } else if (formData) {
            // Also sync from context if context exists
            setDetails(prev => ({
                ...prev,
                eventName: eventType?.name || formData.eventName || prev.eventName,
                contactName: formData.contactName || prev.contactName,
                contactPhone: formData.contactPhone || prev.contactPhone,
                contactEmail: formData.contactEmail || prev.contactEmail
            }));
        }
    }, [formData, eventType]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // --- STRICT VALIDATION LOGIC ---
        // Character only validation for names
        if (['contactName', 'eventName', 'venueName', 'eventPurpose'].includes(name)) {
            const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
            setDetails(prev => ({ ...prev, [name]: filteredValue }));
            return;
        }

        // Integer only validation for guests and phone
        if (['guestCount', 'contactPhone'].includes(name)) {
            const filteredValue = value.replace(/\D/g, '');
            setDetails(prev => ({ ...prev, [name]: filteredValue }));
            return;
        }

        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveDraft = () => {
        localStorage.setItem('event_basic_draft', JSON.stringify(details));
        setCustomAlert({
            show: true,
            title: 'SUCCESS',
            message: 'Draft saved successfully!'
        });
    };

    const handleNext = async () => {
        // Mandatory fields validation
        if (!details.eventName || !details.eventDate || !details.contactName || !details.contactPhone) {
            setCustomAlert({
                show: true,
                title: 'REQUIRED',
                message: 'Please fill in the essential fields: Event Name, Date, Contact Name, and Phone.'
            });
            return;
        }

        const finalForm = { ...formData, ...details };
        setFormData(finalForm);

        try {

            // Post to Backend Inquiry system so it shows in Admin Dashboard
            await API.post('event-inquiries/', {
                planner_name: details.contactName,
                event_type: details.eventName,
                event_date: details.eventDate,
                guests: details.guestCount ? parseInt(details.guestCount) : 0,
                location_type: details.locationType,
                venue_name: details.venueName,
                service_style: details.serviceStyle || 'Standard',
                cuisine_preferences: details.preferredTheme,
                budget_range: `₹${details.basePrice?.toLocaleString('en-IN')} (Base)`,
                contact_name: details.contactName,
                contact_phone: details.contactPhone,
                contact_email: details.contactEmail,
                internal_notes: details.specialInstructions
            });

            // Navigate to confirmation success page directly (simplified flow)
            navigate('/confirmation', {
                state: {
                    details: details,
                    formData: finalForm
                }
            });
        } catch (error) {
            console.error('Error saving event inquiry:', error);
            // Still navigate for flow continuity even if backend sync fails (e.g. offline)
            navigate('/confirmation', {
                state: {
                    details: details,
                    formData: finalForm
                }
            });
        }
    };

    return (
        <div style={{ backgroundColor: '#FCFAFA', minHeight: '100vh', paddingBottom: '80px' }}>
            <Navbar />

            <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
                <div style={{
                    background: '#fff',
                    borderRadius: '24px',
                    padding: '50px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
                    border: '1px solid #f0f0f0'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '2.4rem', fontFamily: 'serif', color: '#1A1A1A', marginBottom: '10px' }}>Event Details</h1>
                        <p style={{ color: '#666', fontSize: '1.1rem' }}>Please share the basic details of your event so we can plan and manage it effectively.</p>

                        <div style={{ marginTop: '20px', padding: '15px', background: '#F9F4E8', borderRadius: '15px', border: '1px solid #EAE2D1' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#1A1A1A' }}>
                                ✨ Have a complex schedule or unique customization?
                                <button
                                    onClick={() => setShowInquiry(true)}
                                    style={{ marginLeft: '10px', background: '#C4A059', color: '#fff', border: 'none', padding: '5px 15px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Tell Us More
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Section 1: Event Information */}
                    <section style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#C4A059', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid #F5F5F5', paddingBottom: '10px' }}>
                            1. Event Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Event Name / Event Type</label>
                                <input
                                    type="text"
                                    name="eventName"
                                    value={details.eventName}
                                    onChange={handleChange}
                                    placeholder="Enter letters only (e.g. Wedding)"
                                    style={inputStyle}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Event Date</label>
                                    <input type="date" name="eventDate" value={details.eventDate} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Start Time</label>
                                    <input type="time" name="startTime" value={details.startTime} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>End Time</label>
                                    <input type="time" name="endTime" value={details.endTime} onChange={handleChange} style={inputStyle} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Venue Information */}
                    <section style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#C4A059', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid #F5F5F5', paddingBottom: '10px' }}>
                            2. Venue Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Venue Name</label>
                                <input type="text" name="venueName" value={details.venueName} onChange={handleChange} placeholder="Hall / Hotel / Outdoor Location" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Venue Address / Location</label>
                                <textarea name="venueAddress" value={details.venueAddress} onChange={handleChange} placeholder="Full address or landmark" style={{ ...inputStyle, height: '80px', paddingTop: '12px' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Event Setting</label>
                                <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
                                    {['Indoor', 'Outdoor', 'Hybrid'].map(type => (
                                        <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#444' }}>
                                            <input type="radio" name="locationType" value={type} checked={details.locationType === type} onChange={handleChange} style={{ accentColor: '#C4A059' }} /> {type}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Guest Details */}
                    <section style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#C4A059', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid #F5F5F5', paddingBottom: '10px' }}>
                            3. Guest Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Expected Number of Guests</label>
                                <input type="number" name="guestCount" value={details.guestCount} onChange={handleChange} placeholder="e.g. 150" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Guest Type</label>
                                <select name="guestType" value={details.guestType} onChange={handleChange} style={inputStyle}>
                                    <option>Adults</option>
                                    <option>Kids</option>
                                    <option>Mixed</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Event Purpose & Preferences */}
                    <section style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#C4A059', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid #F5F5F5', paddingBottom: '10px' }}>
                            4. Event Purpose & Preferences
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Event Purpose / Occasion</label>
                                <input type="text" name="eventPurpose" value={details.eventPurpose} onChange={handleChange} placeholder="What are we celebrating?" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Preferred Theme (Optional)</label>
                                <select name="preferredTheme" value={details.preferredTheme} onChange={handleChange} style={inputStyle}>
                                    <option>Traditional</option>
                                    <option>Modern</option>
                                    <option>Minimal</option>
                                    <option>Vintage</option>
                                    <option>Royal</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Contact Information */}
                    <section style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#C4A059', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid #F5F5F5', paddingBottom: '10px' }}>
                            5. Contact Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ gridColumn: '1 / span 2' }}>
                                <label style={labelStyle}>Contact Person Name</label>
                                <input type="text" name="contactName" value={details.contactName} onChange={handleChange} placeholder="Full Name (Alphabetical only)" style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Contact Phone Number</label>
                                <input type="text" name="contactPhone" value={details.contactPhone} onChange={handleChange} placeholder="+91 00000 00000" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Email Address</label>
                                <input type="email" name="contactEmail" value={details.contactEmail} onChange={handleChange} placeholder="example@mail.com" style={inputStyle} />
                            </div>
                        </div>
                    </section>

                    {/* Section 6: Additional Notes */}
                    <section style={{ marginBottom: '50px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#C4A059', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid #F5F5F5', paddingBottom: '10px' }}>
                            6. Additional Notes (Optional)
                        </h3>
                        <div>
                            <label style={labelStyle}>Special Instructions or Requirements</label>
                            <textarea name="specialInstructions" value={details.specialInstructions} onChange={handleChange} placeholder="Any specific requests or important information..." style={{ ...inputStyle, height: '100px', paddingTop: '12px' }} />
                        </div>
                    </section>

                    {/* Form Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '30px', borderTop: '2px solid #F5F5F5' }}>
                        <button
                            onClick={handleSaveDraft}
                            style={{
                                background: 'none',
                                border: '2px solid #EEE',
                                padding: '15px 30px',
                                borderRadius: '12px',
                                color: '#666',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#C4A059'}
                            onMouseOut={e => e.currentTarget.style.borderColor = '#EEE'}
                        >
                            Save as Draft
                        </button>

                        <button
                            onClick={handleNext}
                            style={{
                                background: '#1A1A1A',
                                color: '#fff',
                                border: 'none',
                                padding: '18px 50px',
                                borderRadius: '12px',
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            Save & Continue
                        </button>
                    </div>
                </div>
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
                eventType="Custom Event"
            />
        </div>
    );
};

const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#888',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '10px',
    border: '1px solid #E0E0E0',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
};

export default EventBasicInfoPage;
