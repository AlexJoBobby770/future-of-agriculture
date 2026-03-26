"""
data_science/price_predictor.py
Member 2 — Price Trend Predictor

Uses linear regression on a 14-day price window.
Returns trend label + risk_score label that market_service.py maps to
    "Low" | "Medium" | "High"  (MarketResponse.risk_level expects a string)
"""

import numpy as np


def analyze_price_trend(price_history: list[float]) -> dict:
    """
    Analyse a list of daily prices and return trend + risk.

    Args:
        price_history: List of prices (at least 2 values, ideally 14).

    Returns:
        {
            "trend":      "Upward" | "Downward" | "Stable",
            "slope":      float   (₹ change per day),
            "volatility": float   (coefficient of variation, 0-1),
            "risk_score": "Low"   | "Medium" | "High"
        }
    """
    if len(price_history) < 2:
        return {
            "trend": "Stable",
            "slope": 0.0,
            "volatility": 0.0,
            "risk_score": "Low",
        }

    x = np.arange(len(price_history))
    y = np.array(price_history, dtype=float)

    # ── Trend via OLS slope ──────────────────────────────────────────────────
    slope, _ = np.polyfit(x, y, 1)

    if slope > 0.5:
        trend = "Upward"
    elif slope < -0.5:
        trend = "Downward"
    else:
        trend = "Stable"

    # ── Volatility: coefficient of variation (std / mean) ───────────────────
    mean_price = float(np.mean(y))
    std_price  = float(np.std(y))
    volatility = round(std_price / mean_price, 4) if mean_price > 0 else 0.0

    # ── Risk score (what market_service.py passes to MarketResponse) ─────────
    # Combines both volatility AND the magnitude of the slope.
    abs_slope = abs(float(slope))

    if volatility > 0.08 or abs_slope > 3.0:
        risk_score = "High"
    elif volatility > 0.04 or abs_slope > 1.5:
        risk_score = "Medium"
    else:
        risk_score = "Low"

    return {
        "trend":      trend,
        "slope":      round(float(slope), 2),
        "volatility": volatility,
        "risk_score": risk_score,
    }


def get_crop_advice(crop_name: str) -> str:
    """Helper stub — kept for backward compat with Member 1 imports."""
    return f"Advice for {crop_name}: Monitor market volatility before selling."