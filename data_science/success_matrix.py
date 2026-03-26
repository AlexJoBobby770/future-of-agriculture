"""
data_science/success_matrix.py
Member 2 — Live Score + Leaching integration

Reads live sensor data and wires Member 3's leaching logic into the
Profit Matrix so heavy rain's effect on nitrogen is reflected in the
final success score.
"""

import json
import os

from data_science.profit_matrix import calculate_profit_score


# ── Leaching thresholds (Member 3's rule) ────────────────────────────────────
LEACHING_RAIN_THRESHOLD_MM = 10   # Heavy rain triggers nitrogen leach
LEACHING_N_LOSS_FRACTION   = 0.10 # 10% N loss


def get_live_score(price_slope: float = 0.0) -> float:
    """
    Reads integration/data/live_sensors.json and returns the
    Crop Success Score (0–100) including any leaching adjustment.

    Args:
        price_slope: Pass the slope from analyze_price_trend() if available.
                     Defaults to 0 (stable market) when called standalone.

    Returns:
        float — the success score, or 0.0 if sensor data is unavailable.
    """
    sensor_path = os.path.join(
        os.path.dirname(__file__), "..", "integration", "data", "live_sensors.json"
    )
    try:
        with open(sensor_path) as f:
            data = json.load(f)
    except FileNotFoundError:
        return 0.0

    n = float(data.get("n", 50))
    p = float(data.get("p", 50))
    k = float(data.get("k", 50))
    rain_mm   = float(data.get("rain_mm", 0))          # If IoT sends rain data
    soil_moist = float(data.get("soil_moisture", 50))

    # Check if leaching is active this reading
    leaching_active = rain_mm > LEACHING_RAIN_THRESHOLD_MM

    # Proxy for water availability (soil moisture → days estimate)
    days_proxy = max(0.0, soil_moist * 0.5)

    result = calculate_profit_score(
        nitrogen=n,
        phosphorus=p,
        potassium=k,
        price_slope=price_slope,
        days_until_water_depletion=days_proxy,
        leaching_active=leaching_active,
    )
    return result["success_score"]


def calculate_leaching_impact(current_n: float, rain_mm: float) -> tuple[float, str]:
    """
    Member 3's Rule: Heavy rain washes away Nitrogen.

    Args:
        current_n : Current nitrogen percentage (0–100)
        rain_mm   : Rainfall in mm for this period

    Returns:
        (adjusted_n, status_message)
    """
    if rain_mm > LEACHING_RAIN_THRESHOLD_MM:
        leached_n = current_n * (1.0 - LEACHING_N_LOSS_FRACTION)
        return (
            round(leached_n, 2),
            f"⚠️ LEACHING DETECTED: {rain_mm:.1f}mm rain has washed away ~10% Nitrogen "
            f"({current_n:.1f}% → {leached_n:.1f}%). Apply top-dress N fertiliser.",
        )
    return (
        round(current_n, 2),
        "✅ Soil stable. No significant nitrogen leaching detected.",
    )