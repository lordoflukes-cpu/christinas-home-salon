"""Performance metrics matching the roadmap's profitability scorecard (§11):
Sharpe, Sortino, max drawdown, Calmar, profit factor, expectancy (R), win rate."""

from __future__ import annotations

import math


def _stdev(xs: list[float]) -> float:
    if len(xs) < 2:
        return 0.0
    m = sum(xs) / len(xs)
    return math.sqrt(sum((x - m) ** 2 for x in xs) / len(xs))


def max_drawdown(equity: list[float]) -> float:
    """Largest peak-to-trough fractional drawdown (>= 0)."""
    peak = -math.inf
    mdd = 0.0
    for v in equity:
        peak = max(peak, v)
        if peak > 0:
            mdd = max(mdd, (peak - v) / peak)
    return mdd


def compute_metrics(equity: list[float], trades: list, bars_per_year: int) -> dict:
    if len(equity) < 2:
        return {"error": "insufficient equity points"}

    rets = [equity[i] / equity[i - 1] - 1 for i in range(1, len(equity)) if equity[i - 1]]
    mean = sum(rets) / len(rets) if rets else 0.0
    sd = _stdev(rets)
    downside = _stdev([r for r in rets if r < 0])
    ann = math.sqrt(bars_per_year)

    sharpe = (mean / sd * ann) if sd else 0.0
    sortino = (mean / downside * ann) if downside else 0.0

    total_return = equity[-1] / equity[0] - 1
    years = max(len(equity) / bars_per_year, 1e-9)
    cagr = (equity[-1] / equity[0]) ** (1 / years) - 1 if equity[0] > 0 else 0.0
    mdd = max_drawdown(equity)
    calmar = (cagr / mdd) if mdd else 0.0

    pnls = [t.pnl for t in trades]
    wins = [p for p in pnls if p > 0]
    losses = [p for p in pnls if p < 0]
    gross_win, gross_loss = sum(wins), abs(sum(losses))
    profit_factor = (gross_win / gross_loss) if gross_loss else (math.inf if gross_win else 0.0)
    win_rate = (len(wins) / len(pnls)) if pnls else 0.0
    expectancy_r = (sum(t.r for t in trades) / len(trades)) if trades else 0.0

    return {
        "total_return": total_return,
        "cagr": cagr,
        "sharpe": sharpe,
        "sortino": sortino,
        "max_drawdown": mdd,
        "calmar": calmar,
        "profit_factor": profit_factor,
        "expectancy_r": expectancy_r,
        "win_rate": win_rate,
        "num_trades": len(trades),
    }
