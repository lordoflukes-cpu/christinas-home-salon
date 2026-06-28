"""Paper-trading executor — closes the research→live loop on the SAME strategy and
sizing used in the backtest. Subscribes to the live price stream, aggregates ticks
into bars, runs the strategy, sizes via ATR, and trades a PaperBroker.

Risk wiring (roadmap §6/§14):
  • kill-switch engaged  -> flatten and stop opening
  • news-window guard     -> hold existing, block NEW entries
  • daily-loss breach     -> auto-engage kill-switch and flatten
Only flat<->long<->short transitions, so trades are discrete and costs are low."""

from __future__ import annotations

import logging
from collections import deque

from ..config import settings
from ..sizing import atr_position_size
from ..strategy import DualEMATrend
from .paper_broker import PaperBroker

log = logging.getLogger("exec")


class _BarBuilder:
    """Aggregate ticks into fixed-second bars; returns a finished Bar on rollover."""

    def __init__(self, seconds: int) -> None:
        self.seconds = seconds
        self._bucket = None
        self._o = self._h = self._l = self._c = 0.0

    def add(self, ts: float, price: float):
        bucket = int(ts // self.seconds)
        if self._bucket is None:
            self._bucket, self._o = bucket, price
            self._h = self._l = self._c = price
            return None
        if bucket != self._bucket:
            finished = {"ts": float(self._bucket * self.seconds),
                        "open": self._o, "high": self._h, "low": self._l, "close": self._c}
            self._bucket, self._o = bucket, price
            self._h = self._l = self._c = price
            return finished
        self._h = max(self._h, price)
        self._l = min(self._l, price)
        self._c = price
        return None


async def run_executor(state, bus, notify) -> None:
    instrument = settings.exec_instrument
    strat = DualEMATrend(fast=settings.exec_fast, slow=settings.exec_slow)
    broker = PaperBroker(equity0=settings.exec_equity0, point_value=settings.exec_point_value)
    builder = _BarBuilder(settings.exec_bar_seconds)
    highs: deque = deque(maxlen=500)
    lows: deque = deque(maxlen=500)
    closes: deque = deque(maxlen=500)
    day_start_equity = broker.equity()

    q = bus.subscribe()
    log.info("paper executor live on %s (%ss bars, fast=%d slow=%d, sim=%s)",
             instrument, settings.exec_bar_seconds, settings.exec_fast, settings.exec_slow,
             settings.use_simulated_feed)
    try:
        while True:
            ev = await q.get()
            if ev.get("type") != "snapshot":
                continue
            px = ev["data"].get("prices", {}).get(instrument)
            if not px:
                continue

            broker.mark(px["last"])
            finished = builder.add(px["ts"], px["last"])
            if finished is None:
                state.paper = broker.state()
                continue

            highs.append(finished["high"])
            lows.append(finished["low"])
            closes.append(finished["close"])
            price = finished["close"]

            target = broker.position  # default: hold
            if len(closes) >= strat.warmup():
                sig = strat.signal(list(highs), list(lows), list(closes))
                d, a = sig["direction"], sig["atr"]

                # daily-loss circuit breaker -> engage kill-switch
                if broker.equity() <= day_start_equity * (1 - settings.max_daily_loss_pct / 100):
                    if not state.kill_switch:
                        state.kill_switch = True
                        await _alert(state, bus, notify, "critical",
                                     f"Daily-loss limit hit ({settings.max_daily_loss_pct}%) — kill-switch engaged")

                if state.kill_switch:
                    target = 0.0
                elif a:
                    same_dir = broker.position != 0 and (broker.position > 0) == (d > 0)
                    if same_dir or d == 0:
                        target = broker.position  # hold winners, no churn
                    elif state.news_guard_active and broker.position == 0:
                        target = 0.0              # block new entries around news
                    else:
                        target = d * atr_position_size(
                            broker.equity(), settings.exec_risk_frac, a,
                            strat.stop_atr_mult, settings.exec_point_value)

            if target != broker.position:
                prev = broker.position
                broker.market_to(target, price, cost_per_unit=settings.exec_cost_per_unit)
                await _alert(state, bus, notify, "info",
                             f"PAPER {instrument}: {prev:+.3f} → {broker.position:+.3f} @ {price:g} "
                             f"(equity {broker.equity():.0f})")

            state.paper = broker.state()
            await bus.publish({"type": "paper", "data": state.paper})
    finally:
        bus.unsubscribe(q)


async def _alert(state, bus, notify, level: str, message: str) -> None:
    import time
    alert = {"ts": time.time(), "key": f"exec:{level}", "level": level, "message": message}
    state.alerts.append(alert)
    await notify(alert)
    await bus.publish({"type": "alert", "data": alert})
