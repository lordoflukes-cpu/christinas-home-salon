"""Economic calendar (Tier 2) + the news-window guard — the single highest-value live rule:
block new entries within ±NEWS_GUARD_MINUTES of a high-impact release (CPI/FOMC/NFP/PMI).

Deterministic: pass `now` and/or `events` for tests. Sim events are offsets from `now`; real
provider (TradingEconomics / FMP) is a documented TODO."""

from __future__ import annotations

import time

from .config import settings

# Sim schedule as offsets (seconds from now) → deterministic given a reference `now`.
_SIM_OFFSETS = [
    {"offset": 90, "title": "US CPI", "impact": "high"},
    {"offset": 3600, "title": "FOMC Minutes", "impact": "high"},
    {"offset": 7200, "title": "US Manufacturing PMI", "impact": "medium"},
]


def _sim_events(now: float) -> list[dict]:
    return [{"ts": now + e["offset"], "title": e["title"], "impact": e["impact"]}
            for e in _SIM_OFFSETS]


def economic_calendar(hours_ahead: int = 24, now: float | None = None,
                      events: list | None = None) -> dict:
    now = now if now is not None else time.time()
    evs = events if events is not None else _sim_events(now)
    window = settings.news_guard_minutes * 60
    horizon = now + hours_ahead * 3600
    upcoming = sorted((e for e in evs if now - window <= e["ts"] <= horizon),
                      key=lambda e: e["ts"])
    return {
        "now": now, "hours_ahead": hours_ahead,
        "source": "provided" if events is not None else "simulated",
        "events": [{"title": e["title"], "impact": e["impact"],
                    "in_minutes": round((e["ts"] - now) / 60, 1)} for e in upcoming],
    }


def news_window(now: float | None = None, events: list | None = None,
                impact_levels=("high",)) -> dict:
    """Is a high-impact event within ±NEWS_GUARD_MINUTES right now? Returns the guard state
    the bridge consumes to block new entries."""
    now = now if now is not None else time.time()
    evs = events if events is not None else _sim_events(now)
    window = settings.news_guard_minutes * 60
    hi = [e for e in evs if e.get("impact") in impact_levels and e["ts"] >= now - window]
    nxt = min(hi, key=lambda e: e["ts"]) if hi else None
    active = bool(nxt and abs(nxt["ts"] - now) <= window)
    return {
        "active": active,
        "guard_minutes": settings.news_guard_minutes,
        "next_event": ({"title": nxt["title"], "impact": nxt["impact"],
                        "in_minutes": round((nxt["ts"] - now) / 60, 2)} if nxt else None),
        "note": "Active = block NEW entries (closes still allowed). Wire to the bridge via "
                "tools/news_window_poller.py.",
    }
