import React from 'react';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      {/* Content goes here */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Agri-Resilient Dashboard</h2>
        <p>Kochi District Data Active</p>
      </div>

      {/* The Navbar stays at the bottom */}
      <Navbar />
    </div>
  );
}

export default App;