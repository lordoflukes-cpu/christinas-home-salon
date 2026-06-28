from app.backtest.data import synthetic_ohlc
from app.backtest.engine import run_backtest
from app.strategy import DualEMATrend


def test_backtest_runs_and_reports():
    bars = synthetic_ohlc(n=1200, seed=11)
    res = run_backtest(bars, DualEMATrend(fast=20, slow=50),
                       risk_frac=0.005, cost_per_unit=0.05, bars_per_year=1512)

    # equity sampled once per bar
    assert len(res.equity) == len(bars)
    # a trending series should generate at least a few discrete trades
    assert res.metrics["num_trades"] >= 3
    # required metric keys present (the §11 scorecard)
    for k in ("sharpe", "profit_factor", "expectancy_r", "max_drawdown", "calmar", "win_rate"):
        assert k in res.metrics


def test_no_lookahead_no_trades_before_warmup():
    bars = synthetic_ohlc(n=300, seed=3)
    strat = DualEMATrend(fast=20, slow=50)
    res = run_backtest(bars, strat, bars_per_year=1512)
    # no trade can be entered before the strategy is warmed up
    assert all(t.entry_i >= strat.warmup() for t in res.trades)
