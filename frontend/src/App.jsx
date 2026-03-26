import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Market from './components/Market';
import Navbar from './components/Navbar';
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

  return (
    <div className="app-container">

      {/* 1. The Top Branding Bar */}
      <Header />

      {/* 2. The Main Scrollable Content Area */}
      <main className="main-content">

        {/* If the user is on 'home', show the gauges */}
        {activeTab === 'home' && (
          <Dashboard
            waterDays={currentWaterDays}
            soilNPK={currentSoilNPK}
          />
        )}

        {/* If the user is on 'market', show the prices */}
        {activeTab === 'market' && (
          <Market
            marketData={liveMarketData}
          />
        )}

        {/* If the user is on 'crops', show the encyclopedia */}
        {activeTab === 'crops' && (
          <Crops />
        )}

        {activeTab === 'predict' && (
          <Predict />
        )}



      </main>

      {/* 3. The Bottom Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

    </div>
  );
}