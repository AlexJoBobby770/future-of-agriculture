"""
routers/predict.py
/predict endpoint — Resource Depletion Prediction
"""

from fastapi import APIRouter, HTTPException
from backend.models.schemas import PredictRequest, PredictResponse
from backend.services.depletion_service import predict_depletion

router = APIRouter(prefix="/predict", tags=["Depletion Engine"])


@router.post(
    "",
    response_model=PredictResponse,
    summary="Predict resource depletion",
    description="Returns days until water depletion and drought status based on usage + weather forecast.",
)
def predict_resource_depletion(payload: PredictRequest):
    try:
        return predict_depletion(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")