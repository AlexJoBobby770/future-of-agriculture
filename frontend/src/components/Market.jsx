import React, { useState, useEffect, useMemo, useCallback } from 'react';

/* ══════════════════════════════════════════════════════════════════════════════
   ASSET EXCHANGE — Live Commodity Trading Dashboard
   Fetches full market data from /market/detail (14-day price history per crop)
   and renders an interactive trading-terminal-style interface.
   ══════════════════════════════════════════════════════════════════════════════ */

const API_BASE = 'http://127.0.0.1:8000';

/* ── Sparkline SVG (mini chart for table rows) ─────────────────────────────── */
const Sparkline = ({ data, color, width = 100, height = 36 }) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => [
        (i / (data.length - 1)) * width,
        height - ((v - min) / range) * (height * 0.8) - height * 0.1,
    ]);

    const pathD = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
            <defs>
                <linearGradient id={`sp-${data.length}-${data[0]}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fillD} fill={`url(#sp-${data.length}-${data[0]})`} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color} />
        </svg>
    );
};

/* ── Expanded Price Chart (larger, interactive) ────────────────────────────── */
const PriceChart = ({ data, color, crop }) => {
    const [hoverIdx, setHoverIdx] = useState(null);
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const W = 500, H = 180, PAD = 30;
    const plotW = W - PAD * 2, plotH = H - PAD * 2;

    const pts = data.map((v, i) => ({
        x: PAD + (i / (data.length - 1)) * plotW,
        y: PAD + plotH - ((v - min) / range) * plotH,
        val: v,
    }));

    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const fillD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${H - PAD} L ${PAD} ${H - PAD} Z`;

    // Y-axis grid lines
    const gridLines = 4;
    const gridVals = Array.from({ length: gridLines + 1 }, (_, i) => min + (range * i) / gridLines);

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: `${W}px` }}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
                onMouseLeave={() => setHoverIdx(null)}
            >
                <defs>
                    <linearGradient id={`chart-${crop}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {gridVals.map((v, i) => {
                    const y = PAD + plotH - ((v - min) / range) * plotH;
                    return (
                        <g key={i}>
                            <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(6,95,70,0.08)" strokeWidth="1" />
                            <text x={PAD - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="'JetBrains Mono', monospace">
                                ₹{v.toFixed(0)}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis labels */}
                {pts.filter((_, i) => i % 2 === 0 || i === pts.length - 1).map((p, i) => (
                    <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="'JetBrains Mono', monospace">
                        D{data.indexOf(p.val) + 1}
                    </text>
                ))}

                {/* Fill + Line */}
                <path d={fillD} fill={`url(#chart-${crop})`} />
                <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points */}
                {pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={hoverIdx === i ? 5 : 3}
                        fill={hoverIdx === i ? '#fff' : color}
                        stroke={color} strokeWidth="2"
                        style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                        onMouseEnter={() => setHoverIdx(i)}
                    />
                ))}

                {/* Hover tooltip */}
                {hoverIdx !== null && pts[hoverIdx] && (
                    <g>
                        <line x1={pts[hoverIdx].x} y1={PAD} x2={pts[hoverIdx].x} y2={H - PAD}
                            stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                        <rect x={pts[hoverIdx].x - 28} y={pts[hoverIdx].y - 22} width="56" height="18" rx="4"
                            fill="#1e293b" />
                        <text x={pts[hoverIdx].x} y={pts[hoverIdx].y - 10} textAnchor="middle"
                            fontSize="10" fill="#fff" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
                            ₹{pts[hoverIdx].val}
                        </text>
                    </g>
                )}
            </svg>
        </div>
    );
};

/* ── Signal Badge ──────────────────────────────────────────────────────────── */
const SignalBadge = ({ recommendation }) => {
    const isBuy = recommendation?.includes('BUY');
    const isSell = recommendation?.includes('SELL');
    const bg = isSell ? (recommendation.includes('QUICKLY') ? '#fef2f2' : '#f0fdf4')
        : isBuy ? '#eff6ff' : '#fffbeb';
    const color = isSell ? (recommendation.includes('QUICKLY') ? '#dc2626' : '#059669')
        : isBuy ? '#2563eb' : '#d97706';
    const label = isSell ? (recommendation.includes('QUICKLY') ? 'SELL NOW' : 'SELL')
        : isBuy ? 'BUY' : 'HOLD';
    const icon = isSell ? (recommendation.includes('QUICKLY') ? '🔴' : '🟢') : isBuy ? '🔵' : '🟡';

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 14px', borderRadius: '20px',
            background: bg, border: `1px solid ${color}30`,
            fontSize: '11px', fontWeight: '800', color,
            textTransform: 'uppercase', letterSpacing: '1px',
        }}>
            {icon} {label}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════════
   MARKET COMPONENT
   ══════════════════════════════════════════════════════════════════════════════ */
const Market = ({ marketData: legacyData }) => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [sortBy, setSortBy] = useState('crop'); // crop | price | trend | risk
    const [sortDir, setSortDir] = useState(1);
    const [filterRisk, setFilterRisk] = useState('all');

    // ── Fetch full market data ─────────────────────────────────────────────
    const fetchMarketDetail = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/market/detail`);
            if (res.ok) {
                const data = await res.json();
                if (data.assets) {
                    setAssets(data.assets);
                    if (!selectedCrop && data.assets.length > 0) {
                        setSelectedCrop(data.assets[0].crop);
                    }
                }
            }
        } catch { /* silent */ }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchMarketDetail();
        const interval = setInterval(fetchMarketDetail, 10000);
        return () => clearInterval(interval);
    }, [fetchMarketDetail]);

    // ── Derived data ───────────────────────────────────────────────────────
    const selectedAsset = useMemo(() => assets.find(a => a.crop === selectedCrop), [assets, selectedCrop]);

    const marketStats = useMemo(() => {
        const gainers = assets.filter(a => a.trend === 'Upward').length;
        const losers = assets.filter(a => a.trend === 'Downward').length;
        const totalMarketCap = assets.reduce((sum, a) => sum + a.current_price, 0);
        const avgSlope = assets.length > 0 ? assets.reduce((s, a) => s + (a.slope || 0), 0) / assets.length : 0;
        return { gainers, losers, neutral: assets.length - gainers - losers, totalMarketCap, avgSlope };
    }, [assets]);

    const filteredAssets = useMemo(() => {
        let filtered = [...assets];
        if (filterRisk !== 'all') {
            filtered = filtered.filter(a => a.risk_level.toLowerCase() === filterRisk);
        }
        filtered.sort((a, b) => {
            let diff = 0;
            if (sortBy === 'crop') diff = a.crop.localeCompare(b.crop);
            else if (sortBy === 'price') diff = a.current_price - b.current_price;
            else if (sortBy === 'trend') diff = (a.slope || 0) - (b.slope || 0);
            else if (sortBy === 'risk') diff = a.risk_level.localeCompare(b.risk_level);
            return diff * sortDir;
        });
        return filtered;
    }, [assets, sortBy, sortDir, filterRisk]);

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(d => d * -1);
        else { setSortBy(col); setSortDir(1); }
    };

    const trendColor = (trend) => trend === 'Upward' ? '#059669' : trend === 'Downward' ? '#dc2626' : '#6b7280';
    const riskColor = (risk) => ({ Low: '#059669', Medium: '#d97706', High: '#dc2626' }[risk] || '#6b7280');
    const trendIcon = (trend) => trend === 'Upward' ? '▲' : trend === 'Downward' ? '▼' : '➖';

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'livePulse 1.5s ease-in-out infinite' }}>📈</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Loading market data...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">

            {/* === MARKET OVERVIEW STRIP === */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px',
                marginBottom: '20px',
            }}>
                {[
                    { label: 'Assets Tracked', value: assets.length, icon: '◎', color: 'var(--trust-green)' },
                    { label: 'Gainers', value: marketStats.gainers, icon: '▲', color: '#059669' },
                    { label: 'Losers', value: marketStats.losers, icon: '▼', color: '#dc2626' },
                    { label: 'Neutral', value: marketStats.neutral, icon: '➖', color: '#6b7280' },
                    { label: 'Avg Momentum', value: `${marketStats.avgSlope >= 0 ? '+' : ''}${marketStats.avgSlope.toFixed(2)}`, icon: '⚡', color: marketStats.avgSlope >= 0 ? '#059669' : '#dc2626' },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', color, marginBottom: '4px' }}>{icon}</div>
                        <div style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '24px', fontWeight: '700', color, lineHeight: 1,
                        }}>{value}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '5px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* === MAIN SPLIT: TABLE + DETAIL === */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* ── LEFT: Asset Table ── */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    {/* Table toolbar */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 20px', borderBottom: '1px solid rgba(6,95,70,0.08)',
                    }}>
                        <div style={{
                            fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '1.5px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                            <span style={{ color: 'var(--trust-green)' }}>◈</span>
                            Commodity Index
                            <span style={{
                                fontSize: '9px', background: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px',
                                padding: '2px 8px', color: 'var(--vibrant-mint)', fontWeight: '800',
                                animation: 'livePulse 2s ease-in-out infinite',
                            }}>◉ LIVE</span>
                        </div>

                        {/* Risk filter */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {['all', 'low', 'medium', 'high'].map(r => (
                                <button key={r} onClick={() => setFilterRisk(r)}
                                    style={{
                                        padding: '3px 10px', borderRadius: '12px', fontSize: '9px', fontWeight: '800',
                                        textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer',
                                        border: filterRisk === r ? 'none' : '1px solid rgba(6,95,70,0.15)',
                                        background: filterRisk === r ? '#065f46' : 'transparent',
                                        color: filterRisk === r ? '#fff' : 'var(--text-muted)',
                                        transition: 'all 0.15s',
                                    }}
                                >{r === 'all' ? 'All' : r}</button>
                            ))}
                        </div>
                    </div>

                    {/* Column headers */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1.5fr 80px 80px 70px',
                        gap: '8px', padding: '8px 20px', background: 'rgba(6,95,70,0.02)',
                        borderBottom: '1px solid rgba(6,95,70,0.06)',
                    }}>
                        {[
                            { key: 'crop', label: 'Asset' },
                            { key: 'price', label: 'Price' },
                            { key: 'trend', label: 'Trend' },
                            { key: 'risk', label: 'Risk' },
                        ].map(({ key, label }) => (
                            <div key={key}
                                onClick={() => handleSort(key)}
                                style={{
                                    fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '3px',
                                    textAlign: key === 'crop' ? 'left' : 'center',
                                    justifyContent: key === 'crop' ? 'flex-start' : 'center',
                                }}
                            >
                                {label}
                                {sortBy === key && <span style={{ fontSize: '8px' }}>{sortDir === 1 ? '▲' : '▼'}</span>}
                            </div>
                        ))}
                    </div>

                    {/* Asset rows */}
                    <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                        {filteredAssets.map((asset) => {
                            const isSelected = asset.crop === selectedCrop;
                            const tc = trendColor(asset.trend);
                            return (
                                <div key={asset.crop}
                                    onClick={() => setSelectedCrop(asset.crop)}
                                    style={{
                                        display: 'grid', gridTemplateColumns: '1.5fr 80px 80px 70px',
                                        gap: '8px', padding: '12px 20px', alignItems: 'center',
                                        cursor: 'pointer', transition: 'all 0.15s',
                                        background: isSelected ? 'rgba(6,95,70,0.06)' : 'transparent',
                                        borderLeft: isSelected ? '3px solid var(--trust-green)' : '3px solid transparent',
                                        borderBottom: '1px solid rgba(6,95,70,0.04)',
                                    }}
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(6,95,70,0.03)'; }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {/* Name + mini sparkline */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                        <Sparkline data={asset.price_history} color={tc} width={40} height={20} />
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                                {asset.crop}
                                            </div>
                                            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Kochi Mkt</div>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)',
                                        }}>₹{asset.current_price}</span>
                                    </div>

                                    {/* Trend */}
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontSize: '11px', fontWeight: '800', color: tc,
                                            padding: '3px 8px', borderRadius: '6px',
                                            background: asset.trend === 'Upward' ? '#f0fdf4' : asset.trend === 'Downward' ? '#fef2f2' : '#f8fafc',
                                            border: `1px solid ${tc}25`,
                                        }}>
                                            {trendIcon(asset.trend)} {asset.slope > 0 ? '+' : ''}{asset.slope}/d
                                        </span>
                                    </div>

                                    {/* Risk */}
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{
                                            fontSize: '9px', fontWeight: '800', textTransform: 'uppercase',
                                            padding: '3px 8px', borderRadius: '10px',
                                            color: riskColor(asset.risk_level),
                                            background: asset.risk_level === 'Low' ? '#f0fdf4' : asset.risk_level === 'High' ? '#fef2f2' : '#fffbeb',
                                            border: `1px solid ${riskColor(asset.risk_level)}30`,
                                        }}>
                                            {asset.risk_level}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── RIGHT: Asset Detail Panel ── */}
                {selectedAsset ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Header card */}
                        <div className="glass-card" style={{
                            borderTop: `3px solid ${trendColor(selectedAsset.trend)}`,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                        {selectedAsset.crop}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                        Kochi Central Market · {selectedAsset.unit}
                                    </div>
                                </div>
                                <SignalBadge recommendation={selectedAsset.recommendation} />
                            </div>

                            {/* Price + change */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
                                <span style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)',
                                }}>₹{selectedAsset.current_price}</span>
                                <span style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '14px', fontWeight: '700',
                                    color: trendColor(selectedAsset.trend),
                                }}>
                                    {trendIcon(selectedAsset.trend)} {selectedAsset.slope > 0 ? '+' : ''}{selectedAsset.slope} ₹/day
                                </span>
                            </div>

                            {/* 14-day chart */}
                            <div style={{
                                padding: '16px', borderRadius: '12px',
                                background: 'rgba(6,95,70,0.02)', border: '1px solid rgba(6,95,70,0.06)',
                            }}>
                                <div style={{
                                    fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px',
                                }}>14-Day Price Chart · Hover for values</div>
                                <PriceChart
                                    data={selectedAsset.price_history}
                                    color={trendColor(selectedAsset.trend)}
                                    crop={selectedAsset.crop}
                                />
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {(() => {
                                const h = selectedAsset.price_history || [];
                                const hi = Math.max(...h);
                                const lo = Math.min(...h);
                                const avg = h.length > 0 ? (h.reduce((a, b) => a + b, 0) / h.length) : 0;
                                const range = hi - lo;
                                const changePct = h.length >= 2 ? (((h[h.length - 1] - h[0]) / h[0]) * 100) : 0;

                                return [
                                    { label: '14D High', value: `₹${hi}`, color: '#059669', icon: '📈' },
                                    { label: '14D Low', value: `₹${lo}`, color: '#dc2626', icon: '📉' },
                                    { label: 'Average', value: `₹${avg.toFixed(1)}`, color: '#2563eb', icon: '📊' },
                                    { label: 'Range', value: `₹${range}`, color: '#7c3aed', icon: '↔️' },
                                    { label: 'Period Change', value: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%`, color: changePct >= 0 ? '#059669' : '#dc2626', icon: '📐' },
                                    { label: 'Volatility', value: selectedAsset.risk_level, color: riskColor(selectedAsset.risk_level), icon: '⚡' },
                                ].map(({ label, value, color, icon }) => (
                                    <div key={label} style={{
                                        padding: '12px', borderRadius: '10px',
                                        background: '#fff', border: '1px solid rgba(6,95,70,0.08)',
                                        textAlign: 'center',
                                    }}>
                                        <div style={{ fontSize: '14px', marginBottom: '4px' }}>{icon}</div>
                                        <div style={{
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontSize: '16px', fontWeight: '700', color, lineHeight: 1,
                                        }}>{value}</div>
                                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>{label}</div>
                                    </div>
                                ));
                            })()}
                        </div>

                        {/* AI Recommendation */}
                        <div className="glass-card" style={{ borderLeft: `3px solid ${trendColor(selectedAsset.trend)}` }}>
                            <div style={{
                                fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}>
                                <span>🤖</span> AI Trading Signal
                            </div>
                            <div style={{
                                fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7',
                                fontWeight: '500',
                            }}>
                                {selectedAsset.recommendation}
                            </div>
                            <div style={{
                                marginTop: '12px', padding: '8px 12px', borderRadius: '8px',
                                background: 'rgba(6,95,70,0.04)', border: '1px solid rgba(6,95,70,0.1)',
                                fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.5',
                            }}>
                                Based on 14-day OLS regression analysis · Slope: {selectedAsset.slope} ₹/day · Risk: {selectedAsset.risk_level}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
                        <div>
                            <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>📊</div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Select an asset to view details</div>
                        </div>
                    </div>
                )}
            </div>

            {/* === FOOTER === */}
            <div style={{
                marginTop: '16px', padding: '12px 18px', borderRadius: '10px',
                background: '#ffffff', border: 'var(--card-border)',
                fontSize: '11px', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: '8px',
            }}>
                <span style={{ color: 'var(--vibrant-mint)' }}>ℹ</span>
                Prices from Kochi Central Market feed · 14-day rolling window · AI signals powered by OLS regression + volatility analysis ·
                <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>Not financial advice</span>
            </div>
        </div>
    );
};

export default Market;