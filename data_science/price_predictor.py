import numpy as np
import json
import os

def analyze_price_trend(price_history):
    """
    Analyzes a list of prices and returns the trend.
    Used by the 'Market Radar' feature.
    """
    if len(price_history) < 2:
        return {"trend": "Stable", "slope": 0}
    
    x = np.arange(len(price_history))
    y = np.array(price_history)
    
    # Linear Regression slope
    slope, intercept = np.polyfit(x, y, 1)
    
    trend = "Upward" if slope > 0.5 else "Downward" if slope < -0.5 else "Stable"
    
    return {
        "trend": trend,
        "slope": round(float(slope), 2)
    }

def get_crop_advice(crop_name):
    # This is a helper for Member 1
    return f"Advice for {crop_name}: Monitor market volatility."