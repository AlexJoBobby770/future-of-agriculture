import React from 'react';

const Header = () => {
    return (
        <header style={{
            backgroundColor: 'var(--agri-dark)',
            color: 'white',
            padding: '25px 20px',
            borderBottom: '4px solid var(--agri-light)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: '800',
                letterSpacing: '0.5px'
            }}>
                Agri-Resilient AI
            </h1>

            <div style={{
                display: 'inline-block',
                backgroundColor: 'rgba(255,255,255,0.15)',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                marginTop: '8px',
                letterSpacing: '0.5px'
            }}>
                📍 Kochi District Data
            </div>
        </header>
    );
};

export default Header;