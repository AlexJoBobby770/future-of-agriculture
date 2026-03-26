import numpy as np

class DepletionEngine:
    def __init__(self, reserve_margin=0.1):
        self.reserve_margin = reserve_margin

    def get_days_to_depletion(self, current_v, daily_usage, et_rate, rain_forecast):
        """
        Calculates days until a resource (water/nutrients) hits the reserve limit.
        et_rate: Evapotranspiration (water lost to sun/wind)
        rain_forecast: Predicted rain (water gained)
        """
        usable_v = current_v - (current_v * self.reserve_margin)
        net_daily_loss = (daily_usage + et_rate) - rain_forecast

        # If it's raining more than we use, we have infinite days (for now)
        if net_daily_loss <= 0:
            return 999 
        
        days_remaining = usable_v / net_daily_loss
        return round(max(0, days_remaining), 1)

# Quick Test logic
if __name__ == "__main__":
    engine = DepletionEngine()
    # 1000L tank, 50L used/day, 5L lost to heat, 0 rain
    print(f"Days left: {engine.get_days_to_depletion(1000, 50, 5, 0)}")