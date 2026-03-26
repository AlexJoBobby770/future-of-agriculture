import React, { useState } from 'react';

const Predict = ({ apiBase = 'http://127.0.0.1:8000' }) => {
    // Input state
    const [tankCapacity,  setTankCapacity]  = useState(5000);
    const [dailyUsage,    setDailyUsage]    = useState(800);
    const [evapRate,      setEvapRate]      = useState(5);
    const [rainForecast,  setRainForecast]  = useState([0, 2, 0, 5, 0, 0, 3]);
    const [prediction,    setPrediction]    = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error,         setError]         = useState(null);

    // Call the real POST /predict API
    const handleCalculate = async () => {
        setIsCalculating(true);
        setError(null);
        try {
            const res = await fetch(`${apiBase}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    water_level: tankCapacity,
                    daily_usage: dailyUsage,
                    evapotranspiration_rate: evapRate,
                    rain_forecast: rainForecast,
                }),
            });
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            setPrediction({
                days: data.days_until_depletion,
                isCritical: data.drought_mode,
                status: data.status,
                action: data.action,
                avgLoss: data.avg_daily_net_loss,
                droughtMode: data.drought_mode,
                totalWater: tankCapacity,
            });
        } catch (err) {
            setError(err.message);
            // Fallback to client-side calc
            const avgRain = rainForecast.reduce((a, b) => a + b, 0) / rainForecast.length;
            const netLoss = dailyUsage + evapRate - avgRain;
            const days = netLoss > 0 ? (tankCapacity * 0.9 / netLoss).toFixed(1) : 999;
            setPrediction({
                days: parseFloat(days),
                isCritical: days < 3,
                status: days < 3 ? 'Critical' : days < 7 ? 'Warning' : 'Normal',
                action: 'API offline — showing client-side estimate.',
                avgLoss: Math.max(0, netLoss).toFixed(1),
                droughtMode: days < 3,
                totalWater: tankCapacity,
            });
        } finally {
            setIsCalculating(false);
        }
    };

    // Rain forecast editor
    const updateRainDay = (index, value) => {
        const updated = [...rainForecast];
        updated[index] = Number(value);
        setRainForecast(updated);
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
                    <div style={{
                        position: 'absolute', left: 0, right: 0, height: '5px',
                        background: 'rgba(6,95,70,0.08)', borderRadius: '3px',
                    }} />
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

                    <SliderRow label="Tank Capacity"       value={tankCapacity} min={1000}  max={20000} step={500}  onChange={setTankCapacity} color="#2563eb"  unit="L"      icon="🛢️" />
                    <SliderRow label="Daily Usage"         value={dailyUsage}   min={100}   max={5000}  step={100}  onChange={setDailyUsage}   color="#dc2626"  unit="L/day"  icon="💧" />
                    <SliderRow label="Evapotranspiration"  value={evapRate}     min={0}     max={50}    step={1}    onChange={setEvapRate}     color="#d97706"  unit="L/day"  icon="🌡️" />

                    {/* 7-Day Rain Forecast */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '10px',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            <span>🌧️</span> 7-Day Rain Forecast (L/day)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                            {rainForecast.map((val, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>Day {i + 1}</div>
                                    <input
                                        type="number"
                                        min={0} max={100} step={1}
                                        value={val}
                                        onChange={(e) => updateRainDay(i, e.target.value)}
                                        style={{
                                            width: '100%', padding: '8px 4px', textAlign: 'center',
                                            border: '1px solid rgba(6,95,70,0.15)', borderRadius: '8px',
                                            fontSize: '13px', fontFamily: "'JetBrains Mono', monospace",
                                            fontWeight: '600', color: val > 0 ? '#059669' : 'var(--text-muted)',
                                            background: val > 0 ? '#f0fdf4' : '#fff',
                                            outline: 'none', boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
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
                        {isCalculating ? '⟳  Computing...' : '▶  Run Depletion Analysis'}
                    </button>

                    {error && (
                        <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', background: '#fffbeb', border: '1px solid rgba(217,119,6,0.2)', fontSize: '11px', color: '#d97706' }}>
                            ⚠ API: {error} — showing fallback estimate
                        </div>
                    )}
                </div>

                {/* === RESULT PANEL === */}
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
                            }}>Predicted Water Reserve</div>

                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '64px', fontWeight: '800', lineHeight: 1,
                                color: prediction.isCritical ? 'var(--danger)' : 'var(--trust-green)',
                            }}>
                                {typeof prediction.days === 'number' ? prediction.days.toFixed(1) : prediction.days}
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
                                {prediction.status}
                            </div>
                        </div>

                        {/* Breakdown & Action */}
                        <div className="glass-card animate-fade-in">
                            <div style={{
                                fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px',
                            }}>Analysis Breakdown</div>
                            {[
                                { label: 'Tank Capacity',    value: `${tankCapacity.toLocaleString('en-IN')} L`, color: 'var(--info)' },
                                { label: 'Daily Usage',      value: `${dailyUsage.toLocaleString('en-IN')} L/day`, color: 'var(--danger)' },
                                { label: 'ET Rate',          value: `${evapRate} L/day`, color: 'var(--warning)' },
                                { label: 'Avg Daily Loss',   value: `${prediction.avgLoss} L/day`, color: 'var(--text-primary)' },
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

                            {/* Action advice from API */}
                            <div style={{
                                marginTop: '14px', padding: '10px 12px', borderRadius: '10px',
                                background: prediction.isCritical ? '#fef2f2' : '#f0fdf4',
                                border: prediction.isCritical ? '1px solid rgba(220,38,38,0.15)' : '1px solid rgba(16,185,129,0.15)',
                                fontSize: '11px', lineHeight: '1.6',
                                color: prediction.isCritical ? 'var(--danger)' : 'var(--trust-green)',
                                fontWeight: '600',
                            }}>
                                ▸ {prediction.action}
                            </div>

                            {prediction.droughtMode && (
                                <div style={{
                                    marginTop: '8px', padding: '8px 12px', borderRadius: '8px',
                                    background: '#fef2f2', border: '1px solid rgba(220,38,38,0.25)',
                                    fontSize: '10px', fontWeight: '800', color: 'var(--danger)',
                                    textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center',
                                }}>
                                    🚨 Drought Mode Activated — High-Water Crops Blocked
                                </div>
                            )}
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
                            Awaiting Analysis
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Configure the parameters above and click{' '}
                            <strong style={{ color: 'var(--trust-green)' }}>Run Depletion Analysis</strong>{' '}
                            to get a prediction from the AI engine.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Predict;