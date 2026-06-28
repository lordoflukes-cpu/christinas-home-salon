"""Position sizing — ATR / volatility targeting (roadmap §6).

Size so that an adverse move of `stop_atr_mult * ATR` costs exactly
`risk_frac` of equity. Shared by the backtest and the live executor so research
and live use identical sizing."""

from __future__ import annotations


def atr_position_size(
    equity: float,
    risk_frac: float,
    atr: float,
    stop_atr_mult: float,
    point_value: float = 1.0,
) -> float:
    """Units (contracts/oz) to risk `risk_frac` of `equity` at a `stop_atr_mult*ATR` stop.

    point_value = account-currency P&L per 1.0 price move per unit.
    Returns 0.0 if inputs are degenerate.
    """
    if equity <= 0 or risk_frac <= 0 or atr is None or atr <= 0 or stop_atr_mult <= 0:
        return 0.0
    risk_per_unit = atr * stop_atr_mult * point_value
    if risk_per_unit <= 0:
        return 0.0
    return (equity * risk_frac) / risk_per_unit
