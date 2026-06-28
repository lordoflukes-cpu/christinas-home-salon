"""charting-tools — MCP (stdio) server for the TradingView layer.

Exposes the ts.alert.v1 contract (validate/build), HMAC signing, a Pine linter, and the
Strategy-Tester cross-check. Pure-Python (only the MCP SDK is required).

  pip install mcp
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import charting as C  # noqa: E402

try:
    from mcp.server.fastmcp import FastMCP
except ModuleNotFoundError:  # pragma: no cover
    sys.stderr.write("charting-tools: missing dependency — run `pip install mcp`\n")
    raise

mcp = FastMCP("charting-tools")


@mcp.tool()
def validate_alert(payload: dict) -> dict:
    """Validate a TradingView alert payload against the ts.alert.v1 contract.
    Returns {valid, errors}. Use before saving a Pine alert or wiring a webhook."""
    return C.validate_alert(payload)


@mcp.tool()
def make_alert_payload(strategy_id: str, symbol: str, action: str, account_track: str,
                       price: float = 0.0, atr: float = 0.0, stop_atr_mult: float = 2.0,
                       risk_frac: float = 0.005, order_type: str = "market",
                       limit_price: float = 0.0, client_order_id: str = "",
                       tv_time: str = "") -> dict:
    """Build a valid ts.alert.v1 payload (the JSON a TradingView alert should send).
    `action` ∈ buy|sell|close; `account_track` ∈ cfd|spreadbet. Pass a unique
    client_order_id in production (idempotency key)."""
    payload = C.make_alert_payload(
        strategy_id=strategy_id, symbol=symbol, action=action, account_track=account_track,
        price=price or None, atr=atr or None, stop_atr_mult=stop_atr_mult, risk_frac=risk_frac,
        order_type=order_type, limit_price=limit_price or None,
        client_order_id=client_order_id, tv_time=tv_time or None)
    return {"payload": payload, "validation": C.validate_alert(payload)}


@mcp.tool()
def sign_payload(payload: dict, secret: str) -> dict:
    """HMAC-SHA256 sign a payload (the bridge verifies this). Returns the signature and
    the payload with `signature` attached."""
    sig = C.sign_payload(payload, secret)
    signed = dict(payload, signature=sig)
    return {"signature": sig, "signed_payload": signed,
            "verifies": C.verify_payload(signed, secret)}


@mcp.tool()
def lint_pine(source: str) -> dict:
    """Lint a Pine script for the mistakes that matter on a money path: missing version,
    no declaration/alert, look-ahead/repaint smells, hardcoded secrets."""
    return C.lint_pine(source)


@mcp.tool()
def diff_metrics(tv_metrics: dict, engine_metrics: dict, tolerance: float = 0.2) -> dict:
    """Cross-check TradingView Strategy-Tester metrics vs the gold-bot engine. Flags fields
    that diverge by more than `tolerance` (relative)."""
    return C.diff_metrics(tv_metrics, engine_metrics, tolerance)


if __name__ == "__main__":
    mcp.run()
