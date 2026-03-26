import React from 'react';

const Market = ({ marketData }) => {
    // Helper function to color-code the risk levels using our CSS variables
    const getRiskColor = (risk) => {
        if (risk.toLowerCase() === 'low') return 'var(--success)';
        if (risk.toLowerCase() === 'medium') return 'var(--warning)';
        if (risk.toLowerCase() === 'high') return 'var(--danger)';
        return 'var(--text-muted)';
    };

    return (
        <div className="animate-fade-in">
            <h2 className="section-title">Live Market Prices</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: '600' }}>
                Current rates at Kochi Central Market
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {marketData.map((item) => (
                    <div key={item.crop} className="glass-card" style={{
                        margin: 0, /* Removes the default bottom margin for a tighter list */
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        borderLeft: `4px solid ${getRiskColor(item.risk)}`
                    }}>

                        {/* Left Side: Crop Name & Risk Badge */}
                        <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-main)' }}>
                                {item.crop}
                            </h3>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                /* The "15" at the end makes the background 15% transparent */
                                backgroundColor: `${getRiskColor(item.risk)}15`,
                                color: getRiskColor(item.risk)
                            }}>
                                {item.risk} VOLATILITY
                            </div>
                        </div>

                        {/* Right Side: Price & Trend */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--agri-dark)' }}>
                                ₹{item.price}
                                <span style={{ fontSize: '16px', marginLeft: '6px' }}>{item.trend}</span>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '700' }}>
                                PER KG / UNIT
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default Market;