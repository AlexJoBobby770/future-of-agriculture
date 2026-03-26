import React, { useState } from 'react';

const CropSearch = () => {
    const [query, setQuery] = useState("");
    // Sample data from your JSON
    const crops = [
        { name: "Paddy", tip: "Switch to SRI during drought." },
        { name: "Black Pepper", tip: "Apply mulch once every 10 days." },
        { name: "Banana", tip: "Prop plants with bamboo before monsoon." }
    ];

    return (
        <div className="search-box">
            <input
                type="text"
                placeholder="Search Kochi crops..."
                onChange={(e) => setQuery(e.target.value)}
            />
            <div className="search-results">
                {crops.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map((c, i) => (
                    <div key={i} className="search-item">
                        <strong>{c.name}:</strong> {c.tip}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CropSearch;