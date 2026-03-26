"""
services/market_service.py
Crop price insights using mock dataset + price_predictor from data_science/.
Replace MOCK_MARKET_DATA with a live API call (e.g., Agmarknet, data.gov.in) in production.
"""

import random
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from data_science.price_predictor import analyze_price_trend
from backend.models.schemas import MarketResponse

# ── Mock market dataset ────────────────────────────────────────────────────────
# Structure: crop_name → last 14 days of prices (₹/kg)
MOCK_MARKET_DATA: dict[str, list[float]] = {
    "Tomato":   [18, 19, 21, 20, 22, 25, 24, 26, 27, 25, 28, 30, 29, 31],
    "Wheat":    [22, 22, 21, 22, 22, 23, 22, 22, 23, 22, 22, 22, 23, 22],
    "Onion":    [35, 33, 30, 28, 26, 25, 24, 22, 21, 20, 19, 18, 17, 16],
    "Soybean":  [45, 46, 44, 47, 46, 48, 49, 50, 48, 51, 52, 53, 51, 54],
    "Rice":     [30, 30, 31, 30, 30, 31, 30, 30, 31, 30, 30, 31, 30, 30],
    "Maize":    [15, 16, 15, 17, 16, 18, 17, 19, 18, 20, 19, 21, 20, 22],
    "Groundnut":[55, 54, 56, 55, 57, 56, 58, 57, 59, 58, 60, 59, 61, 62],
    "Cotton":   [65, 63, 61, 60, 58, 57, 55, 54, 52, 51, 50, 49, 47, 46],
}


def _get_recommendation(trend: str, risk: str) -> str:
    """Generates a simple Buy/Sell/Hold signal based on trend + risk."""
    if trend == "Upward" and risk == "Low":
        return "🟢 SELL – Prices rising steadily. Good time to sell."
    elif trend == "Upward" and risk == "High":
        return "🟡 HOLD – Prices rising but volatile. Wait for stability."
    elif trend == "Downward" and risk == "High":
        return "🔴 HOLD – Falling prices + high volatility. Avoid selling now."
    elif trend == "Downward" and risk == "Low":
        return "🔴 SELL QUICKLY – Steady price decline. Move stock soon."
    else:
        return "🟡 HOLD – Market stable. Monitor for next 3–5 days."


def get_market_insights(crop: str | None = None) -> MarketResponse:
    """
    Returns price trend and trading recommendation for a given crop.
    If no crop is specified, returns a random one from the dataset.
    """
    if crop and crop in MOCK_MARKET_DATA:
        chosen = crop
    elif crop:
        # Fuzzy match: case-insensitive
        match = next((c for c in MOCK_MARKET_DATA if c.lower() == crop.lower()), None)
        chosen = match if match else random.choice(list(MOCK_MARKET_DATA.keys()))
    else:
        chosen = random.choice(list(MOCK_MARKET_DATA.keys()))

    price_history = MOCK_MARKET_DATA[chosen]
    current_price = price_history[-1]

    analysis = analyze_price_trend(price_history)
    recommendation = _get_recommendation(analysis["trend"], analysis["risk_score"])

    return MarketResponse(
        crop=chosen,
        current_price=current_price,
        unit="₹/kg",
        trend=analysis["trend"],
        risk_level=analysis["risk_score"],
        recommendation=recommendation,
    )