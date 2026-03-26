import os
import json
import random
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

    def load_crop_config(self, crop_id):
        with open(self.enc_path, 'r') as f:
            data = json.load(f)
            return next(c for c in data['crops'] if c['id'] == crop_id)

    def simulate_physics(self, weather):
        """Simulates Nitrogen leaching and Nutrient consumption."""
        # 1. Leaching (If soil is saturated)
        if weather['current']['soil_moisture_pct'] > 75:
            self.n -= random.uniform(0.1, 0.3)
        
        # 2. Consumption (If sunny)
        if weather['current']['sunlight_w_m2'] > 500:
            self.n -= 0.05
            self.k -= 0.08
        
        self.n = max(10, self.n) # Prevent negative values

    def get_packet(self):
        weather = self.fetcher.get_live_reality()
        self.simulate_physics(weather)

        # FIXED KEYS: Aligned with Member 2's success_matrix.py
        return {
            "timestamp": weather['timestamp'],
            "n": round(self.n, 2),
            "p": round(self.p, 2),
            "k": round(self.k, 2),
            "temperature": weather['current']['temp_c'],
            "soil_moisture": weather['current']['soil_moisture_pct'],
            "rain_mm": weather['current']['rain']
        }
