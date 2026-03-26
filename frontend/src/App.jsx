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
  const [liveSensors, setLiveSensors] = useState(null);
  const [liveMarketData, setLiveMarketData] = useState([]);
  const [rotationAdvice, setRotationAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [encyclopedia, setEncyclopedia] = useState([]);

  // ── CLIMATE SIMULATION CONTROLS ───────────────────────────────────────────
  const [simMonth, setSimMonth] = useState(new Date().getMonth() + 1);
  const [simRegion, setSimRegion] = useState('Kochi');
  const [simCrop, setSimCrop] = useState(''); // empty = AI Recommended

  // ── FETCH LIVE DATA ───────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    
    async function fetchAll() {
      try {
        // 1. Fetch live sensors
        let liveN = 46, liveP = 36, liveK = 49, livePh = 6.2;
        const sensorRes = await fetch(`${API_BASE}/sensors`);
        if (sensorRes.ok) {
          const s = await sensorRes.json();
          liveN = s.n; liveP = s.p; liveK = s.k; livePh = s.ph;
          if (isMounted) {
            setSoilNPK({ n: liveN, p: liveP, k: liveK });
            setLiveSensors(s);
          }
        }

        // 2. Predict water depletion
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
        
        let dMode = droughtMode;
        if (predictRes.ok) {
          const pred = await predictRes.json();
          dMode = pred.drought_mode;
          if (isMounted) {
            setWaterDays(Math.round(pred.days_until_depletion));
            setDroughtMode(dMode);
          }
        }

        // 3. Rotation recommendation (uses REAL live sensors)
        const rotRes = await fetch(`${API_BASE}/rotation?drought_mode=${dMode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nitrogen: liveN,
            phosphorus: liveP,
            potassium: liveK,
            soil_ph: livePh,
            month: simMonth,
            region: simRegion,
            target_crop: simCrop || undefined
          }),
        });
        
        if (rotRes.ok) {
          const rot = await rotRes.json();
          if (isMounted) setRotationAdvice(rot);
        }

        // 4. Market data (only fetch once or occasionally, but here it's fast enough)
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
        if (validMarket.length > 0 && isMounted) setLiveMarketData(validMarket);

      } catch (err) {
        console.error('API fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const fetchEncyclopedia = async () => {
      try {
        const res = await fetch(`${API_BASE}/encyclopedia`);
        const data = await res.json();
        if (data.crops && isMounted) {
          setEncyclopedia(data.crops);
        }
      } catch (err) {
        console.error('Encyclopedia fetch error:', err);
      }
    };

    // Initial fetch
    fetchAll();
    fetchEncyclopedia();
    
    // Poll every 5s for the "Hackathon Wow Factor"
    const interval = setInterval(fetchAll, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [simMonth, simRegion, simCrop]); // Refetch if user changes sim controls

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
          <div className="page-badge" style={{ border: loading ? '1px solid var(--warning-dim)' : '1px solid var(--mint-glow)' }}>
            <span style={{ 
                color: loading ? 'var(--warning)' : 'var(--vibrant-mint)',
                animation: loading ? 'none' : 'livePulse 2s infinite',
                display: 'inline-block',
                textShadow: loading ? 'none' : '0 0 8px var(--vibrant-mint)'
            }}>◉</span>
            <span style={{ fontWeight: '600' }}>{loading ? 'Fetching sensors...' : 'Live Stream Active'}</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'home' && (
          <Dashboard
            waterDays={waterDays ?? 0}
            soilNPK={soilNPK}
            rotationAdvice={rotationAdvice}
            droughtMode={droughtMode}
            liveSensors={liveSensors}
            simMonth={simMonth}
            setSimMonth={setSimMonth}
            simRegion={simRegion}
            setSimRegion={setSimRegion}
            simCrop={simCrop}
            setSimCrop={setSimCrop}
            encyclopedia={encyclopedia}
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