"""Event-driven backtest engine.

Discipline that matters: signals are computed from data **through bar i** and
executed at **bar i+1's open** — no look-ahead. Trades are discrete (enter when
flat, exit/flip on a direction change), sized once at entry via ATR, with an
explicit per-trade risk so expectancy can be reported in R. Costs are charged per
unit traded as a spread+slippage proxy."""

from __future__ import annotations

from dataclasses import dataclass

from ..sizing import atr_position_size
from .data import Bar
from .metrics import compute_metrics


@dataclass
class Trade:
    entry_i: int
    exit_i: int
    direction: int
    entry: float
    exit: float
    units: float
    pnl: float
    r: float


@dataclass
class BacktestResult:
    equity: list[float]
    trades: list[Trade]
    metrics: dict


def run_backtest(
    bars: list[Bar],
    strategy,
    *,
    equity0: float = 20_000.0,
    risk_frac: float = 0.005,
    cost_per_unit: float = 0.0,
    point_value: float = 1.0,
    allow_short: bool = True,
    bars_per_year: int = 252,
) -> BacktestResult:
    highs = [b.high for b in bars]
    lows = [b.low for b in bars]
    closes = [b.close for b in bars]
    n = len(bars)
    warm = strategy.warmup()

    cash = equity0
    pos = 0.0
    entry = 0.0
    entry_dir = 0
    entry_i = 0
    entry_risk = 0.0
    equity: list[float] = []
    trades: list[Trade] = []

    def open_position(direction: int, atr_val: float, price: float, i: int, equity_now: float):
        nonlocal cash, pos, entry, entry_dir, entry_i, entry_risk
        units = direction * atr_position_size(equity_now, risk_frac, atr_val,
                                              strategy.stop_atr_mult, point_value)
        if units == 0:
            return
        cash -= abs(units) * cost_per_unit
        pos, entry, entry_dir, entry_i = units, price, direction, i
        entry_risk = abs(units) * atr_val * strategy.stop_atr_mult * point_value

    for i in range(n):
        close = bars[i].close
        mtm = cash + (pos * (close - entry) * point_value if pos else 0.0)
        equity.append(mtm)

        if i < warm - 1 or i >= n - 1:
            continue

        sig = strategy.signal(highs[:i + 1], lows[:i + 1], closes[:i + 1])
        d, a = sig["direction"], sig["atr"]
        if not allow_short and d < 0:
            d = 0
        exec_price = bars[i + 1].open

        if pos == 0:
            if d != 0 and a:
                open_position(d, a, exec_price, i + 1, mtm)
        elif d == 0 or d * entry_dir < 0:
            pnl = pos * (exec_price - entry) * point_value
            cash += pnl - abs(pos) * cost_per_unit
            trades.append(Trade(entry_i, i + 1, entry_dir, entry, exec_price, pos, pnl,
                                pnl / entry_risk if entry_risk else 0.0))
            pos = 0.0
            if d * entry_dir < 0 and a:  # flip straight into the new direction
                open_position(d, a, exec_price, i + 1, cash)

    return BacktestResult(equity, trades, compute_metrics(equity, trades, bars_per_year))
