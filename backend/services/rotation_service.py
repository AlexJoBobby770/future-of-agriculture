"""
services/rotation_service.py
Smart Crop Rotation — Rule-based recommendation engine.
Connects Member 2's data science models (price predictor, success matrix, leaching)
with Member 1's API layer.

Rule priority (highest → lowest):
  P0    soil_ph < 5.5              → Lime treatment + acid-tolerant crop     [R03]
  P0.5  drought_mode == True       → Drought-resistant cover crop only        [R02 extension]
  P1    previous_crop high-water   → Drought-tolerant cover crop              [R02]
  P2    nitrogen < 30              → Nitrogen-fixing legume                   [R01]
  P3    phosphorus < 30            → P-mobilising crop (Mustard)
  P4    potassium < 30             → Low-K-demand cover crop                  [R05]
  P5    all nutrients healthy      → Cash crop                               [default]

Drought Mode Connection (Depletion Engine → Rotation Engine):
  The /predict endpoint returns drought_mode: bool when days_until_depletion < 3.
  The frontend or an orchestrator passes drought_mode=true as a query param to
  POST /rotation. The service then filters out ALL high-water-intensity crops
  (water_intensity >= HIGH_WATER_INTENSITY_THRESHOLD) and forces a drought-safe
  recommendation regardless of nutrient state.
"""

import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.models.schemas import RotationRequest, RotationResponse
from data_science.success_matrix import get_live_score, calculate_leaching_impact
from data_science.price_predictor import analyze_price_trend
from data_science.model_inference import match_best_crop


# ── Encyclopedia path ──────────────────────────────────────────────────────────
_ENCYCLOPEDIA_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "backend", "data", "agri_encyclopedia.json"
)

# ── Thresholds ─────────────────────────────────────────────────────────────────
HIGH_WATER_INTENSITY_THRESHOLD = 8    # Encyclopedia R02: water_intensity >= 8
ACIDIC_PH_THRESHOLD            = 5.5  # Encyclopedia R03: soil_ph < 5.5

# ── Drought-safe crop catalogue ────────────────────────────────────────────────
# Confirmed drought-resistant crops from the encyclopedia.
# Ordered by preference: best N-fixer first, then moderate, then minimum-input.
DROUGHT_SAFE_CROPS = [
    {
        "crop": "Horsegram (Drought-Resistant Cover Crop)",
        "reason": (
            "🚨 DROUGHT MODE ACTIVE — Water reserves are critically low (< 3 days remaining). "
            "Horsegram is the safest selection: it requires zero supplemental irrigation, "
            "thrives entirely on residual soil moisture, fixes up to 80 kg N/ha, and "
            "protects topsoil from erosion during the water-stress recovery period. "
            "Do NOT plant any water-intensive crop until the depletion countdown exceeds 7 days."
        ),
    },
    {
        "crop": "Tapioca / Cassava (Drought-Tolerant)",
        "reason": (
            "🚨 DROUGHT MODE ACTIVE — Tapioca is naturally drought-tolerant with a water "
            "requirement of only 2.5 mm/day. Earthing-up soil around the base retains "
            "residual moisture without irrigation. A viable option when horsegram has "
            "already been used in the previous rotation cycle."
        ),
    },
    {
        "crop": "Groundnut (Low-Water Legume)",
        "reason": (
            "🚨 DROUGHT MODE ACTIVE — Groundnut fixes nitrogen (up to 75 kg N/ha) and "
            "requires only 3.5 mm/day — well below the drought threshold. One life-saving "
            "irrigation of 40 mm at the pegging stage is sufficient for full pod formation."
        ),
    },
]

# ── Nutrient rule table (P2–P5) ────────────────────────────────────────────────
# P0, P0.5, P1 are handled by dedicated functions before this table is reached.
ROTATION_RULES = [
    {
        "max_n": 30,
        "crop":  "Cowpea (Legume)",
        "reason": (
            "Nitrogen is critically low. Cowpea fixes up to 100 kg N/ha via root nodules, "
            "restoring the most deficient macronutrient before the next main crop."
        ),
    },
    {
        "max_p": 30,
        "crop":  "Mustard",
        "reason": (
            "Phosphorus is low. Mustard's deep taproot releases organic acids that mobilise "
            "locked P from lower soil layers, making it available for the next crop."
        ),
    },
    {
        "max_k": 30,
        "crop":  "Horsegram (Cover Crop)",
        "reason": (
            "Potassium is low. Horsegram has a very low K demand, fixes nitrogen, and its "
            "residues recycle surface K back into the topsoil after incorporation."
        ),
    },
    {
        "min_n": 60,
        "min_p": 40,
        "min_k": 40,
        "crop":  "Rice / Wheat (Cash Crop)",
        "reason": (
            "All macronutrients are at healthy levels. Conditions are favourable for a "
            "high-demand staple to maximise yield and profit this season."
        ),
    },
]

DEFAULT_CROP   = "Green Manure (Sunnhemp)"
DEFAULT_REASON = (
    "Soil is moderately depleted across multiple nutrients. A green-manure cover crop "
    "will restore organic matter and all macronutrients before the next main season."
)

# ── Base Yields (Tons/Hectare) for Yield Prediction ────────────────────────────
BASE_YIELDS = {
    "Paddy (Rice)": 4.5,
    "Coconut": 10.0,
    "Rubber": 1.5,
    "Black Pepper": 2.0,
    "Banana": 35.0,
    "Tapioca (Cassava)": 30.0,
    "Tapioca (Acid-Tolerant) — after Lime Treatment": 25.0,
    "Cowpea": 1.2,
    "Cowpea (Legume)": 1.2,
    "Groundnut": 2.5,
    "Groundnut (Low-Water Legume)": 2.5,
    "Ginger": 20.0,
    "Turmeric": 25.0,
    "Arecanut": 2.5,
    "Horsegram": 0.8,
    "Horsegram (Cover Crop)": 0.8,
    "Horsegram (Drought-Resistant Cover Crop)": 0.8,
    "Horsegram (Drought-Tolerant Cover Crop)": 0.8,
    "Mustard": 1.5,
    "Green Manure (Sunnhemp)": 5.0
}


# ── Encyclopedia loader ────────────────────────────────────────────────────────

def _load_encyclopedia() -> dict:
    """
    Loads agri_encyclopedia.json and returns a dict keyed by crop id.
    Returns an empty dict silently if the file is missing — callers handle absence.
    """
    try:
        with open(_ENCYCLOPEDIA_PATH, "r") as f:
            data = json.load(f)
        return {crop["id"]: crop for crop in data.get("crops", [])}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


# ── P0: Soil pH rule ───────────────────────────────────────────────────────────

def _check_soil_ph(soil_ph: float) -> tuple[str, str] | None:
    """
    Priority 0 — Acidic soil gate (Encyclopedia R03: soil_ph < 5.5).

    Fires before drought_mode because lime is required regardless of water state —
    planting a drought crop in pH 4.8 soil will still fail.

    Returns (crop, reason) if rule fires, else None.
    """
    if soil_ph < ACIDIC_PH_THRESHOLD:
        crop = "Tapioca (Acid-Tolerant) — after Lime Treatment"
        reason = (
            f"⚠️ ACIDIC SOIL DETECTED (pH {soil_ph:.1f}, threshold < {ACIDIC_PH_THRESHOLD}). "
            f"Immediately apply agricultural lime at 2–3 tonnes/hectare and wait 3–4 weeks "
            f"before planting. Once pH rises above 5.5, Tapioca or Horsegram are the safest "
            f"first crops — both tolerate residual acidity and will not suffer yield loss "
            f"during the soil recovery window."
        )
        return crop, reason
    return None


# ── P0.5: Drought mode rule ────────────────────────────────────────────────────

def _check_drought_mode(
    drought_mode: bool,
    encyclopedia: dict,
    nitrogen: float,
) -> tuple[str, str] | None:
    """
    Priority 0.5 — Live Depletion Engine override (Proactive Resource Guarding).

    Fires when drought_mode=True is passed from the /predict endpoint output,
    signalling days_until_depletion < 3 — a water emergency.

    Selection logic within drought-safe crops:
      nitrogen < 35  → Horsegram (best N-fixer, zero water)
      nitrogen < 60  → Tapioca   (drought-tolerant, neutral N impact)
      nitrogen >= 60 → Groundnut (marketable legume, low water)

    Also appends a transparency note listing every high-water crop that was
    blocked, so the farmer and frontend can see what was overridden.

    Returns (crop, reason) if drought_mode is True, else None.
    """
    if not drought_mode:
        return None

    # Select best drought-safe option based on current nitrogen level
    if nitrogen < 35:
        selected = DROUGHT_SAFE_CROPS[0]   # Horsegram — best N-fixer
    elif nitrogen < 60:
        selected = DROUGHT_SAFE_CROPS[1]   # Tapioca   — low water, neutral N
    else:
        selected = DROUGHT_SAFE_CROPS[2]   # Groundnut — low water, marketable

    # Build blocked-crop list for transparency
    blocked = sorted([
        c["name"]
        for c in encyclopedia.values()
        if c.get("water_intensity", 0) >= HIGH_WATER_INTENSITY_THRESHOLD
    ])
    if blocked:
        blocked_str = ", ".join(blocked)
        reason = (
            selected["reason"]
            + f" | BLOCKED HIGH-WATER CROPS (intensity ≥ {HIGH_WATER_INTENSITY_THRESHOLD}): "
            + f"{blocked_str}."
        )
    else:
        reason = selected["reason"]

    return selected["crop"], reason


# ── P1: Previous crop water intensity rule ─────────────────────────────────────

def _check_previous_crop(
    previous_crop_id: str | None,
    encyclopedia: dict,
) -> tuple[str, str] | None:
    """
    Priority 1 — Post-high-water-crop recovery (Encyclopedia R02).

    If the previous crop had water_intensity >= 8, the soil water reserve is
    depleted and the next crop must be drought-tolerant.

    Returns (crop, reason) if rule fires, else None.
    """
    if not previous_crop_id:
        return None

    prev = encyclopedia.get(previous_crop_id)
    if prev is None:
        return None   # Unknown ID — skip rather than crash

    water_intensity = prev.get("water_intensity", 0)
    if water_intensity >= HIGH_WATER_INTENSITY_THRESHOLD:
        crop_name = prev.get("name", previous_crop_id)
        crop      = "Horsegram (Drought-Tolerant Cover Crop)"
        reason    = (
            f"Previous crop '{crop_name}' had a water intensity of {water_intensity}/10 "
            f"(threshold ≥ {HIGH_WATER_INTENSITY_THRESHOLD}), indicating the soil water "
            f"reserve is significantly depleted. Horsegram thrives on residual soil moisture "
            f"alone, requires zero supplemental irrigation, fixes up to 80 kg N/ha, and "
            f"prevents erosion during the recovery period before the next main crop."
        )
        rotation_benefit = prev.get("rotation_benefit", "")
        if rotation_benefit:
            reason += f" | Rotation note: {rotation_benefit}"
        return crop, reason

    return None


# ── P2–P5: Nutrient rule table ─────────────────────────────────────────────────

def _pick_crop_from_nutrients(n: float, p: float, k: float) -> tuple[str, str]:
    """
    Walks ROTATION_RULES in order and returns the first match.
    Falls back to DEFAULT_CROP if no rule fires.
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


# ── Master recommendation function ────────────────────────────────────────────

def recommend_rotation(
    data: RotationRequest,
    drought_mode: bool = False,
) -> RotationResponse:
    """
    Full rotation pipeline:
      1. Load live weather from Member 3
      2. Load market prices
      3. Run Member 2's data-science engines (leaching, success score)
      4. Load encyclopedia for crop lookups
      5. Apply rule engine in strict priority order (P0 → P5)
      6. Determine next_action string
      7. Return RotationResponse with is_live_data flag

    Args:
        data:         Validated RotationRequest (soil N-P-K, pH, previous crop, etc.)
        drought_mode: Forwarded from /predict engine output via the router.
                      When True, all high-water-intensity crops are suppressed.
    """

    # ── 1. LOAD LIVE WEATHER (Member 3's output) ───────────────────────────────
    weather_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "integration", "data", "live_weather.json"
    )
    live_rain        = 0.0
    rain_forecast_7d = None
    sensors_online   = False

    if os.path.exists(weather_path):
        try:
            with open(weather_path, "r") as f:
                w_data = json.load(f)
            live_rain        = w_data.get("current", {}).get("rain", 0.0)
            rain_forecast_7d = w_data.get("rain_forecast", None)
            sensors_online   = True
        except (json.JSONDecodeError, KeyError):
            live_rain        = 0.0
            rain_forecast_7d = None

    # ── 2. LOAD MARKET PRICES ──────────────────────────────────────────────────
    market_path   = os.path.join(
        os.path.dirname(__file__), "..", "..", "integration", "data", "mock_market_data.json"
    )
    price_history = [200, 210, 220, 215, 225]   # safe default
    if os.path.exists(market_path):
        try:
            with open(market_path, "r") as f:
                m_data = json.load(f)
            first_key = next(iter(m_data), None)
            if first_key:
                price_history = m_data[first_key]
        except (json.JSONDecodeError, StopIteration):
            pass

    # ── 3. MEMBER 2 DATA-SCIENCE ENGINES ──────────────────────────────────────
    analysis    = analyze_price_trend(price_history)
    price_slope = analysis["slope"]
    soil_health = get_live_score(price_slope=price_slope)
    adjusted_n, leaching_msg = calculate_leaching_impact(data.nitrogen, live_rain)

    # ── 4. ENCYCLOPEDIA ────────────────────────────────────────────────────────
    encyclopedia = _load_encyclopedia()

    # ── 5. RULE ENGINE — strict priority order ─────────────────────────────────

    # P0 — Acidic soil (must be resolved before any crop is planted)
    ph_result = _check_soil_ph(data.soil_ph)
    if ph_result:
        crop, reason = ph_result

    else:
        # P0.5 — Drought mode override from Depletion Engine
        drought_result = _check_drought_mode(drought_mode, encyclopedia, adjusted_n)
        if drought_result:
            crop, reason = drought_result

        else:
            # P1 — Previous crop was water-intensive
            prev_result = _check_previous_crop(data.previous_crop_id, encyclopedia)
            if prev_result:
                crop, reason = prev_result

            else:
                # P2–P5 — Nutrient-based rules
                crop, reason = _pick_crop_from_nutrients(
                    adjusted_n, data.phosphorus, data.potassium
                )
                if adjusted_n < data.nitrogen:
                    reason += f" | {leaching_msg}"

    # ── 6. NEXT ACTION ─────────────────────────────────────────────────────────
    if data.soil_ph < ACIDIC_PH_THRESHOLD:
        action = (
            "URGENT: Apply agricultural lime (2–3 t/ha) immediately. "
            "Re-test soil pH in 3–4 weeks before planting any crop."
        )
    elif drought_mode:
        action = (
            "🚨 DROUGHT EMERGENCY: Water reserves critically low (< 3 days). "
            "Halt ALL irrigation on non-essential plots immediately. "
            "Plant only the recommended drought-resistant crop. "
            "Source emergency water supply and review /predict daily."
        )
    elif live_rain > 10.0:
        action = (
            "URGENT: Heavy rain detected. Deploy field drainage. "
            "Nitrogen leaching risk is HIGH — schedule top-dress N fertiliser."
        )
    elif soil_health < 30:
        action = (
            "CRITICAL: Soil health score is very poor. "
            "Apply vermicompost and reduce tilling immediately."
        )
    elif soil_health < 50:
        action = (
            "RECOVERY: Soil needs attention. "
            "Consider organic amendments before the next planting cycle."
        )
    else:
        action = (
            "STABLE: Conditions are favourable. "
            "Proceed with the recommended crop and monitor weekly."
        )

    # ── 7. KNN CONFIDENCE SCORING (Euclidean Distance + Softmax) ────────────
    knn_result = match_best_crop(adjusted_n, data.phosphorus, data.potassium, rain_forecast_7d)
    confidence = knn_result["confidence"]
    uncertainty = knn_result["uncertainty_flag"]
    weather_context = knn_result["weather_context"]

    # ── 8. MATHEMATICAL YIELD PREDICTION ────────────────────────────────────────
    # Yield potential is a weighted blend of AI Confidence (60%) + Soil Health (40%)
    yield_potential_pct = (confidence * 0.6) + ((soil_health / 100.0) * 0.4)
    yield_potential_pct = min(1.0, max(0.1, yield_potential_pct)) # bound 10%-100%
    
    base_yield = BASE_YIELDS.get(crop, 5.0)
    expected_yield = round(base_yield * yield_potential_pct, 2)
    yield_pct_display = round(yield_potential_pct * 100, 1)

    # 9. BUILD RESPONSE ─────────────────────────────────────────────────────────────────
    return RotationResponse(
        recommended_crop=crop,
        reason=reason,
        soil_health_score=round(soil_health, 1),
        confidence_score=confidence,
        uncertainty_flag=uncertainty,
        weather_context=weather_context,
        expected_yield_tons_ha=expected_yield,
        yield_potential_pct=yield_pct_display,
        next_action=action,
        is_live_data=sensors_online,
    )