"""Tier 3 — macro drivers (daily). Pulls FRED series for the gold "trinity":
real yields (DFII10), nominals (DGS10), break-even inflation (T10YIE), and the
broad dollar (DTWEXBGS). Seeds plausible values in simulated mode."""

from __future__ import annotations

import asyncio
import logging

import httpx

from ..config import settings

log = logging.getLogger("feed.macro")

_FRED = "https://api.stlouisfed.org/fred/series/observations"
_SERIES = {"real_yield_10y": "DFII10", "nominal_10y": "DGS10",
           "breakeven_10y": "T10YIE", "dxy": "DTWEXBGS"}
_SIM = {"real_yield_10y": 1.95, "nominal_10y": 4.20, "breakeven_10y": 2.25, "dxy": 99.0}


async def _fetch_fred() -> dict:
    out: dict[str, float] = {}
    async with httpx.AsyncClient(timeout=20) as client:
        for label, series_id in _SERIES.items():
            try:
                r = await client.get(_FRED, params={
                    "series_id": series_id, "api_key": settings.fred_api_key,
                    "file_type": "json", "sort_order": "desc", "limit": 1,
                })
                obs = r.json().get("observations", [])
                if obs and obs[0]["value"] not in (".", ""):
                    out[label] = float(obs[0]["value"])
            except Exception as exc:  # noqa: BLE001
                log.warning("FRED %s fetch failed: %s", series_id, exc)
    return out


async def run_macro_feed(state, bus) -> None:
    use_live = settings.fred_api_key and not settings.use_simulated_feed
    while True:
        data = await _fetch_fred() if use_live else dict(_SIM)
        if data:
            state.macro.update(data)
            await bus.publish({"type": "macro", "data": state.macro})
            log.info("macro updated: %s", data)
        await asyncio.sleep(settings.macro_refresh_sec)
