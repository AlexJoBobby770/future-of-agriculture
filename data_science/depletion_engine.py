import random
import math


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

    # ── Monte Carlo Stochastic Simulation ──────────────────────────────────
    def monte_carlo_depletion(
        self,
        current_v: float,
        daily_usage: float,
        et_rate: float,
        rain_forecast: list,
        n_simulations: int = 100,
        et_variance: float = 0.15,
    ) -> dict:
        """
        Risk-Adjusted AI: Run N stochastic simulations where the
        evapotranspiration rate varies by ±et_variance (default ±15%).

        This accounts for climate volatility — instead of a single
        deterministic depletion date, we get a probability distribution.

        Returns:
            {
                "simulations":          int,     # Number of runs
                "mean_days":            float,   # Average depletion date
                "std_days":             float,   # Standard deviation
                "p10_safe_deadline":    float,   # 10th percentile = Safe Harvest Deadline
                "p50_median":           float,   # 50th percentile
                "p90_optimistic":       float,   # 90th percentile (best case)
                "worst_case":           float,   # Minimum across all runs
                "best_case":            float,   # Maximum across all runs
                "risk_assessment":      str,     # Human-readable risk label
            }
        """
        results = []

        for _ in range(n_simulations):
            # Perturb ET rate by ±variance using uniform distribution
            perturbed_et = et_rate * (1.0 + random.uniform(-et_variance, et_variance))

            # Also perturb daily rain forecast slightly (±20%) to model rain uncertainty
            perturbed_rain = [
                max(0, r * (1.0 + random.uniform(-0.20, 0.20)))
                for r in rain_forecast
            ]

            days = self.get_days_to_depletion(
                current_v=current_v,
                daily_usage=daily_usage,
                et_rate=perturbed_et,
                rain_forecast=perturbed_rain,
            )
            results.append(days)

        # Sort for percentile calculation
        results.sort()

        # Statistics
        mean_days = sum(results) / len(results)
        variance = sum((x - mean_days) ** 2 for x in results) / len(results)
        std_days = math.sqrt(variance)

        # Percentiles (index-based)
        def percentile(data, pct):
            idx = int(len(data) * pct / 100)
            idx = min(idx, len(data) - 1)
            return data[idx]

        p10 = percentile(results, 10)
        p50 = percentile(results, 50)
        p90 = percentile(results, 90)

        # Risk assessment based on the 10th percentile (Safe Harvest Deadline)
        if p10 < 3:
            risk = "CRITICAL — Safe harvest deadline is under 3 days in 10% of climate scenarios"
        elif p10 < 7:
            risk = "HIGH — Significant risk of depletion within one week under adverse conditions"
        elif p10 < 14:
            risk = "MODERATE — Two-week buffer exists but climate volatility could erode it"
        else:
            risk = "LOW — Comfortable margin even under worst-case climate scenarios"

        return {
            "simulations": n_simulations,
            "mean_days": round(mean_days, 1),
            "std_days": round(std_days, 2),
            "p10_safe_deadline": round(p10, 1),
            "p50_median": round(p50, 1),
            "p90_optimistic": round(p90, 1),
            "worst_case": round(min(results), 1),
            "best_case": round(max(results), 1),
            "risk_assessment": risk,
        }