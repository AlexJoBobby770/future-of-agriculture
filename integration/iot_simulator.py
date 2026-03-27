import time
import json
import random
from integration.meteo_client import KochiAgriFetcher

class AgriIoTSimulator:
    """
    Member 3: The Virtual IoT Engine.
    This class generates 'Live' N-P-K and pH data by reacting to 
    real-world weather fetched from Kochi.
    """
    def __init__(self):
        self.fetcher = KochiAgriFetcher()
        
        # --- SOIL BASELINES (Normalized to 0-100% for UI) ---
        self.nitrogen = 85.0   # % relative health
        self.phosphorus = 42.0 # % relative health
        self.potassium = 75.0  # % relative health
        self.ph = 6.4           # Slightly acidic (typical for Kerala)

    def simulate_soil_dynamics(self, weather):
        """
        The 'Logic Engine': Changes soil chemistry based on weather.
        """
        # 1. NITROGEN LEACHING
        # If soil moisture is high (>75%), Nitrogen washes away.
        if 'current' in weather and weather['current'].get('soil_moisture_pct', 0) > 75:
            leach_rate = random.uniform(0.1, 0.4)
            self.nitrogen -= leach_rate
            
        # 2. NUTRIENT CONSUMPTION
        # If it's sunny (>500 W/m2), plants photosynthesize and 'eat' N-P-K.
        if 'current' in weather and weather['current'].get('sunlight_w_m2', 0) > 500:
            self.nitrogen -= 0.05
            self.phosphorus -= 0.02
            self.potassium -= 0.08

        # 3. PH FLUCTUATION
        # Rain or fertilization causes small shifts in pH.
        self.ph += random.uniform(-0.02, 0.02)
        
        # Hackathon "Wow-Factor" Sensor Jitter (Micro-fluctuations)
        self.nitrogen += random.uniform(-0.3, 0.3)
        self.phosphorus += random.uniform(-0.1, 0.1)
        self.potassium += random.uniform(-0.2, 0.2)
        
        # Inject micro-jitter into the weather object so the UI Temperature/Moisture gauges dance
        if 'current' in weather:
            current_temp = weather['current'].get('temp_c', 30.0)
            current_moisture = weather['current'].get('soil_moisture_pct', 35.0)
            weather['current']['temp_c'] = round(current_temp + random.uniform(-0.1, 0.1), 1)
            weather['current']['soil_moisture_pct'] = max(0, min(100, round(current_moisture + random.uniform(-0.5, 0.5), 1)))

        # 4. SAFETY BOUNDS
        # Ensure values stay within normalized 0-100 limits for the UI.
        self.nitrogen = max(10.0, min(self.nitrogen, 100.0))
        self.phosphorus = max(5.0, min(self.phosphorus, 100.0))
        self.potassium = max(10.0, min(self.potassium, 100.0))
        self.ph = max(4.0, min(self.ph, 9.0))

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
                "air_temp_c": reality['current']['temp_c'],
                "soil_moisture_pct": reality['current']['soil_moisture_pct'],
                "evap_rate_mm": reality['current']['evap_rate_mm']
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