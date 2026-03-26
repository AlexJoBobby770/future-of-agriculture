import time
import json
import os
from integration.iot_simulator import AgriIoTSimulator
from integration.meteo_client import KochiAgriFetcher

# Ensure data directory exists
os.makedirs("integration/data", exist_ok=True)

WEATHER_PATH = "integration/data/live_weather.json"
SENSOR_PATH = "integration/data/live_sensors.json"

sim = AgriIoTSimulator(crop_id="paddy_01")
client = KochiAgriFetcher()

print("🚜 DATA RUNNER ACTIVE: Refreshing every 5 seconds...")

while True:
    try:
        # 1. Update Weather File
        weather = client.get_live_reality()
        with open(WEATHER_PATH, 'w') as f:
            json.dump(weather, f, indent=4)

        # 2. Update Sensor File
        sensor_packet = sim.get_packet()
        with open(SENSOR_PATH, 'w') as f:
            json.dump(sensor_packet, f, indent=4)
            
        print(f"✅ Refresh: N={sensor_packet['n']} | Soil Moist={sensor_packet['soil_moisture']}%")
        time.sleep(5)
    except KeyboardInterrupt:
        print("\nStopping Data Runner...")
        break