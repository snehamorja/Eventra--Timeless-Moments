import React from 'react';

const CustomAlert = ({ show, onClose, onConfirm, title, message, subMessage, mode = 'notice' }) => {
    if (!show) return null;

    const isConfirm = mode === 'confirm';

    return (
        <div style={popupOverlayStyle}>
            <div style={popupContentStyle}>
                <button onClick={onClose} style={closeBtnStyle}>&times;</button>
                <div style={textureOverlay}></div>

                <div style={innerBorderStyle}>
                    <h1 style={popupTitleStyle}>{title || (isConfirm ? 'CONFIRM' : 'NOTICE')}</h1>
                    <p style={popupMessageStyle}>{message}</p>
                    {subMessage && (
                        <p style={popupSubStyle}>
                            *{subMessage.toUpperCase()}
                        </p>
                    )}

                    <div style={actionContainer}>
                        <div style={inputMock}>{isConfirm ? 'REQUIRE VERIFICATION' : 'ACKNOWLEDGE POLICY'}</div>

                        {isConfirm ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={onConfirm}
                                    style={{ ...popupBtnStyle, background: '#c5a059' }}
                                >
                                    YES
                                </button>
                                <button
                                    onClick={onClose}
                                    style={{ ...popupBtnStyle, background: '#333' }}
                                >
                                    NO
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onClose}
                                style={popupBtnStyle}
                            >
                                SUBMIT
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// POPUP STYLES
const popupOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.6)', // Neutral dark overlay
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 99999
};

const popupContentStyle = {
    backgroundColor: '#FAF9F6',
    width: '600px',
    minWidth: '320px',
    maxWidth: '95vw',
    minHeight: '200px',
    padding: '40px',
    borderRadius: '4px',
    boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
    textAlign: 'center',
    position: 'relative',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexShrink: 0
};

const innerBorderStyle = {
    border: '1px solid rgba(0,0,0,0.05)',
    padding: '30px 20px',
    position: 'relative',
    zIndex: 2,
    width: '100%',
    boxSizing: 'border-box'
};

const popupTitleStyle = {
    fontSize: '1.6rem',
    color: '#8B6E32',
    margin: '0 0 15px 0',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    lineHeight: '1.2',
    fontFamily: "'Playfair Display', serif"
};

const popupMessageStyle = {
    fontSize: '0.9rem',
    color: '#444',
    lineHeight: '1.6',
    margin: '0 0 25px 0',
    fontWeight: '500',
    fontFamily: "'Montserrat', sans-serif",
    overflowWrap: 'anywhere',
    wordWrap: 'break-word',
    wordBreak: 'normal',
    whiteSpace: 'pre-wrap',
    maxWidth: '100%',
    display: 'block'
};

const popupSubStyle = {
    fontSize: '0.65rem',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '10px',
    fontWeight: '700',
    fontFamily: "'Montserrat', sans-serif"
};

const actionContainer = {
    display: 'flex',
    marginTop: '30px',
    justifyContent: 'center',
    height: '50px',
    width: '100%'
};

const inputMock = {
    flex: 1,
    background: '#1a1a1a',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '1px',
    whiteSpace: 'nowrap'
};

const popupBtnStyle = {
    background: '#c5a059',
    color: '#fff',
    border: 'none',
    padding: '0 30px',
    fontSize: '0.85rem',
    fontWeight: '900',
    cursor: 'pointer',
    letterSpacing: '1px',
    transition: '0.3s',
    flexShrink: 0
};

const closeBtnStyle = {
    position: 'absolute', top: '15px', right: '15px',
    background: 'none', border: 'none', fontSize: '24px',
    cursor: 'pointer', color: '#000', zIndex: 10
};

const textureOverlay = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.08,
    pointerEvents: 'none',
    zIndex: 1,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
};

export default CustomAlert;
