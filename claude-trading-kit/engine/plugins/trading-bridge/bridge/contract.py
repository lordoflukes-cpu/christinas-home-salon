"""ts.alert.v1 validation — a VENDORED copy of the charting validator so the bridge is
self-contained. The schema file under bridge/contract/ is kept byte-identical to the
canonical charting copy by a drift test (tests/test_bridge.py)."""

from __future__ import annotations

import json
import os

_SCHEMA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "contract", "ts_alert_v1.schema.json")
)


def load_schema() -> dict:
    with open(_SCHEMA_PATH) as fh:
        return json.load(fh)


_SCHEMA = load_schema()
_PROPS = set(_SCHEMA["properties"])
_REQUIRED = list(_SCHEMA["required"])
_ENUMS = {
    "account_track": ["cfd", "spreadbet"],
    "action": ["buy", "sell", "close"],
    "order_type": ["market", "limit"],
}
_STR_FIELDS = ["strategy_id", "client_order_id", "symbol", "tv_time", "secret", "signature"]
_NUM_FIELDS = ["price", "limit_price", "atr", "stop_atr_mult", "risk_frac"]


def _is_num(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def validate_alert(payload: dict) -> dict:
    if not isinstance(payload, dict):
        return {"valid": False, "errors": ["payload must be an object"]}
    errors: list[str] = []
    for k in payload:
        if k not in _PROPS:
            errors.append(f"unknown field '{k}'")
    for r in _REQUIRED:
        if r not in payload:
            errors.append(f"missing required field '{r}'")
    if "schema" in payload and payload["schema"] != "ts.alert.v1":
        errors.append("schema must be 'ts.alert.v1'")
    for f, allowed in _ENUMS.items():
        if f in payload and payload[f] not in allowed:
            errors.append(f"{f} must be one of {allowed}, got {payload[f]!r}")
    for f in _STR_FIELDS:
        if f in payload and not isinstance(payload[f], str):
            errors.append(f"{f} must be a string")
    for f in _NUM_FIELDS:
        if f in payload and not _is_num(payload[f]):
            errors.append(f"{f} must be a number")
    for f in ("atr", "stop_atr_mult", "risk_frac"):
        v = payload.get(f)
        if _is_num(v) and v <= 0:
            errors.append(f"{f} must be > 0")
    if _is_num(payload.get("risk_frac")) and payload["risk_frac"] > 0.1:
        errors.append("risk_frac must be <= 0.1 (10%)")
    if payload.get("order_type") == "limit" and "limit_price" not in payload:
        errors.append("order_type 'limit' requires limit_price")
    if payload.get("action") in ("buy", "sell") and "atr" not in payload:
        errors.append("entry actions (buy/sell) require atr for sizing")
    return {"valid": not errors, "errors": errors}
