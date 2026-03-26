"""
data_science/climatology_db.py
Climatology-Informed Crop Recommender (Member 2)
Stores regional historical averages and cross-references them against Crop Tolerance Profiles.
"""

import json
import os

REGIONAL_NORMS = {
    "Kochi": {
        # High Humidity/Monsoon profile (Format: month: {temp, rain, humidity, flood_prob, heat_prob})
        1: {"temp": 27.5, "rain": 20.0, "humidity": 65.0, "extreme_heat_prob": 0.1, "flood_prob": 0.0},
        2: {"temp": 28.5, "rain": 25.0, "humidity": 68.0, "extreme_heat_prob": 0.2, "flood_prob": 0.0},
        3: {"temp": 29.5, "rain": 45.0, "humidity": 70.0, "extreme_heat_prob": 0.4, "flood_prob": 0.0},
        4: {"temp": 30.0, "rain": 115.0, "humidity": 75.0, "extreme_heat_prob": 0.5, "flood_prob": 0.1},
        5: {"temp": 29.5, "rain": 290.0, "humidity": 80.0, "extreme_heat_prob": 0.3, "flood_prob": 0.3},
        6: {"temp": 27.5, "rain": 700.0, "humidity": 88.0, "extreme_heat_prob": 0.0, "flood_prob": 0.8},
        7: {"temp": 27.0, "rain": 600.0, "humidity": 89.0, "extreme_heat_prob": 0.0, "flood_prob": 0.75},
        8: {"temp": 27.0, "rain": 400.0, "humidity": 87.0, "extreme_heat_prob": 0.0, "flood_prob": 0.5},
        9: {"temp": 27.5, "rain": 280.0, "humidity": 84.0, "extreme_heat_prob": 0.1, "flood_prob": 0.2},
        10: {"temp": 28.0, "rain": 260.0, "humidity": 80.0, "extreme_heat_prob": 0.1, "flood_prob": 0.2},
        11: {"temp": 28.0, "rain": 120.0, "humidity": 75.0, "extreme_heat_prob": 0.1, "flood_prob": 0.0},
        12: {"temp": 27.5, "rain": 40.0, "humidity": 68.0, "extreme_heat_prob": 0.1, "flood_prob": 0.0},
    },
    "Palakkad": {
        # Drier/Hotter profile
        1: {"temp": 28.0, "rain": 5.0, "humidity": 50.0, "extreme_heat_prob": 0.2, "flood_prob": 0.0},
        2: {"temp": 30.0, "rain": 10.0, "humidity": 48.0, "extreme_heat_prob": 0.4, "flood_prob": 0.0},
        3: {"temp": 33.0, "rain": 20.0, "humidity": 45.0, "extreme_heat_prob": 0.7, "flood_prob": 0.0},
        4: {"temp": 34.5, "rain": 50.0, "humidity": 50.0, "extreme_heat_prob": 0.8, "flood_prob": 0.0},
        5: {"temp": 32.5, "rain": 100.0, "humidity": 60.0, "extreme_heat_prob": 0.5, "flood_prob": 0.1},
        6: {"temp": 28.5, "rain": 350.0, "humidity": 75.0, "extreme_heat_prob": 0.1, "flood_prob": 0.4},
        7: {"temp": 28.0, "rain": 400.0, "humidity": 80.0, "extreme_heat_prob": 0.0, "flood_prob": 0.5},
        8: {"temp": 28.0, "rain": 250.0, "humidity": 78.0, "extreme_heat_prob": 0.0, "flood_prob": 0.3},
        9: {"temp": 29.0, "rain": 150.0, "humidity": 70.0, "extreme_heat_prob": 0.2, "flood_prob": 0.1},
        10: {"temp": 29.5, "rain": 180.0, "humidity": 68.0, "extreme_heat_prob": 0.2, "flood_prob": 0.2},
        11: {"temp": 29.0, "rain": 80.0, "humidity": 60.0, "extreme_heat_prob": 0.1, "flood_prob": 0.0},
        12: {"temp": 28.0, "rain": 15.0, "humidity": 55.0, "extreme_heat_prob": 0.1, "flood_prob": 0.0},
    }
}

class ClimaticMatchEngine:
    def __init__(self):
        # We need to know which crops are sensitive to what
        self.enc_path = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "agri_encyclopedia.json")
        try:
            with open(self.enc_path, 'r') as f:
                self.encyclopedia = json.load(f)
        except Exception:
            self.encyclopedia = {"crops": []}
            
    def get_crop_profile(self, crop_name):
        """High level classification based on biological tolerance categories."""
        name_lower = crop_name.lower()
        
        # 1. High Flood Tolerance (Wetland/High-Transpiration crops)
        if any(c in name_lower for c in ["paddy", "rice", "banana", "coconut", "arecanut"]):
            return {"heat_tolerance": "moderate", "flood_tolerance": "high", "drought_tolerance": "low"}
        
        # 2. Low Heat Tolerance (Plantation/Spices - need shade/low temp)
        elif any(c in name_lower for c in ["pepper", "cardamom", "ginger", "turmeric", "rubber"]):
            return {"heat_tolerance": "low", "flood_tolerance": "moderate", "drought_tolerance": "low"}
        
        # 3. High Drought Tolerance (Pulse/Tuber - xerophytic characteristics)
        elif any(c in name_lower for c in ["tapioca", "cassava", "tuber", "cowpea", "groundnut", "horsegram"]):
            return {"heat_tolerance": "high", "flood_tolerance": "low", "drought_tolerance": "high"}
            
        else:
            return {"heat_tolerance": "moderate", "flood_tolerance": "moderate", "drought_tolerance": "moderate"}

    def evaluate_crop(self, crop_name: str, region: str, month: int) -> dict:
        """
        Evaluates a crop against the historical Regional Profile.
        Returns a dict: { "score": float, "warning": str | None, "do_not_plant": bool }
        """
        # 1. Fetch the Regional Norms
        region_data = REGIONAL_NORMS.get(region)
        if not region_data:
            # Fallback if region unknown
            return {"score": 1.0, "warning": f"No climate normative data for region: {region}.", "do_not_plant": False}
            
        month_norms = region_data.get(month)
        if not month_norms:
             return {"score": 1.0, "warning": "Invalid month supplied. Assuming safe climate.", "do_not_plant": False}
             
        # 2. Cross-reference against Crop Tolerance
        profile = self.get_crop_profile(crop_name)
        
        score = 1.0
        warnings = []
        do_not_plant = False
        
        # Checking flood risk
        if month_norms["flood_prob"] >= 0.7:
            if profile["flood_tolerance"] == "low":
                do_not_plant = True
                warnings.append(f"SEVERE FLOOD RISK ({int(month_norms['flood_prob']*100)}%). {crop_name} roots will rot. DO NOT PLANT.")
                score *= 0.1
            elif profile["flood_tolerance"] == "moderate":
                warnings.append("High monsoon risk. Ensure excellent drainage.")
                score *= 0.6
        
        # Checking heat/drought risk
        if month_norms["extreme_heat_prob"] >= 0.7:
            if profile["heat_tolerance"] == "low" or profile["drought_tolerance"] == "low":
                do_not_plant = True
                warnings.append(f"EXTREME HEAT RISK ({int(month_norms['extreme_heat_prob']*100)}%). {crop_name} will wither. DO NOT PLANT.")
                score *= 0.1
            elif profile["heat_tolerance"] == "moderate":
                warnings.append("High heat expected. Supplemental irrigation mandatory.")
                score *= 0.7
                
        # Base climatology penalty
        if profile["heat_tolerance"] == "low" and month_norms["temp"] > 30.0:
            score *= 0.8
        if profile["flood_tolerance"] == "low" and month_norms["rain"] > 250:
            score *= 0.8
            
        warning_str = " | ".join(warnings) if warnings else None
        
        return {
            "score": float(score),
            "warning": warning_str,
            "do_not_plant": do_not_plant
        }
