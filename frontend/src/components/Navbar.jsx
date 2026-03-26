import React from 'react';
import './Navbar.css';

// Accept the state as props
const Navbar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'predict', label: 'Predict', icon: '📊' },
        { id: 'market', label: 'Market', icon: '📈' },
        { id: 'pests', label: 'Pests', icon: '🌿' }
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)} // This now updates App.jsx!
                >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default Navbar;