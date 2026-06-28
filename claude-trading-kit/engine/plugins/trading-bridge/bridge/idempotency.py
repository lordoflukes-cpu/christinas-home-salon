"""In-memory TTL store of seen client_order_ids — the idempotency guard that stops a
retried/duplicated alert from creating a second order (docs/08). Swap for Redis to share
across processes when the bridge is scaled."""

from __future__ import annotations

import time


class SeenStore:
    def __init__(self, ttl_sec: int = 3600) -> None:
        self.ttl_sec = ttl_sec
        self._seen: dict[str, float] = {}

    def seen(self, key: str, now: float | None = None) -> bool:
        """Return True if `key` was already seen within the TTL; otherwise record it and
        return False. (Pass `now` for deterministic tests.)"""
        now = now if now is not None else time.time()
        self._purge(now)
        if key in self._seen:
            return True
        self._seen[key] = now
        return False

    def _purge(self, now: float) -> None:
        for k in [k for k, t in self._seen.items() if now - t > self.ttl_sec]:
            del self._seen[k]
