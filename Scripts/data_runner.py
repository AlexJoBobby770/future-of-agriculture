import time
import json
import os
from integration.iot_simulator import AgriIoTSimulator
from integration.meteo_client import KochiAgriFetcher
from integration.market_client import MarketFetcher

# Paths for shared data
WEATHER_PATH = "integration/data/live_weather.json"
SENSOR_PATH = "integration/data/live_sensors.json"
MARKET_PATH = "integration/data/live_market.json"

os.makedirs("integration/data", exist_ok=True)

sim = AgriIoTSimulator(crop_id="paddy_01")
weather_client = KochiAgriFetcher()
market_client = MarketFetcher()

print("🚜 DATA RUNNER STARTING... Press Ctrl+C to stop.")

while True:
    try:
        # 1. Update Weather (7-day forecast included)
        w_data = weather_client.get_live_reality()
        with open(WEATHER_PATH, 'w') as f:
            json.dump(w_data, f, indent=4)

        # 2. Update Sensors (n, p, k keys)
        s_data = sim.get_packet()
        with open(SENSOR_PATH, 'w') as f:
            json.dump(s_data, f, indent=4)

        # 3. Update Market (Live Agmarknet)
        m_data = market_client.get_live_prices("paddy_01")
        with open(MARKET_PATH, 'w') as f:
            json.dump(m_data, f, indent=4)
            
        print(f"✅ Sync Complete | N: {s_data['n']} | Market: {m_data['price']} INR")
        time.sleep(5)
    except KeyboardInterrupt:
        break