from backend.services.rotation_service import recommend_rotation
from backend.models.schemas import RotationRequest

# Mocking the request from a farmer
test_data = RotationRequest(
    nitrogen=50.0,
    phosphorus=50.0,
    potassium=50.0,
    current_moisture=80.0,
    soil_type="loamy",
    current_rain=15.5  # Matches our mock weather
)

print("🧪 TESTING ROTATION LOGIC...")
response = recommend_rotation(test_data)

print(f"\n🌾 Recommended Crop: {response.recommended_crop}")
print(f"📈 Health Score: {response.soil_health_score}")
print(f"📝 Reason: {response.reason}")
print(f"🛠️ Next Action: {response.next_action}")