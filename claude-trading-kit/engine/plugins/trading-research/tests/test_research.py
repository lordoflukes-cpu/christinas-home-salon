"""Tests for the NEW trading-research code (cost model, validation suite, regime).
The vendored engine has its own tests; these cover only what we added."""

import research as R


def test_cost_model_carry_dominates_long_hold():
    c = R.all_in_cost(units=1, price=2350, hold_nights=10,
                      spread_cost_per_unit=7.0, carry_per_unit_per_night=-0.75)
    assert c["carry"] == 7.5
    assert c["total_cost"] == 14.5
    assert c["suggested_cost_per_unit"] == 7.25  # half the round-turn
    assert c["cost_pct_of_notional"] is not None


def test_cost_model_zero_units():
    c = R.all_in_cost(units=0, price=2350)
    assert c["total_cost"] == 0.0
    assert c["suggested_cost_per_unit"] == 0.0


def test_walk_forward_structure_and_determinism():
    a = R.walk_forward(n=1500, seed=7)
    b = R.walk_forward(n=1500, seed=7)
    assert a["n_windows"] >= 1
    assert a == b  # deterministic
    for w in a["windows"]:
        assert {"params", "is_sharpe", "oos_sharpe"} <= set(w)
    assert a["verdict"] in ("stable", "unstable/degrading")


def test_walk_forward_too_short():
    r = R.walk_forward(n=200, in_sample=400, out_sample=150)
    assert "error" in r


def test_monte_carlo_distribution():
    r = R.monte_carlo(n=1500, seed=7, runs=200, mc_seed=1)
    assert r["num_trades"] >= 5
    assert 0.0 <= r["prob_loss"] <= 1.0
    assert r["max_drawdown"]["p95"] >= r["max_drawdown"]["p50"]
    assert r["return"]["p95"] >= r["return"]["p5"]


def test_monte_carlo_too_few_trades():
    r = R.monte_carlo(n=120, seed=3, runs=50)
    assert "error" in r or r.get("num_trades", 0) >= 5


def test_parameter_plateau_grid():
    r = R.parameter_plateau(n=1500, seed=7)
    assert r["cells"] >= 1
    assert isinstance(r["on_plateau"], bool)
    assert "grid_std" in r and "grid_mean" in r


def test_deflated_sharpe_more_trials_lowers_dsr():
    few = R.deflated_sharpe(sharpe=0.15, n_trials=1, n_obs=1500)
    many = R.deflated_sharpe(sharpe=0.15, n_trials=200, n_obs=1500)
    assert few["deflated_sharpe_ratio"] >= many["deflated_sharpe_ratio"]
    assert 0.0 <= many["deflated_sharpe_ratio"] <= 1.0


def test_deflated_sharpe_guards():
    assert "error" in R.deflated_sharpe(sharpe=1.0, n_trials=0, n_obs=1000)
    assert "error" in R.deflated_sharpe(sharpe=1.0, n_trials=5, n_obs=1)


def test_classify_regime_keys():
    bars = R.synthetic_ohlc(n=400, seed=3)
    out = R.classify_regime([b.high for b in bars], [b.low for b in bars],
                            [b.close for b in bars])
    assert out["direction"] in ("up", "side", "down")
    assert out["volatility"] in ("quiet", "volatile")
    assert out["posture"] in ("press", "normal", "shrink", "stand aside")


def test_classify_regime_too_short():
    assert "error" in R.classify_regime([1.0] * 10, [1.0] * 10, [1.0] * 10)
