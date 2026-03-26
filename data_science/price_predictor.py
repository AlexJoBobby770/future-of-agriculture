import numpy as np

def analyze_price_trend(price_history):
    """
    Takes a list of last 7-30 days of prices.
    Returns trend direction and a risk score.
    """
    if len(price_history) < 2:
        return {"trend": "Stable", "slope": 0, "risk": "Low"}

    x = np.arange(len(price_history))
    y = np.array(price_history)
    
    # Linear regression slope
    slope, intercept = np.polyfit(x, y, 1)
    
    # Volatility (Standard Deviation)
    volatility = np.std(y)
    
    trend = "Upward" if slope > 0.5 else "Downward" if slope < -0.5 else "Stable"
    risk = "High" if volatility > (np.mean(y) * 0.1) else "Low"

    return {
        "trend": trend,
        "slope": round(float(slope), 2),
        "risk_score": risk
    }