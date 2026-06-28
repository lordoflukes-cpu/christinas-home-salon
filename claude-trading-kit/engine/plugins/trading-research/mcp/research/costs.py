"""All-in cost model (NEW — the vendor only has a flat `cost_per_unit` proxy).

Costs decide profitability as much as the signal; for multi-day holds, overnight
**financing/carry** usually dominates. This computes a pessimistic per-trade cost and
a `suggested_cost_per_unit` to feed straight into `run_backtest(cost_per_unit=…)` so
backtests are charged honestly.

All amounts are in account currency. `units` = contracts/oz; `point_value` = P&L per
1.0 price move per unit."""

from __future__ import annotations


def all_in_cost(
    *,
    units: float,
    price: float,
    point_value: float = 1.0,
    hold_nights: int = 0,
    spread_cost_per_unit: float = 0.0,      # round-turn (entry+exit) spread, per unit
    commission_per_unit: float = 0.0,       # per unit, per side
    carry_per_unit_per_night: float = 0.0,  # signed: negative = you PAY (e.g. long gold)
) -> dict:
    u = abs(units)
    spread = spread_cost_per_unit * u
    commission = commission_per_unit * u * 2          # both sides
    carry = -carry_per_unit_per_night * u * hold_nights  # express cost as a positive number
    total = spread + commission + carry
    notional = u * price * point_value
    # The backtest charges cost_per_unit on EACH transaction (entry and exit), so the
    # per-transaction figure is half the round-turn spread/commission; carry is folded in.
    per_unit_round_turn = (total / u) if u else 0.0
    suggested_cost_per_unit = per_unit_round_turn / 2 if u else 0.0
    return {
        "spread": round(spread, 4),
        "commission": round(commission, 4),
        "carry": round(carry, 4),
        "total_cost": round(total, 4),
        "notional": round(notional, 2),
        "cost_pct_of_notional": round(total / notional * 100, 4) if notional else None,
        "suggested_cost_per_unit": round(suggested_cost_per_unit, 6),
        "note": "Pessimistic proxy. For multi-day holds carry usually dominates — "
                "compare spread-bet financing vs futures (no carry). "
                "Feed suggested_cost_per_unit into run_backtest(cost_per_unit=…).",
    }
