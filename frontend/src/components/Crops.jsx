import React, { useState } from 'react';

const Crops = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');

    const cropDatabase = [
        { name: "Paddy (Rice)", type: "Cereal", icon: "🌾", tip: "Switch to SRI (System of Rice Intensification) during drought.", risk: "Medium", season: "Jun–Sep" },
        { name: "Rubber",       type: "Cash Crop", icon: "🌳", tip: "Ensure proper drainage trenches before monsoon season.",        risk: "Low",    season: "Year-round" },
        { name: "Black Pepper", type: "Spice",    icon: "🌿", tip: "Apply organic mulch once every 10 days to retain soil moisture.", risk: "Low",    season: "Jul–Feb" },
        { name: "Banana",       type: "Fruit",    icon: "🍌", tip: "Prop mature plants with bamboo poles before high monsoon winds.", risk: "Medium", season: "Year-round" },
        { name: "Cowpea",       type: "Legume",   icon: "🫘", tip: "Excellent for crop rotation to restore Nitrogen (N) to the soil.", risk: "Low",   season: "Nov–Feb" },
        { name: "Coconut",      type: "Tree Crop",icon: "🥥", tip: "Intercropping with banana can increase farm income by 30%.",    risk: "Low",    season: "Year-round" },
        { name: "Cardamom",     type: "Spice",    icon: "🌱", tip: "Requires shade — plant under taller trees. High-value export crop.", risk: "High", season: "Aug–Nov" },
    ];

    const types = ['All', ...new Set(cropDatabase.map(c => c.type))];

    const filteredCrops = cropDatabase.filter(crop => {
        const matchSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            crop.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType   = selectedType === 'All' || crop.type === selectedType;
        return matchSearch && matchType;
    });

    const getRiskCfg = (risk) => ({
        low:    { color: '#059669', bg: '#f0fdf4', border: 'rgba(5,150,105,0.2)' },
        medium: { color: '#d97706', bg: '#fffbeb', border: 'rgba(217,119,6,0.2)' },
        high:   { color: '#dc2626', bg: '#fef2f2', border: 'rgba(220,38,38,0.2)' },
    }[risk.toLowerCase()]);

    return (
        <div className="animate-fade-in">

            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <span style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '14px', color: 'var(--text-muted)', pointerEvents: 'none',
                    }}>🔍</span>
                    <input
                        id="crop-search"
                        type="text"
                        placeholder="Search crops, types..."
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
                Showing <span style={{ color: 'var(--trust-green)', fontWeight: '700' }}>{filteredCrops.length}</span> of {cropDatabase.length} assets
            </div>

            {/* Cards Grid */}
            <div className="animate-stagger" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px',
            }}>
                {filteredCrops.length > 0 ? (
                    filteredCrops.map((crop) => {
                        const rc = getRiskCfg(crop.risk);
                        return (
                            <div key={crop.name} className="glass-card" style={{
                                padding: '18px', margin: 0, borderLeft: `3px solid ${rc.color}`,
                            }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
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

                                {/* Tip */}
                                <div style={{
                                    padding: '10px 12px', borderRadius: '9px', marginBottom: '10px',
                                    background: '#f0fdf4', border: '1px solid rgba(16,185,129,0.15)',
                                }}>
                                    <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--trust-green)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>
                                        💡 Field Intelligence
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        {crop.tip}
                                    </p>
                                </div>

                                {/* Season */}
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>🗓 {crop.season}</div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>No assets found</div>
                        <div style={{ fontSize: '12px' }}>No crops match "{searchTerm}"</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Crops;