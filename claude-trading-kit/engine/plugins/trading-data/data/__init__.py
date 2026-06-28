"""trading-data engine: market data + FRED macro + economic calendar / news-window + COT +
the intermarket panel. Sim-first (no keys); FRED has a real path. Vendor stays pristine."""

from .calendar import economic_calendar, news_window
from .cot import cot
from .fred import fred
from .intermarket import intermarket
from .prices import candles, quote

__all__ = ["quote", "candles", "fred", "economic_calendar", "news_window", "cot", "intermarket"]
