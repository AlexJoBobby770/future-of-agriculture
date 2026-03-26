import React from 'react';
import '../App.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'home',    label: 'Dashboard',        icon: '⬡' },
        { id: 'predict', label: 'Hydro-Simulator',  icon: '◈' },
        { id: 'market',  label: 'Asset Exchange',   icon: '◎' },
        { id: 'crops',   label: 'Agri-Intelligence',icon: '◇' },
    ];

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">🌿</div>
                    <div>
                        <div className="sidebar-app-name">AgroInvest</div>
                        <div className="sidebar-app-sub">Intelligence Platform</div>
                    </div>
                </div>
                <div className="sidebar-location">
                    <span>📍</span>
                    <span>Kochi District</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <div className="nav-section-label">Navigation</div>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        id={`nav-${item.id}`}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                        aria-current={activeTab === item.id ? 'page' : undefined}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}

                <div className="nav-section-label" style={{ marginTop: '8px' }}>System</div>
                <div style={{
                    padding: '10px 12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    fontSize: '11px', color: 'rgba(255,255,255,0.60)',
                    lineHeight: '1.7',
                }}>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginBottom: '4px', fontSize: '11px' }}>
                        Season Status
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Pre-Monsoon</span>
                        <span style={{ color: '#fbbf24', fontWeight: '700', fontSize: '11px' }}>ACTIVE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                        <span>Drought Alert</span>
                        <span style={{ color: '#f87171', fontWeight: '700', fontSize: '11px' }}>HIGH</span>
                    </div>
                </div>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="live-indicator">
                    <div className="live-dot"></div>
                    <span>Live · {timeString} IST</span>
                </div>
                <div className="sidebar-version">v2.1.0 · Kochi Central Feed</div>
            </div>
        </aside>
    );
};

export default Sidebar;
