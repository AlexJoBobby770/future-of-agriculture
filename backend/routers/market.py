"""
routers/market.py
/market endpoint — Crop Price Insights
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.models.schemas import MarketResponse
from backend.services.market_service import get_market_insights, MOCK_MARKET_DATA

router = APIRouter(prefix="/market", tags=["Market Intelligence"])


@router.get(
    "",
    response_model=MarketResponse,
    summary="Get crop market price insight",
    description="Returns current price, trend, and a buy/sell/hold recommendation for a crop.",
)
def get_market(
    crop: Optional[str] = Query(
        default=None,
        description=f"Crop name. Options: {', '.join(MOCK_MARKET_DATA.keys())}"
    )
):
    try:
        return get_market_insights(crop)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market lookup failed: {str(e)}")


@router.get(
    "/all",
    summary="List all available crops in market dataset",
)
def list_crops():
    """Returns all crops available in the mock market dataset."""
    return {"crops": list(MOCK_MARKET_DATA.keys())}


@router.get(
    "/detail",
    summary="Full market detail for all crops",
    description="Returns all crops with full 14-day price history, trend analysis, and trading signals in one payload.",
)
def get_all_market_detail():
    """Returns detailed market data for every crop — price history, trend, slope, risk, recommendation."""
    results = []
    for crop_name in MOCK_MARKET_DATA:
        insight = get_market_insights(crop_name)
        results.append({
            "crop": crop_name,
            "current_price": insight.current_price,
            "unit": insight.unit,
            "trend": insight.trend,
            "slope": insight.slope,
            "risk_level": insight.risk_level,
            "recommendation": insight.recommendation,
            "price_history": MOCK_MARKET_DATA[crop_name],
        })
    return {"assets": results, "count": len(results)}