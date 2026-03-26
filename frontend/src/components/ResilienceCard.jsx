import React from 'react';

const ResilienceCard = ({ title, days, status, type }) => {
    // Severity logic based on backend thresholds (Critical < 3, Warning < 7)
    const getSeverity = (d) => {
        if (d < 3) return '#ef4444'; // Red
        if (d < 7) return '#f59e0b'; // Orange
        return '#22c55e'; // Green
    };

    const emoji = type === 'water' ? '💧' : '🌱';

    return (
        <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            borderTop: `6px solid ${getSeverity(days)}`,
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '24px' }}>{emoji}</div>
            <h3 style={{ margin: '10px 0 5px 0', fontSize: '14px', color: '#64748b' }}>{title}</h3>
            <div style={{ fontSize: '42px', fontWeight: '900', color: '#1e293b' }}>
                {Math.floor(days).toString().padStart(2, '0')}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8' }}>DAYS LEFT</div>
            <p style={{ fontSize: '11px', marginTop: '10px', color: getSeverity(days), fontWeight: '600' }}>
                {status}
            </p>
        </div>
    );
};

export default ResilienceCard;