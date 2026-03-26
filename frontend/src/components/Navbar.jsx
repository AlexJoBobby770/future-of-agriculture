import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'predict', label: 'Predict', icon: '📊' },
        { id: 'market', label: 'Market', icon: '📈' },
        { id: 'crops', label: 'Crops', icon: '🌿' }
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default Navbar;