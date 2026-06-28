"""Paper (simulated) broker. Tracks a single signed position, marks to market,
and realizes P&L on close/flip. Leveraged-derivative accounting: opening costs no
cash outlay, equity = cash + unrealized. Swap this class for a real broker
adapter (OANDA v20 / IBKR) behind the same `market_to`/`equity` interface."""

from __future__ import annotations


class PaperBroker:
    def __init__(self, equity0: float = 20_000.0, point_value: float = 1.0) -> None:
        self.equity0 = equity0
        self.point_value = point_value
        self.cash = equity0          # realized equity
        self.position = 0.0          # signed units
        self.avg = 0.0               # average entry price
        self.realized = 0.0
        self.last = 0.0
        self.trades = 0

    def mark(self, price: float) -> None:
        self.last = price

    def equity(self) -> float:
        unreal = self.position * (self.last - self.avg) * self.point_value if self.position else 0.0
        return self.cash + unreal

    def market_to(self, target: float, price: float, cost_per_unit: float = 0.0) -> None:
        """Move to a target signed position. Only flat<->long<->short transitions
        are used by the executor, so this realizes on any close or flip."""
        if target == self.position:
            self.last = price
            return
        # close existing leg on exit or flip
        if self.position != 0 and (target == 0 or target * self.position < 0):
            pnl = self.position * (price - self.avg) * self.point_value
            self.cash += pnl - abs(self.position) * cost_per_unit
            self.realized += pnl
            self.trades += 1
            self.position, self.avg = 0.0, 0.0
        # open new leg
        if target != 0 and self.position == 0:
            self.cash -= abs(target) * cost_per_unit
            self.position, self.avg = target, price
        self.last = price

    def state(self) -> dict:
        return {
            "equity": round(self.equity(), 2),
            "realized": round(self.realized, 2),
            "position": round(self.position, 4),
            "avg_price": round(self.avg, 3),
            "trades": self.trades,
            "last": self.last,
        }
