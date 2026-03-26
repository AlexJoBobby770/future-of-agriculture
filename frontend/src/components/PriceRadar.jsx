import React from 'react';

const PriceRadar = ({ crop, current_price, trend, risk_level }) => {
    const trendIcon = trend === 'Upward' ? '📈' : trend === 'Downward' ? '📉' : '📊';
    const riskColor = risk_level === 'High' ? '#ef4444' : '#22c55e';

    return (
        <div className="price-row">
            <div className="price-info">
                <strong>{crop}</strong>
                <span style={{ color: riskColor, fontSize: '10px' }}> ● {risk_level} Risk</span>
            </div>
            <div className="price-meta">
                <span className="price-value">₹{current_price}</span>
                <span className="price-trend">{trendIcon}</span>
            </div>
        </div>
    );
};

export default PriceRadar;