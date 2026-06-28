"""OHLC bar container, a CSV loader, and a synthetic generator so the backtest
runs with no data files. Replace synthetic with real Dukascopy/OANDA bars
(roadmap §3) for actual research."""

from __future__ import annotations

import csv
import math
import random
from dataclasses import dataclass


@dataclass
class Bar:
    ts: float
    open: float
    high: float
    low: float
    close: float


def load_csv(path: str) -> list[Bar]:
    """Load OHLC from a CSV with headers: ts,open,high,low,close (extra cols ignored)."""
    bars: list[Bar] = []
    with open(path, newline="") as fh:
        for row in csv.DictReader(fh):
            bars.append(Bar(
                ts=float(row.get("ts", row.get("time", 0)) or 0),
                open=float(row["open"]), high=float(row["high"]),
                low=float(row["low"]), close=float(row["close"]),
            ))
    return bars


def synthetic_ohlc(n: int = 1500, *, start: float = 2350.0, seed: int = 7,
                   trend_strength: float = 0.04, vol: float = 0.008) -> list[Bar]:
    """Trending-with-noise OHLC (regime-switching drift) for demos and tests.

    Deterministic given `seed` so tests are stable.
    """
    rng = random.Random(seed)
    bars: list[Bar] = []
    price = start
    drift = trend_strength * vol
    for i in range(n):
        if i % 120 == 0:  # flip the regime periodically so trends start and end
            drift = rng.choice([1, -1]) * trend_strength * vol
        ret = drift + rng.gauss(0, vol)
        new = max(0.01, price * (1 + ret))
        hi = max(price, new) * (1 + abs(rng.gauss(0, vol / 2)))
        lo = min(price, new) * (1 - abs(rng.gauss(0, vol / 2)))
        bars.append(Bar(ts=float(i), open=price, high=hi, low=lo, close=new))
        price = new
    return bars
