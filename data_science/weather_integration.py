import os
import json
from dotenv import load_dotenv

# Load the .env file Member 3 gave you
load_dotenv()

KOCHI_LAT = os.getenv("KOCHI_LAT")
KOCHI_LON = os.getenv("KOCHI_LON")


def get_weather_impact():
    """
    Checks the local weather data (from Member 3's fetcher)
    and calculates the 'Leaching Penalty'.
    """
    path = os.path.join(
        os.path.dirname(__file__), "..", "integration", "data", "live_weather.json"
    )

    if not os.path.exists(path):
        return 0.0, "Weather Station Offline"

    with open(path, "r") as f:
        data = json.load(f)

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