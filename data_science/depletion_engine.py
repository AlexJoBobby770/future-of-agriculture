import numpy as np

class DepletionEngine:
    def __init__(self, reserve_margin=0.1):
        self.reserve_margin = reserve_margin

    def get_days_to_depletion(self, current_v, daily_usage, et_rate, rain_forecast):
        usable_v = current_v * (1 - self.reserve_margin)
        net_loss = (daily_usage + et_rate) - rain_forecast
        
        if net_loss <= 0:
            return 999 
            
        return round(max(0, usable_v / net_loss), 1)