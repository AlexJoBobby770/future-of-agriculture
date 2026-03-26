import os
import requests
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class MarketFetcher:
    def __init__(self):
        self.api_key = os.getenv("MARKET_API_KEY")
        self.base_url = os.getenv("MARKET_API_URL")
        # Maps crop IDs to Agmarknet commodity names
        self.crop_map = {
            "paddy_01": "Paddy(Dhan)(Common)",
            "coconut_01": "Coconut",
            "banana_01": "Banana - Green",
            "rubber_01": "Rubber"
        }

    def get_live_prices(self, crop_id="paddy_01"):
        commodity = self.crop_map.get(crop_id, "Coconut")
        params = {
            "api-key": self.api_key,
            "format": "json",
            "filters[state]": "Kerala",
            "filters[district]": "Ernakulam",
            "filters[commodity]": commodity
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            records = data.get("records", [])

            if not records:
                return self._get_fallback(commodity, "No local records")

            latest = records[0]
            return {
                "commodity": latest['commodity'],
                "market": latest['market'],
                "price": float(latest['modal_price']), # INR per Quintal
                "date": latest['arrival_date'],
                "status": "LIVE_MARKET"
            }
        except Exception as e:
            return self._get_fallback(commodity, str(e))

# integration/market_client.py

    def _get_fallback(self, commodity, reason):
        """Fixed fallback with all required keys for the test block"""
        return {
            "commodity": commodity,
            "market": "Kochi (Simulated)",
            "price": 2800.0 if commodity == "Coconut" else 1950.0,
            "unit": "INR/Quintal",  # Added this missing key
            "date": datetime.now().strftime("%d/%m/%Y"),
            "status": f"FALLBACK ({reason})"
        }

if __name__ == "__main__":
    fetcher = MarketFetcher()
    print("--- 🛒 Testing Live Market API (Kochi) ---")
    
    data = fetcher.get_live_prices("coconut_01")
    
    print(f"Status: {data['status']}")
    print(f"Commodity: {data['commodity']}")
    # This line won't crash now that 'unit' exists in the dictionary
    print(f"Current Price: {data['price']} {data.get('unit', 'INR/Quintal')}")
    print(f"As of Date: {data['date']}")