from app import indicators
from app.state import PricePoint


def test_gold_silver_ratio():
    assert indicators.gold_silver_ratio(2350.0, 30.0) == 2350.0 / 30.0
    assert indicators.gold_silver_ratio(None, 30.0) is None
    assert indicators.gold_silver_ratio(2350.0, 0) is None


def test_pct_change_over():
    now = 1_000_000.0
    history = [
        PricePoint(now - 1000, 100.0),  # before the window
        PricePoint(now - 600, 100.0),   # at/just inside the cutoff baseline
        PricePoint(now - 10, 110.0),
        PricePoint(now, 110.0),
    ]
    # window 900s: baseline is the 100.0 point at-or-before now-900 -> +10%
    assert round(indicators.pct_change_over(history, 900, now), 4) == 10.0


def test_pct_change_empty():
    assert indicators.pct_change_over([], 900, 1.0) is None


def test_realized_vol_needs_points():
    assert indicators.realized_vol([], 30) is None
    flat = [PricePoint(i, 100.0) for i in range(5)]
    assert indicators.realized_vol(flat, 30) == 0.0
