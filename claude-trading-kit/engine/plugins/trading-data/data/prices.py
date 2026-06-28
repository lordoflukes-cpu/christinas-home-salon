"""Prices (Tier 0/1). Sim mode uses the gold-bot synthetic generator so candles/quotes run
with no API key. Real mode (Twelve Data / AllTick / broker feed) is a documented TODO."""

from __future__ import annotations

from .config import settings
from .goldbot import synthetic_ohlc

_SIM_START = {"XAUUSD": 2350.0, "XAGUSD": 30.0, "DXY": 99.0}
# Deterministic per-symbol seed so repeated calls are stable.
_SEED = {"XAUUSD": 7, "XAGUSD": 11, "DXY": 3}


def candles(symbol: str = "XAUUSD", interval: str = "H4", n: int = 300) -> dict:
    """OHLC bars. Sim: synthetic trending series; Real: provider (TODO)."""
    if settings.use_simulated or not settings.market_data_key:
        start = _SIM_START.get(symbol.upper(), 100.0)
        bars = synthetic_ohlc(n=n, start=start, seed=_SEED.get(symbol.upper(), 5))
        return {
            "symbol": symbol, "interval": interval, "source": "simulated", "n": len(bars),
            "bars": [{"ts": b.ts, "open": b.open, "high": b.high, "low": b.low, "close": b.close}
                     for b in bars],
        }
    # TODO(real): Twelve Data/AllTick time_series → map to ts/open/high/low/close.
    raise NotImplementedError("real market-data provider not wired yet — set USE_SIMULATED_DATA=true")


def quote(symbol: str = "XAUUSD") -> dict:
    """Latest price. Sim: last close of the synthetic series."""
    c = candles(symbol, "H4", 50)
    last = c["bars"][-1]["close"] if c["bars"] else None
    return {"symbol": symbol, "price": last, "source": c["source"]}
