"""Import shim → the vendored gold-bot engine (synthetic OHLC + ratio helper). Keeps the
vendor pristine (ADR 0005); same pattern as the bridge/research shims."""

from __future__ import annotations

import os
import sys

# plugins/trading-data/data/goldbot.py → repo root is three levels up.
_HERE = os.path.dirname(os.path.abspath(__file__))
_VENDOR = os.path.abspath(os.path.join(_HERE, "..", "..", "..", "vendor", "gold-bot"))
if _VENDOR not in sys.path:
    sys.path.insert(0, _VENDOR)

from app.backtest.data import synthetic_ohlc  # noqa: E402
from app.indicators import gold_silver_ratio  # noqa: E402

VENDOR_PATH = _VENDOR

__all__ = ["synthetic_ohlc", "gold_silver_ratio", "VENDOR_PATH"]
