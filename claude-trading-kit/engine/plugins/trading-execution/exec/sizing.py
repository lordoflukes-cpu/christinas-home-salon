"""Per-venue sizing adapters. The venue-neutral size is `units` (from trading-core's
ATR/vol-target). MetaApi/MT5 trade in **lots**; IG spread bets in **stake per point**.

These convert one to the other; the core risk math lives once in trading-core."""

from __future__ import annotations


def units_to_lots(units: float, contract_size: float = 100.0) -> float:
    """Convert units (e.g. oz) to broker lots. For XAUUSD a standard lot = 100 oz, so
    `contract_size=100`. Returns lots rounded to 2 dp (typical min lot step 0.01)."""
    if contract_size <= 0:
        return 0.0
    return round(units / contract_size, 2)


def units_to_stake_per_point(units: float, point_value_per_unit: float = 1.0) -> float:
    """Convert units to IG spread-bet **stake per point**. `point_value_per_unit` is the
    account-currency P&L per 1.0 price move per unit; stake/point = units × that value.
    Rounded to 2 dp."""
    return round(units * point_value_per_unit, 2)
