"""Rule/alert engine. Pure & synchronous: given a StateStore snapshot it returns
the alerts that should fire right now, with per-key cooldown so a persistent
condition doesn't spam. Delivery (Telegram) and fan-out (dashboard) happen in the
caller — see feeds/price_ws.py.

Adding a rule = add a branch in `evaluate`. Documented stubs at the bottom show
where vol-spike and correlation-break rules go."""

from __future__ import annotations

import time

from .. import indicators
from ..config import settings


class AlertEngine:
    def __init__(self, cooldown_sec: int = 300) -> None:
        self.cooldown_sec = cooldown_sec
        self._last_fired: dict[str, float] = {}

    def _fire(self, key: str, level: str, message: str, now: float) -> dict | None:
        if now - self._last_fired.get(key, 0.0) < self.cooldown_sec:
            return None
        self._last_fired[key] = now
        return {"ts": now, "key": key, "level": level, "message": message}

    def evaluate(self, state) -> list[dict]:
        now = time.time()
        out: list[dict] = []

        # ── Tier 0: per-symbol price move + feed-staleness ───────────────────
        for sym in ("XAU/USD", "XAG/USD"):
            st = state.symbols.get(sym)
            if not st or not st.history:
                continue

            move = indicators.pct_change_over(st.history, settings.price_move_window_sec, now)
            if move is not None and abs(move) >= settings.price_move_pct:
                mins = settings.price_move_window_sec // 60
                a = self._fire(f"move:{sym}", "warning",
                               f"{sym} moved {move:+.2f}% in {mins}m (last {st.last:g})", now)
                if a:
                    out.append(a)

            age = now - st.last_ts
            if age > settings.feed_stale_sec:
                a = self._fire(f"stale:{sym}", "critical",
                               f"{sym} feed stale {int(age)}s — possible outage", now)
                if a:
                    out.append(a)

        # ── Tier 1: gold/silver ratio extremes ───────────────────────────────
        ratio = state.gold_silver_ratio()
        if ratio is not None:
            if ratio <= settings.ratio_low:
                a = self._fire("ratio:low", "info",
                               f"Gold/Silver ratio {ratio:.1f} ≤ {settings.ratio_low:g} — silver rich", now)
                if a:
                    out.append(a)
            elif ratio >= settings.ratio_high:
                a = self._fire("ratio:high", "info",
                               f"Gold/Silver ratio {ratio:.1f} ≥ {settings.ratio_high:g} — silver cheap", now)
                if a:
                    out.append(a)

        # ── Tier 2: news-window guard (block entries around high-impact data) ─
        if state.news_guard_active:
            a = self._fire("news:guard", "warning",
                           "News-window guard ACTIVE — new entries blocked", now)
            if a:
                out.append(a)

        # ── Risk: kill-switch engaged ────────────────────────────────────────
        if state.kill_switch:
            a = self._fire("kill:switch", "critical", "KILL-SWITCH engaged — trading halted", now)
            if a:
                out.append(a)

        # TODO(vol-spike): if indicators.realized_vol(st.history) > baseline * mult: fire.
        # TODO(correlation-break): if gold rising while DXY (state.macro['dxy']) rising,
        #   fire "gold/DXY co-move — panic/regime tell" (see ROADMAP §13).
        return out
