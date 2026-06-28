"""The intermarket panel — gold's "trinity" (DXY, real yields) plus the gold-silver ratio,
assembled from the FRED and price tools. The read for both manual context and bot regime."""

from __future__ import annotations

from .fred import fred
from .goldbot import gold_silver_ratio
from .prices import quote


def intermarket() -> dict:
    macro = fred()
    xau = quote("XAUUSD")["price"]
    xag = quote("XAGUSD")["price"]
    ratio = gold_silver_ratio(xau, xag)
    ry, dxy = macro.get("real_yield_10y"), macro.get("dxy")

    bits = []
    if dxy is not None:
        bits.append(f"DXY {dxy}")
    if ry is not None:
        bits.append(f"10y real yield {ry}%")
    if ratio is not None:
        bits.append(f"G/S ratio {round(ratio, 1)}")

    return {
        "source": macro.get("source"),
        "xau": xau, "xag": xag,
        "gold_silver_ratio": round(ratio, 2) if ratio else None,
        "real_yield_10y": ry, "nominal_10y": macro.get("nominal_10y"),
        "breakeven_10y": macro.get("breakeven_10y"), "dxy": dxy,
        "read": "; ".join(bits),
        "note": "Gold is inverse to real yields and DXY (regime-dependent — can break in "
                "panics / central-bank-flow regimes). Watch the ratio for silver leadership.",
    }
