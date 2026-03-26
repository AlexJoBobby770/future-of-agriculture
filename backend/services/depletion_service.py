"""
services/depletion_service.py
Business logic for the Predictive Depletion Engine.
Designed to be swappable with an ML model later — just replace _calculate_depletion().
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from data_science.depletion_engine import DepletionEngine
from backend.models.schemas import PredictRequest, PredictResponse

# Reserve margin: we treat the bottom 10% of the tank as unusable
_engine = DepletionEngine(reserve_margin=0.1)

# Thresholds for status classification
CRITICAL_DAYS = 3
WARNING_DAYS = 7


def predict_depletion(data: PredictRequest) -> PredictResponse:
    """
    Core depletion prediction logic.
    Uses the DepletionEngine from data_science/ and adds status classification.
    
    To plug in an ML model later:
      Replace _engine.get_days_to_depletion(...) with your model.predict(features)
    """
    # Average the rain forecast so the engine gets a single daily value
    avg_rain = sum(data.rain_forecast) / len(data.rain_forecast)

    days = _engine.get_days_to_depletion(
        current_v=data.water_level,
        daily_usage=data.daily_usage,
        et_rate=data.evapotranspiration_rate,
        rain_forecast=avg_rain,
    )

    # Net loss figure for transparency
    net_daily_loss = (data.daily_usage + data.evapotranspiration_rate) - avg_rain
    avg_daily_net_loss = round(max(0, net_daily_loss), 2)

    # ── Status classification ──────────────────────────────────────────────
    if days == 999:
        status = "Surplus"
        drought_mode = False
        action = "Rainfall exceeds usage. Consider storing excess water."
    elif days < CRITICAL_DAYS:
        status = "Critical – Drought Mode"
        drought_mode = True
        action = "🚨 IMMEDIATE ACTION: Activate emergency water conservation. Halt non-critical irrigation NOW."
    elif days < WARNING_DAYS:
        status = "Drought Warning"
        drought_mode = False
        action = "⚠️ Reduce irrigation by 30%. Check alternate water sources within 48 hours."
    else:
        status = "Normal"
        drought_mode = False
        action = "✅ Levels stable. Monitor daily and review forecast every 3 days."

    return PredictResponse(
        days_until_depletion=days,
        avg_daily_net_loss=avg_daily_net_loss,
        status=status,
        drought_mode=drought_mode,
        action=action,
    )