import time
import json
import random
import os
from meteo_client import KochiAgriFetcher


class AgriIoTSimulator:
    def __init__(self, crop_id="paddy_01"):
        self.fetcher = KochiAgriFetcher()
        self.crop_id = crop_id

        # Load the Encyclopedia to get real baselines
        self.crop_data = self.load_crop_config(crop_id)

        # Initialize Soil Baselines from the JSON data
        # We start at the "Optimal" level defined in your Encyclopedia
        self.n = float(self.crop_data['optimal_conditions']['nitrogen_req']['kg_per_ha'])
        self.p = float(self.crop_data['optimal_conditions']['phosphorus_req']['kg_per_ha'])
        self.k = float(self.crop_data['optimal_conditions']['potassium_req']['kg_per_ha'])
        self.ph = float(self.crop_data['optimal_conditions']['ph_range']['min'] + 0.5)

    def load_crop_config(self, crop_id):
        """Reads the Encyclopedia JSON and finds the specific crop."""
        # FIXED PATH: encyclopedia is at backend/data/agri_encyclopedia.json
        file_path = os.path.join(
            os.path.dirname(__file__), '..', 'backend', 'data', 'agri_encyclopedia.json'
        )
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                for crop in data['crops']:
                    if crop['id'] == crop_id:
                        return crop
            print(f"[WARN] Crop {crop_id} not found. Defaulting to first crop.")
            return data['crops'][0]
        except Exception as e:
            print(f"[ERROR] Error loading agri_encyclopedia.json: {e}")
            # Fallback defaults so the simulator doesn't crash
            return {
                "name": "Fallback Crop",
                "id": crop_id,
                "water_intensity": 5,
                "optimal_conditions": {
                    "nitrogen_req": {"kg_per_ha": 50},
                    "phosphorus_req": {"kg_per_ha": 30},
                    "potassium_req": {"kg_per_ha": 40},
                    "ph_range": {"min": 5.5, "max": 7.0},
                },
            }

    def simulate_physics(self, weather):
        """Logic: How the soil changes based on Weather + Crop Intensity."""
        # Get 'Water Intensity' from our JSON (e.g., Paddy is 9/10)
        intensity = self.crop_data.get('water_intensity', 5)

        # 1. Nitrogen Leaching (Faster if soil is wet)
        if weather['soil_moisture_pct'] > 70:
            self.n -= (self.n * 0.002)

        # 2. Nutrient Uptake (Plants eat more when it's sunny)
        if weather['sunlight_w_m2'] > 400:
            consumption_factor = intensity / 10.0
            self.n -= (0.05 * consumption_factor)
            self.k -= (0.1 * consumption_factor)

        # 3. pH Drift (Small random walk)
        self.ph += random.uniform(-0.01, 0.01)

    def get_packet(self):
        """The final JSON payload for Member 1 & 2."""
        weather = self.fetcher.get_live_reality()
        self.simulate_physics(weather)

        return {
            "sensor_metadata": {
                "field_id": f"KOCHI_{self.crop_id.upper()}_01",
                "crop_active": self.crop_data['name'],
                "timestamp": weather['timestamp']
            },
            "live_environment": {
                "temp": weather['temp_c'],
                "humidity_index": weather['soil_moisture_pct'],
                "evap_rate": weather['evap_rate_mm']
            },
            "soil_nutrients": {
                "n_kg_ha": round(self.n, 2),
                "p_kg_ha": round(self.p, 2),
                "k_kg_ha": round(self.k, 2),
                "ph": round(self.ph, 2)
            },
            "api_status": weather['status']
        }

    def write_live_sensors(self, packet):
        """
        Write a legacy-compatible live_sensors.json that Member 2's
        data_science modules (success_matrix, profit_matrix) depend on.
        """
        legacy = {
            "timestamp": time.time(),
            "soil_moisture": packet["live_environment"]["humidity_index"],
            "n": packet["soil_nutrients"]["n_kg_ha"],
            "p": packet["soil_nutrients"]["p_kg_ha"],
            "k": packet["soil_nutrients"]["k_kg_ha"],
            "temperature": packet["live_environment"]["temp"],
            "ph": packet["soil_nutrients"]["ph"],
            "rain_mm": 0.0,  # Will be enriched by meteo_client's weather data
        }
        out_path = os.path.join(os.path.dirname(__file__), 'data', 'live_sensors.json')
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'w') as f:
            json.dump(legacy, f, indent=4)


if __name__ == "__main__":
    sim = AgriIoTSimulator(crop_id="banana_01")
    print(f"[IoT] Simulation started for: {sim.crop_data['name']}")
    print(f"[IoT] Writing live_sensors.json every 5 seconds...")

    while True:
        data = sim.get_packet()
        sim.write_live_sensors(data)
        print(f"[IoT] {data['sensor_metadata']['timestamp']} | "
              f"N:{data['soil_nutrients']['n_kg_ha']} "
              f"P:{data['soil_nutrients']['p_kg_ha']} "
              f"K:{data['soil_nutrients']['k_kg_ha']} "
              f"pH:{data['soil_nutrients']['ph']} "
              f"| {data['api_status']}")
        time.sleep(5)