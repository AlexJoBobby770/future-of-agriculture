import numpy as np

class DepletionEngine:
    def __init__(self, reserve_margin=0.1):
        self.reserve_margin = reserve_margin

    def get_days_to_depletion(self, current_v, daily_usage, et_rate, rain_forecast):
        usable_v = current_v * (1 - self.reserve_margin)
        
        # Handle 7-day weather forecast array
        if isinstance(rain_forecast, (list, tuple)):
            days_passed = 0
            current_usable = usable_v
            
            for rain in rain_forecast:
                net_loss = (daily_usage + et_rate) - rain
                current_usable -= net_loss
                days_passed += 1
                if current_usable <= 0:
                    return float(days_passed)
                    
            avg_rain = sum(rain_forecast) / len(rain_forecast) if len(rain_forecast) > 0 else 0
            avg_net_loss = (daily_usage + et_rate) - avg_rain
            
            if avg_net_loss <= 0:
                return 999.0
            
            remaining_days = current_usable / avg_net_loss
            return round(days_passed + remaining_days, 1)
            
        # Fallback for single daily average value
        else:
            net_loss = (daily_usage + et_rate) - rain_forecast
            if net_loss <= 0:
                return 999 
            return round(max(0, usable_v / net_loss), 1)

    def get_nutrient_days_to_depletion(self, current_n, current_p, current_k, daily_loss_n=0.5, daily_loss_p=0.2, daily_loss_k=0.3):
        """
        Estimates days until major soil nutrients (N, P, K) deplete to critical levels (< 20%).
        """
        def days_to_threshold(current, loss_rate, threshold=20.0):
            if current <= threshold:
                return 0.0
            if loss_rate <= 0:
                return 999.0
            return round((current - threshold) / loss_rate, 1)
            
        return {
            "n_days": days_to_threshold(current_n, daily_loss_n),
            "p_days": days_to_threshold(current_p, daily_loss_p),
            "k_days": days_to_threshold(current_k, daily_loss_k)
        }