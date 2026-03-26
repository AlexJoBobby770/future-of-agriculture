import React, { useMemo } from 'react';

/* ----------------------------------------------------------
   Micro Sparkline SVG
   ---------------------------------------------------------- */
const Sparkline = ({ seed, isUp, color }) => {
    const points = useMemo(() => {
        let state = seed;
        const next = () => {
            state = (state * 1664525 + 1013904223) & 0xffffffff;
            return ((state >>> 0) / 0xffffffff);
        };
        const pts = [];
        let y = 50;
        for (let i = 0; i < 20; i++) {
            y += (next() - 0.48) * 14;
            y = Math.max(10, Math.min(90, y));
            pts.push([i * (100 / 19), y]);
        }
        if (isUp) pts[pts.length - 1][1] = Math.min(pts[pts.length - 1][1], 35);
        else       pts[pts.length - 1][1] = Math.max(pts[pts.length - 1][1], 65);
        return pts;
    }, [seed, isUp]);

    const pathD = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
    const fillD = `${pathD} L 100 100 L 0 100 Z`;

    return (
        <svg width="90" height="36" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
            <defs>
                <linearGradient id={`sg-${seed}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.20" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fillD} fill={`url(#sg-${seed})`} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={points[points.length-1][0]} cy={points[points.length-1][1]} r="4" fill={color} />
        </svg>
    );
};

/* ----------------------------------------------------------
   Volatility Badge
   ---------------------------------------------------------- */
const VolatilityBadge = ({ risk }) => {
    const cfg = {
        low:    { label: 'Low Vol.', bg: '#f0fdf4', border: 'rgba(5,150,105,0.3)',  color: '#059669' },
        medium: { label: 'Med. Vol.', bg: '#fffbeb', border: 'rgba(217,119,6,0.3)', color: '#d97706' },
        high:   { label: 'High Vol.', bg: '#fef2f2', border: 'rgba(220,38,38,0.3)', color: '#dc2626' },
    };
    const { label, bg, border, color } = cfg[risk.toLowerCase()] || cfg.medium;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '3px 9px', borderRadius: '20px',
            fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
            background: bg, border: `1px solid ${border}`, color,
        }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, display: 'inline-block' }} />
            {label}
        </span>
    );
};

/* ----------------------------------------------------------
   Market Component
   ---------------------------------------------------------- */
const Market = ({ marketData }) => {
    const getSeed = (crop) => crop.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 137;

    const getTrendColor = (trend) => {
        if (trend.includes('▲')) return 'var(--vibrant-mint)'; /* #10b981 */
        if (trend.includes('▼')) return 'var(--danger)';
        return 'var(--text-muted)';
    };
    const isUp = (trend) => trend.includes('▲');

    const gainers = marketData.filter(d => d.trend.includes('▲')).length;
    const losers  = marketData.filter(d => d.trend.includes('▼')).length;
    const neutral = marketData.length - gainers - losers;

    const riskAccent = (risk) => ({
        low:    '#059669',
        medium: '#d97706',
        high:   '#dc2626',
    }[risk.toLowerCase()] || '#6b7280');

    return (
        <div className="animate-fade-in">

            {/* Summary Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                    { label: 'Assets Tracked', value: marketData.length, color: 'var(--trust-green)', icon: '◎' },
                    { label: 'Gainers',         value: gainers,           color: 'var(--vibrant-mint)', icon: '▲' },
                    { label: 'Losers',          value: losers,            color: 'var(--danger)',       icon: '▼' },
                    { label: 'Neutral',         value: neutral,           color: 'var(--text-muted)',  icon: '➖' },
                ].map(({ label, value, color, icon }) => (
                    <div key={label} className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', color, marginBottom: '4px' }}>{icon}</div>
                        <div style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '28px', fontWeight: '700', color, lineHeight: 1,
                        }}>{value}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Column Headers */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 100px 100px 90px',
                gap: '12px',
                padding: '6px 20px',
                fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px',
            }}>
                <span>Asset / Volatility</span>
                <span style={{ textAlign: 'center' }}>30D Trend</span>
                <span style={{ textAlign: 'right' }}>Price ₹/kg</span>
                <span style={{ textAlign: 'right' }}>Change</span>
            </div>

            {/* Asset Rows */}
            <div className="animate-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {marketData.map((item) => {
                    const seed = getSeed(item.crop);
                    const trendColor = getTrendColor(item.trend);
                    const up = isUp(item.trend);
                    const accent = riskAccent(item.risk);

                    return (
                        <div key={item.crop} className="glass-card" style={{
                            padding: '14px 20px', margin: 0,
                            display: 'grid',
                            gridTemplateColumns: '2fr 100px 100px 90px',
                            gap: '12px', alignItems: 'center',
                            borderLeft: `3px solid ${accent}`,
                        }}>
                            {/* Name + badge */}
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                        {item.crop}
                                    </span>
                                    <VolatilityBadge risk={item.risk} />
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                    Kochi Central Market
                                </div>
                            </div>

                            {/* Sparkline */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <Sparkline seed={seed} isUp={up} color={trendColor} />
                                <div style={{ fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>30D CHART</div>
                            </div>

                            {/* Price */}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1,
                                }}>₹{item.price.toLocaleString('en-IN')}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>per kg</div>
                            </div>

                            {/* Trend */}
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '12px', fontWeight: '700', color: trendColor,
                                    padding: '5px 8px', borderRadius: '8px',
                                    background: up ? '#f0fdf4' : item.trend.includes('▼') ? '#fef2f2' : '#f8fafc',
                                    border: `1px solid ${trendColor}30`,
                                    display: 'inline-block', whiteSpace: 'nowrap',
                                }}>
                                    {item.trend}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '16px', padding: '12px 18px', borderRadius: '10px',
                background: '#ffffff', border: 'var(--card-border)',
                fontSize: '11px', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: '8px',
            }}>
                <span style={{ color: 'var(--vibrant-mint)' }}>ℹ</span>
                Prices indicative only. Sourced from Kochi Central Market feed.
                Volatility badges reflect 30-day price standard deviation bands.
            </div>
        </div>
    );
};

export default Market;