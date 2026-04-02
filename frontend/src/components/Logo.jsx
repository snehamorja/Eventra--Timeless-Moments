import React from 'react';

const Logo = ({ size = '80px' }) => {
    return (
        <div style={{
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <img
                src="/9740328b-d8b4-40e0-b96e-4080c5fff8cd.png"
                alt="EVENTRA"
                style={{
                    height: size,
                    width: 'auto',
                    mixBlendMode: 'multiply', // Automatically removes white background
                    transition: 'transform 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
        </div>
    );
};

export default Logo;
