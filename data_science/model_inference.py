"""
data_science/model_inference.py
Euclidean Distance Matcher — KNN-style crop fit scoring.

Compares a live N-P-K soil vector against a dictionary of Ideal Crop Centroids
and returns a ranked list of crops with Softmax confidence probabilities.

Mathematical foundation:
  1. Euclidean distance:  d = sqrt((N1-N2)^2 + (P1-P2)^2 + (K1-K2)^2)
  2. Inverse distance:    score_i = 1 / (d_i + epsilon)
  3. Softmax normalisation: P(crop_i) = exp(score_i) / sum(exp(score_j) for all j)

This is the foundation of K-Nearest Neighbors (KNN). The AI is mathematically
finding the "best fit" soil profile for each crop.
"""

import math

# ── Ideal N-P-K centroids for each crop (kg/ha or %) ──────────────────────────
# Source: Agri-encyclopaedia + agronomic research baselines.
# The vector represents [Nitrogen, Phosphorus, Potassium].
CROP_CENTROIDS: dict[str, list[float]] = {
    "Ginger":             [60, 50, 80],
    "Cowpea (Legume)":    [20, 40, 20],
    "Rice / Wheat":       [80, 50, 50],
    "Mustard":            [40, 20, 30],
    "Banana / Plantain":  [60, 30, 70],
    "Horsegram":          [15, 25, 15],
    "Tapioca / Cassava":  [50, 40, 60],
    "Groundnut":          [25, 60, 30],
    "Green Manure":       [35, 35, 35],
    "Black Pepper":       [50, 40, 60],
    "Cardamom":           [55, 45, 70],
    "Coconut":            [45, 35, 65],
}

# Epsilon to avoid division by zero in inverse distance
_EPSILON = 1e-6

# Temperature parameter for softmax sharpness
# Lower = sharper (more confident), higher = more uniform
_SOFTMAX_TEMPERATURE = 10.0


def euclidean_distance(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Compute Euclidean distance between two N-dimensional vectors.
    d(a, b) = sqrt(sum((a_i - b_i)^2))
    """
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(vec_a, vec_b)))


def compute_crop_distances(
    n: float, p: float, k: float
) -> dict[str, float]:
    """
    Compute Euclidean distance from the input soil vector to each crop centroid.
    Returns a dict: {crop_name: distance}.
    """
    soil_vector = [n, p, k]
    return {
        crop: round(euclidean_distance(soil_vector, centroid), 2)
        for crop, centroid in CROP_CENTROIDS.items()
    }


def inverse_distance_scores(distances: dict[str, float]) -> dict[str, float]:
    """
    Convert distances to scores using inverse distance weighting.
    score_i = 1 / (distance_i + epsilon)
    Closer distance → higher score.
    """
    return {
        crop: round(1.0 / (dist + _EPSILON), 4)
        for crop, dist in distances.items()
    }


def softmax_probabilities(
    distances: dict[str, float],
    temperature: float = _SOFTMAX_TEMPERATURE,
) -> dict[str, float]:
    """
    Apply Softmax normalisation to convert distances into probability distribution.

    P(crop_i) = exp(-d_i / T) / sum(exp(-d_j / T) for all j)

    We negate the distance so that CLOSER crops get HIGHER probability.
    Temperature T controls sharpness:
      T → 0: all probability on closest crop
      T → ∞: uniform distribution

    Returns: {crop_name: probability} summing to 1.0
    """
    # Compute raw exponents (negate distance so smaller distance = larger exponent)
    raw = {crop: -dist / temperature for crop, dist in distances.items()}

    # Subtract max for numerical stability (log-sum-exp trick)
    max_val = max(raw.values())
    exp_vals = {crop: math.exp(val - max_val) for crop, val in raw.items()}

    # Normalise
    total = sum(exp_vals.values())
    return {
        crop: round(exp_v / total, 4)
        for crop, exp_v in exp_vals.items()
    }


def match_best_crop(
    n: float, p: float, k: float
) -> dict:
    """
    Full KNN-style inference pipeline.

    Args:
        n: Current soil nitrogen (kg/ha or %)
        p: Current soil phosphorus
        k: Current soil potassium

    Returns:
        {
            "best_crop":       str,
            "confidence":      float,  # 0.0 – 1.0 (softmax probability)
            "uncertainty_flag": str | None,
            "all_scores":      [{crop, distance, probability}, ...] (sorted best→worst)
        }
    """
    distances = compute_crop_distances(n, p, k)
    probabilities = softmax_probabilities(distances)

    # Sort by probability descending
    ranked = sorted(
        [
            {"crop": crop, "distance": distances[crop], "probability": prob}
            for crop, prob in probabilities.items()
        ],
        key=lambda x: x["probability"],
        reverse=True,
    )

    best = ranked[0]
    confidence = best["probability"]

    # Uncertainty flag
    if confidence < 0.5:
        flag = "Low Certainty - Soil Amendment Required"
    else:
        flag = None

    return {
        "best_crop": best["crop"],
        "confidence": confidence,
        "uncertainty_flag": flag,
        "all_scores": ranked,
    }
