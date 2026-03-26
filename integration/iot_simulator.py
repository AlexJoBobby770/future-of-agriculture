import random
import time
import json
import os

def generate_sensor_data():
    """Generates realistic soil and environment data."""
    data = {
        "timestamp": time.time(),
        "soil_moisture": round(random.uniform(20.0, 60.0), 2),
        "n": random.randint(30, 70),  # Nitrogen
        "p": random.randint(20, 50),  # Phosphorus
        "k": random.randint(40, 80),  # Potassium
        "temperature": round(random.uniform(15.0, 35.0), 2)
    }
    
    # Save it to the data folder so other modules can read it
    os.makedirs('integration/data', exist_ok=True)
    with open('integration/data/live_sensors.json', 'w') as f:
        json.dump(data, f, indent=4)
    return data

if __name__ == "__main__":
    while True:
        print(f"📡 Generating IoT Data: {generate_sensor_data()}")
        time.sleep(5) # Updates every 5 seconds