"""Pure indicator helpers — no I/O, easy to unit-test.

Note: the price feed delivers ticks (not OHLC bars), so volatility here is a
tick-based realized proxy, not a true ATR. Wire real ATR off your bar data in
the strategy layer; this is for live-monitoring alerts only."""

from __future__ import annotations

import statistics
import time
from typing import Iterable, Optional


def pct_change_over(history: Iterable, window_sec: int, now: Optional[float] = None) -> Optional[float]:
    """Percent change from the price as-of `window_sec` ago to the latest price."""
    points = list(history)
    if not points:
        return None
    now = now if now is not None else time.time()
    cutoff = now - window_sec

    past = None
    for p in points:  # chronological
        if p.ts <= cutoff:
            past = p.price
        else:
            break
    if past is None:
        past = points[0].price

    cur = points[-1].price
    if past == 0:
        return None
    return (cur - past) / past * 100.0


def realized_vol(history: Iterable, n: int = 30) -> Optional[float]:
    """Population stdev of the last `n` tick-to-tick returns."""
    prices = [p.price for p in list(history)[-(n + 1):]]
    if len(prices) < 3:
        return None
    rets = [prices[i] / prices[i - 1] - 1 for i in range(1, len(prices)) if prices[i - 1]]
    if len(rets) < 2:
        return None
    return statistics.pstdev(rets)


def gold_silver_ratio(xau: Optional[float], xag: Optional[float]) -> Optional[float]:
    if xau and xag:
        return xau / xag
    return None


def ema(values: list[float], period: int) -> Optional[float]:
    """Latest exponential moving average (SMA-seeded). Returns None until warmed up."""
    if period <= 0 or len(values) < period:
        return None
    k = 2.0 / (period + 1)
    e = sum(values[:period]) / period
    for v in values[period:]:
        e = v * k + e * (1 - k)
    return e


def atr(highs: list[float], lows: list[float], closes: list[float], period: int) -> Optional[float]:
    """Wilder's Average True Range over the most recent `period` bars."""
    n = len(closes)
    if n < period + 1 or len(highs) != n or len(lows) != n:
        return None
    trs = [
        max(highs[i] - lows[i], abs(highs[i] - closes[i - 1]), abs(lows[i] - closes[i - 1]))
        for i in range(1, n)
    ]
    a = sum(trs[:period]) / period
    for tr in trs[period:]:
        a = (a * (period - 1) + tr) / period
    return a
