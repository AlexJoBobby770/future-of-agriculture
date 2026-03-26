"""
backend/main.py
Agri-Resilient AI — FastAPI Entry Point
Run with: uvicorn backend.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import json

from backend.routers import predict, rotation, market, encyclopedia  # ← ADD: encyclopedia

# ── App initialisation ─────────────────────────────────────────────────────────
app = FastAPI(
    title="🌾 Agri-Resilient AI",
    description=(
        "A predictive Farm Operating System. "
        "Shifts agriculture from passive monitoring to proactive resource guarding.\n\n"
        "**Engines:**\n"
        "- `/predict` — Depletion forecasting with Drought Mode alerts\n"
        "- `/rotation` — Rule-based SmartSeed crop rotation matrix\n"
        "- `/market`  — Price trend + Buy/Sell/Hold signals\n"
        "- `/encyclopedia` — Full Agri crop knowledge base\n"  # ← ADD: description entry
    ),
    version="1.0.0",
    contact={"name": "Team Agri-Resilient", "url": "https://github.com/your-repo"},
)

# ── CORS (allow frontend on any port during hackathon) ─────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Lock this down for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(predict.router)
app.include_router(rotation.router)
app.include_router(market.router)
app.include_router(encyclopedia.router)  # ← ADD: this line


# ── Root endpoint ──────────────────────────────────────────────────────────────
@app.get("/", tags=["System"])
def root():
    return {
        "project": "Agri-Resilient AI",
        "tagline": "Proactive resource guarding for every farmer.",
        "theme": "PS2 – Future of Smart Agriculture & Climate Adaptation",
        "version": "1.0.0",
        "endpoints": {
            "POST /predict":           "Predict water/resource depletion days",
            "POST /rotation":          "Get optimal crop rotation recommendation",
            "GET  /market":            "Fetch crop price trend and trading signal",
            "GET  /market/all":        "List all crops in market dataset",
            "GET  /encyclopedia":      "List all crops in the Agri Encyclopedia",      # ← ADD
            "GET  /encyclopedia/{id}": "Get full details for a specific crop by ID",   # ← ADD
        },
        "docs": "/docs",
        "status": "✅ All systems operational",
    }


@app.get("/sensors", tags=["System"])
def get_sensors():
    """Returns the live hardware simulation state."""
    sensor_path = os.path.join(
        os.path.dirname(__file__), "..", "integration", "data", "live_sensors.json"
    )
    if os.path.exists(sensor_path):
        try:
            with open(sensor_path, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "timestamp": "OFFLINE", "n": 46, "p": 36, "k": 49,
        "ph": 6.2, "temperature": 30.0, "soil_moisture": 35.0, "rain_mm": 0.0
    }

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy"}