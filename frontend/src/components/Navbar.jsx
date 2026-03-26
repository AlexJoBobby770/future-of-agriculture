import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'home', label: 'Dashboard', icon: '🏠' },
        { id: 'predict', label: 'Predict', icon: '📉' },
        { id: 'market', label: 'Market', icon: '💰' },
        { id: 'crops', label: 'Crops', icon: '🌿' }
    ];

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'var(--card-bg)',
            display: 'flex',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
            zIndex: 1000 /* Keeps it on top of scrolling content */
        }}>
            {navItems.map((item) => {
                const isActive = activeTab === item.id;

                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        style={{
                            flex: 1,
                            padding: '16px 0',
                            backgroundColor: 'transparent',
                            border: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            color: isActive ? 'var(--agri-dark)' : 'var(--text-muted)',
                            borderTop: isActive ? '3px solid var(--agri-dark)' : '3px solid transparent',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span style={{
                            fontSize: '24px',
                            marginBottom: '4px',
                            transform: isActive ? 'scale(1.15)' : 'scale(1)',
                            transition: 'transform 0.2s ease'
                        }}>
                            {item.icon}
                        </span>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: isActive ? '800' : '600',
                            letterSpacing: '0.5px'
                        }}>
                            {item.label.toUpperCase()}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

export default Navbar;