import React, { useState } from 'react';

const Crops = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data based on your agri_encyclopedia.json
    const cropDatabase = [
        { name: "Paddy (Rice)", type: "Cereal", tip: "Switch to SRI (System of Rice Intensification) during drought." },
        { name: "Rubber", type: "Cash Crop", tip: "Ensure proper drainage trenches before monsoon season." },
        { name: "Black Pepper", type: "Spice", tip: "Apply organic mulch once every 10 days to retain soil moisture." },
        { name: "Banana", type: "Fruit", tip: "Prop mature plants with bamboo poles before high monsoon winds." },
        { name: "Cowpea", type: "Legume", tip: "Excellent for crop rotation to restore Nitrogen (N) to the soil." }
    ];

    // Filter crops based on what the user types in the search bar
    const filteredCrops = cropDatabase.filter(crop =>
        crop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <h2 className="section-title">Agri-Encyclopedia</h2>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search for a crop in Kochi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    marginBottom: '20px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}
            />

            {/* Results List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredCrops.length > 0 ? (
                    filteredCrops.map((crop) => (
                        <div key={crop.name} className="glass-card" style={{ margin: 0, padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>{crop.name}</h3>
                                <span style={{
                                    fontSize: '10px',
                                    backgroundColor: 'var(--bg-color)',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    color: 'var(--agri-dark)',
                                    fontWeight: '700'
                                }}>
                                    {crop.type}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                💡 {crop.tip}
                            </p>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '14px' }}>
                        No crops found for "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default Crops;