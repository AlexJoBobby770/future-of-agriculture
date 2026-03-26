import React, { useState } from 'react';
import { CROP_DATABASE } from '../data/cropData';

const Crops = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [expandedId, setExpandedId] = useState(null);

    const cropDatabase = CROP_DATABASE;

    const types = ['All', ...new Set(cropDatabase.map(c => c.type))];

    const filteredCrops = cropDatabase.filter(crop => {
        const matchSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            crop.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (crop.tip || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchType   = selectedType === 'All' || crop.type === selectedType;
        return matchSearch && matchType;
    });

    const getRiskCfg = (risk) => ({
        low:    { color: '#059669', bg: '#f0fdf4', border: 'rgba(5,150,105,0.2)' },
        medium: { color: '#d97706', bg: '#fffbeb', border: 'rgba(217,119,6,0.2)' },
        high:   { color: '#dc2626', bg: '#fef2f2', border: 'rgba(220,38,38,0.2)' },
    }[risk.toLowerCase()]);

    const getWaterColor = (water) => ({
        low:    '#059669',
        medium: '#d97706',
        high:   '#2563eb',
    }[(water || 'medium').toLowerCase()] || '#d97706');

    const waterDots = (level) => {
        const n = { low: 1, medium: 2, high: 3 }[(level || 'medium').toLowerCase()] || 2;
        return Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{
                width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block',
                marginRight: '2px',
                background: i < n ? getWaterColor(level) : 'rgba(6,95,70,0.1)',
            }} />
        ));
    };

    return (
        <div className="animate-fade-in">

            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <span style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '14px', color: 'var(--text-muted)', pointerEvents: 'none',
                    }}>🔍</span>
                    <input
                        id="crop-search"
                        type="text"
                        placeholder="Search crops, types, tips..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '11px 14px 11px 40px',
                            background: '#ffffff', border: '1px solid rgba(6,95,70,0.15)',
                            borderRadius: '10px', fontSize: '13px', color: 'var(--text-primary)',
                            outline: 'none', boxSizing: 'border-box',
                            boxShadow: 'var(--card-shadow)', fontFamily: 'Inter, sans-serif',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(6,95,70,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,95,70,0.08)'; }}
                        onBlur={e  => { e.target.style.borderColor = 'rgba(6,95,70,0.15)'; e.target.style.boxShadow = 'var(--card-shadow)'; }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {types.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            style={{
                                padding: '7px 13px', borderRadius: '20px', cursor: 'pointer',
                                border: selectedType === type ? '1px solid rgba(6,95,70,0.4)' : '1px solid rgba(6,95,70,0.12)',
                                background: selectedType === type ? '#065f46' : '#ffffff',
                                color: selectedType === type ? '#ffffff' : 'var(--text-muted)',
                                fontSize: '11px', fontWeight: '700', fontFamily: 'Inter, sans-serif',
                                transition: 'all 0.2s ease',
                                boxShadow: selectedType === type ? '0 2px 8px rgba(6,95,70,0.25)' : 'var(--card-shadow)',
                            }}
                        >{type}</button>
                    ))}
                </div>
            </div>

            {/* Count */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Showing <span style={{ color: 'var(--trust-green)', fontWeight: '700' }}>{filteredCrops.length}</span> of {cropDatabase.length} crops
            </div>

            {/* Cards Grid */}
            <div className="animate-stagger" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px',
            }}>
                {filteredCrops.length > 0 ? (
                    filteredCrops.map((crop) => {
                        const rc = getRiskCfg(crop.risk);
                        const isExpanded = expandedId === crop.id;
                        return (
                            <div
                                key={crop.id}
                                className="glass-card"
                                onClick={() => setExpandedId(isExpanded ? null : crop.id)}
                                style={{
                                    padding: '18px', margin: 0,
                                    borderLeft: `3px solid ${rc.color}`,
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s, transform 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,95,70,0.12)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '22px' }}>{crop.icon}</span>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1px' }}>
                                                {crop.name}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' }}>
                                                {crop.type}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: '700',
                                        textTransform: 'uppercase', letterSpacing: '0.5px',
                                        background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color, flexShrink: 0,
                                    }}>{crop.risk} Risk</span>
                                </div>

                                {/* Quick Stats Row */}
                                <div style={{ display: 'flex', gap: '14px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                        🗓 <strong style={{ color: 'var(--text-secondary)' }}>{crop.season}</strong>
                                    </div>
                                    {crop.duration && (
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                            ⏱ <strong style={{ color: 'var(--text-secondary)' }}>
                                                {crop.duration >= 365 ? `${(crop.duration/365).toFixed(0)}+ yr` : `${crop.duration}d`}
                                            </strong>
                                        </div>
                                    )}
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        💧 {waterDots(crop.water)}
                                    </div>
                                </div>

                                {/* Tip */}
                                <div style={{
                                    padding: '10px 12px', borderRadius: '9px', marginBottom: '8px',
                                    background: '#f0fdf4', border: '1px solid rgba(16,185,129,0.15)',
                                }}>
                                    <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--trust-green)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>
                                        💡 Field Intelligence
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        {crop.tip}
                                    </p>
                                </div>

                                {/* Expanded: NPK hint */}
                                {isExpanded && crop.npk && (
                                    <div style={{
                                        padding: '8px 12px', borderRadius: '8px', marginTop: '4px',
                                        background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)',
                                        fontSize: '11px', color: '#2563eb', fontWeight: '600',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                    }}>
                                        🧪 Fertiliser Ratio (N-P-K): <strong>{crop.npk}</strong>
                                    </div>
                                )}

                                {/* Expand cue */}
                                <div style={{ textAlign: 'right', fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px', opacity: 0.6, letterSpacing: '0.5px' }}>
                                    {isExpanded ? '▲ less' : '▼ more'}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>No crops found</div>
                        <div style={{ fontSize: '12px' }}>No crops match "{searchTerm}"</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Crops;