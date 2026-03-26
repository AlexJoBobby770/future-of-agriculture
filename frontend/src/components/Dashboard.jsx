import React from 'react';

const Dashboard = ({ waterDays, soilNPK }) => {
    // Logic to determine if water is critically low (less than 5 days)
    const isCritical = waterDays < 5;

    return (
        <div className="animate-fade-in">

            {/* 1. The Alert Banner */}
            <div style={{
                backgroundColor: 'var(--danger)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
            }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                DROUGHT WARNING ACTIVE
            </div>

            <h2 className="section-title">Resource Timers</h2>

            {/* 2. Water Reserve Card */}
            <div className="glass-card" style={{
                borderTop: `4px solid ${isCritical ? 'var(--danger)' : 'var(--success)'}`,
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💧</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-muted)' }}>Water Reserve</h3>

                <div style={{ fontSize: '48px', fontWeight: '900', lineHeight: '1', color: 'var(--text-main)' }}>
                    {/* padStart adds a '0' so "4" becomes "04" */}
                    {waterDays.toString().padStart(2, '0')}
                </div>

                <p style={{
                    margin: '8px 0 0 0',
                    fontSize: '12px',
                    fontWeight: '800',
                    color: isCritical ? 'var(--danger)' : 'var(--success)'
                }}>
                    {isCritical ? 'DAYS LEFT (CRITICAL)' : 'DAYS LEFT (STABLE)'}
                </p>
            </div>

            <h2 className="section-title">Soil Health</h2>

            {/* 3. Soil NPK Gauges */}
            <div className="glass-card">
                <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    NPK Nutrient Levels
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>

                    {/* Nitrogen (N) - Blue */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            border: '4px solid #3b82f6', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: '800', color: '#3b82f6',
                            margin: '0 auto 8px auto'
                        }}>
                            {soilNPK.n}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>NITROGEN</div>
                    </div>

                    {/* Phosphorus (P) - Purple */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            border: '4px solid #a855f7', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: '800', color: '#a855f7',
                            margin: '0 auto 8px auto'
                        }}>
                            {soilNPK.p}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>PHOSPHORUS</div>
                    </div>

                    {/* Potassium (K) - Orange */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            border: '4px solid #f59e0b', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: '800', color: '#f59e0b',
                            margin: '0 auto 8px auto'
                        }}>
                            {soilNPK.k}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>POTASSIUM</div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Dashboard;