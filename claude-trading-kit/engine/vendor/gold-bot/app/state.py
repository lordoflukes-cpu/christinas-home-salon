"""In-memory state store — the single source of truth the dashboard and alert
engine read from. Kept in-process for <1ms reads; swap for Redis if you scale to
multiple processes."""

from __future__ import annotations

import time
from collections import deque
from dataclasses import dataclass, field
from threading import RLock
from typing import Deque, Optional


@dataclass
class PricePoint:
    ts: float
    price: float


@dataclass
class SymbolState:
    symbol: str
    last: float = 0.0
    last_ts: float = 0.0
    history: Deque[PricePoint] = field(default_factory=lambda: deque(maxlen=5000))

    def update(self, price: float, ts: Optional[float] = None) -> None:
        ts = ts if ts is not None else time.time()
        self.last = price
        self.last_ts = ts
        self.history.append(PricePoint(ts, price))


class StateStore:
    """Thread-safe snapshot of every monitored signal across all latency tiers."""

    def __init__(self) -> None:
        self._lock = RLock()
        self.symbols: dict[str, SymbolState] = {}
        self.macro: dict[str, float] = {}        # Tier 3: real_yield_10y, dxy, breakeven_10y...
        self.cot: dict[str, object] = {}         # Tier 4: managed-money net positions (lagged)
        self.next_event: Optional[dict] = None   # Tier 2: next high-impact calendar event
        self.news_guard_active: bool = False
        self.kill_switch: bool = False
        self.paper: dict = {}                    # paper-executor state (equity, position, ...)
        self.alerts: Deque[dict] = deque(maxlen=200)
        self.started_at = time.time()

    def update_price(self, symbol: str, price: float, ts: Optional[float] = None) -> None:
        with self._lock:
            st = self.symbols.setdefault(symbol, SymbolState(symbol))
            st.update(price, ts)

    def last(self, symbol: str) -> Optional[float]:
        st = self.symbols.get(symbol)
        return st.last if st and st.last else None

    def gold_silver_ratio(self) -> Optional[float]:
        xau, xag = self.last("XAU/USD"), self.last("XAG/USD")
        if xau and xag:
            return xau / xag
        return None

    def snapshot(self) -> dict:
        with self._lock:
            now = time.time()
            return {
                "ts": now,
                "uptime_sec": round(now - self.started_at, 1),
                "prices": {
                    s: {"last": st.last, "ts": st.last_ts, "age_sec": round(now - st.last_ts, 1)}
                    for s, st in self.symbols.items()
                },
                "gold_silver_ratio": self.gold_silver_ratio(),
                "macro": dict(self.macro),
                "cot": dict(self.cot),
                "next_event": self.next_event,
                "news_guard_active": self.news_guard_active,
                "kill_switch": self.kill_switch,
                "paper": dict(self.paper),
                "alerts": list(self.alerts)[-20:],
            }
