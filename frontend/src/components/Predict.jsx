import React, { useState } from 'react';

const Predict = () => {
    // Form state
    const [tankCapacity, setTankCapacity] = useState(5000);
    const [dailyUsage, setDailyUsage] = useState(800);
    const [rainfall, setRainfall] = useState(0);

    // Result state
    const [prediction, setPrediction] = useState(null);

    // The local simulation engine
    const handleCalculate = () => {
        // Simplified logic: (Capacity + (Rainfall in mm * 100)) / Daily Usage
        const extraWater = rainfall * 100;
        const totalWater = tankCapacity + extraWater;
        const daysLeft = (totalWater / dailyUsage).toFixed(1);

        setPrediction({
            days: daysLeft,
            isCritical: daysLeft < 5
        });
    };

    return (
        <div className="animate-fade-in">
            <h2 className="section-title">Farm Simulator</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Adjust parameters to simulate your water depletion timeline.
            </p>

            {/* 1. The Input Form */}
            <div className="glass-card">

                {/* Tank Capacity Slider */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <label>TANK CAPACITY</label>
                        <span style={{ color: 'var(--agri-dark)' }}>{tankCapacity} L</span>
                    </div>
                    <input
                        type="range" min="1000" max="20000" step="500"
                        value={tankCapacity} onChange={(e) => setTankCapacity(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#3b82f6' }}
                    />
                </div>

                {/* Daily Usage Slider */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <label>DAILY USAGE</label>
                        <span style={{ color: 'var(--danger)' }}>{dailyUsage} L/day</span>
                    </div>
                    <input
                        type="range" min="100" max="5000" step="100"
                        value={dailyUsage} onChange={(e) => setDailyUsage(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#ef4444' }}
                    />
                </div>

                {/* Expected Rainfall Slider */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <label>EXPECTED RAINFALL</label>
                        <span style={{ color: 'var(--success)' }}>{rainfall} mm</span>
                    </div>
                    <input
                        type="range" min="0" max="100" step="5"
                        value={rainfall} onChange={(e) => setRainfall(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#22c55e' }}
                    />
                </div>

                <button
                    onClick={handleCalculate}
                    style={{
                        width: '100%', padding: '16px', backgroundColor: 'var(--agri-dark)',
                        color: 'white', border: 'none', borderRadius: '12px',
                        fontWeight: '800', fontSize: '13px', letterSpacing: '0.5px',
                        cursor: 'pointer', boxShadow: '0 4px 10px rgba(27, 67, 50, 0.2)'
                    }}
                >
                    RUN SIMULATION
                </button>
            </div>

            {/* 2. The Result Card (Only shows after clicking the button) */}
            {prediction && (
                <div className="glass-card animate-fade-in" style={{
                    marginTop: '16px',
                    textAlign: 'center',
                    borderTop: `4px solid ${prediction.isCritical ? 'var(--danger)' : 'var(--success)'}`
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-muted)' }}>Simulated Reserves</h3>
                    <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--text-main)', lineHeight: '1' }}>
                        {prediction.days}
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', fontWeight: '800', color: prediction.isCritical ? 'var(--danger)' : 'var(--success)' }}>
                        {prediction.isCritical ? 'DAYS LEFT (CRITICAL)' : 'DAYS LEFT (SAFE)'}
                    </p>
                </div>
            )}

        </div>
    );
};

export default Predict;