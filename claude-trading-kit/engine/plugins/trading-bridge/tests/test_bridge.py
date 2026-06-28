"""Tests for the bridge pipeline: contract drift, auth, idempotency, risk-gate, routing."""

import json
import os

from bridge import Bridge, Settings, sign_payload

CHARTING_SCHEMA = os.path.join(os.path.dirname(__file__), "..", "..",
                               "trading-charting", "contract", "ts_alert_v1.schema.json")
BRIDGE_SCHEMA = os.path.join(os.path.dirname(__file__), "..", "bridge", "contract",
                             "ts_alert_v1.schema.json")


def _bridge(**kw):
    base = dict(secret="topsecret", auto_strategies={"auto-strat": "auto"}, default_mode="manual")
    base.update(kw)
    return Bridge(Settings(**base))


def _entry(**over):
    p = {"schema": "ts.alert.v1", "strategy_id": "auto-strat", "client_order_id": "c1",
         "account_track": "spreadbet", "symbol": "XAUUSD", "action": "buy",
         "order_type": "market", "price": 2350.0, "atr": 12.0,
         "stop_atr_mult": 2.0, "risk_frac": 0.005}
    p.update(over)
    return p


def _signed(p, secret="topsecret"):
    p = dict(p)
    p["signature"] = sign_payload(p, secret)
    return json.dumps(p)


# ── contract drift ──────────────────────────────────────────────────────────
def test_schema_drift_guard():
    a = open(CHARTING_SCHEMA, "rb").read()
    b = open(BRIDGE_SCHEMA, "rb").read()
    assert a == b, "bridge schema copy has drifted from the canonical charting schema"


# ── auth ────────────────────────────────────────────────────────────────────
def test_valid_signed_alert_routes():
    d = _bridge().handle(_signed(_entry()))
    assert d.status == "routed" and d.mode == "auto" and d.units > 0


def test_bad_signature_rejected():
    p = _entry()
    body = dict(p, signature="deadbeef")
    d = _bridge().handle(json.dumps(body))
    assert d.status == "rejected" and d.stage == "auth"


def test_tampered_body_rejected():
    p = _entry()
    p["signature"] = sign_payload(p, "topsecret")
    p["price"] = 9999.0  # changed after signing
    d = _bridge().handle(json.dumps(p))
    assert d.status == "rejected" and d.stage == "auth"


def test_dev_mode_skips_auth_when_no_secret():
    d = _bridge(secret="").handle(json.dumps(_entry()))
    assert d.status == "routed"


# ── validation ──────────────────────────────────────────────────────────────
def test_invalid_alert_rejected():
    d = _bridge(secret="").handle(json.dumps(_entry(action="buy", atr=None)))
    assert d.status == "rejected" and d.stage == "validate"


def test_malformed_json_rejected():
    d = _bridge().handle("not json")
    assert d.status == "rejected" and d.stage == "parse"


# ── idempotency ─────────────────────────────────────────────────────────────
def test_duplicate_client_order_id_deduped():
    b = _bridge()
    assert b.handle(_signed(_entry())).status == "routed"
    assert b.handle(_signed(_entry())).status == "duplicate"


# ── risk-gate ───────────────────────────────────────────────────────────────
def test_kill_switch_blocks():
    b = _bridge()
    b.set_kill_switch(True)
    d = b.handle(_signed(_entry()))
    assert d.status == "blocked" and "kill-switch" in d.reason


def test_news_window_blocks_entry_allows_close():
    b = _bridge()
    b.set_news_window(True)
    assert b.handle(_signed(_entry())).status == "blocked"
    close = {"schema": "ts.alert.v1", "strategy_id": "auto-strat", "client_order_id": "cl1",
             "account_track": "cfd", "symbol": "XAUUSD", "action": "close", "order_type": "market"}
    assert b.handle(_signed(close)).status == "routed"


def test_size_over_cap_blocks():
    b = _bridge(max_position_units=1.0)  # tiny cap → 4.17 units exceeds it
    d = b.handle(_signed(_entry()))
    assert d.status == "blocked" and "exceeds max" in d.reason


# ── routing ─────────────────────────────────────────────────────────────────
def test_manual_strategy_suggests():
    d = _bridge().handle(_signed(_entry(strategy_id="disc-strat", client_order_id="m1")))
    assert d.status == "routed" and d.mode == "manual" and d.route == "telegram-suggestion"


def test_auto_strategy_executes_paper():
    b = _bridge()
    d = b.handle(_signed(_entry()))
    assert d.route == "paper-execution"
    assert b.paper.broker.position != 0  # a fill happened
