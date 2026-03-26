"""
routers/dashboard.py
/summary endpoint — Unified Dashboard for Member 4 (Frontend)

Single POST that runs the full prediction + rotation + market pipeline
in one request, so the frontend never needs to chain three separate calls.

Pipeline (in order):
  1. Run predict_depletion()   → depletion days, drought_mode, conservation_mode,
                                 Monte Carlo risk distribution
  2. Extract drought_mode      → pass directly into recommend_rotation()
  3. Run recommend_rotation()  → crop recommendation, soil health, KNN confidence
  4. Run get_market_insights() → price trend + Buy/Sell/Hold signal
  5. Return one unified JSON   → DashboardResponse

Endpoint:
    POST /summary
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from backend.models.schemas import PredictRequest, RotationRequest
from backend.services.depletion_service import predict_depletion
from backend.services.rotation_service import recommend_rotation
from backend.services.market_service import get_market_insights

# ── Router ─────────────────────────────────────────────────────────────────────
router = APIRouter(prefix="/summary", tags=["Unified Dashboard"])


# ── Request schema ─────────────────────────────────────────────────────────────

class DashboardRequest(BaseModel):
    """
    Combines every field needed by /predict and /rotation into one body.
    All /rotation fields that were optional stay optional here.
    """

    # ── /predict fields ────────────────────────────────────────────────────────
    water_level: float = Field(
        ..., gt=0,
        description="Current water level in litres"
    )
    daily_usage: float = Field(
        default=50.0, gt=0,
        description="Daily water consumption in litres"
    )
    evapotranspiration_rate: float = Field(
        ..., ge=0,
        description="Daily ET loss in litres"
    )
    rain_forecast: List[float] = Field(
        ..., min_items=1,
        description="Next N days of expected rainfall (litres)"
    )

    # ── /rotation fields ───────────────────────────────────────────────────────
    nitrogen: float = Field(
        ..., ge=0, le=100,
        description="Nitrogen % in soil"
    )
    phosphorus: float = Field(
        ..., ge=0, le=100,
        description="Phosphorus % in soil"
    )
    potassium: float = Field(
        ..., ge=0, le=100,
        description="Potassium % in soil"
    )
    soil_ph: float = Field(
        ..., ge=0, le=14,
        description="Current soil pH (0–14)"
    )
    previous_crop_id: Optional[str] = Field(
        default=None,
        description="Encyclopedia crop ID of the last harvested crop (e.g. 'paddy_01')"
    )
    soil_type: Optional[str] = Field(
        default="Loamy",
        description="Soil texture: Loamy, Sandy, or Clay"
    )
    current_moisture: Optional[float] = Field(
        default=None, ge=0, le=100,
        description="Current soil moisture %"
    )
    current_rain: Optional[float] = Field(
        default=None, ge=0,
        description="Current rainfall in mm"
    )

    # ── /market field ──────────────────────────────────────────────────────────
    crop_name: Optional[str] = Field(
        default=None,
        description="Crop name for market lookup (e.g. 'Tomato'). "
                    "Omit to receive a random market signal."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "water_level": 1000,
                "daily_usage": 50,
                "evapotranspiration_rate": 5,
                "rain_forecast": [0, 2, 0, 5, 0, 0, 3],
                "nitrogen": 25,
                "phosphorus": 40,
                "potassium": 60,
                "soil_ph": 6.0,
                "previous_crop_id": "paddy_01",
                "soil_type": "Loamy",
                "current_moisture": 45.0,
                "current_rain": 2.5,
                "crop_name": "Tomato"
            }
        }


# ── Response schema ────────────────────────────────────────────────────────────

class DashboardResponse(BaseModel):
    """
    Unified payload returned to the frontend.
    Structured into three top-level blocks matching the three engines,
    plus a top-level alert_level that the UI can use to colour-code cards.
    """

    # Top-level alert derived from the depletion engine
    alert_level: str           # "CRITICAL" | "WARNING" | "CONSERVATION" | "NORMAL" | "SURPLUS"

    # ── Engine 1: Depletion ────────────────────────────────────────────────────
    prediction: dict           # Full PredictResponse as dict (includes monte_carlo)

    # ── Engine 2: Rotation ────────────────────────────────────────────────────
    rotation: dict             # Full RotationResponse as dict (includes KNN confidence)

    # ── Engine 3: Market ──────────────────────────────────────────────────────
    market: dict               # Full MarketResponse as dict (includes Buy/Sell/Hold)


# ── Helper: derive alert_level from PredictResponse ───────────────────────────

def _alert_level(drought_mode: bool, conservation_mode: bool, status: str) -> str:
    """
    Maps the two boolean flags + status string from the depletion engine to a
    single priority label the frontend can use for card colour-coding.

      CRITICAL    → drought_mode=True   (< 3 days)   → red
      WARNING     → status="Drought Warning"          → orange  (3–7 days, conservation_mode=True)
      CONSERVATION→ conservation_mode=True (synonym)  → amber   (kept for explicitness)
      SURPLUS     → status="Surplus"                  → blue
      NORMAL      → everything else                   → green
    """
    if drought_mode:
        return "CRITICAL"
    if conservation_mode:
        return "WARNING"
    if status == "Surplus":
        return "SURPLUS"
    return "NORMAL"


# ── POST /summary ──────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=DashboardResponse,
    summary="Unified dashboard summary",
    description=(
        "Runs the full Agri-Resilient pipeline in a single request.\n\n"
        "**Pipeline order:**\n"
        "1. `predict_depletion` — water countdown + Monte Carlo risk\n"
        "2. `recommend_rotation` — receives `drought_mode` extracted from step 1\n"
        "3. `get_market_insights` — price trend + trading signal\n\n"
        "**Returns one JSON object** containing all three engine outputs plus a "
        "top-level `alert_level` field (`CRITICAL | WARNING | SURPLUS | NORMAL`) "
        "that the frontend can use to colour-code Resilience Cards without "
        "parsing nested fields.\n\n"
        "**drought_mode propagation:** if the depletion engine calculates "
        "`days_until_depletion < 3`, the rotation engine automatically suppresses "
        "all high-water-intensity crops — no extra parameter needed from the client."
    ),
)
def get_dashboard_summary(payload: DashboardRequest):
    """
    Unified dashboard endpoint.

    Internally constructs the individual request objects for each service,
    calls them in dependency order, then stitches the results into one response.
    """
    try:
        # ── Step 1: Build PredictRequest and run the depletion engine ──────────
        predict_req = PredictRequest(
            water_level=payload.water_level,
            daily_usage=payload.daily_usage,
            evapotranspiration_rate=payload.evapotranspiration_rate,
            rain_forecast=payload.rain_forecast,
        )
        predict_result = predict_depletion(predict_req)

        # ── Step 2: Extract drought_mode and build RotationRequest ─────────────
        # drought_mode flows directly from the depletion engine — the caller never
        # has to compute or pass it themselves.
        drought_mode = predict_result.drought_mode

        rotation_req = RotationRequest(
            nitrogen=payload.nitrogen,
            phosphorus=payload.phosphorus,
            potassium=payload.potassium,
            soil_ph=payload.soil_ph,
            previous_crop_id=payload.previous_crop_id,
            soil_type=payload.soil_type,
            current_moisture=payload.current_moisture,
            current_rain=payload.current_rain,
        )
        rotation_result = recommend_rotation(
            data=rotation_req,
            drought_mode=drought_mode,
        )

        # ── Step 3: Market signal ──────────────────────────────────────────────
        market_result = get_market_insights(payload.crop_name)

        # ── Step 4: Derive top-level alert_level ──────────────────────────────
        alert = _alert_level(
            drought_mode=predict_result.drought_mode,
            conservation_mode=predict_result.conservation_mode,
            status=predict_result.status,
        )

        # ── Step 5: Assemble and return unified response ───────────────────────
        return DashboardResponse(
            alert_level=alert,
            prediction=predict_result.model_dump(),
            rotation=rotation_result.model_dump(),
            market=market_result.model_dump(),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dashboard pipeline failed: {str(e)}"
        )