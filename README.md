# Agri-Resilient AI: Predictive Farm OS

> A next-generation, data-driven "Digital Twin" operating system for agriculture. Shifting farm management from reactive monitoring to proactive, predictive resource optimization.

## 🚀 Overview

The **Agri-Resilient AI System** integrates live weather forecasting, real-time local market commodity pricing, and simulated IoT soil data into a unified, predictive pipeline. By combining these data streams, our Data Science engine provides farmers with advanced warnings for water depletion, dynamic crop rotation strategies, and market-timed profit optimization.

## ✨ Core Capabilities

* 💧 **Predictive Depletion Engine:** Physics-based water balance modeling that predicts exact days until water exhaustion, triggering early drought alerts.
* 🌱 **Smart Crop Rotation:** An expert-system logic matrix that analyzes current soil N-P-K levels, pH drift, and previous crop history to suggest optimal planting sequences.
* 📊 **Market Intelligence Engine:** Real-time fetching of Agmarknet (Mandi) prices to generate Buy/Hold/Sell signals and calculate dynamic Profit Matrices.
* 📡 **Virtual IoT "Digital Twin":** A continuous simulation engine generating live Nitrogen, Phosphorus, Potassium, and pH data that actively reacts to real-world weather inputs (leaching, consumption).

## 🏗️ System Architecture

Our ecosystem is divided into four synchronized layers:

1.  **Frontend (The Face):** React + Vite dashboard featuring sleek, data-dense, real-time charts and insights.
2.  **Backend (The Heart):** FastAPI server routing complex logic and serving predictions.
3.  **Data Science (The Brain):** Algorithmic engines processing thresholds, leaching penalties, and success probabilities.
4.  **Integration (The Senses):** Live API wrappers for Open-Meteo, Data.gov.in, and our custom IoT physical simulator.

## 📂 Project Structure

```text
future-of-agriculture/
├── backend/                # FastAPI application and routing
│   ├── routers/            # /predict, /market, /rotation, /encyclopedia
│   └── data/               # agri_encyclopedia.json (Crop Knowledge Base)
├── frontend/               # React 19 + Vite UI Dashboard
├── data_science/           # Predictive AI, Leaching, and Profit models
├── integration/            # API Clients (Weather, Market) & IoT Simulator
│   └── data/               # Live synced JSON states (Sensors, Weather, Prices)
└── Scripts/
    └── data_runner.py      # The "Heartbeat" syncing all data every 5 seconds
