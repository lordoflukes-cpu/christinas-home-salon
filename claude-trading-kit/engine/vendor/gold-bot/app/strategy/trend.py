"""Trend/momentum strategy — the roadmap's recommended first system (§1).

Dual-EMA crossover for direction, ATR for the stop distance that drives position
sizing. Long/flat/short on signed direction. Deliberately simple and robust: an
ensemble across several (fast, slow) pairs is the future-proofing upgrade
(roadmap §13) — this single pair is the honest baseline to beat."""

from __future__ import annotations

from dataclasses import dataclass

from ..indicators import atr, ema


@dataclass
class DualEMATrend:
    fast: int = 20
    slow: int = 50
    atr_period: int = 14
    stop_atr_mult: float = 2.0

    def warmup(self) -> int:
        """Bars needed before a signal is valid."""
        return max(self.slow, self.atr_period + 1)

    def signal(self, highs: list[float], lows: list[float], closes: list[float]) -> dict:
        """Direction in {-1, 0, +1} plus the ATR used for sizing/stops."""
        if len(closes) < self.warmup():
            return {"direction": 0, "atr": None}
        fast = ema(closes, self.fast)
        slow = ema(closes, self.slow)
        a = atr(highs, lows, closes, self.atr_period)
        if fast is None or slow is None or a is None:
            return {"direction": 0, "atr": a}
        direction = 1 if fast > slow else (-1 if fast < slow else 0)
        return {"direction": direction, "atr": a, "ema_fast": fast, "ema_slow": slow}
