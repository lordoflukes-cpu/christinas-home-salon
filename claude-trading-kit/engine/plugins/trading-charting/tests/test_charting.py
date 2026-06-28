"""Tests for trading-charting: the ts.alert.v1 contract, HMAC signing, Pine lint, the
metric cross-check, and that the shipped Pine scripts lint clean."""

import os

import charting as C

PINE_DIR = os.path.join(os.path.dirname(__file__), "..", "pine")


# ── contract ────────────────────────────────────────────────────────────────
def test_schema_loads():
    s = C.load_schema()
    assert s["title"] == "ts.alert.v1"
    assert "account_track" in s["properties"]


def test_make_and_validate_good_entry():
    p = C.make_alert_payload(strategy_id="gold-trend-h4", symbol="XAUUSD", action="buy",
                             account_track="spreadbet", price=2350.0, atr=12.0,
                             client_order_id="abc-1")
    r = C.validate_alert(p)
    assert r["valid"], r["errors"]
    assert p["risk_frac"] == 0.005 and p["stop_atr_mult"] == 2.0


def test_validate_entry_requires_atr():
    p = {"schema": "ts.alert.v1", "strategy_id": "x", "client_order_id": "y",
         "account_track": "cfd", "symbol": "XAUUSD", "action": "buy", "order_type": "market"}
    r = C.validate_alert(p)
    assert not r["valid"]
    assert any("atr" in e for e in r["errors"])


def test_validate_bad_enum_and_unknown_field():
    p = C.make_alert_payload(strategy_id="x", symbol="XAUUSD", action="buy",
                             account_track="cfd", price=1.0, atr=1.0)
    p["account_track"] = "isa"
    p["oops"] = 1
    errs = C.validate_alert(p)["errors"]
    assert any("account_track" in e for e in errs)
    assert any("unknown field" in e for e in errs)


def test_validate_limit_requires_limit_price():
    p = C.make_alert_payload(strategy_id="x", symbol="XAUUSD", action="buy",
                             account_track="cfd", price=1.0, atr=1.0, order_type="limit")
    assert any("limit_price" in e for e in C.validate_alert(p)["errors"])


def test_validate_risk_frac_bounds():
    p = C.make_alert_payload(strategy_id="x", symbol="XAUUSD", action="buy",
                             account_track="cfd", price=1.0, atr=1.0, risk_frac=0.5)
    assert any("risk_frac" in e for e in C.validate_alert(p)["errors"])


# ── signing ─────────────────────────────────────────────────────────────────
def test_hmac_round_trip():
    p = C.make_alert_payload(strategy_id="x", symbol="XAUUSD", action="buy",
                             account_track="cfd", price=1.0, atr=1.0)
    sig = C.sign_payload(p, "topsecret")
    signed = dict(p, signature=sig)
    assert C.verify_payload(signed, "topsecret")
    assert not C.verify_payload(signed, "wrong")
    # signature field is excluded from the signed body (idempotent)
    assert C.sign_payload(signed, "topsecret") == sig


# ── pine lint ───────────────────────────────────────────────────────────────
def test_lint_flags_broken_pine():
    res = C.lint_pine("strategy('x')\nstrategy.entry('L', strategy.long)")
    assert not res["ok"]  # missing //@version is an error
    msgs = " ".join(f["msg"] for f in res["findings"])
    assert "//@version" in msgs


def test_shipped_pine_scripts_lint_ok():
    for name in ("ts_trend_strategy.pine", "ts_trend_indicator.pine", "ts_screener.pine"):
        src = open(os.path.join(PINE_DIR, name)).read()
        res = C.lint_pine(src)
        assert res["ok"], f"{name}: {res['findings']}"
    # the strategy must emit an alert and be a strategy
    strat = C.lint_pine(open(os.path.join(PINE_DIR, "ts_trend_strategy.pine")).read())
    assert strat["is_strategy"]


# ── cross-check ─────────────────────────────────────────────────────────────
def test_diff_metrics_flags_divergence():
    out = C.diff_metrics({"profit_factor": 2.0, "num_trades": 40},
                         {"profit_factor": 1.2, "num_trades": 40}, tolerance=0.2)
    assert out["diverged"]
    pf = [r for r in out["rows"] if r["metric"] == "profit_factor"][0]
    assert pf["diverged"]


def test_diff_metrics_within_tolerance():
    out = C.diff_metrics({"sharpe": 1.00}, {"sharpe": 1.10}, tolerance=0.2)
    assert not out["diverged"]
