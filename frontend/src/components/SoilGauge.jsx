import React from 'react';

const SoilGauge = ({ n, p, k }) => {
    const nutrients = [
        { label: 'N', value: n, color: '#3b82f6' },
        { label: 'P', value: p, color: '#a855f7' },
        { label: 'K', value: k, color: '#f59e0b' }
    ];

    return (
        <div style={{ background: 'white', padding: '15px', borderRadius: '16px', marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>SOIL NUTRIENTS (NPK)</h4>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {nutrients.map(nut => (
                    <div key={nut.label} style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '45px', height: '45px', borderRadius: '50%',
                            border: `3px solid ${nut.color}`, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                        }}>
                            {nut.value}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{nut.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SoilGauge;