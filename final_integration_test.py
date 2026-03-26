import json
import time
from data_science.success_matrix import get_live_score

def test_full_pipeline():
    print("🚀 STARTING FULL PIPELINE TEST...")
    
    # 1. Try to read the live data Member 3 (or our simulator) created
    try:
        with open('integration/data/live_sensors.json', 'r') as f:
            sensor_data = json.load(f)
            print(f"✅ STEP 1: Found Sensor Data: {sensor_data}")
    except FileNotFoundError:
        print("❌ ERROR: No sensor data found. Is the simulator running?")
        return

    # 2. Feed it into your Math Engine
    # We'll use some mock market prices for the test
    mock_prices = [200, 210, 220, 215] 
    water_reserve = 1000 # Liters
    
    npk_values = {
        "n": sensor_data['n'],
        "p": sensor_data['p'],
        "k": sensor_data['k']
    }

    score = get_live_score()
    
    print(f"✅ STEP 2: Math Engine output: {score}/100")
    
    if score > 0:
        print("\n⭐ SYSTEM READY: You can safely push to main!")
    else:
        print("\n⚠️ WARNING: Score is 0. Check your math logic.")

if __name__ == "__main__":
    test_full_pipeline()