import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Market from './components/Market';
import Crops from './components/Crops';
import Predict from './components/Predict';
import { CROP_DATABASE } from './data/cropData';
import './App.css';

const API_BASE = 'http://127.0.0.1:8000';

// Rain leaches N most, K moderately, P barely (phosphate binds to soil)
const computeEffectiveNPK = (npk, rainMm) => ({
  n: Math.max(0, Math.round(npk.n * (1 - rainMm * 0.0030))),
  p: Math.max(0, Math.round(npk.p * (1 - rainMm * 0.0008))),
  k: Math.max(0, Math.round(npk.k * (1 - rainMm * 0.0020))),
});

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // ── LIVE DATA STATE ────────────────────────────────────────────────────────
  const [waterDays, setWaterDays] = useState(null);
  const [droughtMode, setDroughtMode] = useState(false);
  const [soilNPK, setSoilNPK] = useState({ n: 0, p: 0, k: 0 });
  const [liveSensors, setLiveSensors] = useState(null);
  const [liveMarketData, setLiveMarketData] = useState([]);
  const [rotationAdvice, setRotationAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [encyclopedia, setEncyclopedia] = useState(CROP_DATABASE);

  // ── CLIMATE SIMULATION CONTROLS ───────────────────────────────────────────
  const [simMonth, setSimMonth] = useState(new Date().getMonth() + 1);
  const [simRegion, setSimRegion] = useState('Kochi');
  const [simCrop, setSimCrop] = useState('');

  // ── DEMO MODE ─────────────────────────────────────────────────────────────
  const [demoMode, setDemoMode] = useState(false);
  const [demoNPK, setDemoNPK] = useState({ n: 65, p: 42, k: 58 }); // base soil values
  const [demoRain, setDemoRain] = useState(0);  // mm of rain (0-120)

  // Effective NPK seen by the UI when demo mode is on (rain leaches nutrients)
  const demoEffectiveNPK = computeEffectiveNPK(demoNPK, demoRain);

  // The actual soilNPK the rest of the dashboard reads:
  const displayedNPK = demoMode ? demoEffectiveNPK : soilNPK;
  // Simulate rain effect on soil moisture for demo
  const demoLiveSensors = demoMode ? {
    ...(liveSensors ?? { temperature: 28.5, rain_mm: 0, ph: 6.5 }),
    soil_moisture: Math.min(100, 30 + demoRain * 0.55),
    rain_mm: demoRain,
    n: demoEffectiveNPK.n,
    p: demoEffectiveNPK.p,
    k: demoEffectiveNPK.k,
  } : liveSensors;

  // ── CALL ROTATION API (shared between poll and demo instant-update) ────────
  const fetchRotation = useCallback(async ({ n, p, k, ph = 6.5, dMode = false }) => {
    try {
      const res = await fetch(`${API_BASE}/rotation?drought_mode=${dMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nitrogen: n, phosphorus: p, potassium: k,
          soil_ph: ph, month: simMonth, region: simRegion,
          target_crop: simCrop || undefined,
        }),
      });
      if (res.ok) setRotationAdvice(await res.json());
    } catch { /* silent */ }
  }, [simMonth, simRegion, simCrop]);

  // ── INSTANT RE-FETCH when demo sliders change ─────────────────────────────
  useEffect(() => {
    if (!demoMode) return;
    const eff = computeEffectiveNPK(demoNPK, demoRain);
    const ph = liveSensors?.ph ?? 6.5;
    fetchRotation({ n: eff.n, p: eff.p, k: eff.k, ph, dMode: false });
    // Also update displayed NPK instantly
    // (displayedNPK is derived, so this is automatic)
  }, [demoMode, demoNPK, demoRain, fetchRotation]);

  // ── BACKGROUND POLL (every 5 s) ───────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function fetchAll() {
      try {
        // 1. Fetch live sensors
        let liveN = 46, liveP = 36, liveK = 49, livePh = 6.2;
        const jitter = (base, jitterPct = 10) =>
          Math.round(base * (1 + (Math.random() * 2 - 1) * (jitterPct / 100)));

        try {
          const sensorRes = await fetch(`${API_BASE}/sensors`);
          if (sensorRes.ok) {
            const s = await sensorRes.json();
            liveN = jitter(s.n, 6); liveP = jitter(s.p, 6);
            liveK = jitter(s.k, 6); livePh = s.ph;
            if (isMounted) {
              setSoilNPK({ n: liveN, p: liveP, k: liveK });
              setLiveSensors({ ...s, n: liveN, p: liveP, k: liveK });
            }
          } else {
            liveN = jitter(46, 10); liveP = jitter(36, 10); liveK = jitter(49, 10);
            if (isMounted) setSoilNPK({ n: liveN, p: liveP, k: liveK });
          }
        } catch {
          liveN = jitter(46, 10); liveP = jitter(36, 10); liveK = jitter(49, 10);
          if (isMounted) setSoilNPK({ n: liveN, p: liveP, k: liveK });
        }

        // 2. Predict water depletion
        try {
          const predictRes = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              water_level: 5000, daily_usage: 800,
              evapotranspiration_rate: 5,
              rain_forecast: [0, 2, 0, 5, 0, 0, 3],
            }),
          });
          let dMode = false;
          if (predictRes.ok) {
            const pred = await predictRes.json();
            dMode = pred.drought_mode;
            if (isMounted) {
              setWaterDays(Math.round(pred.days_until_depletion));
              setDroughtMode(dMode);
            }
          }

          // 3. Rotation — skip if demo mode (handled by instant-update effect)
          if (!demoMode) {
            await fetchRotation({ n: liveN, p: liveP, k: liveK, ph: livePh, dMode });
          }
        } catch { /* ignore predict/rotation errors */ }

        // 4. Market data
        try {
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
            crop: m.crop, price: m.current_price,
            trend: m.trend === 'Upward' ? `▲ +${m.slope}/day` :
                   m.trend === 'Downward' ? `▼ ${m.slope}/day` :
                   `➖ ${m.slope}/day`,
            risk: m.risk_level,
          }));
          if (validMarket.length > 0 && isMounted) setLiveMarketData(validMarket);
        } catch { /* ignore */ }

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
        if (data.crops && data.crops.length > 0 && isMounted) {
          setEncyclopedia(data.crops);
        }
      } catch (_) { /* fall back to local CROP_DATABASE */ }
    };

    fetchAll();
    fetchEncyclopedia();
    const interval = setInterval(fetchAll, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [simMonth, simRegion, simCrop, demoMode, fetchRotation]);

  const pageConfig = {
    home:    { title: 'Farm Dashboard',    subtitle: 'Real-time resource monitoring & AI signals' },
    predict: { title: 'Hydro-Simulator',   subtitle: 'Model water depletion timelines with precision' },
    market:  { title: 'Asset Exchange',    subtitle: 'Live commodity prices · Kochi Central Market' },
    crops:   { title: 'Agri-Intelligence', subtitle: 'Crop encyclopedia & field management insights' },
  };

  const current = pageConfig[activeTab];

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
            soilNPK={displayedNPK}
            rotationAdvice={rotationAdvice}
            droughtMode={droughtMode}
            liveSensors={demoLiveSensors}
            simMonth={simMonth}    setSimMonth={setSimMonth}
            simRegion={simRegion}  setSimRegion={setSimRegion}
            simCrop={simCrop}      setSimCrop={setSimCrop}
            encyclopedia={encyclopedia}
            /* demo props */
            demoMode={demoMode}       setDemoMode={setDemoMode}
            demoNPK={demoNPK}         setDemoNPK={setDemoNPK}
            demoRain={demoRain}        setDemoRain={setDemoRain}
            demoEffectiveNPK={demoEffectiveNPK}
          />
        )}

        {activeTab === 'market' && <Market marketData={liveMarketData} />}
        {activeTab === 'crops'  && <Crops />}
        {activeTab === 'predict' && <Predict apiBase={API_BASE} />}
      </main>
    </div>
  );
}