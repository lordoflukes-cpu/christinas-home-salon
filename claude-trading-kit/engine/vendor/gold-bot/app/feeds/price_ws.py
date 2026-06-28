"""Tier 0/1 — real-time price feed for XAU/USD and XAG/USD.

In simulated mode it generates a correlated random walk (silver ~2x gold vol) so
the whole app runs with no API keys. In live mode it connects to a WebSocket
provider with heartbeat + exponential-backoff reconnect — fill in the subscribe
and parse lines for your chosen provider (Twelve Data / AllTick / OANDA v20)."""

from __future__ import annotations

import asyncio
import json
import logging
import random

from ..config import settings

log = logging.getLogger("feed.price")

_SIM_START = {"XAU/USD": 2350.0, "XAG/USD": 30.0}
_SIM_VOL = {"XAU/USD": 0.0008, "XAG/USD": 0.0016}  # silver is the higher-beta cousin


async def run_price_feed(state, bus, engine, notify) -> None:
    if settings.use_simulated_feed or not settings.price_ws_url:
        log.info("price feed: SIMULATED (set USE_SIMULATED_FEED=false + PRICE_WS_URL for live)")
        await _simulated(state, bus, engine, notify)
    else:
        log.info("price feed: LIVE %s", settings.price_ws_url)
        await _live(state, bus, engine, notify)


async def _on_tick(state, bus, engine, notify) -> None:
    """Update derived state, run the alert engine, fan out to dashboards."""
    for alert in engine.evaluate(state):
        state.alerts.append(alert)
        await notify(alert)
        await bus.publish({"type": "alert", "data": alert})
    await bus.publish({"type": "snapshot", "data": state.snapshot()})


async def _simulated(state, bus, engine, notify) -> None:
    prices = dict(_SIM_START)
    for sym, p in prices.items():
        state.update_price(sym, p)
    while True:
        # shared macro shock + idiosyncratic move => positively correlated metals
        shock = random.gauss(0, 0.0006)
        for sym in prices:
            ret = shock + random.gauss(0, _SIM_VOL[sym])
            prices[sym] = max(0.01, prices[sym] * (1 + ret))
            state.update_price(sym, round(prices[sym], 3))
        await _on_tick(state, bus, engine, notify)
        await asyncio.sleep(1.0)


async def _live(state, bus, engine, notify) -> None:
    import websockets  # imported lazily so sim mode needs no extra deps at import time

    backoff = 1
    while True:
        try:
            async with websockets.connect(settings.price_ws_url, ping_interval=20) as ws:
                # TODO: provider-specific subscribe frame.
                await ws.send(json.dumps({
                    "action": "subscribe",
                    "symbols": ["XAU/USD", "XAG/USD"],
                    "apikey": settings.price_api_key,
                }))
                backoff = 1
                async for raw in ws:
                    msg = json.loads(raw)
                    # TODO: map provider fields -> (symbol, price).
                    sym, price = msg.get("symbol"), msg.get("price")
                    if sym and price is not None:
                        state.update_price(sym, float(price))
                        await _on_tick(state, bus, engine, notify)
        except Exception as exc:  # noqa: BLE001 — keep reconnecting through any feed error
            log.warning("price feed disconnected (%s); reconnecting in %ss", exc, backoff)
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, 30)
