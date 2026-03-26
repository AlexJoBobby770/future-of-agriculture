import React from 'react';

const ResilienceCard = ({ label, days, status, type }) => {
    const isCritical = days < 5;
    const emoji = type === 'water' ? '💧' : '🌱';

    return (
        <div className={`res-card ${isCritical ? 'critical' : 'stable'}`}>
            <span className="res-emoji">{emoji}</span>
            <div className="res-content">
                <h3>{label}</h3>
                <div className="res-timer">
                    <span className="res-days">{Math.floor(days)}</span>
                    <span className="res-unit">Days</span>
                </div>
                <p className="res-status">{status}</p>
            </div>
        </div>
    );
};

export default ResilienceCard;