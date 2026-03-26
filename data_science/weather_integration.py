import json
import os
# Import threshold from Member 2's master file to ensure consistency
from data_science.success_matrix import LEACHING_RAIN_THRESHOLD_MM


def get_weather_impact():
<<<<<<< HEAD
    """
    Checks the local weather data (from Member 3's fetcher)
    and calculates the 'Leaching Penalty'.
    """
    path = os.path.join(
        os.path.dirname(__file__), "..", "integration", "data", "live_weather.json"
    )

    if not os.path.exists(path):
        return 0.0, "Weather Station Offline"
=======
    path = "integration/data/live_weather.json"
    if not os.path.exists(path):
        return {"status": "Waiting for data...", "leaching_penalty": 0}
>>>>>>> 9fd566f16884294321c67a4bc4706bad38191879

    with open(path, 'r') as f:
        data = json.load(f)

<<<<<<< HEAD
    # Open-Meteo usually returns 'rain' in mm under "current"
    current_rain = data.get("current", {}).get("rain", 0.0)

    # LEACHING LOGIC:
    # In Kochi, rain > 5mm/hr starts moving Nitrogen deep into the soil (Leaching)
    if current_rain > 5.0:
        penalty = 10.5  # Heavy impact
        status = f"LEACHING ALERT: {current_rain}mm rain at {KOCHI_LAT}N"
    elif current_rain > 0.1:
        penalty = -2.0  # Light rain is actually good for N-fixation!
        status = "Light Rain: Soil Hydration Optimal"
    else:
        penalty = 0.0
        status = "Clear Skies: No Leaching Risk"

    return penalty, status
=======
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
>>>>>>> 9fd566f16884294321c67a4bc4706bad38191879
