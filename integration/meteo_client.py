import requests
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class KochiAgriFetcher:
    """
    Member 3: The Reality Anchor.
    This class handles the connection to Open-Meteo for Kochi-specific data.
    """
    def __init__(self):
        # Exact coordinates for Kochi, Kerala
        self.lat = float(os.getenv("KOCHI_LAT"))
        self.lon = float(os.getenv("KOCHI_LON"))
        self.base_url = os.getenv("METEO_API_URL")

        
    def get_live_reality(self):
        """Fetches real-time agricultural metrics from Open-Meteo."""
        params = {
            "latitude": self.lat,
            "longitude": self.lon,
            "hourly": [
                "temperature_2m", 
                "soil_moisture_0_to_7cm", 
                "et0_fao_evapotranspiration", 
                "shortwave_radiation"
            ],
            "timezone": "Asia/Kolkata",
            "forecast_days": 1
        }

        try:
            # We use a timeout so the app doesn't hang if the internet is slow
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Index [0] represents the current hour's data
            hourly = data['hourly']
            
            return {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "temp_c": hourly['temperature_2m'][0],
                "soil_moisture_pct": round(hourly['soil_moisture_0_to_7cm'][0] * 100, 2),
                "evap_rate_mm": hourly['et0_fao_evapotranspiration'][0],
                "sunlight_w_m2": hourly['shortwave_radiation'][0],
                "location": "Kochi, IN",
                "status": "LIVE"
            }

        except Exception as e:
            # Proper Fallback Mode: Keeps the demo running if Wi-Fi fails
            return {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "temp_c": 30.5,
                "soil_moisture_pct": 38.0,
                "evap_rate_mm": 0.3,
                "sunlight_w_m2": 450.0,
                "location": "Kochi (Simulated)",
                "status": "OFFLINE_FALLBACK"
            }

# This part lets you test just this file by running: python scripts/meteo_client.py
if __name__ == "__main__":
    client = KochiAgriFetcher()
    print("--- Testing Open-Meteo Connection ---")
    print(client.get_live_reality())