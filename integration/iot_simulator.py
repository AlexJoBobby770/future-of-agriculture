import time
import json
import random
from meteo_client import KochiAgriFetcher

class AgriIoTSimulator:
    """
    Member 3: The Virtual IoT Engine.
    This class generates 'Live' N-P-K and pH data by reacting to 
    real-world weather fetched from Kochi.
    """
    def __init__(self):
        self.fetcher = KochiAgriFetcher()
        
        # --- SOIL BASELINES (Kochi/Ernakulam Averages) ---
        self.nitrogen = 280.5   # kg/ha (Target for Paddy/Rubber)
        self.phosphorus = 42.0  # kg/ha
        self.potassium = 155.0  # kg/ha
        self.ph = 6.4           # Slightly acidic (typical for Kerala)

    def simulate_soil_dynamics(self, weather):
        """
        The 'Logic Engine': Changes soil chemistry based on weather.
        """
        # 1. NITROGEN LEACHING
        # If soil moisture is high (>75%), Nitrogen washes away.
        if weather['soil_moisture_pct'] > 75:
            leach_rate = random.uniform(0.1, 0.4)
            self.nitrogen -= leach_rate
            
        # 2. NUTRIENT CONSUMPTION
        # If it's sunny (>500 W/m2), plants photosynthesize and 'eat' N-P-K.
        if weather['sunlight_w_m2'] > 500:
            self.nitrogen -= 0.05
            self.phosphorus -= 0.02
            self.potassium -= 0.08

        # 3. PH FLUCTUATION
        # Rain or fertilization causes small shifts in pH.
        self.ph += random.uniform(-0.01, 0.01)

        # 4. SAFETY BOUNDS
        # Ensure values stay within realistic agricultural limits.
        self.nitrogen = max(40.0, self.nitrogen)
        self.ph = max(4.5, min(8.5, self.ph))

    def get_sensor_packet(self):
        """Combines Real API Senses with Simulated Soil Brain."""
        # Step 1: Get the 'Reality' from Kochi
        reality = self.fetcher.get_live_reality()
        
        # Step 2: Evolve the soil based on that reality
        self.simulate_soil_dynamics(reality)

        # Step 3: Package the JSON for Member 1 & 2
        return {
            "header": {
                "device_id": "AISAT-KOCHI-FIELD-01",
                "timestamp": reality['timestamp'],
                "status": reality['status']
            },
            "environment": {
                "air_temp_c": reality['temp_c'],
                "soil_moisture_pct": reality['soil_moisture_pct'],
                "evap_rate_mm": reality['evap_rate_mm']
            },
            "soil_nutrients": {
                "n": round(self.nitrogen, 2),
                "p": round(self.phosphorus, 2),
                "k": round(self.potassium, 2),
                "ph": round(self.ph, 2)
            }
        }

# --- TEST LOOP ---
if __name__ == "__main__":
    sim = AgriIoTSimulator()
    print("🚜 Agri-Resilient IoT Simulator is LIVE...")
    print("Press Ctrl+C to stop.\n")
    
    try:
        # Simulate a reading every 3 seconds for the demo
        for i in range(5):
            packet = sim.get_sensor_packet()
            print(f"Reading #{i+1} | N: {packet['soil_nutrients']['n']} | Moist: {packet['environment']['soil_moisture_pct']}%")
            # In a real setup, you'd POST this to Member 1's API here.
            time.sleep(3)
    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")