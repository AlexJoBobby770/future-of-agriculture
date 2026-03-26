"""
test_member2.py
Full test for all Member 2 deliverables.
Run from project root: python test_member2.py
"""

import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

PASS = "[PASS]"
FAIL = "[FAIL]"
WARN = "[WARN]"
SEP  = "-" * 55


def run_all():
    errors = []

    print(f"\n{'═'*55}")
    print("  AGRI-RESILIENT AI — Member 2 Full Test Suite")
    print(f"{'═'*55}\n")

    # ── TEST 1: Depletion Engine ─────────────────────────────────────────────
    print("TEST 1: Depletion Engine")
    print(SEP)
    try:
        from data_science.depletion_engine import DepletionEngine
        engine = DepletionEngine(reserve_margin=0.1)

        # Normal: 1200L, 40L use, 5L ET, 0 rain → should return ~26 days
        days = engine.get_days_to_depletion(1200, 40, 5, 0)
        assert isinstance(days, (int, float)), "days should be numeric"
        assert days > 0, "days should be positive"
        print(f"  {PASS} Normal scenario: {days} days until depletion")

        # Surplus: rain > usage → should return 999
        surplus = engine.get_days_to_depletion(1200, 10, 2, 50)
        assert surplus == 999, f"Expected 999 surplus, got {surplus}"
        print(f"  {PASS} Surplus scenario: {surplus} (rain exceeds usage)")

        # Critical: nearly empty tank
        critical = engine.get_days_to_depletion(100, 40, 5, 0)
        assert critical < 3, f"Expected < 3 days, got {critical}"
        print(f"  {PASS} Critical scenario: {critical} days")

        # 7-day forecast array: 1200L, 40L use, 5L ET, some rain
        forecast_rain = [0, 0, 50, 0, 0, 0, 0] # heavy rain on day 3
        days_array = engine.get_days_to_depletion(1200, 40, 5, forecast_rain)
        assert days_array > 24, "Rain in forecast should extend depletion days"
        print(f"  {PASS} Array Forecast scenario (7-day): {days_array} days")

        # Nutrient depletion math
        nutrients = engine.get_nutrient_days_to_depletion(50, 50, 50)
        assert "n_days" in nutrients and "p_days" in nutrients and "k_days" in nutrients, "Missing nutrient keys"
        assert nutrients["n_days"] > 0, "Nutrient days should be calculated properly"
        print(f"  {PASS} Nutrient depletion logic: N:{nutrients['n_days']}d, P:{nutrients['p_days']}d, K:{nutrients['k_days']}d")

    except Exception as e:
        print(f"  {FAIL} {e}")
        errors.append(f"Depletion Engine: {e}")
    print()

    # ── TEST 2: Price Predictor ──────────────────────────────────────────────
    print("TEST 2: Price Predictor")
    print(SEP)
    try:
        from data_science.price_predictor import analyze_price_trend

        upward = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
        result = analyze_price_trend(upward)
        assert result["trend"] == "Upward",    f"Expected Upward, got {result['trend']}"
        assert "risk_score" in result,         "risk_score key missing"
        assert result["risk_score"] in ("Low", "Medium", "High"), \
            f"Invalid risk_score: {result['risk_score']}"
        print(f"  {PASS} Upward trend: slope={result['slope']}, risk={result['risk_score']}")

        downward = [28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15]
        result2 = analyze_price_trend(downward)
        assert result2["trend"] == "Downward", f"Expected Downward, got {result2['trend']}"
        print(f"  {PASS} Downward trend: slope={result2['slope']}, risk={result2['risk_score']}")

        stable = [22, 22, 21, 22, 22, 23, 22, 22, 23, 22, 22, 22, 23, 22]
        result3 = analyze_price_trend(stable)
        assert result3["trend"] == "Stable",   f"Expected Stable, got {result3['trend']}"
        print(f"  {PASS} Stable trend: slope={result3['slope']}, risk={result3['risk_score']}")

    except Exception as e:
        print(f"  {FAIL} {e}")
        errors.append(f"Price Predictor: {e}")
    print()

    # ── TEST 3: Profit Matrix ────────────────────────────────────────────────
    print("TEST 3: Profit Matrix Algorithm")
    print(SEP)
    try:
        from data_science.profit_matrix import calculate_profit_score

        # Ideal conditions → expect high score
        perfect = calculate_profit_score(
            nitrogen=50, phosphorus=50, potassium=50,
            price_slope=3.0, days_until_water_depletion=40
        )
        assert perfect["success_score"] >= 70, \
            f"Ideal conditions should score ≥70, got {perfect['success_score']}"
        print(f"  {PASS} Ideal conditions: {perfect['success_score']}/100")
        print(f"        soil={perfect['soil_prob']}, market={perfect['market_factor']}, water={perfect['water_factor']}")
        print(f"        Recommendation: {perfect['recommendation'][:60]}...")

        # Drought + poor soil → expect low score
        poor = calculate_profit_score(
            nitrogen=10, phosphorus=10, potassium=10,
            price_slope=-2.0, days_until_water_depletion=1.5
        )
        assert poor["success_score"] < 30, \
            f"Poor conditions should score <30, got {poor['success_score']}"
        print(f"  {PASS} Poor conditions: {poor['success_score']}/100 (correctly low)")

        # Leaching penalty test
        no_leach = calculate_profit_score(50, 50, 50, 1.0, 20, leaching_active=False)
        leach    = calculate_profit_score(50, 50, 50, 1.0, 20, leaching_active=True)
        assert leach["success_score"] < no_leach["success_score"], \
            "Leaching should lower the score"
        print(f"  {PASS} Leaching penalty applied: {no_leach['success_score']} → {leach['success_score']}")

    except Exception as e:
        print(f"  {FAIL} {e}")
        errors.append(f"Profit Matrix: {e}")
    print()

    # ── TEST 4: Leaching / Success Matrix ────────────────────────────────────
    print("TEST 4: Success Matrix + Leaching")
    print(SEP)
    try:
        from data_science.success_matrix import calculate_leaching_impact

        # Heavy rain → leaching should fire
        n_after, msg = calculate_leaching_impact(50.0, rain_mm=15)
        assert n_after < 50.0,     "N should drop after heavy rain"
        assert "LEACHING" in msg,  "Warning message expected"
        print(f"  {PASS} Heavy rain: N {50.0} → {n_after}%")
        print(f"        {msg[:70]}...")

        # Light rain → no leaching
        n_stable, msg2 = calculate_leaching_impact(50.0, rain_mm=5)
        assert n_stable == 50.0,   "N should not drop with light rain"
        assert "stable" in msg2.lower()
        print(f"  {PASS} Light rain: N unchanged at {n_stable}%")

    except Exception as e:
        print(f"  {FAIL} {e}")
        errors.append(f"Success Matrix: {e}")
    print()

    # ── SUMMARY ──────────────────────────────────────────────────────────────
    print(f"{'═'*55}")
    if not errors:
        print(f"  {PASS} ALL TESTS PASSED — Member 2 logic is hackathon-ready!")
    else:
        print(f"  {FAIL} {len(errors)} test(s) failed:")
        for e in errors:
            print(f"    • {e}")
    print(f"{'═'*55}\n")
    return len(errors) == 0


if __name__ == "__main__":
    success = run_all()
    sys.exit(0 if success else 1)