import json
import os
# Import threshold from Member 2's master file to ensure consistency
from data_science.success_matrix import LEACHING_RAIN_THRESHOLD_MM

def get_weather_impact():
    path = "integration/data/live_weather.json"
    if not os.path.exists(path):
        return {"status": "Waiting for data...", "leaching_penalty": 0}

    with open(path, 'r') as f:
        data = json.load(f)

    current_rain = data.get("current", {}).get("rain", 0.0)
    
    # Updated Threshold: 10mm
    if current_rain > LEACHING_RAIN_THRESHOLD_MM:
        penalty = 10.5
        status = f"🚨 ALERT: Leaching active ({current_rain}mm rain)"
    else:
        penalty = 0
        status = "✅ Conditions Stable"

    return {
        "status": status,
        "leaching_penalty": penalty
    }