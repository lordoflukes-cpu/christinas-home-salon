from app.execution.paper_broker import PaperBroker


def test_long_profit_and_close():
    b = PaperBroker(equity0=20_000)
    b.market_to(2.0, price=2350.0)        # open long 2 units
    b.mark(2360.0)                        # +10 * 2 = +20 unrealized
    assert round(b.equity(), 2) == 20_020.0
    b.market_to(0.0, price=2360.0)        # close
    assert round(b.realized, 2) == 20.0
    assert b.position == 0.0
    assert b.trades == 1


def test_flip_long_to_short_realizes_and_reopens():
    b = PaperBroker(equity0=20_000)
    b.market_to(1.0, price=100.0)
    b.market_to(-1.0, price=110.0)        # close +10 profit, open short
    assert round(b.realized, 2) == 10.0
    assert b.position == -1.0
    assert b.avg == 110.0
    assert b.trades == 1


def test_cost_charged_on_transactions():
    b = PaperBroker(equity0=20_000)
    b.market_to(1.0, price=100.0, cost_per_unit=0.5)   # open: -0.5
    b.market_to(0.0, price=100.0, cost_per_unit=0.5)   # close: -0.5, pnl 0
    assert round(b.equity(), 2) == 19_999.0
