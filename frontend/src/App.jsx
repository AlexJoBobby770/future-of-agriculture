import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ResilienceCard from './components/ResilienceCard';
import PriceRadar from './components/PriceRadar';
import CropSearch from './components/CropSearch';
import './App.css';

function App() {
  // Mocking the integration with Member 1's API (schemas.py)
  const [prediction, setPrediction] = useState({
    days_until_depletion: 4.2,
    status: "Drought Warning",
    drought_mode: false
  });

  const [marketData, setMarketData] = useState([
    { crop: "Rubber", current_price: 182, trend: "Upward", risk_level: "Low" },
    { crop: "Coconut", current_price: 42, trend: "Stable", risk_level: "Medium" }
  ]);

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>AGRI-RESILIENT AI</h1>
        <div className="location-badge">📍 KOCHI DISTRICT</div>
      </header>

      <main className="dashboard">
        {/* SECTION 1: RESILIENCE DASHBOARD */}
        <section className="section">
          <h2 className="section-title">Resource Timers</h2>
          <div className="grid-2">
            <ResilienceCard
              label="Water"
              days={prediction.days_until_depletion}
              status={prediction.status}
              type="water"
            />
            <ResilienceCard
              label="Soil NPK"
              days={12}
              status="Optimal"
              type="soil"
            />
          </div>
        </section>

        {/* SECTION 2: PRICE RADAR */}
        <section className="section">
          <h2 className="section-title">Market Radar</h2>
          <div className="price-container">
            {marketData.map((data, index) => (
              <PriceRadar key={index} {...data} />
            ))}
          </div>
        </section>

        {/* SECTION 3: CROP DISCOVERY */}
        <section className="section">
          <h2 className="section-title">Agri-Encyclopedia</h2>
          <CropSearch />
        </section>
      </main>

      <Navbar />
    </div>
  );
}

export default App;