"""CLI backtest runner. Examples:

    python -m app.backtest.run                 # synthetic demo
    python -m app.backtest.run --csv bars.csv  # your own OHLC (ts,open,high,low,close)

Prints the scorecard and a go/no-go verdict against the roadmap §11 thresholds.
NB: the synthetic series is for plumbing validation only — it is NOT evidence of
edge. Real research = real data + walk-forward + the §5 robustness suite."""

from __future__ import annotations

import argparse

from ..strategy import DualEMATrend
from .data import load_csv, synthetic_ohlc
from .engine import run_backtest

_GATES = {  # roadmap §11 minimums to consider going live
    "sharpe": 0.7, "profit_factor": 1.3, "expectancy_r": 0.2, "calmar": 0.5,
}


def _verdict(m: dict) -> tuple[bool, list[str]]:
    fails = [f"{k} {m.get(k, 0):.2f} < {v}" for k, v in _GATES.items() if (m.get(k) or 0) < v]
    return (not fails, fails)


def main() -> None:
    p = argparse.ArgumentParser(description="Trend-strategy backtest")
    p.add_argument("--csv", help="OHLC CSV (ts,open,high,low,close)")
    p.add_argument("--fast", type=int, default=20)
    p.add_argument("--slow", type=int, default=50)
    p.add_argument("--risk", type=float, default=0.005, help="risk fraction per trade")
    p.add_argument("--cost", type=float, default=0.05, help="cost per unit traded")
    p.add_argument("--bars-per-year", type=int, default=1512, help="H4≈1512, daily=252")
    args = p.parse_args()

    bars = load_csv(args.csv) if args.csv else synthetic_ohlc()
    strat = DualEMATrend(fast=args.fast, slow=args.slow)
    res = run_backtest(bars, strat, risk_frac=args.risk, cost_per_unit=args.cost,
                       bars_per_year=args.bars_per_year)

    m = res.metrics
    print(f"\nBars: {len(bars)}   Trades: {m['num_trades']}   Source: "
          f"{'CSV ' + args.csv if args.csv else 'synthetic (demo only)'}\n")
    rows = [
        ("Total return", f"{m['total_return'] * 100:+.1f}%"),
        ("CAGR", f"{m['cagr'] * 100:+.1f}%"),
        ("Sharpe", f"{m['sharpe']:.2f}"),
        ("Sortino", f"{m['sortino']:.2f}"),
        ("Max drawdown", f"{m['max_drawdown'] * 100:.1f}%"),
        ("Calmar", f"{m['calmar']:.2f}"),
        ("Profit factor", f"{m['profit_factor']:.2f}"),
        ("Expectancy (R)", f"{m['expectancy_r']:.2f}"),
        ("Win rate", f"{m['win_rate'] * 100:.0f}%"),
    ]
    for label, val in rows:
        print(f"  {label:<16} {val:>10}")

    ok, fails = _verdict(m)
    print("\n  VERDICT:", "PASS gates ✅" if ok else "FAIL gates ❌ — " + "; ".join(fails))
    print()


if __name__ == "__main__":
    main()
