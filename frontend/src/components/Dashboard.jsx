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
const Dashboard = ({
    waterDays, soilNPK, rotationAdvice, droughtMode, liveSensors,
    simMonth, setSimMonth, simRegion, setSimRegion, simCrop, setSimCrop, encyclopedia,
    // demo props
    demoMode = false, setDemoMode, demoNPK, setDemoNPK, demoRain = 0, setDemoRain, demoEffectiveNPK,
}) => {
    const isCritical = waterDays < 5;
    const waterPct = Math.min((waterDays / 30) * 100, 100);

    return (
        <div className="animate-fade-in">

            {/* === DEMO CONTROL PANEL === */}
            {(() => {
                // Compact slider row
                const DSlider = ({ label, icon, value, min, max, step, color, unit, onChange }) => {
                    const pct = ((value - min) / (max - min)) * 100;
                    return (
                        <div style={{ flex: 1, minWidth: '160px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                    {icon} {label}
                                </span>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: '800', color }}>
                                    {value}<span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: '2px' }}>{unit}</span>
                                </span>
                            </div>
                            <div style={{ position: 'relative', height: '18px', display: 'flex', alignItems: 'center' }}>
                                <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', background: 'rgba(6,95,70,0.08)', borderRadius: '2px' }} />
                                <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: '4px', background: `linear-gradient(90deg,${color}60,${color})`, borderRadius: '2px', pointerEvents: 'none' }} />
                                <input type="range" min={min} max={max} step={step} value={value}
                                    onChange={e => onChange(Number(e.target.value))}
                                    style={{ position: 'relative', zIndex: 2, width: '100%', appearance: 'none', WebkitAppearance: 'none', background: 'transparent', cursor: 'pointer', height: '18px', accentColor: color }}
                                />
                            </div>
                        </div>
                    );
                };

                const leachPct = r => Math.round(r * 0.25);  // visual guide: at 100mm, ~25% leach hint

                return (
                    <div style={{
                        marginBottom: '16px',
                        borderRadius: '14px',
                        border: demoMode ? '1.5px solid rgba(217,119,6,0.5)' : '1.5px dashed rgba(6,95,70,0.18)',
                        background: demoMode ? 'linear-gradient(135deg, rgba(255,251,235,0.95), rgba(255,247,220,0.9))' : '#ffffff',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        boxShadow: demoMode ? '0 4px 20px rgba(217,119,6,0.12)' : 'var(--card-shadow)',
                    }}>
                        {/* Header toggle */}
                        <div
                            onClick={() => setDemoMode && setDemoMode(v => !v)}
                            style={{
                                padding: '12px 20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                cursor: 'pointer',
                                borderBottom: demoMode ? '1px solid rgba(217,119,6,0.2)' : 'none',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '18px' }}>🎮</span>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '800', color: demoMode ? '#b45309' : 'var(--text-primary)', letterSpacing: '0.3px' }}>
                                        Hackathon Demo Controls
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                        {demoMode ? 'Override active — live sensors paused' : 'Click to override NPK & rain for demo'}
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                padding: '4px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                                background: demoMode ? '#b45309' : 'rgba(6,95,70,0.08)',
                                color: demoMode ? '#fff' : 'var(--text-muted)',
                                transition: 'all 0.2s',
                                border: demoMode ? 'none' : '1px solid rgba(6,95,70,0.15)',
                            }}>
                                {demoMode ? '● DEMO ON' : '○ OFF'}
                            </div>
                        </div>

                        {/* Expanded controls */}
                        {demoMode && demoNPK && (
                            <div style={{ padding: '16px 20px' }}>
                                {/* Rain slider — spans full width */}
                                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.8px' }}>🌧️ Simulated Rainfall</span>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: '900', color: '#2563eb' }}>{demoRain}</span>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>mm</span>
                                            {demoRain > 0 && (
                                                <span style={{
                                                    fontSize: '9px', fontWeight: '800', padding: '2px 8px',
                                                    borderRadius: '20px', background: 'rgba(220,38,38,0.1)',
                                                    color: 'var(--danger)', border: '1px solid rgba(220,38,38,0.2)',
                                                }}>⤵ Leaching N−{Math.round(demoRain * 0.3)}% K−{Math.round(demoRain * 0.2)}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <DSlider label="" icon="" value={demoRain} min={0} max={120} step={2} color="#2563eb" unit="mm" onChange={v => setDemoRain && setDemoRain(v)} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: "'JetBrains Mono', monospace" }}>
                                        <span>0 dry</span><span>40 drizzle</span><span>80 heavy</span><span>120 flood</span>
                                    </div>
                                </div>

                                {/* NPK sliders */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Base Soil NPK (before leaching)</div>
                                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                        <DSlider label="Nitrogen" icon="🔵" value={demoNPK.n} min={0} max={100} step={1} color="var(--info)" unit="kg/ha"
                                            onChange={v => setDemoNPK && setDemoNPK(p => ({ ...p, n: v }))} />
                                        <DSlider label="Phosphorus" icon="🟣" value={demoNPK.p} min={0} max={100} step={1} color="var(--purple)" unit="kg/ha"
                                            onChange={v => setDemoNPK && setDemoNPK(p => ({ ...p, p: v }))} />
                                        <DSlider label="Potassium" icon="🟡" value={demoNPK.k} min={0} max={100} step={1} color="var(--warning)" unit="kg/ha"
                                            onChange={v => setDemoNPK && setDemoNPK(p => ({ ...p, k: v }))} />
                                    </div>
                                </div>

                                {/* Live leached preview */}
                                {demoRain > 0 && demoEffectiveNPK && (
                                    <div style={{
                                        padding: '10px 14px', borderRadius: '8px', marginTop: '4px',
                                        background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.15)',
                                        display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center',
                                    }}>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>⚗ After Leaching →</span>
                                        {[['N', demoEffectiveNPK.n, demoNPK.n, 'var(--info)'], ['P', demoEffectiveNPK.p, demoNPK.p, 'var(--purple)'], ['K', demoEffectiveNPK.k, demoNPK.k, 'var(--warning)']].map(([lbl, eff, base, col]) => (
                                            <div key={lbl} style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: '800', fontSize: '15px', color: col }}>{eff}</span>
                                                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>kg/ha</span>
                                                <span style={{ fontSize: '9px', color: 'var(--danger)', fontWeight: '700' }}>(−{base - eff})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Quick presets */}
                                <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', alignSelf: 'center' }}>Quick:</span>
                                    {[
                                        { label: '☀️ Ideal Soil',  npk: { n: 72, p: 55, k: 68 }, rain: 0 },
                                        { label: '🌦 Light Rain',  npk: { n: 65, p: 42, k: 58 }, rain: 30 },
                                        { label: '🌧 Heavy Rain',  npk: { n: 60, p: 38, k: 55 }, rain: 80 },
                                        { label: '🌊 Flood',       npk: { n: 20, p: 30, k: 18 }, rain: 120 },
                                        { label: '🏜️ Drought',     npk: { n: 18, p: 12, k: 22 }, rain: 0 },
                                    ].map(({ label, npk, rain }) => (
                                        <button key={label}
                                            onClick={() => { setDemoNPK && setDemoNPK(npk); setDemoRain && setDemoRain(rain); }}
                                            style={{
                                                padding: '5px 12px', fontSize: '11px', fontWeight: '700',
                                                borderRadius: '20px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                                border: '1px solid rgba(6,95,70,0.2)', background: '#fff',
                                                color: 'var(--text-secondary)', transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#065f46'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        >{label}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

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

            {/* === SOIL STATUS PANEL === */}
            <div className="section-title">Soil & Field Status</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>

                {/* ── Soil Health Score Card ── */}
                {(() => {
                    const score = rotationAdvice?.soil_health_score ?? null;
                    const scoreColor = score === null ? 'var(--text-muted)'
                        : score >= 70 ? 'var(--vibrant-mint)'
                        : score >= 45 ? 'var(--warning)'
                        : 'var(--danger)';
                    const scoreLabel = score === null ? 'Loading…'
                        : score >= 70 ? 'Excellent'
                        : score >= 45 ? 'Fair'
                        : 'Poor';
                    const scorePct   = score !== null ? Math.min(score, 100) : 0;
                    const scoreAnim  = score !== null && score < 45 ? 'pulseDanger 2.5s ease-in-out infinite' : 'none';

                    // Irrigation hint from soil moisture
                    const moisture   = liveSensors?.soil_moisture ?? null;
                    const irrigNeed  = moisture === null ? null : moisture < 30 ? 'Irrigate Now' : moisture < 50 ? 'Monitor' : 'Sufficient';
                    const irrigColor = moisture === null ? 'var(--text-muted)' : moisture < 30 ? 'var(--danger)' : moisture < 50 ? 'var(--warning)' : 'var(--vibrant-mint)';

                    return (
                        <div className="glass-card" style={{
                            textAlign: 'center',
                            borderTop: `3px solid ${scoreColor}`,
                            animation: scoreAnim,
                        }}>
                            <div style={{
                                fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px',
                            }}>🌱 Soil Health</div>

                            <ArcGauge
                                value={score ?? 0} max={100}
                                color={scoreColor}
                                label="Health Score" size={130}
                            />

                            {/* Score label badge */}
                            <div style={{
                                marginTop: '14px',
                                padding: '5px 16px', borderRadius: '20px', display: 'inline-block',
                                background: score === null ? 'var(--page-bg)'
                                    : score >= 70 ? 'var(--mint-dim)'
                                    : score >= 45 ? 'rgba(217,119,6,0.08)'
                                    : 'var(--danger-dim)',
                                border: `1px solid ${scoreColor}30`,
                                fontSize: '12px', fontWeight: '800',
                                color: scoreColor,
                                letterSpacing: '0.8px', textTransform: 'uppercase',
                            }}>
                                {scoreLabel}
                            </div>

                            {/* Recommended crop pill */}
                            {rotationAdvice?.recommended_crop && (
                                <div style={{
                                    marginTop: '10px',
                                    fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600',
                                }}>
                                    🌾 <span style={{ color: 'var(--trust-green)', fontWeight: '700' }}>
                                        {rotationAdvice.recommended_crop}
                                    </span> recommended
                                </div>
                            )}

                            {/* Irrigation status */}
                            {irrigNeed && (
                                <div style={{
                                    marginTop: '10px',
                                    padding: '5px 12px', borderRadius: '8px',
                                    background: 'var(--page-bg)',
                                    border: `1px solid ${irrigColor}30`,
                                    fontSize: '10px', fontWeight: '700',
                                    color: irrigColor,
                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                }}>
                                    💧 Irrigation: {irrigNeed} ({moisture?.toFixed(0)}%)
                                </div>
                            )}

                            {/* pH strip */}
                            {liveSensors?.ph && (
                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    pH {liveSensors.ph.toFixed(1)} · {liveSensors.ph < 6 ? 'Acidic' : liveSensors.ph > 7.5 ? 'Alkaline' : 'Neutral'}
                                </p>
                            )}
                        </div>
                    );
                })()}

                {/* ── Soil NPK Card ── */}
                <div className="glass-card">
                    <div style={{
                        fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <span>🧪 Soil NPK Live Readings</span>
                        <span style={{
                            fontSize: '9px', background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px',
                            padding: '2px 8px', color: 'var(--vibrant-mint)', fontWeight: '800',
                            animation: 'livePulse 2s ease-in-out infinite',
                        }}>◉ LIVE</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-around', gap: '8px', flexWrap: 'wrap' }}>
                        <ArcGauge value={soilNPK.n} max={100} color="var(--info)"    label="Nitrogen"   unit="kg/ha" size={120} />
                        <ArcGauge value={soilNPK.p} max={100} color="var(--purple)"  label="Phosphorus" unit="kg/ha" size={120} />
                        <ArcGauge value={soilNPK.k} max={100} color="var(--warning)" label="Potassium"  unit="kg/ha" size={120} />
                    </div>

                    {/* Status + delta row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginTop: '16px' }}>
                        {[
                            { label: 'Nitrogen',     val: soilNPK.n, color: 'var(--info)',    threshold: 40 },
                            { label: 'Phosphorus',   val: soilNPK.p, color: 'var(--purple)',  threshold: 30 },
                            { label: 'Potassium',    val: soilNPK.k, color: 'var(--warning)', threshold: 40 },
                        ].map(({ label, val, color, threshold }) => {
                            const ok = val > threshold;
                            return (
                                <div key={label} style={{
                                    padding: '10px', borderRadius: '10px',
                                    background: ok ? 'rgba(16,185,129,0.04)' : 'rgba(220,38,38,0.04)',
                                    border: `1px solid ${ok ? 'rgba(16,185,129,0.15)' : 'rgba(220,38,38,0.15)'}`,
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</div>
                                    <div style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: '18px', fontWeight: '800', color, lineHeight: 1,
                                        transition: 'color 0.5s ease',
                                    }}>{val}</div>
                                    <div style={{
                                        fontSize: '9px', marginTop: '4px', fontWeight: '700',
                                        color: ok ? 'var(--vibrant-mint)' : 'var(--danger)',
                                    }}>{ok ? '✓ Optimal' : '↓ Low'}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Soil advice bar */}
                    <div style={{
                        marginTop: '12px', padding: '8px 12px', borderRadius: '8px',
                        background: 'rgba(6,95,70,0.04)', border: '1px solid rgba(6,95,70,0.1)',
                        fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5',
                    }}>
                        {soilNPK.n < 40 ? '⚠ Add nitrogen fertiliser before next sowing cycle.' :
                         soilNPK.p < 30 ? '⚠ Phosphorus low — apply DAP or bone meal.' :
                         soilNPK.k < 40 ? '⚠ Potassium deficient — apply MOP or wood ash.' :
                         '✅ All macronutrients within optimal range. Good to plant.'}
                    </div>
                </div>
            </div>

            {/* === AI INVESTMENT SIGNAL (LIVE from /rotation API) === */}
            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span>AI Investment Signal</span>
                
                {/* CLIMATE SIMULATION CONTROLS */}
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: '600', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Simulate Climate:</span>
                    
                    <select 
                        value={simCrop}
                        onChange={e => setSimCrop(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.3)', background: 'var(--page-bg)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="">🔮 AI Recommended</option>
                        {encyclopedia.map(crop => (
                            <option key={crop.id} value={crop.name}>
                                {crop.name}
                            </option>
                        ))}
                    </select>

                    <select 
                        value={simRegion} 
                        onChange={e => setSimRegion(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.3)', background: 'var(--page-bg)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="Kochi">Kochi (Monsoons)</option>
                        <option value="Palakkad">Palakkad (Dry/Hot)</option>
                    </select>
                    
                    <select 
                        value={simMonth} 
                        onChange={e => setSimMonth(parseInt(e.target.value, 10))}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.3)', background: 'var(--page-bg)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="1">Jan</option>
                        <option value="2">Feb</option>
                        <option value="3">Mar</option>
                        <option value="4">Apr</option>
                        <option value="5">May</option>
                        <option value="6">Jun (Monsoon)</option>
                        <option value="7">Jul</option>
                        <option value="8">Aug</option>
                        <option value="9">Sep</option>
                        <option value="10">Oct</option>
                        <option value="11">Nov</option>
                        <option value="12">Dec</option>
                    </select>
                </div>
            </div>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
                                        <strong style={{ color: 'var(--trust-green)' }}>
                                            Recommended: {rotationAdvice.recommended_crop}
                                        </strong>
                                    </p>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                        AI Confidence: {(rotationAdvice.confidence_score * 100).toFixed(1)}%
                                    </span>
                                </div>
                                
                                {rotationAdvice.uncertainty_flag && (
                                    <div style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>⚠️</span> {rotationAdvice.uncertainty_flag}
                                    </div>
                                )}
                                
                                {rotationAdvice.seasonal_warning && (
                                    <div style={{
                                        fontSize: '11px', color: '#b91c1c', fontWeight: '800', marginBottom: '8px', 
                                        padding: '6px 10px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px'
                                    }}>
                                        🚨 {rotationAdvice.seasonal_warning}
                                    </div>
                                )}
                                
                                {rotationAdvice.weather_context && (
                                    <div style={{
                                        fontSize: '10px', color: '#2563eb', fontWeight: '600', marginBottom: '8px', 
                                        padding: '4px 8px', background: 'rgba(37,99,235,0.08)', borderRadius: '6px',
                                        display: 'inline-block'
                                    }}>
                                        {rotationAdvice.weather_context}
                                    </div>
                                )}

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

                                {/* YIELD PREDICTION METRICS */}
                                {rotationAdvice.expected_yield_tons_ha !== undefined && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(16,185,129,0.1))',
                                        border: '1px solid rgba(16,185,129,0.2)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '4px' }}>
                                                Projected Yield
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                                <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: "'JetBrains Mono', monospace", color: 'var(--vibrant-mint)' }}>
                                                    {rotationAdvice.expected_yield_tons_ha}
                                                </span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Tons/ha</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '4px' }}>
                                                Yield Potential
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                                <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ 
                                                        width: `${rotationAdvice.yield_potential_pct}%`, 
                                                        height: '100%', 
                                                        background: rotationAdvice.yield_potential_pct > 80 ? 'var(--vibrant-mint)' : rotationAdvice.yield_potential_pct > 50 ? 'var(--warning)' : 'var(--danger)',
                                                        transition: 'width 1s ease-in-out, background 1s ease-in-out'
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                                                    {rotationAdvice.yield_potential_pct}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                    { label: 'Soil pH', value: liveSensors?.ph?.toFixed(1) ?? '--', unit: 'pH', icon: '⚗️', color: 'var(--info)' },
                    { label: 'Temperature', value: liveSensors ? `${liveSensors.temperature.toFixed(1)}°` : '--', unit: 'Celsius', icon: '🌡️', color: 'var(--warning)' },
                    { label: 'Moisture', value: liveSensors ? `${liveSensors.soil_moisture.toFixed(1)}%` : '--', unit: 'Soil Vol.', icon: '💧', color: 'var(--vibrant-mint)' },
                    { label: 'Rain (7d)', value: liveSensors ? `${liveSensors.rain_mm.toFixed(0)}` : '--', unit: 'mm', icon: '🌧️', color: 'var(--purple)' },
                ].map(({ label, value, unit, icon, color }) => (
                    <div key={label} className="glass-card" style={{ padding: '16px', textAlign: 'center', transition: 'all 0.3s ease' }}>
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