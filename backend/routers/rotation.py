"""
routers/rotation.py
/rotation endpoint — Smart Crop Rotation Recommendation
"""

from fastapi import APIRouter, HTTPException
from backend.models.schemas import RotationRequest, RotationResponse
from backend.services.rotation_service import recommend_rotation

router = APIRouter(prefix="/rotation", tags=["Smart Rotation"])


@router.post(
    "",
    response_model=RotationResponse,
    summary="Get smart crop rotation recommendation",
    description=(
        "Analyses current soil N-P-K levels and returns the optimal crop to plant "
        "next, a soil health score (0–100), and what to do after harvest. "
        "Rule engine is designed to be swapped for an ML model — just replace "
        "`recommend_rotation()` in rotation_service.py."
    ),
)
def get_rotation(payload: RotationRequest):
    try:
        return recommend_rotation(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rotation engine failed: {str(e)}")