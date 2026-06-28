"""Market-regime classification (NEW) — direction × volatility, with a posture
recommendation for a trend system. Cheap and robust (EMA spread + ATR), per the
roadmap's "adapt, don't predict" stance. Used by trading-core's `regime` skill."""

from __future__ import annotations

from .goldbot import atr, ema


def classify_regime(highs: list[float], lows: list[float], closes: list[float], *,
                    fast: int = 20, slow: int = 50, atr_period: int = 14) -> dict:
    need = max(slow, atr_period + 1) + 20
    if len(closes) < need:
        return {"error": f"need >= {need} bars, got {len(closes)}"}

    ef = ema(closes, fast)
    es = ema(closes, slow)
    a = atr(highs, lows, closes, atr_period)
    a_prev = atr(highs[:-20], lows[:-20], closes[:-20], atr_period)
    if ef is None or es is None or a is None:
        return {"error": "warmup"}

    spread = (ef - es) / es if es else 0.0
    if spread > 0.001:
        direction = "up"
    elif spread < -0.001:
        direction = "down"
    else:
        direction = "side"

    atr_pct = a / closes[-1] if closes[-1] else 0.0
    expanding = a_prev is not None and a > a_prev
    volatility = "volatile" if (expanding or atr_pct > 0.01) else "quiet"

    if direction != "side" and volatility == "volatile":
        posture = "press"
    elif direction != "side":
        posture = "normal"
    elif volatility == "quiet":
        posture = "stand aside"
    else:
        posture = "shrink"

    return {
        "direction": direction,
        "volatility": volatility,
        "posture": posture,
        "ema_fast": round(ef, 3),
        "ema_slow": round(es, 3),
        "ema_spread_pct": round(spread * 100, 3),
        "atr": round(a, 4),
        "atr_pct": round(atr_pct, 4),
        "note": "Trend systems press in directional+volatile regimes and stand aside in "
                "quiet ranges. Thresholds are heuristic — confirm with the macro overlay "
                "(DXY/real yields) when available.",
    }
