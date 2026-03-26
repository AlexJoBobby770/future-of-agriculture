import os
import json
import random
import time
from integration.meteo_client import KochiAgriFetcher


class AgriIoTSimulator:
    def __init__(self, crop_id="paddy_01"):
        self.fetcher = KochiAgriFetcher()
        self.crop_id = crop_id
        
        # FIXED PATH: Points to backend/data/agri_encyclopedia.json
        self.enc_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'agri_encyclopedia.json')
        self.crop_data = self.load_crop_config(crop_id)
        
        # Nutrient Baselines
        self.n = float(self.crop_data['optimal_conditions']['nitrogen_req']['kg_per_ha'])
        self.p = float(self.crop_data['optimal_conditions']['phosphorus_req']['kg_per_ha'])
        self.k = float(self.crop_data['optimal_conditions']['potassium_req']['kg_per_ha'])
        self.ph = 6.5 # Default starting pH

    def load_crop_config(self, crop_id):
        try:
            with open(self.enc_path, 'r') as f:
                data = json.load(f)
                return next((c for c in data['crops'] if c['id'] == crop_id), data['crops'][0])
        except Exception:
            # Fallback for startup
            return {
                "name": "Paddy", "id": "paddy_01",
                "optimal_conditions": {
                    "nitrogen_req": {"kg_per_ha": 80},
                    "phosphorus_req": {"kg_per_ha": 40},
                    "potassium_req": {"kg_per_ha": 40}
                }
            }

    def simulate_physics(self, weather):
        """Simulates Nitrogen leaching and Nutrient consumption."""
        current = weather.get('current', {})
        # 1. Leaching (If soil is saturated)
        if current.get('soil_moisture_pct', 0) > 75:
            self.n -= random.uniform(0.1, 0.3)
        
        # 2. Consumption (If sunny)
        if current.get('sunlight_w_m2', 0) > 500:
            self.n -= 0.05
            self.k -= 0.08
        
        # 3. Small drift for pH
        self.ph += random.uniform(-0.02, 0.02)
        
        # 4. Hackathon "Wow-Factor" Sensor Jitter (Micro-fluctuations)
        self.n += random.uniform(-0.3, 0.3)
        self.p += random.uniform(-0.1, 0.1)
        self.k += random.uniform(-0.2, 0.2)
        
        # Inject micro-jitter into the weather object so the UI Temperature/Moisture gauges dance
        if 'current' in weather:
            weather['current']['temp_c'] = round(weather['current'].get('temp_c', 30.0) + random.uniform(-0.1, 0.1), 1)
            weather['current']['soil_moisture_pct'] = round(weather['current'].get('soil_moisture_pct', 35.0) + random.uniform(-0.5, 0.5), 1)
            # Ensure moisture stays in bounds
            weather['current']['soil_moisture_pct'] = max(0, min(100, weather['current']['soil_moisture_pct']))
        
        self.n = max(10, min(self.n, 150)) # Prevent negative values and unrealistic spikes
        self.p = max(5, min(self.p, 100))
        self.k = max(10, min(self.k, 100))
        self.ph = max(4.0, min(self.ph, 9.0))

    def get_packet(self):
        self.last_weather = self.fetcher.get_live_reality()
        self.simulate_physics(self.last_weather)

        # Keys aligned with both Member 1 (API) and Member 2 (Success Matrix)
        return {
            "timestamp": self.last_weather['timestamp'],
            "n": round(self.n, 2),
            "p": round(self.p, 2),
            "k": round(self.k, 2),
            "ph": round(self.ph, 2),
            "temperature": self.last_weather['current']['temp_c'],
            "soil_moisture": self.last_weather['current']['soil_moisture_pct'],
            "rain_mm": self.last_weather['current']['rain']
        }

    def write_live_sensors(self, packet):
        """Writes for success_matrix.py to consume."""
        out_path = os.path.join(os.path.dirname(__file__), 'data', 'live_sensors.json')
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'w') as f:
            json.dump(packet, f, indent=4)
            
        # Also write the raw weather payload for the rotation service
        weather_path = os.path.join(os.path.dirname(__file__), 'data', 'live_weather.json')
        if hasattr(self, 'last_weather') and self.last_weather:
            with open(weather_path, 'w') as f:
                json.dump(self.last_weather, f, indent=4)


if __name__ == "__main__":
    sim = AgriIoTSimulator(crop_id="paddy_01")
    print(f"[IoT] Simulation started for: {sim.crop_data['name']}")
    
    while True:
        try:
            packet = sim.get_packet()
            sim.write_live_sensors(packet)
            print(f"[IoT] {packet['timestamp']} | N:{packet['n']} P:{packet['p']} K:{packet['k']} | Moisture:{packet['soil_moisture']}%")
        except Exception as e:
            print(f"[IoT Error] {e}")
        time.sleep(5)
