import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    CheckBadgeIcon,
    CalendarIcon,
    UserIcon,
    CreditCardIcon,
    MusicalNoteIcon,
    SparklesIcon,
    CakeIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';
import CustomInquiryModal from '../components/CustomInquiryModal';

const InvoicePage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Load state from navigation OR localStorage
    const [bookingData, setBookingData] = useState(() => {
        if (location.state) return location.state;
        const saved = localStorage.getItem('ongoing_booking');
        try {
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    // Check if the booking is already paid on mount
    useEffect(() => {
        if (bookingData.id) {
            api.get(`/bookings/${bookingData.id}/`)
                .then(res => {
                    if (res.data.payment_status === 'Advance Paid' || res.data.payment_status === 'Full Paid') {
                        setIsPaid(true);
                    }
                    // Update local state with latest from server
                    const updated = { ...bookingData, ...res.data };
                    setBookingData(updated);
                    localStorage.setItem('ongoing_booking', JSON.stringify(updated));
                })
                .catch(err => console.error("Error refreshing booking status:", err));
        }
    }, [bookingData.id]);

    const sanitizeError = (err) => {
        let msg = "An unexpected error occurred.";
        if (err.response?.data) {
            if (typeof err.response.data === 'string') {
                msg = err.response.data;
            } else if (err.response.data.detail) {
                msg = err.response.data.detail;
            } else if (err.response.data.message) {
                msg = err.response.data.message;
            } else {
                msg = JSON.stringify(err.response.data);
            }
        } else if (err.message) {
            msg = err.message;
        }

        if (msg.includes('<!DOCTYPE') || msg.includes('<html') || msg.includes('<code>')) {
            msg = "Server Error (404/500). The requested endpoint was not found or failed on the server.";
        }
        return msg.substring(0, 200);
    };

    const [isPaid, setIsPaid] = useState(false);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '', mode: 'notice', onConfirm: null });
    const [showInquiry, setShowInquiry] = useState(false);

    // Data derived from state
    const {
        selectedMenu = null,
        guestCount = 0,
        totalCateringCost = 0,
        selectedStyles = {},
        totalDecorCost = 0,
        selectedPerformer = null,
        eventData = {} // Original form data
    } = bookingData;

    // Calculate Grand Totals with numeric safety
    const safeCateringCost = parseFloat(totalCateringCost) || 0;
    const safeDecorCost = parseFloat(totalDecorCost) || 0;
    const performerCost = selectedPerformer ? (parseFloat(selectedPerformer.price) || 0) : 0;
    
    const subtotal = safeCateringCost + safeDecorCost + performerCost;
    const gst = subtotal * 0.18;
    const grandTotal = subtotal + gst;

    // Split Payment Calculations
    const advanceAmount = grandTotal / 2;
    const balanceAmount = grandTotal - advanceAmount;

    // Decoration items list - safe check
    const decorationItems = selectedStyles ? Object.values(selectedStyles) : [];

    const handleRemoveItem = (type, id) => {
        const newData = { ...bookingData };

        if (type === 'catering') {
            newData.selectedMenu = null;
            newData.totalCateringCost = 0;
        } else if (type === 'decoration') {
            const newStyles = { ...newData.selectedStyles };
            delete newStyles[id];
            newData.selectedStyles = newStyles;
            // Recalculate total decor cost
            newData.totalDecorCost = Object.values(newStyles).reduce((sum, s) => sum + s.price, 0);
        } else if (type === 'performer') {
            newData.selectedPerformer = null;
        }

        setBookingData(newData);
        localStorage.setItem('ongoing_booking', JSON.stringify(newData));
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (forcedId = null) => {
        const apiKey = 'rzp_test_YOUR_KEY_HERE';
        const bookingId = forcedId || bookingData.id;

        const updateBackend = async (paymentId) => {
            if (!bookingId) {
                console.warn("No Booking ID found. Data saved locally only.");
                return;
            }

            try {
                await api.patch(`/bookings/${bookingId}/`, {
                    payment_status: 'Advance Paid',
                    total_cost: grandTotal,
                    advance_amount: advanceAmount,
                    balance_amount: balanceAmount,
                    // Snapshot details
                    catering_package: selectedMenu ? selectedMenu.name : '',
                    catering_price: selectedMenu ? selectedMenu.price : 0,
                    decoration_name: Object.values(selectedStyles).map(s => s.name).join(', '),
                    decoration_price: totalDecorCost,
                    performer_name: selectedPerformer ? selectedPerformer.name : '',
                    performer_price: selectedPerformer ? selectedPerformer.price : 0
                });
                console.log("Backend updated successfully");
            } catch (error) {
                console.error("Failed to sync with backend:", error);
                // Don't block UI for this, but log it
            }
        };

        // 1. Simulation Mode (If no valid key is provided)
        if (apiKey === 'rzp_test_YOUR_KEY_HERE') {
            setCustomAlert({
                show: true,
                title: 'SIMULATION',
                message: "Demo Mode: You haven't set a Razorpay API Key yet.\n\nSimulate successful payment?",
                mode: 'confirm',
                onConfirm: async () => {
                    setCustomAlert({ show: false });
                    setIsPaid(true);
                    await updateBackend('SIMULATED_PAYMENT_ID');
                    localStorage.removeItem('wedding_form_draft');
                    localStorage.removeItem('ongoing_booking');

                    setCustomAlert({
                        show: true,
                        title: 'SUCCESS',
                        message: "Advance Payment (Simulated) Successful! Booking Confirmed.",
                        mode: 'notice'
                    });
                }
            });
            return;
        }

        // 2. Real Razorpay Mode
        const res = await loadRazorpay();
        if (!res) {
            setCustomAlert({
                show: true,
                title: 'ERROR',
                message: 'Razorpay SDK failed to load. Are you online?',
                mode: 'notice'
            });
            return;
        }

        try {
            const options = {
                key: apiKey,
                amount: Math.round(advanceAmount * 100), // Amount in paise
                currency: 'INR',
                name: 'Infinity Hospitality',
                description: 'Advance Payment (50%)',
                image: 'https://via.placeholder.com/150',
                handler: async function (response) {
                    setIsPaid(true);
                    await updateBackend(response.razorpay_payment_id);
                    // Clear all drafts on successful payment
                    localStorage.removeItem('wedding_form_draft');
                    localStorage.removeItem('ongoing_booking');

                    setCustomAlert({
                        show: true,
                        title: 'SUCCESS',
                        message: "Advance Payment Successful! Booking Confirmed.",
                        mode: 'notice'
                    });
                },
                prefill: {
                    name: eventData.plannerName || "Valued Guest",
                    email: "guest@example.com",
                    contact: "9999999999"
                },
                notes: {
                    address: eventData.address || "Event Location"
                },
                theme: {
                    color: "#5D4037"
                },
                modal: {
                    ondismiss: function () {
                        console.log('Payment window closed');
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);

            paymentObject.on('payment.failed', function (response) {
                setCustomAlert({
                    show: true,
                    title: 'FAILED',
                    message: `Payment Failed: ${response.error.description}`,
                    mode: 'notice'
                });
            });

            paymentObject.open();

        } catch (err) {
            console.error(err);
            setCustomAlert({
                show: true,
                title: 'ERROR',
                message: "Could not initiate payment. Please check your API Key.",
                mode: 'notice'
            });
        }
    };

    // --- AUTH & SAVE LOGIC ---
    const isLoggedIn = !!localStorage.getItem('access_token');
    const [isSaving, setIsSaving] = useState(false);

    const handleLoginRedirect = () => {
        const navState = { from: '/invoice', bookingData: bookingData };
        localStorage.setItem('pendingAutoAction', 'save_and_pay');
        navigate('/login', { state: navState });
    };

    useEffect(() => {
        const autoAction = localStorage.getItem('pendingAutoAction');
        if (autoAction === 'save_and_pay' && isLoggedIn && !bookingData.id) {
            localStorage.removeItem('pendingAutoAction');
            handleSaveAndPay();
        } else if (isLoggedIn && !bookingData.id && (selectedMenu || decorationItems.length > 0 || selectedPerformer)) {
            // Auto-save draft to get an Invoice ID if none exists
            handleSaveAndPay(true); // true = silent save only
        }
    }, [isLoggedIn, bookingData.id]);

    const handleSaveAndPay = async (silentSave = false) => {
        if (isSaving || (isPaid && !silentSave)) return;
        setIsSaving(true);
        try {
            let currentId = bookingData.id;

            // 1. Save Booking if it doesn't have an ID yet
            if (!currentId) {
                // --- Validation Check: Date must be 30 days away ---
                const eventDate = eventData.event_date;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const thirtyDaysLater = new Date(today);
                thirtyDaysLater.setDate(today.getDate() + 30);

                if (new Date(eventDate) < thirtyDaysLater && !silentSave) {
                    setCustomAlert({
                        show: true,
                        title: 'DATE TOO SOON',
                        message: `The selected date (${eventDate}) is within 30 days. Wedding bookings must be scheduled at least 1 month in advance.\n\nPlease go back to the Wedding Form and select a valid date.`,
                        mode: 'notice'
                    });
                    setIsSaving(false);
                    return;
                }

                const payload = {
                    ...eventData,
                    total_cost: grandTotal,
                    advance_amount: advanceAmount,
                    balance_amount: balanceAmount,
                    catering_package: selectedMenu ? selectedMenu.name : '',
                    catering_price: selectedMenu ? (selectedMenu.price_per_plate || selectedMenu.price || 0) : 0,
                    decoration_name: Object.values(selectedStyles || {}).map(s => s.name).join(', '),
                    decoration_price: safeDecorCost,
                    performer_name: selectedPerformer ? selectedPerformer.name : '',
                    performer_price: performerCost,
                    wedding_details: {
                        ...(eventData.wedding_details || {}),
                        guestCount: parseInt(guestCount) || 1,
                        selectedStyles: selectedStyles || {},
                        performer: selectedPerformer
                    }
                };

                const createRes = await api.post('/bookings/', payload);
                currentId = createRes.data.id;

                const updated = { ...bookingData, id: currentId };
                setBookingData(updated);
                localStorage.setItem('ongoing_booking', JSON.stringify(updated));
                console.log("Booking saved with ID:", currentId);
            }

            // 2. Trigger Payment Flow (if not silent)
            if (!silentSave) {
                await handlePayment(currentId);
            }

        } catch (error) {
            console.error("Submission Failed:", error);
            if (!silentSave) {
                setCustomAlert({
                    show: true,
                    title: 'ERROR',
                    message: "We couldn't process your request: " + sanitizeError(error),
                    mode: 'notice'
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const styles = {
        container: { backgroundColor: '#FDFBF7', minHeight: '100vh', padding: '60px 20px', fontFamily: '"Arial", sans-serif', color: '#333' },
        paper: { maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.1)', padding: '60px', position: 'relative', borderTop: '10px solid #5D4037' },
        logoBox: { display: 'flex', justifyContent: 'center', marginBottom: '40px' },
        logoPlaceholder: { border: '1px solid #000', padding: '10px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', textAlign: 'center', fontSize: '10px', fontWeight: 'bold' },
        title: { fontSize: '36px', fontWeight: '700', textAlign: 'center', color: '#212121', marginBottom: '20px' },
        companyInfo: { textAlign: 'center', fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '30px', marginBottom: '50px', letterSpacing: '1px' },
        gridContainer: { display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr', border: '1px solid #e0e0e0', marginBottom: '40px' },
        gridRow: { display: 'contents' },
        gridLabel: { backgroundColor: '#f9f9f9', padding: '15px', fontWeight: 'bold', fontSize: '14px', color: '#555', borderBottom: '1px solid #e0e0e0' },
        gridValue: { padding: '15px', fontSize: '14px', borderBottom: '1px solid #e0e0e0' },
        sectionTitle: { fontSize: '20px', fontWeight: 'bold', color: '#212121', marginBottom: '15px' },
        billToBox: { marginBottom: '40px' },
        billText: { fontSize: '14px', lineHeight: '1.6', color: '#555' },
        table: { width: '100%', borderCollapse: 'collapse', marginBottom: '40px' },
        th: { textAlign: 'left', padding: '15px', backgroundColor: '#f9f9f9', fontSize: '14px', fontWeight: 'bold', color: '#555', borderBottom: '1px solid #ddd' },
        td: { padding: '15px', fontSize: '14px', color: '#333', borderBottom: '1px solid #eee' },
        totalSection: { display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', maxWidth: '350px' },
        totalRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px', color: '#555' },
        grandTotalRow: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '1px solid #eee', marginTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#000' },
        splitRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '15px', fontWeight: '600', color: '#5D4037', borderTop: '1px dashed #ccc' },
        payButton: { backgroundColor: '#5D4037', color: '#fff', border: 'none', padding: '15px 40px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' },
        loginButton: { backgroundColor: '#111', color: '#fff', border: 'none', padding: '15px 40px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' },
        saveButton: { backgroundColor: '#C4A059', color: '#fff', border: 'none', padding: '15px 40px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' },
        successBox: { backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9', padding: '30px', borderRadius: '8px', textAlign: 'center', color: '#2e7d32', fontWeight: 'bold' }
    };

    return (
        <div style={styles.container}>
            <Navbar />

            <div style={{
                background: 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)',
                padding: '12px',
                textAlign: 'center',
                color: '#fff',
                marginBottom: '20px',
                borderRadius: '8px',
                maxWidth: '900px',
                margin: '0 auto 20px auto',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                    ✨ Need to adjust this plan or have special requests?
                    <button
                        onClick={() => setShowInquiry(true)}
                        style={{
                            marginLeft: '15px',
                            background: '#fff',
                            color: '#5D4037',
                            border: 'none',
                            padding: '4px 15px',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                        }}
                    >
                        Request Changes
                    </button>
                </p>
            </div>

            <div style={styles.paper}>

                {/* Title */}
                <h1 style={styles.title}>Invoice for Events</h1>
                <div style={styles.companyInfo}>
                    Eventra-Timeless Moments | Surat,Gujarat | +91 84697 45000
                </div>

                {/* Info Grid */}
                <div style={styles.gridContainer}>
                    <div style={styles.gridRow}>
                        <div style={styles.gridLabel}>Invoice Number:</div>
                        <div style={styles.gridValue}>{bookingData.id ? `#${bookingData.id}` : 'DRAFT'}</div>
                    </div>
                    <div style={styles.gridRow}>
                        <div style={styles.gridLabel}>Invoice Date:</div>
                        <div style={styles.gridValue}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <div style={styles.gridRow}>
                        <div style={{ ...styles.gridLabel, borderBottom: 'none' }}>Due Date:</div>
                        <div style={{ ...styles.gridValue, borderBottom: 'none' }}>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                </div>

                {/* Bill To */}
                <div style={styles.billToBox}>
                    <h3 style={styles.sectionTitle}>Bill To</h3>
                    <div style={styles.billText}>
                        <strong>Name:</strong> {eventData.plannerName || 'Valued Guest'}<br />
                        <strong>Event:</strong> {eventData.event_type || 'Special Event'}<br />
                        <strong>Address:</strong> {eventData.address || 'Address not provided'}
                    </div>
                </div>

                {/* Details Table */}
                <div style={{ marginBottom: '50px' }}>
                    <h3 style={styles.sectionTitle}>Invoice Details</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ ...styles.th, width: '40%' }}>Description</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>Price</th>
                                <th style={styles.th}>Total</th>
                                {!isPaid && <th style={{ ...styles.th, width: '50px' }}></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {selectedMenu && (
                                <tr>
                                    <td style={styles.td}>Catering Service - {selectedMenu.name}</td>
                                    <td style={styles.td}>{guestCount}</td>
                                    <td style={styles.td}>₹{(parseFloat(selectedMenu.price_per_plate || selectedMenu.price) || 0).toLocaleString()}</td>
                                    <td style={styles.td}>₹{safeCateringCost.toLocaleString()}</td>
                                    {!isPaid && (
                                        <td style={styles.td}>
                                            <TrashIcon
                                                onClick={() => handleRemoveItem('catering')}
                                                style={{ width: '20px', color: 'red', cursor: 'pointer' }}
                                            />
                                        </td>
                                    )}
                                </tr>
                            )}
                            {decorationItems.map(item => (
                                <tr key={item.id}>
                                    <td style={styles.td}>Venue Decoration - {item.name}</td>
                                    <td style={styles.td}>1</td>
                                    <td style={styles.td}>₹{(parseFloat(item.price) || 0).toLocaleString()}</td>
                                    <td style={styles.td}>₹{(parseFloat(item.price) || 0).toLocaleString()}</td>
                                    {!isPaid && (
                                        <td style={styles.td}>
                                            <TrashIcon
                                                onClick={() => handleRemoveItem('decoration', item.id)}
                                                style={{ width: '20px', color: 'red', cursor: 'pointer' }}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {selectedPerformer && (
                                <tr>
                                    <td style={styles.td}>Entertainment - {selectedPerformer.name}</td>
                                    <td style={styles.td}>1</td>
                                    <td style={styles.td}>₹{(parseFloat(selectedPerformer.price) || 0).toLocaleString()}</td>
                                    <td style={styles.td}>₹{(parseFloat(selectedPerformer.price) || 0).toLocaleString()}</td>
                                    {!isPaid && (
                                        <td style={styles.td}>
                                            <TrashIcon
                                                onClick={() => handleRemoveItem('performer')}
                                                style={{ width: '20px', color: 'red', cursor: 'pointer' }}
                                            />
                                        </td>
                                    )}
                                </tr>
                            )}
                            {/* Empty rows filler */}
                            <tr><td style={{ ...styles.td, height: '40px' }}></td><td style={styles.td}></td><td style={styles.td}></td><td style={styles.td}></td>{!isPaid && <td style={styles.td}></td>}</tr>
                            <tr><td style={{ ...styles.td, height: '40px' }}></td><td style={styles.td}></td><td style={styles.td}></td><td style={styles.td}></td>{!isPaid && <td style={styles.td}></td>}</tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div style={{ marginBottom: '60px' }}>
                    <h3 style={styles.sectionTitle}>Total Amounts</h3>
                    <div style={styles.totalSection}>
                        <div style={styles.totalRow}>
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div style={styles.totalRow}>
                            <span>Tax (18%):</span>
                            <span>₹{gst.toLocaleString()}</span>
                        </div>
                        <div style={styles.grandTotalRow}>
                            <span>Grand Total:</span>
                            <span>₹{grandTotal.toLocaleString()}</span>
                        </div>

                        {/* Split Payment Breakdown */}
                        <div style={styles.splitRow}>
                            <span>Advance Payable (50%):</span>
                            <span>₹{advanceAmount.toLocaleString()}</span>
                        </div>
                        <div style={{ ...styles.totalRow, color: '#D32F2F', fontWeight: 'bold' }}>
                            <span>Balance Due (After Event):</span>
                            <span>₹{balanceAmount.toLocaleString()}</span>
                        </div>

                    </div>
                </div>

                {/* Actions */}
                <div className="no-print" style={{ textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '40px' }}>
                    {!isLoggedIn ? (
                        <div>
                            <p style={{ marginBottom: '10px', color: '#666' }}>Please log in to save your wedding plan and proceed.</p>
                            <button onClick={handleLoginRedirect} style={styles.loginButton}>
                                🔐 Login / Signup to Confirm
                            </button>
                        </div>
                    ) : (
                        // Logged In Flow
                        !isPaid ? (
                            <button onClick={handleSaveAndPay} disabled={isSaving} style={styles.payButton}>
                                {isSaving ? 'Processing...' : `Confirm & Pay Advance: ₹${advanceAmount.toLocaleString()}`}
                            </button>
                        ) : (
                            <div style={styles.successBox}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>✓ ADVANCE PAID</div>
                                <div style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>
                                    Remaining Balance: ₹{balanceAmount.toLocaleString()} (To be paid after event)
                                </div>
                                <button onClick={() => window.print()} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', marginRight: '20px', color: '#2e7d32' }}>Print Invoice</button>
                                <button onClick={() => navigate('/dashboard')} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#2e7d32' }}>Back to Dashboard</button>
                            </div>
                        )
                    )}
                </div>

            </div>

            <CustomAlert
                show={customAlert.show}
                onClose={() => setCustomAlert({ ...customAlert, show: false })}
                onConfirm={customAlert.onConfirm}
                title={customAlert.title}
                message={customAlert.message}
                mode={customAlert.mode}
            />
            <CustomInquiryModal
                isOpen={showInquiry}
                onClose={() => setShowInquiry(false)}
                eventType="Invoice Customization"
            />
        </div>
    );
};

export default InvoicePage;
