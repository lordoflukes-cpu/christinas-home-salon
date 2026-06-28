from app.sizing import atr_position_size


def test_sizing_risks_exactly_risk_frac():
    # equity 20000, risk 0.5%, ATR 10, stop 2x => risk_per_unit=20 => 100 units risks $100.
    units = atr_position_size(20_000, 0.005, atr=10.0, stop_atr_mult=2.0, point_value=1.0)
    assert round(units, 6) == 5.0  # 100 / 20
    # the dollar risk at the stop equals risk_frac * equity
    assert round(units * 10.0 * 2.0, 2) == 100.0


def test_sizing_degenerate_inputs_return_zero():
    assert atr_position_size(20_000, 0.005, atr=0.0, stop_atr_mult=2.0) == 0.0
    assert atr_position_size(0, 0.005, atr=10, stop_atr_mult=2.0) == 0.0
    assert atr_position_size(20_000, 0, atr=10, stop_atr_mult=2.0) == 0.0
    assert atr_position_size(20_000, 0.005, atr=None, stop_atr_mult=2.0) == 0.0
