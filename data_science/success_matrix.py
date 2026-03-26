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

def calculate_leaching_impact(current_n, rain_mm):
    """
    Member 3's Logic: Heavy rain washes away Nitrogen.
    If rain > 10mm, Nitrogen drops by 10%.
    """
    if rain_mm > 10:
        leached_n = current_n * 0.90 # 10% loss
        return round(leached_n, 2), "⚠️ LEACHING DETECTED: Heavy rain is washing away Nitrogen."
    return current_n, "✅ Soil stable."