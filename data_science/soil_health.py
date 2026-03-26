def calculate_soil_health(n, p, k):
    """
    Normalizes N-P-K values (0-100) into a single 0.0-1.0 health index.
    Ideal ranges for general crops: N: 50, P: 50, K: 50
    """
    # Calculate how far we are from 'Ideal' (50) for each nutrient
    n_score = 1 - (abs(50 - n) / 50)
    p_score = 1 - (abs(50 - p) / 50)
    k_score = 1 - (abs(50 - k) / 50)
    
    # Average them out (weighted)
    overall_health = (n_score + p_score + k_score) / 3
    return round(max(0, overall_health), 2)