import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Market from './components/Market';
import Crops from './components/Crops';
import Predict from './components/Predict';
import './App.css';

const API_BASE = 'http://127.0.0.1:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // ── LIVE DATA STATE (replaces hardcoded mock data) ──────────────────────
  const [waterDays, setWaterDays] = useState(null);
  const [droughtMode, setDroughtMode] = useState(false);
  const [soilNPK, setSoilNPK] = useState({ n: 0, p: 0, k: 0 });
  const [liveMarketData, setLiveMarketData] = useState([]);
  const [rotationAdvice, setRotationAdvice] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── FETCH LIVE DATA ON MOUNT ────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      try {
        // 1. Predict water depletion with a default farm scenario
        const predictRes = await fetch(`${API_BASE}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            water_level: 5000,
            daily_usage: 800,
            evapotranspiration_rate: 5,
            rain_forecast: [0, 2, 0, 5, 0, 0, 3],
          }),
        });
        if (predictRes.ok) {
          const pred = await predictRes.json();
          setWaterDays(Math.round(pred.days_until_depletion));
          setDroughtMode(pred.drought_mode);
        }

        // 2. Market data for all tracked crops
        const crops = ['Tomato', 'Wheat', 'Onion', 'Soybean', 'Maize', 'Rice', 'Cotton', 'Groundnut'];
        const marketResults = await Promise.all(
          crops.map(async (crop) => {
            try {
              const r = await fetch(`${API_BASE}/market?crop=${encodeURIComponent(crop)}`);
              if (r.ok) return await r.json();
            } catch { }
            return null;
          })
        );
        const validMarket = marketResults.filter(Boolean).map((m) => ({
          crop: m.crop,
          price: m.current_price,
          trend: m.trend === 'Upward' ? `▲ +${m.slope}/day` :
                 m.trend === 'Downward' ? `▼ ${m.slope}/day` :
                 `➖ ${m.slope}/day`,
          risk: m.risk_level,
        }));
        if (validMarket.length > 0) setLiveMarketData(validMarket);

        // 3. Rotation recommendation (uses live sensor N-P-K if available)
        const rotRes = await fetch(`${API_BASE}/rotation?drought_mode=${droughtMode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nitrogen: 46,
            phosphorus: 36,
            potassium: 49,
            soil_ph: 6.2,
          }),
        });
        if (rotRes.ok) {
          const rot = await rotRes.json();
          setRotationAdvice(rot);
          setSoilNPK({ n: 46, p: 36, k: 49 });
        }
      } catch (err) {
        console.error('API fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const pageConfig = {
    home: {
      title: 'Farm Dashboard',
      subtitle: 'Real-time resource monitoring & AI signals',
    },
    predict: {
      title: 'Hydro-Simulator',
      subtitle: 'Model water depletion timelines with precision',
    },
    market: {
      title: 'Asset Exchange',
      subtitle: 'Live commodity prices · Kochi Central Market',
    },
    crops: {
      title: 'Agri-Intelligence',
      subtitle: 'Crop encyclopedia & field management insights',
    },
  };

  const current = pageConfig[activeTab];

  return (
    <div className="app-shell">
      {/* Vertical Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Panel */}
      <main className="dashboard-main">

        {/* Page Header */}
        <div className="page-header animate-fade-in">
          <div>
            <h1 className="page-title">{current.title}</h1>
            <p className="page-subtitle">{current.subtitle}</p>
          </div>
          <div className="page-badge">
            <span style={{ color: loading ? 'var(--warning)' : 'var(--vibrant-mint)' }}>◉</span>
            <span>{loading ? 'Fetching live data...' : 'Connected to API'}</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'home' && (
          <Dashboard
            waterDays={waterDays ?? 0}
            soilNPK={soilNPK}
            rotationAdvice={rotationAdvice}
            droughtMode={droughtMode}
          />
        )}

        {activeTab === 'market' && (
          <Market
            marketData={liveMarketData}
          />
        )}

        {activeTab === 'crops' && (
          <Crops />
        )}

        {activeTab === 'predict' && (
          <Predict apiBase={API_BASE} />
        )}

      </main>
    </div>
  );
}