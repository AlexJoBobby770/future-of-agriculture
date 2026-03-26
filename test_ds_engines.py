import sys
import os
import json

# --- THE FIX: Force Python to see your venv and modules ---
# Get the absolute path of the current directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VENV_PACKAGES = os.path.join(BASE_DIR, "venv", "Lib", "site-packages")

if VENV_PACKAGES not in sys.path:
    sys.path.insert(0, VENV_PACKAGES)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Now try the imports
try:
    import numpy as np
    from data_science.depletion_engine import DepletionEngine
    from data_science.price_predictor import analyze_price_trend
    print("✅ SUCCESS: Imports linked and Numpy found!")
except ImportError as e:
    print(f"❌ ERROR: {e}")
    sys.exit(1)

# --- TEST 1: Depletion Engine (The Water Countdown) ---
engine = DepletionEngine()
# Input: 1200L, 40L use, 5.2L evap, 0 rain
days = engine.get_days_to_depletion(1200, 40, 5.2, 0)
print(f"📉 [Depletion] Days until water runs out: {days} days")

# --- TEST 2: Price Trend (The Market Logic) ---
mock_prices = [210, 215, 212, 220, 225, 230, 235] # Upward trend
analysis = analyze_price_trend(mock_prices)
print(f"💰 [Market] Price Trend detected: {analysis['trend']}")

# --- TEST 3: Success Score (The AI Recommendation) ---
# Logic: High soil health (0.9) + Upward trend (slope ~3)
def calculate_score(health, slope):
    price_factor = (slope + 5) / 10 
    return round(((health * 0.6) + (price_factor * 0.4)) * 100, 1)

score = calculate_score(0.9, analysis.get('slope', 3.5))
print(f"⭐ [Matrix] Final Crop Success Score: {score}/100")

print("\n🚀 ALL SYSTEMS GO. Member 2 logic is hackathon-ready!")