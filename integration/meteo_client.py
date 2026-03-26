import os
import requests
from dotenv import load_dotenv
from datetime import datetime

# Load variables from .env
load_dotenv()

class KochiAgriFetcher:
    """
    Handles connection to Open-Meteo with safety checks for null values.
    """
    def __init__(self):
        self.lat = os.getenv("KOCHI_LAT")
        self.lon = os.getenv("KOCHI_LON")
        self.base_url = os.getenv("METEO_API_URL")
        # For the demo, ensure we know if config is missing
        print(f"DEBUG: URL={self.base_url}, LAT={self.lat}, LON={self.lon}")

    def _safe_val(self, data_list, index, default=0.0):
        """Helper to prevent 'NoneType * int' errors"""
        val = data_list[index]
        return float(val) if val is not None else default

    def get_live_reality(self):
        if not all([self.lat, self.lon, self.base_url]):
            return self._get_fallback_data("MISSING_ENV_CONFIG")

        params = {
            "latitude": self.lat,
            "longitude": self.lon,
            "hourly": ["temperature_2m", "soil_moisture_0_to_7cm", "et0_fao_evapotranspiration", "shortwave_radiation"],
            "daily": ["precipitation_sum"], # Needed for Member 2
            "timezone": "Asia/Kolkata",
            "forecast_days": 7
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            h = data['hourly']
            d = data['daily']

            return {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "current": {
                    "temp_c": self._safe_val(h['temperature_2m'], 0, 30.0),
                    # FIXED: Added safety check before the * 100
                    "soil_moisture_pct": round(self._safe_val(h['soil_moisture_0_to_7cm'], 0, 0.35) * 100, 2),
                    "evap_rate_mm": self._safe_val(h['et0_fao_evapotranspiration'], 0, 0.1),
                    "sunlight_w_m2": self._safe_val(h['shortwave_radiation'], 0, 0.0),
                    "rain": self._safe_val(d['precipitation_sum'], 0, 0.0)
                },
                "rain_forecast": d['precipitation_sum'], # 7-day array for Depletion Engine
                "status": "LIVE"
            }
        except Exception as e:
            print(f"API ERROR: {e}")
            return self._get_fallback_data(str(e))

    def _get_fallback_data(self, error):
        return {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "current": { "temp_c": 30.5, "soil_moisture_pct": 38.0, "evap_rate_mm": 0.3, "sunlight_w_m2": 450.0, "rain": 0.0 },
            "rain_forecast": [0.0, 2.0, 5.0, 0.0, 10.0, 0.0, 0.0],
            "status": f"OFFLINE_FALLBACK ({error})"
        }

if __name__ == "__main__":
    client = KochiAgriFetcher()
    print("--- 🌦️ Testing Live Weather API (Kochi) ---")
    res = client.get_live_reality()
    print(f"Status: {res['status']}")
    print(f"Current Rain: {res['current']['rain']}mm")
    print(f"Soil Moisture: {res['current']['soil_moisture_pct']}%")