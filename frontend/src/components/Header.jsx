import React from 'react';
// No need to import App.css here, App.jsx handles it globally!

const Header = () => {
    return (
        <header className="main-header">
            <h1>Agri-Resilient AI</h1>
            <div className="location-badge">📍 KOCHI DISTRICT DATA</div>
        </header>
    );
};

export default Header;