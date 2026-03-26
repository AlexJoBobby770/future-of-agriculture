import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Market from './components/Market';
import Crops from './components/Crops';
import Predict from './components/Predict';
import './App.css';

export default function App() {
  // This state tells the app which screen to show
  const [activeTab, setActiveTab] = useState('home');

  // --- THE DATA ---
  // Right now this is mock data. Later, you will replace these
  // variables with a 'fetch' command to Member 1's backend API.

  const currentWaterDays = 4;
  const currentSoilNPK = { n: 46, p: 36, k: 49 };

  const liveMarketData = [
    { crop: "Rubber", price: 182, trend: "▲ +2.4%", risk: "Low" },
    { crop: "Coconut", price: 42, trend: "▼ -1.1%", risk: "Medium" },
    { crop: "Cardamom", price: 2150, trend: "▲ +5.2%", risk: "High" },
    { crop: "Black Pepper", price: 540, trend: "➖ 0.0%", risk: "Low" }
  ];

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
            <span style={{ color: 'var(--vibrant-mint)' }}>◉</span>
            <span>Data refreshed just now</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'home' && (
          <Dashboard
            waterDays={currentWaterDays}
            soilNPK={currentSoilNPK}
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
          <Predict />
        )}

      </main>
    </div>
  );
}