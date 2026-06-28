"""trading-research engine extensions — wraps the vendored gold-bot, adds the cost
model, the honest-validation suite, and regime classification. Vendor stays pristine."""

from .costs import all_in_cost
from .goldbot import (
    Bar, BacktestResult, DualEMATrend, Trade, atr, atr_position_size, compute_metrics,
    ema, load_csv, max_drawdown, run_backtest, synthetic_ohlc,
)
from .regime import classify_regime
from .validation import deflated_sharpe, monte_carlo, parameter_plateau, walk_forward

__all__ = [
    "all_in_cost", "classify_regime",
    "walk_forward", "monte_carlo", "parameter_plateau", "deflated_sharpe",
    "run_backtest", "BacktestResult", "Trade", "Bar", "load_csv", "synthetic_ohlc",
    "compute_metrics", "max_drawdown", "atr_position_size", "DualEMATrend", "ema", "atr",
]
