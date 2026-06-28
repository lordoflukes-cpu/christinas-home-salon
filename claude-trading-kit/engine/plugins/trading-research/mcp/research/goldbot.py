"""Import shim → the vendored gold-bot engine.

Adds `vendor/gold-bot` to sys.path and re-exports the engine's public API so the
rest of trading-research imports from one place and the vendor stays **pristine**
(ADR 0005 — we wrap, we don't modify it). The engine pieces we use are pure-stdlib.
"""

from __future__ import annotations

import os
import sys

# plugins/trading-research/mcp/research/goldbot.py → repo root is four levels up.
_HERE = os.path.dirname(os.path.abspath(__file__))
_VENDOR = os.path.abspath(os.path.join(_HERE, "..", "..", "..", "..", "vendor", "gold-bot"))
if _VENDOR not in sys.path:
    sys.path.insert(0, _VENDOR)

# Re-export the verified engine API (see docs/03-integrations/gold-bot.md).
from app.backtest import BacktestResult, Trade, run_backtest  # noqa: E402
from app.backtest.data import Bar, load_csv, synthetic_ohlc  # noqa: E402
from app.backtest.metrics import compute_metrics, max_drawdown  # noqa: E402
from app.indicators import atr, ema, realized_vol  # noqa: E402
from app.sizing import atr_position_size  # noqa: E402
from app.strategy import DualEMATrend  # noqa: E402

VENDOR_PATH = _VENDOR

__all__ = [
    "VENDOR_PATH",
    "BacktestResult", "Trade", "run_backtest",
    "Bar", "load_csv", "synthetic_ohlc",
    "compute_metrics", "max_drawdown",
    "atr", "ema", "realized_vol",
    "atr_position_size", "DualEMATrend",
]
