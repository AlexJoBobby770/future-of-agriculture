"""
routers/rotation.py
/rotation endpoint — Smart Crop Rotation Recommendation

drought_mode is accepted as an optional query parameter so the frontend can
pass the value it received from POST /predict without modifying the request body.

Example calls:
    POST /rotation                          — normal recommendation
    POST /rotation?drought_mode=true        — depletion engine has flagged emergency
"""

from fastapi import APIRouter, HTTPException, Query
from backend.models.schemas import RotationRequest, RotationResponse
from backend.services.rotation_service import recommend_rotation

router = APIRouter(prefix="/rotation", tags=["Smart Rotation"])


@router.post(
    "",
    response_model=RotationResponse,
    summary="Get smart crop rotation recommendation",
    description=(
        "Analyses current soil N-P-K levels, pH, previous crop, and optional drought "
        "status from the Depletion Engine, then returns the optimal crop to plant next, "
        "a soil health score (0–100), and the required next action.\n\n"
        "**Drought Mode Integration:**\n"
        "Pass `?drought_mode=true` when the `/predict` endpoint returns "
        "`drought_mode: true`. This suppresses all high-water-intensity crops and "
        "forces a drought-resistant recommendation regardless of nutrient state.\n\n"
        "The rule engine priority is:\n"
        "- **P0** soil pH < 5.5 → Lime treatment first\n"
        "- **P0.5** drought_mode=true → Drought-resistant crop\n"
        "- **P1** previous crop was high-water → Recovery cover crop\n"
        "- **P2–P5** N / P / K deficiency or surplus → Nutrient-based crop"
    ),
)
def get_rotation(
    payload: RotationRequest,
    drought_mode: bool = Query(
        default=False,
        description=(
            "Set to true when the /predict endpoint returns drought_mode=true "
            "(days_until_depletion < 3). Activates emergency drought-resistant "
            "crop selection and suppresses all high-water-intensity crops."
        ),
    ),
):
    try:
        return recommend_rotation(data=payload, drought_mode=drought_mode)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rotation engine failed: {str(e)}")