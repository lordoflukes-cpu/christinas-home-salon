"""FRED macro (Tier 3). Real path mirrors the gold-bot macro feed; sim seeds plausible values.
Series: real yields (DFII10), nominals (DGS10), break-even inflation (T10YIE), broad dollar
(DTWEXBGS)."""

from __future__ import annotations

import logging

import httpx

from .config import settings

log = logging.getLogger("data.fred")

_FRED = "https://api.stlouisfed.org/fred/series/observations"
_SERIES = {"real_yield_10y": "DFII10", "nominal_10y": "DGS10",
           "breakeven_10y": "T10YIE", "dxy": "DTWEXBGS"}
_SIM = {"real_yield_10y": 1.95, "nominal_10y": 4.20, "breakeven_10y": 2.25, "dxy": 99.0}


def _fetch_real() -> dict:
    out: dict[str, float] = {}
    with httpx.Client(timeout=20) as client:
        for label, series_id in _SERIES.items():
            try:
                r = client.get(_FRED, params={
                    "series_id": series_id, "api_key": settings.fred_api_key,
                    "file_type": "json", "sort_order": "desc", "limit": 1})
                obs = r.json().get("observations", [])
                if obs and obs[0]["value"] not in (".", ""):
                    out[label] = float(obs[0]["value"])
            except Exception as exc:  # noqa: BLE001
                log.warning("FRED %s fetch failed: %s", series_id, exc)
    return out


def fred(series: str = "") -> dict:
    """Latest macro values. Real when FRED_API_KEY is set and not in sim mode; else seeded.
    `series` optionally filters to one label (e.g. 'real_yield_10y')."""
    if settings.fred_api_key and not settings.use_simulated:
        data = _fetch_real() or dict(_SIM)
        source = "fred" if data is not _SIM else "simulated"
    else:
        data, source = dict(_SIM), "simulated"
    if series:
        return {"series": series, "value": data.get(series), "source": source}
    return {"source": source, "series_map": _SERIES, **data}
