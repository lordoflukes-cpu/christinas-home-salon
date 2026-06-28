"""Import shim → the vendored gold-bot engine (sizing + PaperBroker). Keeps the bridge
reusing the verified engine without copying it. Vendor stays pristine (ADR 0005)."""

from __future__ import annotations

import os
import sys

# plugins/trading-bridge/bridge/goldbot.py → repo root is three levels up.
_HERE = os.path.dirname(os.path.abspath(__file__))
_VENDOR = os.path.abspath(os.path.join(_HERE, "..", "..", "..", "vendor", "gold-bot"))
if _VENDOR not in sys.path:
    sys.path.insert(0, _VENDOR)

from app.execution.paper_broker import PaperBroker  # noqa: E402
from app.sizing import atr_position_size  # noqa: E402

VENDOR_PATH = _VENDOR

__all__ = ["atr_position_size", "PaperBroker", "VENDOR_PATH"]
