import React, { useState, useEffect, useRef } from 'react';

/* ================================================================
   INLINE SVG ICONS (Lucide-style, no emoji anywhere)
   ================================================================ */
const Icon = {
    alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>,
    thermometer: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>,
    droplet: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>,
    flask: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6"/><path d="M10 9V3"/><path d="M14 9V3"/><path d="M10 9l-4.5 7.794A2 2 0 0 0 7.236 20h9.528a2 2 0 0 0 1.736-2.994L14 9"/></svg>,
    cloud: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>,
    target: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    arrowUp: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>,
    check: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
    arrowDown: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>,
    sliders: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>,
    sparkles: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
    wheat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/></svg>,
};

/* ================================================================
   DONUT CHART — Depletion Engine
   Animated circular gauge showing "Days of Water Remaining"
   ================================================================ */
const DonutChart = ({ value, max = 30, size = 180, unit = 'days left', strokeColor, badgeLabel, badgeBg, badgeBorder }) => {
    const [animatedPct, setAnimatedPct] = useState(0);
    const pct = Math.min(Math.max(value / max, 0), 1);
    const R = (size / 2) - 16;
    const C = 2 * Math.PI * R;
    const cx = size / 2, cy = size / 2;

    // Default color logic (water depletion severity)
    const autoColor = value <= 5 ? '#EF4444' : value <= 12 ? '#F59E0B' : '#10B981';
    const color = strokeColor || autoColor;

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedPct(pct), 100);
        return () => clearTimeout(timer);
    }, [pct]);

    const strokeDash = C * animatedPct;
    const strokeGap = C - strokeDash;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle cx={cx} cy={cy} r={R} fill="none"
                        stroke="#F1F5F9" strokeWidth="12" />
                    {/* Progress */}
                    <circle cx={cx} cy={cy} r={R} fill="none"
                        stroke={color} strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={`${strokeDash} ${strokeGap}`}
                        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.5s ease' }} />
                </svg>
                {/* Center text */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: size > 160 ? '36px' : '28px', fontWeight: '700', color: 'var(--text-primary)',
                        lineHeight: 1,
                    }}>{value}</span>
                    <span style={{
                        fontSize: '11px', color: 'var(--text-muted)',
                        fontWeight: '500', marginTop: '4px',
                    }}>{unit}</span>
                </div>
            </div>
            {badgeLabel && (
                <div style={{
                    marginTop: '12px', padding: '4px 14px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px',
                    background: badgeBg || 'var(--emerald-wash)',
                    color,
                    border: `1px solid ${badgeBorder || 'var(--emerald-border)'}`,
                }}>
                    {badgeLabel}
                </div>
            )}
        </div>
    );
};

/* ================================================================
   NUTRIENT BAR CHART — Soil N-P-K Drift
   Clean vertical bars with labeled values
   ================================================================ */
const NutrientBars = ({ n, p, k }) => {
    // Dynamically scale Y-axis based on actual data
    const currentMax = Math.max(n || 0, p || 0, k || 0, 100);
    const chartMax = Math.ceil(currentMax / 50) * 50; 
    
    const nutrients = [
        { label: 'Nitrogen', short: 'N', value: n, max: chartMax, color: '#3B82F6' },
        { label: 'Phosphorus', short: 'P', value: p, max: chartMax, color: '#8B5CF6' },
        { label: 'Potassium', short: 'K', value: k, max: chartMax, color: '#F59E0B' },
    ];
    const W = 280, H = 160, PAD_T = 20, PAD_B = 36, PAD_L = 38;
    const plotH = H - PAD_T - PAD_B;
    const barW = 36, gap = 40;
    const totalBarsW = nutrients.length * barW + (nutrients.length - 1) * gap;
    const startX = PAD_L + (W - PAD_L - totalBarsW) / 2;

    // Generate 5 dynamic ticks
    const tickVals = Array.from({length: 5}, (_, i) => (chartMax / 4) * i);

    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            {/* Y-axis dotted grid */}
            {tickVals.map(v => {
                const y = PAD_T + plotH - (v / chartMax) * plotH;
                return (
                    <g key={v}>
                        <line x1={PAD_L} y1={y} x2={W - 10} y2={y}
                            stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,4" />
                        <text x={PAD_L - 6} y={y + 3} textAnchor="end"
                            fontSize="9" fill="#94A3B8" fontFamily="'JetBrains Mono', monospace">
                            {v}
                        </text>
                    </g>
                );
            })}

            {/* Bars */}
            {nutrients.map((nut, i) => {
                const x = startX + i * (barW + gap);
                const barH = Math.max(2, (nut.value / nut.max) * plotH);
                const y = PAD_T + plotH - barH;
                const threshold = nut.short === 'P' ? 30 : 40;
                const isLow = nut.value < threshold;

                return (
                    <g key={nut.short}>
                        {/* Background track */}
                        <rect x={x} y={PAD_T} width={barW} height={plotH}
                            rx="6" fill="#F8FAFC" />
                        {/* Value bar */}
                        <rect x={x} y={y} width={barW} height={barH}
                            rx="6" fill={nut.color} opacity="0.85"
                            style={{ transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), y 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                        {/* Value label on top */}
                        <text x={x + barW / 2} y={y - 6} textAnchor="middle"
                            fontSize="12" fontWeight="700" fill={nut.color}
                            fontFamily="'JetBrains Mono', monospace">
                            {nut.value}
                        </text>
                        {/* Bottom label */}
                        <text x={x + barW / 2} y={H - 10} textAnchor="middle"
                            fontSize="10" fontWeight="600" fill="#64748B">
                            {nut.short}
                        </text>
                        <text x={x + barW / 2} y={H - 0} textAnchor="middle"
                            fontSize="8" fill="#94A3B8">
                            kg/ha
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

/* ================================================================
   AREA CHART — Market Predictor (14-day price trend)
   Smooth curved line with emerald gradient fill
   ================================================================ */
const AreaChart = ({ data, label = 'Tomato', unit = '/kg' }) => {
    if (!data || data.length < 2) return null;
    const [hoverIdx, setHoverIdx] = useState(null);
    const W = 520, H = 170, PAD = { t: 20, b: 28, l: 40, r: 12 };
    const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;

    const min = Math.min(...data) - 1;
    const max = Math.max(...data) + 1;
    const range = max - min || 1;

    const pts = data.map((v, i) => ({
        x: PAD.l + (i / (data.length - 1)) * plotW,
        y: PAD.t + plotH - ((v - min) / range) * plotH,
        val: v,
    }));

    // Catmull-Rom → cubic bezier approximation for smooth curve
    const catmullRomPath = (points) => {
        if (points.length < 2) return '';
        let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(i - 1, 0)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(i + 2, points.length - 1)];
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
        }
        return d;
    };

    const lineD = catmullRomPath(pts);
    const fillD = `${lineD} L ${pts[pts.length - 1].x.toFixed(1)} ${H - PAD.b} L ${PAD.l} ${H - PAD.b} Z`;

    // Y-axis ticks
    const yTicks = 4;
    const tickVals = Array.from({ length: yTicks + 1 }, (_, i) => min + (range * i) / yTicks);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
                onMouseLeave={() => setHoverIdx(null)}>
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Y-axis dotted grid */}
                {tickVals.map((v, i) => {
                    const y = PAD.t + plotH - ((v - min) / range) * plotH;
                    return (
                        <g key={i}>
                            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
                                stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,4" />
                            <text x={PAD.l - 6} y={y + 3} textAnchor="end"
                                fontSize="9" fill="#94A3B8" fontFamily="'JetBrains Mono', monospace">
                                {v.toFixed(0)}
                            </text>
                        </g>
                    );
                })}

                {/* Gradient fill */}
                <path d={fillD} fill="url(#areaGrad)" />
                {/* Smooth line */}
                <path d={lineD} fill="none" stroke="#10B981" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points */}
                {pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={hoverIdx === i ? 5 : 2.5}
                        fill={hoverIdx === i ? '#FFFFFF' : '#10B981'}
                        stroke="#10B981" strokeWidth="2"
                        style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                        onMouseEnter={() => setHoverIdx(i)} />
                ))}

                {/* Hover crosshair + tooltip */}
                {hoverIdx !== null && pts[hoverIdx] && (
                    <g>
                        <line x1={pts[hoverIdx].x} y1={PAD.t} x2={pts[hoverIdx].x} y2={H - PAD.b}
                            stroke="#10B981" strokeWidth="1" strokeDasharray="3,3" opacity="0.35" />
                        <rect x={pts[hoverIdx].x - 26} y={pts[hoverIdx].y - 24} width="52" height="20" rx="6"
                            fill="#1E293B" />
                        <text x={pts[hoverIdx].x} y={pts[hoverIdx].y - 10} textAnchor="middle"
                            fontSize="10" fill="#fff" fontWeight="600" fontFamily="'JetBrains Mono', monospace">
                            ₹{pts[hoverIdx].val}
                        </text>
                    </g>
                )}

                {/* X-axis labels */}
                {pts.filter((_, i) => i % 2 === 0 || i === pts.length - 1).map((p, idx) => (
                    <text key={idx} x={p.x} y={H - 6} textAnchor="middle"
                        fontSize="8" fill="#94A3B8" fontFamily="'JetBrains Mono', monospace">
                        D{data.indexOf(p.val) + 1}
                    </text>
                ))}
            </svg>
        </div>
    );
};

/* ================================================================
   METRIC CARD — Compact stat display
   ================================================================ */
const MetricCard = ({ icon, label, value, unit, color }) => (
    <div className="glass-card" style={{ padding: '20px 16px', textAlign: 'center' }}>
        <div style={{ color, marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
            {icon}
        </div>
        <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)',
            lineHeight: 1,
        }}>{value}</div>
        <div style={{
            fontSize: '9px', color: 'var(--text-faint)', marginTop: '4px',
            letterSpacing: '1.2px', textTransform: 'uppercase', fontWeight: '600',
        }}>{unit}</div>
        <div style={{
            fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px',
            fontWeight: '500',
        }}>{label}</div>
    </div>
);

/* ================================================================
   DEMO SLIDER (compact, clean)
   ================================================================ */
const DemoSlider = ({ label, value, min, max, step, color, unit, onChange }) => {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    {label}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: '700', color }}>
                    {value}<span style={{ fontSize: '9px', color: 'var(--text-faint)', marginLeft: '2px' }}>{unit}</span>
                </span>
            </div>
            <div style={{ position: 'relative', height: '18px', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, height: '3px', background: '#F1F5F9', borderRadius: '2px' }} />
                <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: '3px', background: color, borderRadius: '2px', pointerEvents: 'none', opacity: 0.7, transition: 'width 0.1s ease' }} />
                <input type="range" min={min} max={max} step={step} value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    style={{ position: 'relative', zIndex: 2, width: '100%', appearance: 'none', WebkitAppearance: 'none', background: 'transparent', cursor: 'pointer', height: '18px', accentColor: color }}
                />
            </div>
        </div>
    );
};


/* ================================================================
   DASHBOARD COMPONENT
   ================================================================ */
const Dashboard = ({
    waterDays, soilNPK, rotationAdvice, droughtMode, liveSensors,
    simMonth, setSimMonth, simRegion, setSimRegion, simCrop, setSimCrop, encyclopedia,
    demoMode = false, setDemoMode, demoNPK, setDemoNPK, demoRain = 0, setDemoRain, demoEffectiveNPK,
}) => {
    const isCritical = waterDays < 5;
    const score = rotationAdvice?.soil_health_score ?? null;
    const scoreColor = score === null ? 'var(--text-muted)' : score >= 70 ? '#10B981' : score >= 45 ? '#F59E0B' : '#EF4444';
    const scoreLabel = score === null ? 'Loading' : score >= 70 ? 'Excellent' : score >= 45 ? 'Fair' : 'Poor';

    // Mock market price data (Tomato 14-day from backend)
    const marketPrices = [18, 20, 19, 22, 21, 25, 24, 26, 25, 28, 27, 29, 31, 31];

    return (
        <div className="animate-fade-in">

            {/* ── DEMO CONTROLS ── */}
            <div style={{
                marginBottom: '24px', borderRadius: '14px', overflow: 'hidden',
                border: demoMode ? '1px solid var(--warning-border)' : '1px solid var(--surface-border)',
                background: demoMode ? 'var(--warning-wash)' : 'var(--surface)',
                boxShadow: demoMode ? 'none' : 'var(--surface-shadow)',
                transition: 'all 0.3s ease',
            }}>
                <div
                    onClick={() => setDemoMode && setDemoMode(v => !v)}
                    style={{
                        padding: '14px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderBottom: demoMode ? '1px solid var(--warning-border)' : 'none',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: demoMode ? '#F59E0B' : 'var(--text-muted)' }}>{Icon.sliders}</span>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: demoMode ? '#92400E' : 'var(--text-primary)' }}>
                                Demo Controls
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {demoMode ? 'Override active — live sensors paused' : 'Override NPK & rainfall for demonstration'}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        padding: '4px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                        background: demoMode ? '#F59E0B' : '#F1F5F9',
                        color: demoMode ? '#fff' : 'var(--text-muted)',
                        transition: 'all 0.2s ease',
                    }}>
                        {demoMode ? 'ON' : 'OFF'}
                    </div>
                </div>

                {demoMode && demoNPK && (
                    <div style={{ padding: '16px 20px' }}>
                        {/* Rainfall */}
                        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: 'var(--info-wash)', border: '1px solid var(--info-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Simulated Rainfall</span>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: '700', color: 'var(--info)' }}>{demoRain}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>mm</span>
                                </div>
                            </div>
                            <DemoSlider label="" value={demoRain} min={0} max={120} step={2} color="#3B82F6" unit="mm" onChange={v => setDemoRain && setDemoRain(v)} />
                        </div>

                        {/* NPK Sliders */}
                        <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Base Soil NPK</div>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <DemoSlider label="Nitrogen" value={demoNPK.n} min={0} max={100} step={1} color="#3B82F6" unit="kg/ha" onChange={v => setDemoNPK && setDemoNPK(p => ({ ...p, n: v }))} />
                            <DemoSlider label="Phosphorus" value={demoNPK.p} min={0} max={100} step={1} color="#8B5CF6" unit="kg/ha" onChange={v => setDemoNPK && setDemoNPK(p => ({ ...p, p: v }))} />
                            <DemoSlider label="Potassium" value={demoNPK.k} min={0} max={100} step={1} color="#F59E0B" unit="kg/ha" onChange={v => setDemoNPK && setDemoNPK(p => ({ ...p, k: v }))} />
                        </div>

                        {/* Quick presets — no emojis */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-faint)', fontWeight: '600', alignSelf: 'center' }}>Presets:</span>
                            {[
                                { label: 'Ideal',      npk: { n: 72, p: 55, k: 68 }, rain: 0 },
                                { label: 'Light Rain', npk: { n: 65, p: 42, k: 58 }, rain: 30 },
                                { label: 'Heavy Rain', npk: { n: 60, p: 38, k: 55 }, rain: 80 },
                                { label: 'Flood',      npk: { n: 20, p: 30, k: 18 }, rain: 120 },
                                { label: 'Drought',    npk: { n: 18, p: 12, k: 22 }, rain: 0 },
                            ].map(({ label, npk, rain }) => (
                                <button key={label}
                                    onClick={() => { setDemoNPK && setDemoNPK(npk); setDemoRain && setDemoRain(rain); }}
                                    style={{
                                        padding: '5px 14px', fontSize: '11px', fontWeight: '500',
                                        borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                        border: '1px solid var(--surface-border)', background: 'var(--surface)',
                                        color: 'var(--text-secondary)', transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#065F46'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#065F46'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
                                >{label}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── ALERT BANNER ── */}
            {(isCritical || droughtMode) && (
                <div className="alert-banner">
                    <div className="alert-icon">{Icon.alert}</div>
                    <div className="alert-content">
                        <div className="alert-title">
                            {droughtMode ? 'Drought Mode Active' : 'Water Warning'}
                        </div>
                        <div className="alert-sub">
                            {droughtMode
                                ? 'Water reserves critically low. Emergency conservation protocols activated.'
                                : `Water reserve at ${waterDays} days — below safe threshold.`}
                        </div>
                    </div>
                    <div className="alert-badge">Live</div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════
               BENTO GRID — Row 1: Soil Health + NPK Bars
               ══════════════════════════════════════════════════════════ */}
            <div className="section-title">Resource Overview</div>
            <div className="animate-stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                {/* ── Soil Health Score ── */}
                {(() => {
                    const moisture = liveSensors?.soil_moisture ?? null;
                    const irrigNeed = moisture === null ? null : moisture < 30 ? 'Irrigate Now' : moisture < 50 ? 'Monitor' : 'Sufficient';
                    const irrigColor = moisture === null ? 'var(--text-muted)' : moisture < 30 ? '#EF4444' : moisture < 50 ? '#F59E0B' : '#10B981';

                    return (
                        <div className="glass-card" style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            padding: '28px 24px', borderTop: `3px solid ${scoreColor}`,
                        }}>
                            <div style={{
                                fontSize: '11px', fontWeight: '600', color: 'var(--text-faint)',
                                textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px',
                                display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start',
                            }}>
                                {Icon.target}
                                Soil Health
                            </div>

                            {/* Donut gauge for soil score */}
                            <DonutChart value={score ?? 0} max={100} size={160}
                                unit="/ 100"
                                strokeColor={scoreColor}
                                badgeLabel={scoreLabel}
                                badgeBg={score === null ? '#F1F5F9' : score >= 70 ? 'var(--emerald-wash)' : score >= 45 ? 'var(--warning-wash)' : 'var(--danger-wash)'}
                                badgeBorder={score === null ? '#E2E8F0' : score >= 70 ? 'var(--emerald-border)' : score >= 45 ? 'var(--warning-border)' : 'var(--danger-border)'}
                            />

                            {/* Recommended crop */}
                            {rotationAdvice?.recommended_crop && (
                                <div style={{
                                    marginTop: '12px', fontSize: '12px', fontWeight: '500',
                                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px',
                                }}>
                                    {Icon.wheat}
                                    <span><strong style={{ color: '#065F46' }}>{rotationAdvice.recommended_crop}</strong> recommended</span>
                                </div>
                            )}

                            {/* Irrigation status */}
                            {irrigNeed && (
                                <div style={{
                                    marginTop: '8px', padding: '4px 12px', borderRadius: '8px',
                                    background: '#F8FAFC', border: `1px solid ${irrigColor}25`,
                                    fontSize: '11px', fontWeight: '600', color: irrigColor,
                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                }}>
                                    {Icon.droplet} Irrigation: {irrigNeed} ({moisture?.toFixed(0)}%)
                                </div>
                            )}

                            {/* pH */}
                            {liveSensors?.ph && (
                                <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '8px', fontWeight: '500' }}>
                                    pH {liveSensors.ph.toFixed(1)} · {liveSensors.ph < 6 ? 'Acidic' : liveSensors.ph > 7.5 ? 'Alkaline' : 'Neutral'}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* ── Soil Nutrient Drift (Bar Chart) ── */}
                <div className="glass-card" style={{ padding: '28px 24px' }}>
                    <div style={{
                        fontSize: '11px', fontWeight: '600', color: 'var(--text-faint)',
                        textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {Icon.flask}
                            Soil Nutrient Drift
                        </div>
                        <span style={{
                            fontSize: '9px', fontWeight: '600', padding: '2px 8px',
                            borderRadius: '6px', color: 'var(--emerald)',
                            background: 'var(--emerald-wash)', border: '1px solid var(--emerald-border)',
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                        }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--emerald)', animation: 'livePulse 2s infinite', display: 'inline-block' }}></span>
                            Live
                        </span>
                    </div>
                    <NutrientBars n={soilNPK.n} p={soilNPK.p} k={soilNPK.k} />

                    {/* Status summary */}
                    <div style={{
                        marginTop: '12px', padding: '10px 14px', borderRadius: '10px',
                        background: '#F8FAFC', border: '1px solid #E2E8F0',
                        fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5',
                        fontWeight: '500',
                    }}>
                        {soilNPK.n < 40 ? 'Nitrogen deficit detected — apply urea before next cycle.' :
                         soilNPK.p < 30 ? 'Phosphorus low — consider DAP or bone meal application.' :
                         soilNPK.k < 40 ? 'Potassium deficient — apply MOP or wood ash.' :
                         'All macronutrients within optimal range.'}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
               BENTO GRID — Row 2: Market Predictor (full width)
               ══════════════════════════════════════════════════════════ */}
            <div className="section-title">Market Predictor</div>
            <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '16px',
                }}>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Tomato — Kochi Mandi
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            14-day rolling price · INR/kg
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)',
                        }}>₹{marketPrices[marketPrices.length - 1]}</div>
                        <div style={{
                            fontSize: '11px', fontWeight: '600', color: '#10B981',
                            display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end',
                        }}>
                            {Icon.arrowUp} +0.96/day
                        </div>
                    </div>
                </div>
                <AreaChart data={marketPrices} label="Tomato" unit="/kg" />
            </div>

            {/* ══════════════════════════════════════════════════════════
               AI ADVISORY
               ══════════════════════════════════════════════════════════ */}
            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span>AI Advisory</span>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: '500', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-faint)' }}>Climate:</span>
                    <select value={simCrop} onChange={e => setSimCrop(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: '11px' }}>
                        <option value="">AI Recommended</option>
                        {encyclopedia.map(crop => <option key={crop.id} value={crop.name}>{crop.name}</option>)}
                    </select>
                    <select value={simRegion} onChange={e => setSimRegion(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: '11px' }}>
                        <option value="Kochi">Kochi (Monsoons)</option>
                        <option value="Palakkad">Palakkad (Dry/Hot)</option>
                    </select>
                    <select value={simMonth} onChange={e => setSimMonth(parseInt(e.target.value, 10))}
                        style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: '11px' }}>
                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => (
                            <option key={i} value={i+1}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="glass-card" style={{ borderLeft: '3px solid var(--emerald)' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                        background: 'var(--emerald-wash)', border: '1px solid var(--emerald-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--emerald)',
                    }}>{Icon.sparkles}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                Crop Rotation Advisory
                            </span>
                            <span style={{
                                fontSize: '9px', fontWeight: '700', letterSpacing: '1px',
                                background: '#065F46', color: 'white',
                                padding: '3px 10px', borderRadius: '6px', textTransform: 'uppercase',
                            }}>
                                {rotationAdvice?.is_live_data ? 'Live' : 'AI'}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--emerald)', fontWeight: '600', marginLeft: 'auto' }}>
                                Score: {rotationAdvice?.soil_health_score ?? '--'}/100
                            </span>
                        </div>

                        {rotationAdvice ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: '500' }}>
                                        Recommended: <strong style={{ color: '#065F46' }}>{rotationAdvice.recommended_crop}</strong>
                                    </p>
                                    <span style={{ fontSize: '10px', color: 'var(--text-faint)', fontWeight: '500' }}>
                                        Confidence: {(rotationAdvice.confidence_score * 100).toFixed(1)}%
                                    </span>
                                </div>

                                {rotationAdvice.seasonal_warning && (
                                    <div style={{
                                        fontSize: '11px', color: '#EF4444', fontWeight: '600', marginBottom: '8px',
                                        padding: '6px 10px', background: 'var(--danger-wash)', border: '1px solid var(--danger-border)', borderRadius: '8px',
                                    }}>{rotationAdvice.seasonal_warning}</div>
                                )}

                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 8px 0' }}>
                                    {rotationAdvice.reason}
                                </p>

                                <div style={{
                                    padding: '8px 12px', borderRadius: '8px',
                                    background: droughtMode ? 'var(--danger-wash)' : 'var(--emerald-wash)',
                                    border: droughtMode ? '1px solid var(--danger-border)' : '1px solid var(--emerald-border)',
                                    fontSize: '11px', fontWeight: '500',
                                    color: droughtMode ? '#EF4444' : '#065F46',
                                }}>{rotationAdvice.next_action}</div>

                                {rotationAdvice.expected_yield_tons_ha !== undefined && (
                                    <div style={{
                                        marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px 16px', borderRadius: '10px',
                                        background: 'var(--emerald-wash)', border: '1px solid var(--emerald-border)',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '2px' }}>Projected Yield</div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                <span style={{ fontSize: '22px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace", color: '#10B981' }}>{rotationAdvice.expected_yield_tons_ha}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>T/ha</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '2px' }}>Potential</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                                <div style={{ width: '60px', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${rotationAdvice.yield_potential_pct}%`, height: '100%',
                                                        background: rotationAdvice.yield_potential_pct > 80 ? '#10B981' : rotationAdvice.yield_potential_pct > 50 ? '#F59E0B' : '#EF4444',
                                                        transition: 'width 1s ease, background 0.5s ease',
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '14px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                                                    {rotationAdvice.yield_potential_pct}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Loading advisory...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
               FIELD METRICS — Compact Grid
               ══════════════════════════════════════════════════════════ */}
            <div className="section-title">Field Metrics</div>
            <div className="animate-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                <MetricCard icon={Icon.flask} label="Soil pH" value={liveSensors?.ph?.toFixed(1) ?? '--'} unit="pH" color="var(--info)" />
                <MetricCard icon={Icon.thermometer} label="Temperature" value={liveSensors ? `${liveSensors.temperature.toFixed(1)}°` : '--'} unit="Celsius" color="#F59E0B" />
                <MetricCard icon={Icon.droplet} label="Moisture" value={liveSensors ? `${liveSensors.soil_moisture.toFixed(0)}%` : '--'} unit="Soil Vol" color="#10B981" />
                <MetricCard icon={Icon.cloud} label="Rain (7d)" value={liveSensors ? `${liveSensors.rain_mm.toFixed(0)}` : '--'} unit="mm" color="#8B5CF6" />
                <MetricCard icon={Icon.target} label="Soil Score" value={score ?? '--'} unit={scoreLabel} color={scoreColor} />
            </div>
        </div>
    );
};

export default Dashboard;