"""
data_science/profit_matrix.py
Member 2 — Profit Matrix Algorithm

Combines:
  1. Soil/climate success probability  (from soil health + weather)
  2. Market price momentum             (from price_predictor slope)
  3. Water availability factor         (from depletion engine)

→ A single 0–100 "Crop Success Score" per crop recommendation.

Architecture is ML-ready:
    Current  → weighted formula
    Future   → replace _score_components() with a trained model
"""

import numpy as np
import json
import os
from typing import Optional


# ── Weight constants (tunable — based on ICAR field study proxies) ───────────
W_SOIL    = 0.40   # Soil nutrient health matters most
W_MARKET  = 0.35   # Price momentum is a strong profit signal
W_WATER   = 0.25   # Water availability gates feasibility


def _soil_success_probability(n: float, p: float, k: float) -> float:
    """
    Maps N-P-K percentages to a 0-1 probability that the soil will support
    a generic high-yield crop this season.

    Ideal targets (ICAR): N ≈ 50, P ≈ 50, K ≈ 50
    Penalty is quadratic near extremes to model diminishing returns.
    """
    def _component(val: float, ideal: float = 50.0) -> float:
        # Gaussian-style decay: 1.0 at ideal, approaches 0 at 0 or 100
        return float(np.exp(-0.5 * ((val - ideal) / 25.0) ** 2))

    prob = (_component(n) + _component(p) + _component(k)) / 3.0
    return round(min(max(prob, 0.0), 1.0), 4)


def _market_factor(slope: float, max_slope: float = 5.0) -> float:
    """
    Converts price trend slope (₹/day) to a 0-1 score.
    Positive slope → good time to grow and sell.
    Negative slope → market headwind (penalty).
    Clipped at ±max_slope.
    """
    clipped = max(-max_slope, min(max_slope, slope))
    # Shift to 0-1 range: 0 = max downward slope, 1 = max upward slope
    factor = (clipped + max_slope) / (2 * max_slope)
    return round(factor, 4)


def _water_factor(days_until_depletion: float) -> float:
    """
    Converts depletion countdown to a 0-1 viability score.
    > 30 days → full score (1.0)
    7–30 days → linear degradation
    < 7 days  → near zero (critical)
    """
    if days_until_depletion >= 999:   # Surplus signal from engine
        return 1.0
    if days_until_depletion >= 30:
        return 1.0
    if days_until_depletion <= 0:
        return 0.0
    if days_until_depletion < 7:
        return round(days_until_depletion / 7.0 * 0.2, 4)   # Heavily penalised
    # Linear 0.2 → 1.0 in the 7–30 day window
    return round(0.2 + (days_until_depletion - 7) / 23.0 * 0.8, 4)


def calculate_profit_score(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    price_slope: float,
    days_until_water_depletion: float,
    leaching_active: bool = False,
) -> dict:
    """
    Master Profit Matrix function.

    Args:
        nitrogen   (0–100): Current soil N %
        phosphorus (0–100): Current soil P %
        potassium  (0–100): Current soil K %
        price_slope       : Output of analyze_price_trend()["slope"]
        days_until_water_depletion: Output of DepletionEngine.get_days_to_depletion()
        leaching_active   : True if Member 3's leaching detector fires (rain > 10 mm)

    Returns:
        {
            "success_score": float (0–100),
            "soil_prob":     float (0–1),
            "market_factor": float (0–1),
            "water_factor":  float (0–1),
            "leaching_penalty": float,
            "recommendation": str
        }
    """
    soil_p   = _soil_success_probability(nitrogen, phosphorus, potassium)
    market_f = _market_factor(price_slope)
    water_f  = _water_factor(days_until_water_depletion)

    # Leaching applies a 15% N-loss penalty to the soil score
    leaching_penalty = 0.0
    if leaching_active:
        leaching_penalty = round(soil_p * 0.15, 4)
        soil_p = max(0.0, soil_p - leaching_penalty)

    raw_score = (soil_p * W_SOIL) + (market_f * W_MARKET) + (water_f * W_WATER)
    success_score = round(raw_score * 100, 1)

    # ── Recommendation text ──────────────────────────────────────────────────
    if success_score >= 75:
        recommendation = (
            "🟢 HIGH POTENTIAL — Soil, water, and market conditions are aligned. "
            "Proceed with planned crop."
        )
    elif success_score >= 50:
        recommendation = (
            "🟡 MODERATE POTENTIAL — One or more factors need attention. "
            "Review the weakest component before committing resources."
        )
    elif success_score >= 30:
        recommendation = (
            "🟠 LOW POTENTIAL — Significant constraints present. "
            "Consider a restorative fallow crop (cowpea / horsegram) this cycle."
        )
    else:
        recommendation = (
            "🔴 CRITICAL — Multiple factors in deficit. "
            "Prioritise soil recovery and water sourcing before planting."
        )

    return {
        "success_score":     success_score,
        "soil_prob":         round(soil_p, 4),
        "market_factor":     market_f,
        "water_factor":      water_f,
        "leaching_penalty":  leaching_penalty,
        "recommendation":    recommendation,
    }


def score_from_live_sensors(price_slope: float = 0.0) -> dict:
    """
    Convenience wrapper: reads live_sensors.json, pulls N-P-K + soil_moisture,
    and returns a full profit matrix result.

    Designed to be called from final_integration_test.py or the API.
    Falls back gracefully if the sensor file isn't available.
    """
    sensor_path = os.path.join(
        os.path.dirname(__file__), "..", "integration", "data", "live_sensors.json"
    )
    try:
        with open(sensor_path) as f:
            data = json.load(f)
    except FileNotFoundError:
        return {
            "success_score":    0.0,
            "error":            "Sensor file not found. Is the IoT simulator running?",
        }

    # Approximate days from soil moisture (proxy — replace with real depletion call)
    # 100% moisture ≈ 30+ days, 0% ≈ 0 days
    days_proxy = max(0.0, data.get("soil_moisture", 50) * 0.5)

    return calculate_profit_score(
        nitrogen=float(data.get("n", 50)),
        phosphorus=float(data.get("p", 50)),
        potassium=float(data.get("k", 50)),
        price_slope=price_slope,
        days_until_water_depletion=days_proxy,
    )