"""
services/rotation_service.py
Smart Crop Rotation — Rule-based recommendation engine.
Connects Member 2's data science models (price predictor, success matrix, leaching)
with Member 1's API layer.
"""

import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.models.schemas import RotationRequest, RotationResponse
from data_science.success_matrix import get_live_score, calculate_leaching_impact
from data_science.price_predictor import analyze_price_trend


# ── Crop rotation rules (Member 1 logic) ──────────────────────────────────────
ROTATION_RULES = [
    {"max_n": 30, "crop": "Cowpea (Legume)",    "reason": "Nitrogen is critically low. Legumes fix atmospheric N into the soil via root nodules."},
    {"max_p": 30, "crop": "Mustard",            "reason": "Phosphorus is low. Mustard's deep roots mobilise P from lower soil layers."},
    {"max_k": 30, "crop": "Banana / Plantain",  "reason": "Potassium is low. Follow with K-rich compost after harvest to rebuild reserves."},
    {"min_n": 60, "min_p": 40, "min_k": 40, "crop": "Rice / Wheat (Cash Crop)", "reason": "All nutrients healthy. Maximise profit with a high-demand staple."},
]

DEFAULT_CROP = "Green Manure (Sunnhemp)"
DEFAULT_REASON = "Soil is moderately depleted. A green-manure cover crop will restore organic matter and all macronutrients."


def _pick_crop(n: float, p: float, k: float) -> tuple[str, str]:
    """
    Rule engine: walks the rotation table and returns the first match.
    Returns (crop_name, reason).
    """
    for rule in ROTATION_RULES:
        if "max_n" in rule and n < rule["max_n"]:
            return rule["crop"], rule["reason"]
        if "max_p" in rule and p < rule["max_p"]:
            return rule["crop"], rule["reason"]
        if "max_k" in rule and k < rule["max_k"]:
            return rule["crop"], rule["reason"]
        if all(k2 in rule for k2 in ("min_n", "min_p", "min_k")):
            if n >= rule["min_n"] and p >= rule["min_p"] and k >= rule["min_k"]:
                return rule["crop"], rule["reason"]
    return DEFAULT_CROP, DEFAULT_REASON


def recommend_rotation(data: RotationRequest) -> RotationResponse:
    """
    Full rotation pipeline:
      1. Read live weather from Member 3
      2. Read market prices
      3. Run Member 2's data-science engines
      4. Pick best crop via rule engine
      5. Return actionable response
    """
    # ── 1. LOAD LIVE WEATHER (Member 3's Output) ────────────────────────
    weather_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "integration", "data", "live_weather.json"
    )
    live_rain = 0.0
    if os.path.exists(weather_path):
        with open(weather_path, "r") as f:
            w_data = json.load(f)
            live_rain = w_data.get("current", {}).get("rain", 0.0)

    # ── 2. LOAD MARKET PRICES ───────────────────────────────────────────
    market_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "integration", "data", "mock_market_data.json"
    )
    if os.path.exists(market_path):
        try:
            with open(market_path, "r") as f:
                m_data = json.load(f)
            # Pick first available crop's price history
            first_key = next(iter(m_data), None)
            price_history = m_data[first_key] if first_key else [200, 210, 220, 215, 225]
        except (json.JSONDecodeError, StopIteration):
            price_history = [200, 210, 220, 215, 225]
    else:
        price_history = [200, 210, 220, 215, 225]

    # ── 3. RUN MEMBER 2 DATA SCIENCE ENGINES ────────────────────────────
    # analyze_price_trend returns a DICT with keys: trend, slope, volatility, risk_score
    analysis = analyze_price_trend(price_history)
    price_slope = analysis["slope"]

    # Success Score factors in soil + market + water
    soil_health = get_live_score(price_slope=price_slope)

    # Leaching check using rain from Member 3's meteo data
    adjusted_n, leaching_msg = calculate_leaching_impact(data.nitrogen, live_rain)

    # ── 4. PICK CROP VIA RULE ENGINE ────────────────────────────────────
    # Use adjusted nitrogen (post-leaching) for the decision
    crop, reason = _pick_crop(adjusted_n, data.phosphorus, data.potassium)

    # Append leaching context if active
    if adjusted_n < data.nitrogen:
        reason += f" | {leaching_msg}"

    # ── 5. DETERMINE NEXT ACTION ────────────────────────────────────────
    if live_rain > 10.0:
        action = "URGENT: Heavy rain detected. Deploy field drainage. Nitrogen leaching risk is HIGH."
    elif soil_health < 30:
        action = "CRITICAL: Soil health is very poor. Apply vermicompost + reduce tilling immediately."
    elif soil_health < 50:
        action = "RECOVERY: Soil needs attention. Consider organic amendments before next planting cycle."
    else:
        action = "STABLE: Conditions are favourable. Proceed with recommended crop and monitor weekly."

    return RotationResponse(
        recommended_crop=crop,
        reason=reason,
        soil_health_score=round(soil_health, 1),
        next_action=action,
    )