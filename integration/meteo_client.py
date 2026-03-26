import os
import requests
from dotenv import load_dotenv
from datetime import datetime

# Load variables from .env
load_dotenv()

class KochiAgriFetcher:
    """
    Handles connection to Open-Meteo.
    Fetches hourly current data and 7-day daily rain forecasts.
    """
    def __init__(self):
        self.lat = os.getenv("KOCHI_LAT")
        self.lon = os.getenv("KOCHI_LON")
        self.base_url = os.getenv("METEO_API_URL")

    def get_live_reality(self):
        if not all([self.lat, self.lon, self.base_url]):
            return self._get_fallback_data("MISSING_ENV_CONFIG")

        params = {
            "latitude": self.lat,
            "longitude": self.lon,
            "hourly": ["temperature_2m", "soil_moisture_0_to_7cm", "et0_fao_evapotranspiration", "shortwave_radiation"],
            "daily": ["precipitation_sum"],
            "timezone": "Asia/Kolkata",
            "forecast_days": 7
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            moisture_val = data['hourly']['soil_moisture_0_to_7cm'][0]
            if moisture_val is None:
                moisture_val = 0.35

            return {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "current": {
                    "temp_c": data['hourly']['temperature_2m'][0],
                    "soil_moisture_pct": round(moisture_val * 100, 2),
                    "evap_rate_mm": data['hourly']['et0_fao_evapotranspiration'][0],
                    "sunlight_w_m2": data['hourly']['shortwave_radiation'][0],
                    "rain": data['daily']['precipitation_sum'][0] # Today's rain
                },
                "rain_forecast": data['daily']['precipitation_sum'], # 7-day array for Member 2
                "status": "LIVE"
            }
        except Exception as e:
            return self._get_fallback_data(str(e))

    def _get_fallback_data(self, error):
        return {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "current": { "temp_c": 30.0, "soil_moisture_pct": 35.0, "evap_rate_mm": 0.3, "sunlight_w_m2": 450.0, "rain": 0.0 },
            "rain_forecast": [0.0, 2.0, 5.0, 0.0, 10.0, 0.0, 0.0],
            "status": f"OFFLINE_FALLBACK ({error})"
        }