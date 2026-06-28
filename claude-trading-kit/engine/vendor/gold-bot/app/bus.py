"""Tiny in-process pub/sub so feeds can fan out to every connected dashboard
WebSocket without coupling to them. Drops events to slow subscribers rather than
blocking the feed (a stalled browser must never back-pressure the price path)."""

from __future__ import annotations

import asyncio
import logging

log = logging.getLogger(__name__)


class EventBus:
    def __init__(self, maxsize: int = 100) -> None:
        self._subscribers: set[asyncio.Queue] = set()
        self._maxsize = maxsize

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=self._maxsize)
        self._subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self._subscribers.discard(q)

    async def publish(self, event: dict) -> None:
        for q in list(self._subscribers):
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                log.debug("dropping event for a slow subscriber")
