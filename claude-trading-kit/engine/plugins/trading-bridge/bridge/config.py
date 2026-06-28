"""Bridge settings (env-driven). Secrets never committed (docs/08-security.md)."""

from __future__ import annotations

import os
from dataclasses import dataclass, field


def _strategies(env: str) -> dict:
    # BRIDGE_AUTO_STRATEGIES="gold-trend-h4,silver-trend" → those route to auto.
    out = {}
    for s in filter(None, (x.strip() for x in env.split(","))):
        out[s] = "auto"
    return out


@dataclass
class Settings:
    # Auth — if empty, the bridge runs in DEV mode (no HMAC enforced). Set in production.
    secret: str = field(default_factory=lambda: os.environ.get("BRIDGE_SECRET", ""))
    # Routing — manual (suggest) is the safe default; opt specific strategies into auto.
    default_mode: str = field(default_factory=lambda: os.environ.get("BRIDGE_DEFAULT_MODE", "manual"))
    auto_strategies: dict = field(
        default_factory=lambda: _strategies(os.environ.get("BRIDGE_AUTO_STRATEGIES", "")))
    # Risk limits (the alert carries risk_frac/stop_atr_mult; these are caps/fallbacks).
    equity0: float = field(default_factory=lambda: float(os.environ.get("BRIDGE_EQUITY0", "20000")))
    max_position_units: float = field(
        default_factory=lambda: float(os.environ.get("BRIDGE_MAX_POSITION_UNITS", "50")))
    daily_loss_frac: float = field(
        default_factory=lambda: float(os.environ.get("BRIDGE_DAILY_LOSS_FRAC", "0.05")))
    default_risk_frac: float = field(
        default_factory=lambda: float(os.environ.get("BRIDGE_RISK_FRAC", "0.005")))
    default_stop_atr_mult: float = field(
        default_factory=lambda: float(os.environ.get("BRIDGE_STOP_ATR_MULT", "2.0")))
    idempotency_ttl_sec: int = field(
        default_factory=lambda: int(os.environ.get("BRIDGE_IDEMPOTENCY_TTL", "3600")))
    # Phase 5: when set, route to the trading-execution service over HTTP (auto → /execute,
    # manual → /notify). Unset → use the in-process Paper/Notify stubs (Phase-3 default).
    execution_url: str = field(default_factory=lambda: os.environ.get("BRIDGE_EXECUTION_URL", ""))
