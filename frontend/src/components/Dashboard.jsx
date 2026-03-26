import React from 'react';

/* ----------------------------------------------------------
   Circular SVG Arc Gauge
   ---------------------------------------------------------- */
const ArcGauge = ({ value, max = 100, color, label, unit = '', size = 130 }) => {
    const pct = Math.min(Math.max(value / max, 0), 1);
    const R = 48;
    const C = 2 * Math.PI * R;
    const strokeDash = C * pct;
    const strokeGap  = C - strokeDash;
    const cx = size / 2;
    const cy = size / 2;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle cx={cx} cy={cy} r={R} fill="none"
                        stroke="rgba(6,95,70,0.08)" strokeWidth="8" />
                    {/* Progress */}
                    <circle cx={cx} cy={cy} r={R} fill="none"
                        stroke={color} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${strokeDash} ${strokeGap}`}
                        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)' }} />
                </svg>
                {/* Center Value */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: size > 110 ? '26px' : '20px',
                        fontWeight: '700', color, lineHeight: 1,
                    }}>{value}</span>
                    {unit && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                            {unit}
                        </span>
                    )}
                </div>
            </div>
            <span style={{
                fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center',
            }}>{label}</span>
        </div>
    );
};

/* ----------------------------------------------------------
   Dashboard Component
   ---------------------------------------------------------- */
const Dashboard = ({ waterDays, soilNPK, rotationAdvice, droughtMode }) => {
    const isCritical = waterDays < 5;
    const waterPct = Math.min((waterDays / 30) * 100, 100);

    return (
        <div className="animate-fade-in">

            {/* === ALERT BANNER === */}
            {(isCritical || droughtMode) && (
                <div className="alert-banner">
                    <div className="alert-icon">⚠️</div>
                    <div className="alert-content">
                        <div className="alert-title">
                            {droughtMode ? 'Drought Mode Active' : 'Water Warning'}
                        </div>
                        <div className="alert-sub">
                            {droughtMode
                                ? 'Water reserves critically low (< 3 days). Emergency conservation protocols activated.'
                                : `Water reserve at ${waterDays} days — below safe threshold. Monitor closely.`
                            }
                        </div>
                    </div>
                    <div className="alert-badge">Live</div>
                </div>
            )}

            {/* === RESOURCE TIMERS — two cards side by side === */}
            <div className="section-title">Resource Timers</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>

                {/* Water Reserve Card */}
                <div className="glass-card" style={{
                    textAlign: 'center',
                    borderTop: `3px solid ${isCritical ? 'var(--danger)' : 'var(--vibrant-mint)'}`,
                    animation: isCritical ? 'pulseDanger 2.5s ease-in-out infinite' : 'none',
                }}>
                    <div style={{
                        fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px',
                    }}>💧 Water Reserve</div>

                    <ArcGauge
                        value={waterDays} max={30}
                        color={isCritical ? 'var(--danger)' : 'var(--vibrant-mint)'}
                        label="Days Remaining" size={130}
                    />

                    <div style={{
                        marginTop: '16px',
                        padding: '6px 16px', borderRadius: '20px', display: 'inline-block',
                        background: isCritical ? 'var(--danger-dim)' : 'var(--mint-dim)',
                        border: isCritical ? '1px solid rgba(220,38,38,0.25)' : '1px solid rgba(16,185,129,0.25)',
                        fontSize: '11px', fontWeight: '800',
                        color: isCritical ? 'var(--danger)' : 'var(--vibrant-mint)',
                        letterSpacing: '0.8px', textTransform: 'uppercase',
                    }}>
                        {isCritical ? '⚠ Critical' : '✓ Stable'}
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
                        {waterPct.toFixed(0)}% of 30-day baseline
                    </p>
                </div>

                {/* Soil NPK Card */}
                <div className="glass-card">
                    <div style={{
                        fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px',
                    }}>🧪 Soil NPK Investment Gauges</div>

                    <div style={{ display: 'flex', justifyContent: 'space-around', gap: '8px', flexWrap: 'wrap' }}>
                        <ArcGauge value={soilNPK.n} max={100} color="var(--info)" label="Nitrogen" unit="kg/ha" size={120} />
                        <ArcGauge value={soilNPK.p} max={100} color="var(--purple)" label="Phosphorus" unit="kg/ha" size={120} />
                        <ArcGauge value={soilNPK.k} max={100} color="var(--warning)" label="Potassium" unit="kg/ha" size={120} />
                    </div>

                    {/* Status row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginTop: '16px' }}>
                        {[
                            { label: 'N Status', val: soilNPK.n, color: 'var(--info)',    status: soilNPK.n > 40 ? 'Optimal' : 'Low' },
                            { label: 'P Status', val: soilNPK.p, color: 'var(--purple)', status: soilNPK.p > 30 ? 'Optimal' : 'Low' },
                            { label: 'K Status', val: soilNPK.k, color: 'var(--warning)', status: soilNPK.k > 40 ? 'Optimal' : 'Low' },
                        ].map(({ label, color, status }) => (
                            <div key={label} style={{
                                padding: '8px 10px', borderRadius: '10px',
                                background: 'var(--page-bg)', border: '1px solid rgba(6,95,70,0.08)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px', letterSpacing: '0.5px' }}>{label}</div>
                                <div style={{ fontSize: '12px', fontWeight: '800', color }}>{status}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* === AI INVESTMENT SIGNAL (LIVE from /rotation API) === */}
            <div className="section-title">AI Investment Signal</div>
            <div className="glass-card" style={{
                border: 'var(--glass-border-accent)',
                animation: 'pulseGlow 3s ease-in-out infinite',
            }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                    }}>🤖</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                Crop Rotation Advisory
                            </span>
                            <span style={{
                                fontSize: '9px', fontWeight: '800', letterSpacing: '1px',
                                background: 'linear-gradient(135deg, var(--trust-green), var(--vibrant-mint))',
                                color: 'white', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase',
                            }}>
                                {rotationAdvice?.is_live_data ? 'Live Signal' : 'AI Signal'}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--vibrant-mint)', fontWeight: '700', marginLeft: 'auto' }}>
                                Score: {rotationAdvice?.soil_health_score ?? '--'}/100
                            </span>
                        </div>

                        {rotationAdvice ? (
                            <>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: '0 0 4px 0' }}>
                                    <strong style={{ color: 'var(--trust-green)' }}>
                                        Recommended: {rotationAdvice.recommended_crop}
                                    </strong>
                                </p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 4px 0' }}>
                                    {rotationAdvice.reason}
                                </p>
                                <div style={{
                                    marginTop: '10px', padding: '8px 12px', borderRadius: '8px',
                                    background: droughtMode ? '#fef2f2' : '#f0fdf4',
                                    border: droughtMode ? '1px solid rgba(220,38,38,0.2)' : '1px solid rgba(16,185,129,0.15)',
                                    fontSize: '11px',
                                    color: droughtMode ? 'var(--danger)' : 'var(--trust-green)',
                                    fontWeight: '600',
                                }}>
                                    ▸ {rotationAdvice.next_action}
                                </div>
                            </>
                        ) : (
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.7', margin: 0 }}>
                                Loading rotation recommendation from API...
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* === FIELD METRICS === */}
            <div className="section-title">Field Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                    { label: 'Soil pH', value: '6.2', unit: 'pH', icon: '⚗️', color: 'var(--info)' },
                    { label: 'Temperature', value: '31°', unit: 'Celsius', icon: '🌡️', color: 'var(--warning)' },
                    { label: 'Humidity', value: '72%', unit: 'Relative', icon: '💨', color: 'var(--purple)' },
                    { label: 'UV Index', value: '8.4', unit: 'High', icon: '☀️', color: 'var(--danger)' },
                ].map(({ label, value, unit, icon, color }) => (
                    <div key={label} className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
                        <div style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '22px', fontWeight: '700', color, lineHeight: 1,
                        }}>{value}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px', letterSpacing: '1px', textTransform: 'uppercase' }}>{unit}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: '500' }}>{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;