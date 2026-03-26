import json

def get_live_score():
    try:
        with open('integration/data/live_sensors.json', 'r') as f:
            data = json.load(f)
        
        # Simple Logic: Higher NPK and Moisture = Higher Score
        avg_npk = (data['n'] + data['p'] + data['k']) / 3
        moisture_factor = data['soil_moisture'] / 100
        
        final_score = (avg_npk * 0.7) + (moisture_factor * 30)
        return round(min(100, final_score), 1)
    except FileNotFoundError:
        return 0.0 # Data hasn't been generated yet