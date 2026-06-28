"""Tier 4 — CFTC Commitments of Traders (weekly, LAGGED). Tuesday positions are
released Friday, so this is never real-time — surfaced for context only, flagged
`lagged: true` so nothing downstream treats it as live."""

from __future__ import annotations

import asyncio
import logging

from ..config import settings

log = logging.getLogger("feed.cot")

# Stub values (managed-money net contracts). TODO: pull the CFTC disaggregated
# report (Friday) or a mirror (Barchart / Myfxbook / metalcharts) and parse.
_SIM = {"gold_mm_net": 173_800, "silver_mm_net": 24_500, "as_of": "2026-06-12", "lagged": True}


async def run_cot_feed(state, bus) -> None:
    while True:
        state.cot.update(_SIM)
        await bus.publish({"type": "cot", "data": state.cot})
        log.info("COT updated (lagged): %s", state.cot)
        await asyncio.sleep(settings.cot_refresh_sec)
