import React, { useState, useEffect, useCallback, useRef } from 'react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Predict = ({ apiBase = 'http://127.0.0.1:8000' }) => {
    // ── LIVE WEATHER STATE ─────────────────────────────────────────────────
    const [liveWeather, setLiveWeather] = useState(null);
    const [liveSensors, setLiveSensors] = useState(null);
    const [weatherStatus, setWeatherStatus] = useState('connecting'); // connecting | live | offline

    // ── SIMULATION INPUT STATE ─────────────────────────────────────────────
    const [tankCapacity,  setTankCapacity]  = useState(5000);
    const [dailyUsage,    setDailyUsage]    = useState(800);
    const [evapRate,      setEvapRate]      = useState(5);
    const [rainForecast,  setRainForecast]  = useState([0, 2, 0, 5, 0, 0, 3]);

    // ── DEMO OVERRIDE MODE ─────────────────────────────────────────────────
    const [demoMode, setDemoMode] = useState(false);
    const [demoRain, setDemoRain] = useState([0, 2, 0, 5, 0, 0, 3]);
    const [demoEvap, setDemoEvap] = useState(5);

    // ── PREDICTION RESULT ──────────────────────────────────────────────────
    const [prediction,    setPrediction]    = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error,         setError]         = useState(null);
    const [autoRunning,   setAutoRunning]   = useState(true);
    const lastFetchRef = useRef(0);

    // The actual values used for simulation — demo overrides live
    const effectiveRain = demoMode ? demoRain : rainForecast;
    const effectiveEvap = demoMode ? demoEvap : evapRate;

    // ── FETCH LIVE WEATHER + SENSORS ───────────────────────────────────────
    const fetchLiveData = useCallback(async () => {
        try {
            const [weatherRes, sensorRes] = await Promise.all([
                fetch(`${apiBase}/weather`),
                fetch(`${apiBase}/sensors`),
            ]);

            if (weatherRes.ok) {
                const w = await weatherRes.json();
                setLiveWeather(w);

                // Apply live rain forecast (7-day array from Open-Meteo)
                if (w.rain_forecast && Array.isArray(w.rain_forecast)) {
                    const cleanForecast = w.rain_forecast.slice(0, 7).map(v => 
                        typeof v === 'number' ? Math.round(v * 10) / 10 : 0
                    );
                    // Pad to 7 days if shorter
                    while (cleanForecast.length < 7) cleanForecast.push(0);
                    setRainForecast(cleanForecast);
                }

                // Apply live ET rate
                if (w.current?.evap_rate_mm !== undefined) {
                    // Convert mm/hr to L/day estimate for a 1-hectare field
                    // For demo: multiply by a scaling factor to make it meaningful
                    const etDaily = Math.round(w.current.evap_rate_mm * 24 * 10) / 10;
                    setEvapRate(Math.max(1, Math.min(50, etDaily || 5)));
                }

                setWeatherStatus(w.status === 'LIVE' ? 'live' : 
                    w.status?.includes('OFFLINE') ? 'offline' : 'live');
            }

            if (sensorRes.ok) {
                const s = await sensorRes.json();
                setLiveSensors(s);
            }
        } catch {
            setWeatherStatus('offline');
        }
    }, [apiBase]);

    // ── AUTO-POLL WEATHER every 5s ─────────────────────────────────────────
    useEffect(() => {
        fetchLiveData();
        const interval = setInterval(fetchLiveData, 5000);
        return () => clearInterval(interval);
    }, [fetchLiveData]);

    // ── CALL /predict API ──────────────────────────────────────────────────
    const runPrediction = useCallback(async (silent = false) => {
        const now = Date.now();
        if (now - lastFetchRef.current < 1500) return; // debounce
        lastFetchRef.current = now;

        if (!silent) setIsCalculating(true);
        setError(null);
        try {
            const res = await fetch(`${apiBase}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    water_level: tankCapacity,
                    daily_usage: dailyUsage,
                    evapotranspiration_rate: effectiveEvap,
                    rain_forecast: effectiveRain,
                }),
            });
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            setPrediction({
                days: data.days_until_depletion,
                isCritical: data.drought_mode,
                status: data.status,
                action: data.action,
                avgLoss: data.avg_daily_net_loss,
                droughtMode: data.drought_mode,
                conservationMode: data.conservation_mode,
                totalWater: tankCapacity,
                mc_safe_deadline: data.monte_carlo?.p10_safe_deadline,
                mc_risk: data.monte_carlo?.risk_assessment,
                mc_optimistic: data.monte_carlo?.p90_optimistic,
            });
        } catch (err) {
            if (!silent) setError(err.message);
            // Fallback to client-side calc
            const avgRain = effectiveRain.reduce((a, b) => a + b, 0) / effectiveRain.length;
            const netLoss = dailyUsage + effectiveEvap - avgRain;
            const days = netLoss > 0 ? (tankCapacity * 0.9 / netLoss) : 999;
            setPrediction({
                days: parseFloat(days.toFixed(1)),
                isCritical: days < 3,
                status: days < 3 ? 'Critical – Drought Mode' : days < 7 ? 'Drought Warning' : days >= 999 ? 'Surplus' : 'Normal',
                action: 'API offline — showing client-side estimate.',
                avgLoss: Math.max(0, netLoss).toFixed(1),
                droughtMode: days < 3,
                totalWater: tankCapacity,
            });
        } finally {
            if (!silent) setIsCalculating(false);
        }
    }, [apiBase, tankCapacity, dailyUsage, effectiveEvap, effectiveRain]);

    // ── AUTO-RUN prediction when live data changes ─────────────────────────
    useEffect(() => {
        if (autoRunning && !demoMode) {
            runPrediction(true);
        }
    }, [rainForecast, evapRate, autoRunning, demoMode, runPrediction]);

    // ── INSTANT RE-RUN when demo sliders change ────────────────────────────
    useEffect(() => {
        if (demoMode) {
            const timer = setTimeout(() => runPrediction(true), 300);
            return () => clearTimeout(timer);
        }
    }, [demoMode, demoRain, demoEvap, tankCapacity, dailyUsage, runPrediction]);

    // Rain forecast editor
    const updateRainDay = (index, value) => {
        if (demoMode) {
            const updated = [...demoRain];
            updated[index] = Number(value);
            setDemoRain(updated);
        } else {
            const updated = [...rainForecast];
            updated[index] = Number(value);
            setRainForecast(updated);
        }
    };

    const totalRain = effectiveRain.reduce((a, b) => a + b, 0);
    const maxRainDay = Math.max(...effectiveRain, 1);

    /* Custom Slider Row */
    const SliderRow = ({ label, value, min, max, step, onChange, color, unit, icon, locked }) => {
        const pct = ((value - min) / (max - min)) * 100;
        return (
            <div style={{ marginBottom: '24px', opacity: locked ? 0.5 : 1, pointerEvents: locked ? 'none' : 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{
                        fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '1.2px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        <span>{icon}</span>{label}
                        {locked && <span style={{ fontSize: '9px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', padding: '2px 6px', borderRadius: '8px', fontWeight: '800' }}>LIVE</span>}
                    </label>
                    <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '16px', fontWeight: '700', color,
                    }}>
                        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
                        <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '4px' }}>{unit}</span>
                    </span>
                </div>
                {/* Track wrapper */}
                <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        position: 'absolute', left: 0, right: 0, height: '5px',
                        background: 'rgba(6,95,70,0.08)', borderRadius: '3px',
                    }} />
                    <div style={{
                        position: 'absolute', left: 0, width: `${pct}%`, height: '5px',
                        background: `linear-gradient(90deg, ${color}60, ${color})`,
                        borderRadius: '3px', pointerEvents: 'none',
                    }} />
                    <input
                        type="range" min={min} max={max} step={step} value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                        style={{
                            position: 'relative', zIndex: 2, width: '100%',
                            appearance: 'none', WebkitAppearance: 'none',
                            background: 'transparent', cursor: locked ? 'not-allowed' : 'pointer', height: '20px',
                            accentColor: color,
                        }}
                    />
                </div>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px',
                    fontFamily: "'JetBrains Mono', monospace",
                }}>
                    <span>{min.toLocaleString()}</span>
                    <span>{max.toLocaleString()}</span>
                </div>
            </div>
        );
    };

    const pctFill = prediction ? Math.min((prediction.days / 30) * 100, 100) : 0;
    const statusColor = prediction?.isCritical ? 'var(--danger)' : 
        prediction?.status?.includes('Warning') ? '#d97706' : 'var(--vibrant-mint)';

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* === LIVE WEATHER STATUS BAR === */}
                <div style={{
                    display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'stretch',
                }}>
                    {/* Current conditions mini-cards */}
                    {[
                        { label: 'Temperature', value: liveWeather?.current?.temp_c?.toFixed(1) ?? '--', unit: '°C', icon: '🌡️', color: '#d97706' },
                        { label: 'Soil Moisture', value: liveWeather?.current?.soil_moisture_pct?.toFixed(1) ?? '--', unit: '%', icon: '💧', color: '#2563eb' },
                        { label: 'ET Rate', value: liveWeather?.current?.evap_rate_mm?.toFixed(2) ?? '--', unit: 'mm/h', icon: '🌬️', color: '#dc2626' },
                        { label: 'Today\'s Rain', value: liveWeather?.current?.rain?.toFixed(1) ?? '--', unit: 'mm', icon: '🌧️', color: '#7c3aed' },
                        { label: 'Total 7d Rain', value: totalRain.toFixed(1), unit: 'mm', icon: '📊', color: '#059669' },
                    ].map(({ label, value, unit, icon, color }) => (
                        <div key={label} style={{
                            flex: '1 1 120px', padding: '14px 16px', borderRadius: '14px',
                            background: '#fff', border: '1px solid rgba(6,95,70,0.1)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                            transition: 'all 0.3s ease',
                        }}>
                            <span style={{ fontSize: '20px' }}>{icon}</span>
                            <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '18px', fontWeight: '800', color, lineHeight: 1,
                                transition: 'color 0.5s ease',
                            }}>
                                {value}<span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '2px' }}>{unit}</span>
                            </span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</span>
                        </div>
                    ))}

                    {/* Status badge */}
                    <div style={{
                        flex: '0 0 auto', padding: '14px 20px', borderRadius: '14px',
                        background: weatherStatus === 'live' ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : '#fffbeb',
                        border: weatherStatus === 'live' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(217,119,6,0.3)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                        <span style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: weatherStatus === 'live' ? '#10b981' : weatherStatus === 'offline' ? '#d97706' : '#94a3b8',
                            animation: weatherStatus === 'live' ? 'livePulse 2s ease-in-out infinite' : 'none',
                            display: 'block',
                        }} />
                        <span style={{
                            fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px',
                            color: weatherStatus === 'live' ? '#059669' : '#d97706',
                        }}>
                            {weatherStatus === 'live' ? 'Live Weather' : weatherStatus === 'offline' ? 'Fallback' : 'Connecting...'}
                        </span>
                    </div>
                </div>

                {/* === 7-DAY RAIN FORECAST VISUALIZATION === */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
                    }}>
                        <div style={{
                            fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '1.5px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                            <span style={{ color: '#2563eb' }}>◈</span>
                            7-Day Rainfall Forecast
                            {!demoMode && (
                                <span style={{
                                    fontSize: '9px', background: 'rgba(16,185,129,0.1)',
                                    border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px',
                                    padding: '2px 8px', color: 'var(--vibrant-mint)', fontWeight: '800',
                                    animation: 'livePulse 2s ease-in-out infinite',
                                }}>◉ LIVE</span>
                            )}
                        </div>

                        {/* Demo toggle */}
                        <div
                            onClick={() => {
                                if (!demoMode) {
                                    // Entering demo: copy current live values as starting point
                                    setDemoRain([...rainForecast]);
                                    setDemoEvap(evapRate);
                                }
                                setDemoMode(v => !v);
                            }}
                            style={{
                                padding: '5px 14px', borderRadius: '20px', fontSize: '10px', fontWeight: '800',
                                cursor: 'pointer', transition: 'all 0.2s',
                                background: demoMode ? '#b45309' : 'rgba(6,95,70,0.08)',
                                color: demoMode ? '#fff' : 'var(--text-muted)',
                                border: demoMode ? 'none' : '1px solid rgba(6,95,70,0.15)',
                            }}
                        >
                            {demoMode ? '🎮 DEMO ON' : '🎮 Demo Override'}
                        </div>
                    </div>

                    {/* Rain bars visualization */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '16px' }}>
                        {effectiveRain.map((val, i) => {
                            const barH = Math.max(4, (val / Math.max(maxRainDay, 10)) * 80);
                            const isToday = i === 0;
                            return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    {/* Value */}
                                    <span style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: '12px', fontWeight: '800',
                                        color: val > 10 ? '#2563eb' : val > 0 ? '#059669' : 'var(--text-muted)',
                                    }}>{val.toFixed(1)}</span>

                                    {/* Bar */}
                                    <div style={{
                                        width: '100%', height: '80px',
                                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                                    }}>
                                        <div style={{
                                            width: '70%', height: `${barH}px`,
                                            borderRadius: '4px 4px 0 0',
                                            background: val > 15 ? 'linear-gradient(180deg, #1d4ed8, #3b82f6)' :
                                                val > 5 ? 'linear-gradient(180deg, #2563eb, #60a5fa)' :
                                                val > 0 ? 'linear-gradient(180deg, #60a5fa, #93c5fd)' :
                                                'rgba(6,95,70,0.06)',
                                            transition: 'height 0.6s cubic-bezier(0.16,1,0.3,1), background 0.3s ease',
                                            boxShadow: val > 5 ? '0 0 10px rgba(37,99,235,0.3)' : 'none',
                                        }} />
                                    </div>

                                    {/* Day label */}
                                    <span style={{
                                        fontSize: '9px', fontWeight: isToday ? '900' : '700', letterSpacing: '0.5px',
                                        color: isToday ? '#2563eb' : 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                    }}>{DAY_LABELS[i]}</span>
                                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>mm</span>

                                    {/* Editable input in demo mode */}
                                    {demoMode && (
                                        <input
                                            type="number" min={0} max={120} step={0.5} value={val}
                                            onChange={(e) => updateRainDay(i, e.target.value)}
                                            style={{
                                                width: '100%', padding: '4px 2px', textAlign: 'center',
                                                border: '1px solid rgba(37,99,235,0.3)', borderRadius: '6px',
                                                fontSize: '11px', fontFamily: "'JetBrains Mono', monospace",
                                                fontWeight: '600', color: '#2563eb',
                                                background: 'rgba(37,99,235,0.04)', outline: 'none',
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Rain summary strip */}
                    <div style={{
                        display: 'flex', gap: '16px', padding: '10px 14px', borderRadius: '10px',
                        background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.12)',
                        flexWrap: 'wrap', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Cumulative:</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: '800', color: '#2563eb' }}>{totalRain.toFixed(1)}</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>mm</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Daily Avg:</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: '800', color: '#059669' }}>{(totalRain / 7).toFixed(1)}</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>mm/day</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Peak Day:</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: '800', color: maxRainDay > 15 ? '#dc2626' : '#7c3aed' }}>{maxRainDay.toFixed(1)}</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>mm</span>
                        </div>
                        {demoMode && (
                            <span style={{
                                fontSize: '9px', fontWeight: '800', padding: '3px 10px',
                                borderRadius: '20px', background: '#b45309', color: '#fff',
                                marginLeft: 'auto',
                            }}>🎮 DEMO VALUES</span>
                        )}
                    </div>
                </div>

                {/* === SIMULATION PARAMETERS === */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                    {/* Left: Adjustable parameters */}
                    <div className="glass-card">
                        <div style={{
                            fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '24px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                            <span style={{ color: 'var(--trust-green)' }}>◈</span>
                            Water Parameters
                        </div>

                        <SliderRow label="Tank Capacity"       value={tankCapacity} min={1000}  max={20000} step={500}  onChange={setTankCapacity} color="#2563eb"  unit="L"      icon="🛢️" />
                        <SliderRow label="Daily Usage"         value={dailyUsage}   min={100}   max={5000}  step={100}  onChange={setDailyUsage}   color="#dc2626"  unit="L/day"  icon="💧" />
                        <SliderRow 
                            label="Evapotranspiration"  
                            value={demoMode ? demoEvap : evapRate}     
                            min={0} max={50} step={1}    
                            onChange={v => demoMode ? setDemoEvap(v) : setEvapRate(v)}     
                            color="#d97706"  unit="L/day"  icon="🌡️"
                            locked={!demoMode}
                        />


                        {/* Manual run button */}
                        <button
                            id="run-simulation-btn"
                            onClick={() => runPrediction(false)}
                            disabled={isCalculating}
                            style={{
                                width: '100%', padding: '14px', marginTop: '16px',
                                background: isCalculating ? '#a7f3d0' : 'linear-gradient(135deg, #065f46, #059669)',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontWeight: '800', fontSize: '13px', letterSpacing: '0.8px',
                                cursor: isCalculating ? 'not-allowed' : 'pointer',
                                boxShadow: isCalculating ? 'none' : '0 4px 16px rgba(6,95,70,0.25)',
                                textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => { if (!isCalculating) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,95,70,0.35)'; } }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isCalculating ? 'none' : '0 4px 16px rgba(6,95,70,0.25)'; }}
                        >
                            {isCalculating ? '⟳  Computing...' : '▶  Run Depletion Analysis'}
                        </button>

                        {error && (
                            <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', background: '#fffbeb', border: '1px solid rgba(217,119,6,0.2)', fontSize: '11px', color: '#d97706' }}>
                                ⚠ API: {error} — showing fallback estimate
                            </div>
                        )}

                        {/* Demo quick presets */}
                        {demoMode && (
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Quick Scenarios</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {[
                                        { label: '🏜️ Drought', rain: [0,0,0,0,0,0,0], evap: 12, tank: 2000, usage: 800 },
                                        { label: '☀️ Dry Week', rain: [0,0,0.5,0,0,0,0], evap: 8, tank: 5000, usage: 600 },
                                        { label: '🌦 Normal', rain: [2,5,0,3,0,8,1], evap: 5, tank: 8000, usage: 500 },
                                        { label: '🌧 Monsoon', rain: [15,22,18,30,12,25,20], evap: 2, tank: 10000, usage: 400 },
                                        { label: '🌊 Flood', rain: [40,55,60,45,50,35,30], evap: 1, tank: 15000, usage: 300 },
                                    ].map(({ label, rain, evap, tank, usage }) => (
                                        <button key={label}
                                            onClick={() => { setDemoRain(rain); setDemoEvap(evap); setTankCapacity(tank); setDailyUsage(usage); }}
                                            style={{
                                                padding: '5px 12px', fontSize: '11px', fontWeight: '700',
                                                borderRadius: '20px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                                border: '1px solid rgba(6,95,70,0.2)', background: '#fff',
                                                color: 'var(--text-secondary)', transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#065f46'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        >{label}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Results */}
                    {prediction ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Main Result Card */}
                            <div className="glass-card animate-fade-in" style={{
                                textAlign: 'center',
                                borderTop: `3px solid ${statusColor}`,
                                animation: prediction.isCritical ? 'pulseDanger 2.5s ease-in-out infinite' : 'pulseGlow 3s ease-in-out infinite',
                            }}>
                                <div style={{
                                    fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px',
                                }}>Predicted Water Reserve</div>

                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '56px', fontWeight: '800', lineHeight: 1,
                                    color: statusColor,
                                    transition: 'color 0.5s ease',
                                }}>
                                    {typeof prediction.days === 'number'
                                        ? prediction.days >= 999 ? '∞' : prediction.days.toFixed(1)
                                        : prediction.days}
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>
                                    {prediction.days >= 999 ? 'surplus — rain exceeds usage' : 'days of water remaining'}
                                </div>

                                {/* Progress bar */}
                                <div style={{ background: 'var(--page-bg)', borderRadius: '4px', height: '6px', marginBottom: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: `${pctFill}%`,
                                        background: prediction.isCritical
                                            ? 'linear-gradient(90deg, #dc2626, #f87171)'
                                            : prediction.status?.includes('Warning') 
                                                ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                                                : 'linear-gradient(90deg, #065f46, #10b981)',
                                        borderRadius: '4px',
                                        transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                                    }} />
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                    {pctFill.toFixed(0)}% of 30-day safe threshold
                                </div>

                                {/* Status Badge */}
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                                    padding: '9px 20px', borderRadius: '24px',
                                    background: prediction.isCritical ? '#fef2f2' :
                                        prediction.status?.includes('Warning') ? '#fffbeb' : '#f0fdf4',
                                    border: `1px solid ${statusColor}40`,
                                    fontSize: '12px', fontWeight: '800',
                                    color: statusColor,
                                    letterSpacing: '0.5px', textTransform: 'uppercase',
                                }}>
                                    <span style={{
                                        width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block',
                                        background: statusColor,
                                        animation: 'livePulse 1.5s ease-in-out infinite',
                                    }} />
                                    {prediction.status}
                                </div>
                            </div>

                            {/* Breakdown Card */}
                            <div className="glass-card animate-fade-in">
                                <div style={{
                                    fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px',
                                }}>Analysis Breakdown</div>
                                {[
                                    { label: 'Tank Capacity',    value: `${tankCapacity.toLocaleString('en-IN')} L`, color: 'var(--info)' },
                                    { label: 'Daily Usage',      value: `${dailyUsage.toLocaleString('en-IN')} L/day`, color: 'var(--danger)' },
                                    { label: 'ET Rate',          value: `${effectiveEvap} L/day`, color: 'var(--warning)' },
                                    { label: 'Avg Rain',         value: `${(totalRain / 7).toFixed(1)} mm/day`, color: '#2563eb' },
                                    { label: 'Net Daily Loss',   value: `${prediction.avgLoss} L/day`, color: 'var(--text-primary)' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '8px 0', borderBottom: '1px solid rgba(6,95,70,0.07)',
                                    }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
                                        <span style={{
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontSize: '13px', fontWeight: '700', color,
                                        }}>{value}</span>
                                    </div>
                                ))}

                                {/* Action advice */}
                                <div style={{
                                    marginTop: '14px', padding: '10px 12px', borderRadius: '10px',
                                    background: prediction.isCritical ? '#fef2f2' : 
                                        prediction.status?.includes('Warning') ? '#fffbeb' : '#f0fdf4',
                                    border: `1px solid ${statusColor}20`,
                                    fontSize: '11px', lineHeight: '1.6',
                                    color: statusColor,
                                    fontWeight: '600',
                                }}>
                                    ▸ {prediction.action}
                                </div>

                                {/* Monte Carlo Risk */}
                                {prediction.mc_safe_deadline && (
                                    <div style={{
                                        marginTop: '12px', padding: '12px', borderRadius: '10px',
                                        background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.15)',
                                    }}>
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                            📉 Stochastic Risk Analysis
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Safe Harvest Deadline (P10)</span>
                                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb' }}>{prediction.mc_safe_deadline} days</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Optimistic window (P90)</span>
                                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--trust-green)' }}>{prediction.mc_optimistic} days</span>
                                        </div>
                                        <div style={{ fontSize: '9px', lineHeight: '1.4', color: 'var(--text-secondary)', padding: '6px', background: '#fff', borderRadius: '6px', border: '1px solid rgba(37,99,235,0.08)' }}>
                                            {prediction.mc_risk}
                                        </div>
                                    </div>
                                )}

                                {prediction.droughtMode && (
                                    <div style={{
                                        marginTop: '8px', padding: '8px 12px', borderRadius: '8px',
                                        background: '#fef2f2', border: '1px solid rgba(220,38,38,0.25)',
                                        fontSize: '10px', fontWeight: '800', color: 'var(--danger)',
                                        textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center',
                                    }}>
                                        🚨 Drought Mode Activated — High-Water Crops Blocked
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Placeholder */
                        <div style={{
                            padding: '40px 24px', borderRadius: '16px',
                            border: '2px dashed rgba(6,95,70,0.12)', background: '#ffffff',
                            textAlign: 'center', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>💧</div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                {autoRunning ? 'Fetching live data...' : 'Awaiting Analysis'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                {autoRunning
                                    ? 'The simulator will auto-run as soon as live weather data arrives.'
                                    : <>Configure parameters and click <strong style={{ color: 'var(--trust-green)' }}>Run Depletion Analysis</strong> to begin.</>
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Predict;