import React from 'react';

const RotationCard = ({ recommendedCrop, reason }) => {
    return (
        <div style={{
            background: '#1b4332', color: 'white',
            padding: '20px', borderRadius: '16px', marginTop: '15px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🔄</span>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Smart Rotation Advice</h3>
            </div>
            <div style={{ marginTop: '15px' }}>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>RECOMMENDED CROP</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{recommendedCrop}</div>
            </div>
            <p style={{ fontSize: '13px', marginTop: '10px', lineHeight: '1.4', opacity: 0.9 }}>
                {reason}
            </p>
        </div>
    );
};

export default RotationCard;