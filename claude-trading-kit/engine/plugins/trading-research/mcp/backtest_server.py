"""backtest-engine — MCP (stdio) server exposing the trading-research engine.

Wraps the vendored gold-bot (no-look-ahead backtest, ATR sizing, honest scorecard)
plus the new cost model, validation suite, and regime classifier. Registered via the
plugin's .mcp.json; starts when trading-research is enabled.

Requires the MCP SDK:  pip install mcp
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import research as R  # noqa: E402  (after sys.path tweak; adds vendor via research.goldbot)

try:
    from mcp.server.fastmcp import FastMCP
except ModuleNotFoundError:  # pragma: no cover
    sys.stderr.write("backtest-engine: missing dependency — run `pip install mcp`\n")
    raise

mcp = FastMCP("backtest-engine")

# Roadmap §11 go-live gates.
_GATES = {"sharpe": 0.7, "profit_factor": 1.3, "expectancy_r": 0.2, "calmar": 0.5}


def _round_metrics(m: dict) -> dict:
    return {k: (round(v, 4) if isinstance(v, float) else v) for k, v in m.items()}


@mcp.tool()
def position_size(equity: float, atr: float, risk_frac: float = 0.005,
                  stop_atr_mult: float = 2.0, point_value: float = 1.0) -> dict:
    """ATR / volatility-targeting position size: units that risk `risk_frac` of
    `equity` if price moves `stop_atr_mult * atr` against you."""
    units = R.atr_position_size(equity, risk_frac, atr, stop_atr_mult, point_value)
    return {
        "units": round(units, 6),
        "dollar_risk_at_stop": round(units * atr * stop_atr_mult * point_value, 2),
        "stop_distance": round(atr * stop_atr_mult, 4),
        "risk_frac": risk_frac,
    }


@mcp.tool()
def cost_model(units: float, price: float, point_value: float = 1.0, hold_nights: int = 0,
               spread_cost_per_unit: float = 0.0, commission_per_unit: float = 0.0,
               carry_per_unit_per_night: float = 0.0) -> dict:
    """All-in cost of a hold (spread + commission + overnight carry). `carry_per_unit_
    per_night` is negative when you pay it (e.g. long gold). Returns a breakdown plus a
    `suggested_cost_per_unit` to feed into run_backtest."""
    return R.all_in_cost(units=units, price=price, point_value=point_value,
                         hold_nights=hold_nights, spread_cost_per_unit=spread_cost_per_unit,
                         commission_per_unit=commission_per_unit,
                         carry_per_unit_per_night=carry_per_unit_per_night)


@mcp.tool()
def run_backtest(csv_path: str = "", fast: int = 20, slow: int = 50,
                 risk_frac: float = 0.005, cost_per_unit: float = 0.05,
                 point_value: float = 1.0, bars_per_year: int = 1512,
                 allow_short: bool = True) -> dict:
    """Backtest the dual-EMA+ATR trend strategy. Pass a CSV (ts,open,high,low,close) or
    leave empty for synthetic demo data. Returns the §11 scorecard + verdict.
    NB: synthetic data validates plumbing only — it is NOT evidence of edge."""
    bars = R.load_csv(csv_path) if csv_path else R.synthetic_ohlc()
    res = R.run_backtest(bars, R.DualEMATrend(fast=fast, slow=slow), risk_frac=risk_frac,
                         cost_per_unit=cost_per_unit, point_value=point_value,
                         bars_per_year=bars_per_year, allow_short=allow_short)
    m = res.metrics
    fails = [f"{k} {m.get(k, 0):.2f} < {v}" for k, v in _GATES.items() if (m.get(k) or 0) < v]
    return {
        "source": csv_path or "synthetic (demo only — not edge)",
        "bars": len(bars),
        "metrics": _round_metrics(m),
        "verdict": "PASS" if not fails else "FAIL",
        "gate_failures": fails,
    }


@mcp.tool()
def walk_forward(csv_path: str = "", in_sample: int = 400, out_sample: int = 150,
                 step: int = 150, risk_frac: float = 0.005, cost_per_unit: float = 0.05,
                 bars_per_year: int = 1512) -> dict:
    """Rolling re-optimization: pick best (fast,slow) in-sample, test out-of-sample,
    aggregate. Reports walk-forward efficiency and a stability verdict."""
    return R.walk_forward(csv_path=csv_path, in_sample=in_sample, out_sample=out_sample,
                          step=step, risk_frac=risk_frac, cost_per_unit=cost_per_unit,
                          bars_per_year=bars_per_year)


@mcp.tool()
def monte_carlo(csv_path: str = "", fast: int = 20, slow: int = 50, runs: int = 1000,
                risk_frac: float = 0.005, cost_per_unit: float = 0.05,
                bars_per_year: int = 1512, mc_seed: int = 0) -> dict:
    """Reshuffle trade order (`runs` times) to get the distribution of drawdowns and
    returns the strategy's sequence could have produced. Reports p95 max-drawdown and
    P(loss)."""
    return R.monte_carlo(csv_path=csv_path, fast=fast, slow=slow, runs=runs,
                         risk_frac=risk_frac, cost_per_unit=cost_per_unit,
                         bars_per_year=bars_per_year, mc_seed=mc_seed)


@mcp.tool()
def parameter_plateau(csv_path: str = "", center_fast: int = 20, center_slow: int = 50,
                      metric: str = "sharpe", risk_frac: float = 0.005,
                      cost_per_unit: float = 0.05, bars_per_year: int = 1512) -> dict:
    """Sweep (fast,slow) around a center point and report whether the chosen point sits
    on a robust PLATEAU or is a lone, overfit spike."""
    return R.parameter_plateau(csv_path=csv_path, center_fast=center_fast,
                               center_slow=center_slow, metric=metric, risk_frac=risk_frac,
                               cost_per_unit=cost_per_unit, bars_per_year=bars_per_year)


@mcp.tool()
def deflated_sharpe(sharpe: float, n_trials: int, n_obs: int,
                    skew: float = 0.0, kurtosis: float = 3.0) -> dict:
    """Deflated Sharpe Ratio (Bailey & López de Prado): correct an observed (per-period)
    Sharpe for how many configurations were tried and for non-normal returns."""
    return R.deflated_sharpe(sharpe=sharpe, n_trials=n_trials, n_obs=n_obs,
                             skew=skew, kurtosis=kurtosis)


@mcp.tool()
def classify_regime(csv_path: str = "", fast: int = 20, slow: int = 50,
                    atr_period: int = 14) -> dict:
    """Classify the latest regime (direction × volatility) from OHLC and recommend a
    posture for a trend system. Uses a CSV or synthetic demo data."""
    bars = R.load_csv(csv_path) if csv_path else R.synthetic_ohlc(n=400, seed=3)
    return R.classify_regime([b.high for b in bars], [b.low for b in bars],
                             [b.close for b in bars], fast=fast, slow=slow,
                             atr_period=atr_period)


@mcp.tool()
def metrics_explain() -> dict:
    """Explain the scorecard metrics and the §11 go-live gates."""
    return {
        "gates": _GATES,
        "metrics": {
            "sharpe": "risk-adjusted return; >2 strong, >3 suspect of overfitting",
            "sortino": "downside-only Sharpe",
            "calmar": "CAGR / max drawdown; >1 good",
            "profit_factor": "gross win / gross loss; >1.5 healthy, >3 suspect",
            "expectancy_r": "avg trade in R (risk units); 0.2–0.5R is typical for durable systems",
            "max_drawdown": "worst peak-to-trough; 'too good' is a leakage red flag",
            "win_rate": "trend systems often 35–45%; high win-rate alone is not the goal",
        },
        "note": "A FAIL is the common, correct outcome — never tune parameters to force a "
                "PASS. Validate any PASS with walk_forward + monte_carlo + parameter_plateau "
                "+ deflated_sharpe before trusting it.",
    }


if __name__ == "__main__":
    mcp.run()
