"""Tier 2 — economic calendar + news-window guard. High-impact releases
(CPI/FOMC/NFP/PMI) are known in advance; this feed keeps `next_event` current and
flips `news_guard_active` on within +/- NEWS_GUARD_MINUTES so the engine blocks
new entries around them — the single highest-value live rule for a metals bot."""

from __future__ import annotations

import asyncio
import logging
import time

from ..config import settings

log = logging.getLogger("feed.calendar")

# TODO: replace with a pull from an economic-calendar API
# (Investing.com / FMP economics / Trading Economics). Each item: epoch ts + title.
# Demo: a high-impact event ~2.5 min after startup so the guard visibly
# transitions clear -> active as the window approaches.
_EVENTS: list[dict] = [
    {"ts": time.time() + 150, "title": "US CPI (demo)", "impact": "high"},
]


def _next_event(now: float) -> dict | None:
    upcoming = [e for e in _EVENTS if e["ts"] >= now - settings.news_guard_minutes * 60]
    return min(upcoming, key=lambda e: e["ts"]) if upcoming else None


async def run_calendar_feed(state, bus) -> None:
    guard_window = settings.news_guard_minutes * 60
    while True:
        now = time.time()
        event = _next_event(now)
        state.next_event = event
        state.news_guard_active = bool(event and abs(event["ts"] - now) <= guard_window)
        await bus.publish({"type": "calendar",
                           "data": {"next_event": event, "guard": state.news_guard_active}})
        await asyncio.sleep(5)
