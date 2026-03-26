"""
services/rotation_service.py
Rule-based Crop Rotation Decision Tree.
Architecture is intentionally structured for easy ML upgrade:
  current  → if/elif rules
  future   → replace with trained DecisionTreeClassifier or RF model
"""

from backend.models.schemas import RotationRequest, RotationResponse

# ── Nutrient thresholds (%) ────────────────────────────────────────────────────
N_LOW = 30       # Nitrogen
P_LOW = 35       # Phosphorus
K_LOW = 40       # Potassium


def _score_soil(n: float, p: float, k: float) -> float:
    """Composite soil health score 0–100. Weights: N=40%, P=30%, K=30%."""
    score = (min(n, 100) * 0.4) + (min(p, 100) * 0.3) + (min(k, 100) * 0.3)
    return round(score, 1)


def recommend_rotation(data: RotationRequest) -> RotationResponse:
    """
    Decision tree for crop rotation.
    Priority: Nitrogen > Phosphorus > Potassium > Default
    
    Rule sources: FAO soil fertility guidelines + ICAR recommendations.
    """
    n, p, k = data.nitrogen, data.phosphorus, data.potassium
    soil_health = _score_soil(n, p, k)

    # ── Decision Tree ─────────────────────────────────────────────────────────
    if n < N_LOW:
        crop = "Legumes"
        reason = f"Nitrogen critically low ({n}%). Legumes fix atmospheric N into soil via rhizobia bacteria."
        next_action = "After legume harvest, test nitrogen again. Target >40% before planting cereals."

    elif p < P_LOW:
        crop = "Root Crops (Carrot / Radish)"
        reason = f"Phosphorus deficient ({p}%). Root crops stimulate microbial phosphorus cycling."
        next_action = "Apply bone meal or rock phosphate. Retest soil after 4 weeks."

    elif k < K_LOW:
        crop = "Leafy Greens (Spinach / Amaranth)"
        reason = f"Potassium insufficient ({k}%). Leafy crops have lower K demand and won't deplete further."
        next_action = "Add wood ash or potassium sulphate. Avoid heavy fruiting crops next cycle."

    else:
        # All nutrients acceptable — recommend high-value cash crop
        if data.soil_type and "loamy" in data.soil_type.lower():
            crop = "Wheat / Sorghum"
            reason = f"Soil nutrients balanced (N:{n}%, P:{p}%, K:{k}%). Loamy soil suits grain crops."
        elif data.soil_type and "sandy" in data.soil_type.lower():
            crop = "Groundnut / Millet"
            reason = f"Sandy soil with good nutrient levels. Groundnut improves texture and yields well."
        else:
            crop = "Maize / Sorghum"
            reason = f"Good nutrient profile (N:{n}%, P:{p}%, K:{k}%). High-yield option recommended."
        next_action = "Maintain current nutrient levels. Schedule compost application mid-season."

    return RotationResponse(
        recommended_crop=crop,
        reason=reason,
        soil_health_score=soil_health,
        next_action=next_action,
    )