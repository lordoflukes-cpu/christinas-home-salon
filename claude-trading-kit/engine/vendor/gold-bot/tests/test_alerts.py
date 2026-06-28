from app.alerts.engine import AlertEngine
from app.state import StateStore


def _state_with_ratio(xau, xag):
    s = StateStore()
    s.update_price("XAU/USD", xau)
    s.update_price("XAG/USD", xag)
    return s


def test_ratio_high_fires_once_then_cools_down():
    engine = AlertEngine(cooldown_sec=300)
    state = _state_with_ratio(2000.0, 20.0)  # ratio 100 >= ratio_high (90)

    first = engine.evaluate(state)
    keys = {a["key"] for a in first}
    assert "ratio:high" in keys

    # Immediate re-eval: cooldown suppresses the repeat.
    second = engine.evaluate(state)
    assert "ratio:high" not in {a["key"] for a in second}


def test_ratio_low_fires():
    engine = AlertEngine()
    state = _state_with_ratio(2000.0, 50.0)  # ratio 40 <= ratio_low (50)
    keys = {a["key"] for a in engine.evaluate(state)}
    assert "ratio:low" in keys


def test_kill_switch_alert():
    engine = AlertEngine()
    state = _state_with_ratio(2350.0, 34.0)  # ratio ~69, no ratio alert
    state.kill_switch = True
    keys = {a["key"] for a in engine.evaluate(state)}
    assert "kill:switch" in keys


def test_no_spurious_alerts_in_normal_band():
    engine = AlertEngine()
    state = _state_with_ratio(2350.0, 34.0)  # ratio ~69, single tick => no move/stale
    assert engine.evaluate(state) == []
