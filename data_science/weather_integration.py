"""
data_science/weather_integration.py
Reads live weather from Member 3's fetcher and calculates leaching penalty.
Uses the shared LEACHING_RAIN_THRESHOLD_MM from success_matrix to ensure
consistent thresholds across all data-science modules.
"""

import json
import os
from data_science.success_matrix import LEACHING_RAIN_THRESHOLD_MM


def get_weather_impact():
<<<<<<< HEAD
    path = "integration/data/live_weather.json"
    if not os.path.exists(path):
        return {"status": "Waiting for data...", "leaching_penalty": 0}
=======
    """
    Checks the local weather data (from Member 3's fetcher)
    and calculates the 'Leaching Penalty'.
    Returns a dict with status and penalty value.
    """
    path = os.path.join(
        os.path.dirname(__file__), "..", "integration", "data", "live_weather.json"
    )

    if not os.path.exists(path):
        return {"status": "Weather Station Offline", "leaching_penalty": 0}
>>>>>>> b5f120a5559064ce7f46a02c2180a678802c47d1

    with open(path, 'r') as f:
        data = json.load(f)

    current_rain = data.get("current", {}).get("rain", 0.0)
<<<<<<< HEAD
    
    # Updated Threshold: 10mm
=======

>>>>>>> b5f120a5559064ce7f46a02c2180a678802c47d1
    if current_rain > LEACHING_RAIN_THRESHOLD_MM:
        penalty = 10.5
        status = f"LEACHING ALERT: {current_rain}mm rain (threshold: {LEACHING_RAIN_THRESHOLD_MM}mm)"
    elif current_rain > 0.1:
        penalty = -2.0
        status = "Light Rain: Soil Hydration Optimal"
    else:
        penalty = 0
        status = "Clear Skies: No Leaching Risk"

    return {
        "status": status,
        "leaching_penalty": penalty,
    }
