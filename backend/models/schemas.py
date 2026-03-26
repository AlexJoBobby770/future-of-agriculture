"""
models/schemas.py
Pydantic models for request/response validation across all endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# ─────────────────────────────────────────────
# /predict  – Resource Depletion
# ─────────────────────────────────────────────

class PredictRequest(BaseModel):
    water_level: float = Field(..., gt=0, description="Current water level in litres")
    daily_usage: float = Field(default=50.0, gt=0, description="Daily water consumption in litres")
    evapotranspiration_rate: float = Field(..., ge=0, description="Daily ET loss in litres")
    rain_forecast: List[float] = Field(..., min_items=1, description="Next N days of rain (litres)")

    class Config:
        json_schema_extra = {
            "example": {
                "water_level": 1000,
                "daily_usage": 50,
                "evapotranspiration_rate": 5,
                "rain_forecast": [0, 2, 0, 5, 0, 0, 3]
            }
        }


class PredictResponse(BaseModel):
    days_until_depletion: float
    avg_daily_net_loss: float
    status: str                   # "Normal" | "Drought Warning" | "Critical – Drought Mode"
    drought_mode: bool            # True when days < 3
    action: str                   # Human-readable advice


# ─────────────────────────────────────────────
# /rotation  – Crop Rotation Recommendation
# ─────────────────────────────────────────────

class RotationRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=100, description="Nitrogen % in soil")
    phosphorus: float = Field(..., ge=0, le=100, description="Phosphorus % in soil")
    potassium: float = Field(..., ge=0, le=100, description="Potassium % in soil")
    soil_ph: float = Field(..., ge=0, le=14, description="Current soil pH (0–14)")
    previous_crop_id: Optional[str] = Field(
        default=None,
        description="Encyclopedia crop ID of the last harvested crop (e.g. 'paddy_01', 'banana_01'). "
                    "Used to evaluate water intensity and soil depletion index rules."
    )
    soil_type: Optional[str] = Field(default="Loamy", description="e.g. Loamy, Sandy, Clay")
    current_moisture: Optional[float] = Field(default=None, ge=0, le=100, description="Current soil moisture %")
    current_rain: Optional[float] = Field(default=None, ge=0, description="Current rainfall in mm")

    class Config:
        json_schema_extra = {
            "example": {
                "nitrogen": 25,
                "phosphorus": 40,
                "potassium": 60,
                "soil_ph": 6.0,
                "previous_crop_id": "paddy_01",
                "soil_type": "Loamy",
                "current_moisture": 45.0,
                "current_rain": 2.5
            }
        }


class RotationResponse(BaseModel):
    recommended_crop: str
    reason: str
    soil_health_score: float      # 0-100 composite score
    next_action: str              # What to do after this rotation
    is_live_data: bool            # True = live IoT sensors; False = simulated/fallback data


# ─────────────────────────────────────────────
# /market  – Crop Price Insights
# ─────────────────────────────────────────────

class MarketResponse(BaseModel):
    crop: str
    current_price: float
    unit: str                     # e.g. "₹/kg"
    trend: str                    # "Upward" | "Stable" | "Downward"
    slope: Optional[float] = None # Price change per day (₹)
    risk_level: str               # "Low" | "Medium" | "High"
    recommendation: str           # Buy/Sell/Hold signal