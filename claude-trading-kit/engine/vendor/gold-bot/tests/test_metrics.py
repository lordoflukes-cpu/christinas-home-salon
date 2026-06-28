from app.backtest.engine import Trade
from app.backtest.metrics import compute_metrics, max_drawdown


def test_max_drawdown():
    assert max_drawdown([100, 120, 90, 110]) == (120 - 90) / 120
    assert max_drawdown([100, 101, 102]) == 0.0


def test_profit_factor_and_expectancy():
    trades = [
        Trade(0, 1, 1, 100, 110, 1, pnl=200.0, r=2.0),
        Trade(2, 3, 1, 110, 105, 1, pnl=-100.0, r=-1.0),
        Trade(4, 5, 1, 105, 108, 1, pnl=100.0, r=1.0),
    ]
    equity = [20000, 20200, 20100, 20200]
    m = compute_metrics(equity, trades, bars_per_year=252)
    assert round(m["profit_factor"], 2) == 3.0          # 300 wins / 100 losses
    assert round(m["expectancy_r"], 4) == round((2 - 1 + 1) / 3, 4)
    assert round(m["win_rate"], 4) == round(2 / 3, 4)
    assert m["num_trades"] == 3


def test_insufficient_points():
    assert "error" in compute_metrics([100], [], 252)
