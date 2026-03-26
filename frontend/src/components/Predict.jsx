import React, { useState } from 'react';

const Predict = () => {
    // All original hooks preserved
    const [tankCapacity, setTankCapacity] = useState(5000);
    const [dailyUsage,   setDailyUsage]   = useState(800);
    const [rainfall,     setRainfall]     = useState(0);
    const [prediction,   setPrediction]   = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Original calculation logic preserved
    const handleCalculate = () => {
        setIsCalculating(true);
        setTimeout(() => {
            const extraWater = rainfall * 100;
            const totalWater = tankCapacity + extraWater;
            const daysLeft   = (totalWater / dailyUsage).toFixed(1);
            setPrediction({ days: daysLeft, isCritical: daysLeft < 5, totalWater });
            setIsCalculating(false);
        }, 500);
    };

    /* Custom Slider Row */
    const SliderRow = ({ label, value, min, max, step, onChange, color, unit, icon }) => {
        const pct = ((value - min) / (max - min)) * 100;
        return (
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{
                        fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '1.2px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        <span>{icon}</span>{label}
                    </label>
                    <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '16px', fontWeight: '700', color,
                    }}>
                        {value.toLocaleString('en-IN')}
                        <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '4px' }}>{unit}</span>
                    </span>
                </div>
                {/* Track wrapper */}
                <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
                    {/* Background track */}
                    <div style={{
                        position: 'absolute', left: 0, right: 0, height: '5px',
                        background: 'rgba(6,95,70,0.08)', borderRadius: '3px',
                    }} />
                    {/* Filled track */}
                    <div style={{
                        position: 'absolute', left: 0, width: `${pct}%`, height: '5px',
                        background: `linear-gradient(90deg, ${color}60, ${color})`,
                        borderRadius: '3px', pointerEvents: 'none',
                    }} />
                    <input
                        type="range" min={min} max={max} step={step} value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                        style={{
                            position: 'relative', zIndex: 2, width: '100%',
                            appearance: 'none', WebkitAppearance: 'none',
                            background: 'transparent', cursor: 'pointer', height: '20px',
                            accentColor: color,
                        }}
                    />
                </div>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px',
                    fontFamily: "'JetBrains Mono', monospace",
                }}>
                    <span>{min.toLocaleString()}</span>
                    <span>{max.toLocaleString()}</span>
                </div>
            </div>
        );
    };

    const pctFill = prediction ? Math.min((prediction.days / 30) * 100, 100) : 0;

    return (
        <div className="animate-fade-in">
            {/*
              LAYOUT: Stack vertically on narrow screens.
              Input panel on top, result panel below.
              This guarantees correct display at any viewport width.
            */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* === INPUT PANEL === */}
                <div className="glass-card" style={{ maxWidth: '720px' }}>
                    <div style={{
                        fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '24px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <span style={{ color: 'var(--trust-green)' }}>◈</span>
                        Simulation Parameters
                    </div>

                    <SliderRow label="Tank Capacity"    value={tankCapacity} min={1000}  max={20000} step={500}  onChange={setTankCapacity} color="#2563eb"  unit="L"     icon="🛢️" />
                    <SliderRow label="Daily Usage"      value={dailyUsage}   min={100}   max={5000}  step={100}  onChange={setDailyUsage}   color="#dc2626"  unit="L/day" icon="💧" />
                    <SliderRow label="Expected Rainfall" value={rainfall}    min={0}     max={100}   step={5}    onChange={setRainfall}     color="#059669"  unit="mm"    icon="🌧️" />

                    {/* Formula Preview */}
                    <div style={{
                        padding: '12px 16px', borderRadius: '10px', marginBottom: '18px',
                        background: 'var(--page-bg)', border: '1px solid rgba(6,95,70,0.10)',
                        fontSize: '12px', color: 'var(--text-muted)',
                    }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '11px' }}>Formula Preview</div>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', fontSize: '11px' }}>
                            ({tankCapacity.toLocaleString()} + {(rainfall * 100).toLocaleString()}) ÷ {dailyUsage.toLocaleString()} =&nbsp;
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: 'var(--trust-green)', fontSize: '12px' }}>
                            {((tankCapacity + rainfall * 100) / dailyUsage).toFixed(1)} days
                        </span>
                    </div>

                    {/* CTA Button */}
                    <button
                        id="run-simulation-btn"
                        onClick={handleCalculate}
                        disabled={isCalculating}
                        style={{
                            width: '100%', padding: '14px',
                            background: isCalculating ? '#a7f3d0' : 'linear-gradient(135deg, #065f46, #059669)',
                            color: 'white', border: 'none', borderRadius: '12px',
                            fontWeight: '800', fontSize: '13px', letterSpacing: '0.8px',
                            cursor: isCalculating ? 'not-allowed' : 'pointer',
                            boxShadow: isCalculating ? 'none' : '0 4px 16px rgba(6,95,70,0.25)',
                            textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { if (!isCalculating) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,95,70,0.35)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isCalculating ? 'none' : '0 4px 16px rgba(6,95,70,0.25)'; }}
                    >
                        {isCalculating ? '⟳  Computing...' : '▶  Run Simulation'}
                    </button>
                </div>

                {/* === RESULT PANEL (shown only after calculation) === */}
                {prediction ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '720px' }}>

                        {/* Main Result */}
                        <div className="glass-card animate-fade-in" style={{
                            textAlign: 'center',
                            borderTop: `3px solid ${prediction.isCritical ? 'var(--danger)' : 'var(--vibrant-mint)'}`,
                            animation: prediction.isCritical ? 'pulseDanger 2.5s ease-in-out infinite' : 'pulseGlow 3s ease-in-out infinite',
                        }}>
                            <div style={{
                                fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px',
                            }}>Simulated Water Reserve</div>

                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '64px', fontWeight: '800', lineHeight: 1,
                                color: prediction.isCritical ? 'var(--danger)' : 'var(--trust-green)',
                            }}>
                                {prediction.days}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>
                                days of water remaining
                            </div>

                            {/* Progress bar */}
                            <div style={{ background: 'var(--page-bg)', borderRadius: '4px', height: '6px', marginBottom: '6px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', width: `${pctFill}%`,
                                    background: prediction.isCritical
                                        ? 'linear-gradient(90deg, #dc2626, #f87171)'
                                        : 'linear-gradient(90deg, #065f46, #10b981)',
                                    borderRadius: '4px',
                                    transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                                }} />
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                {pctFill.toFixed(0)}% of 30-day safe threshold
                            </div>

                            {/* Status Badge */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '7px',
                                padding: '9px 20px', borderRadius: '24px',
                                background: prediction.isCritical ? '#fef2f2' : '#f0fdf4',
                                border: prediction.isCritical ? '1px solid rgba(220,38,38,0.25)' : '1px solid rgba(16,185,129,0.3)',
                                fontSize: '12px', fontWeight: '800',
                                color: prediction.isCritical ? 'var(--danger)' : 'var(--trust-green)',
                                letterSpacing: '0.5px', textTransform: 'uppercase',
                            }}>
                                <span style={{
                                    width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block',
                                    background: prediction.isCritical ? 'var(--danger)' : 'var(--vibrant-mint)',
                                    animation: 'livePulse 1.5s ease-in-out infinite',
                                }} />
                                {prediction.isCritical ? 'Critical Shortage' : 'Safe Reserve'}
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="glass-card animate-fade-in">
                            <div style={{
                                fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px',
                            }}>Simulation Breakdown</div>
                            {[
                                { label: 'Tank Capacity',  value: `${tankCapacity.toLocaleString('en-IN')} L`,   color: 'var(--info)' },
                                { label: 'Rainfall Bonus', value: `+${(rainfall * 100).toLocaleString('en-IN')} L`, color: 'var(--vibrant-mint)' },
                                { label: 'Total Water',    value: `${prediction.totalWater.toLocaleString('en-IN')} L`, color: 'var(--text-primary)' },
                                { label: 'Daily Burn',     value: `${dailyUsage.toLocaleString('en-IN')} L/day`, color: 'var(--danger)' },
                            ].map(({ label, value, color }) => (
                                <div key={label} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 0', borderBottom: '1px solid rgba(6,95,70,0.07)',
                                }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
                                    <span style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: '13px', fontWeight: '700', color,
                                    }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Placeholder */
                    <div style={{
                        maxWidth: '720px', padding: '40px 24px', borderRadius: '16px',
                        border: '2px dashed rgba(6,95,70,0.12)', background: '#ffffff',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>💧</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Awaiting Simulation
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Adjust the parameters above and click{' '}
                            <strong style={{ color: 'var(--trust-green)' }}>Run Simulation</strong>.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Predict;