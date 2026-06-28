"""CFTC Commitments of Traders (Tier 4) — weekly and LAGGED (Tue data, Fri release). Sim
values; real CFTC/Barchart pull is a documented TODO."""

from __future__ import annotations

_SIM = {"gold_mm_net": 173_800, "silver_mm_net": 24_500, "as_of": "2026-06-12", "lagged": True}


def cot() -> dict:
    # TODO(real): pull the CFTC disaggregated report (Friday) or a mirror and parse.
    return {
        "source": "simulated",
        **_SIM,
        "note": "Managed-money net contracts. Weekly & LAGGED (never use intra-week as "
                "real-time). Crowded extremes flag squeeze/reversal risk.",
    }
