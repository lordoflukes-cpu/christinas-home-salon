"""PaperVenue — the working, no-creds default. Wraps one gold-bot PaperBroker per symbol so
it supports a multi-symbol book, is idempotent, and serves both tracks for testing."""

from __future__ import annotations

from .goldbot import PaperBroker
from .interface import Account, Fill, Order, Position, Reconciliation
from .reconcile import compare


class PaperVenue:
    name = "paper"

    def __init__(self, equity0: float = 20_000.0, track: str = "cfd") -> None:
        self.track = track
        self.equity0 = equity0
        self._brokers: dict[str, PaperBroker] = {}
        self._seen: set[str] = set()

    def _broker(self, symbol: str) -> PaperBroker:
        return self._brokers.setdefault(symbol, PaperBroker(equity0=self.equity0))

    def get_account(self) -> Account:
        pnl = sum(b.equity() - b.equity0 for b in self._brokers.values())
        return Account(equity=round(self.equity0 + pnl, 2), venue=self.name, track=self.track)

    def get_positions(self) -> list[Position]:
        return [Position(sym, round(b.position, 4), round(b.avg, 3), self.track)
                for sym, b in self._brokers.items() if b.position != 0]

    def place_order(self, order: Order) -> Fill:
        if order.idempotency_key in self._seen:
            return Fill(order.idempotency_key, order.symbol, order.side, 0.0,
                        order.price or 0.0, order.track, self.name, status="duplicate")
        self._seen.add(order.idempotency_key)
        b = self._broker(order.symbol)
        price = order.price or b.last or 0.0
        b.mark(price)
        target = 0.0 if order.side == "close" else (order.units if order.side == "buy" else -order.units)
        b.market_to(target, price)
        return Fill(order.idempotency_key, order.symbol, order.side, order.units, price,
                    order.track, self.name, status="filled")

    def close(self, symbol: str) -> Fill:
        b = self._broker(symbol)
        b.market_to(0.0, b.last or b.avg or 0.0)
        return Fill(f"close-{symbol}", symbol, "close", 0.0, b.last or 0.0, self.track, self.name)

    def flatten_all(self) -> list[Fill]:
        fills = []
        for sym, b in self._brokers.items():
            if b.position != 0:
                b.market_to(0.0, b.last or b.avg or 0.0)
                fills.append(Fill(f"flat-{sym}", sym, "close", 0.0, b.last or 0.0,
                                  self.track, self.name))
        return fills

    def reconcile(self) -> Reconciliation:
        # Paper is its own source of truth → internal == venue (always ok). Real venues
        # would compare internal expectations to the broker API here.
        pos = [{"symbol": p.symbol, "units": p.units} for p in self.get_positions()]
        return compare(pos, pos)
