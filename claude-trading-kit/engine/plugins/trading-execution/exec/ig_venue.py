"""IGVenue — UK spread-bet (tax-free track) via IG's REST/streaming API (ADR 0006). Sizing
(units→stake/point) and track tagging are implemented and tested; live API calls are
documented TODOs that raise a clear error until credentials are configured."""

from __future__ import annotations

from .interface import Account, Fill, Order, Position, Reconciliation
from .sizing import units_to_stake_per_point

# Per-point value per unit by instrument (account currency P&L per 1.0 move per unit).
_POINT_VALUE = {"XAUUSD": 1.0, "XAGUSD": 1.0}


class IGVenue:
    name = "ig"
    track = "spreadbet"

    def __init__(self, api_key: str = "", username: str = "", password: str = "",
                 account_id: str = "") -> None:
        self.api_key = api_key
        self.username = username
        self.password = password
        self.account_id = account_id

    @property
    def configured(self) -> bool:
        return bool(self.api_key and self.username and self.password)

    def prepare(self, order: Order) -> dict:
        """Venue-specific order shape (tested): units→stake per point, spread-bet track."""
        stake = units_to_stake_per_point(order.units, _POINT_VALUE.get(order.symbol, 1.0))
        direction = {"buy": "BUY", "sell": "SELL", "close": "CLOSE"}.get(order.side, order.side)
        return {"epic": order.symbol, "direction": direction, "stake_per_point": stake,
                "type": order.order_type, "stop": order.stop, "track": "spreadbet",
                "deal_reference": order.idempotency_key}

    def _require(self) -> None:
        if not self.configured:
            raise RuntimeError(
                "IGVenue not configured — set EXEC_IG_API_KEY + EXEC_IG_USERNAME + "
                "EXEC_IG_PASSWORD (+ EXEC_IG_ACCOUNT). Live IG calls are not wired in this build "
                "(see docs/03-integrations/uk-spreadbet-ig.md). Use the PaperVenue for testing.")

    # TODO(real): implement via IG REST (session token) + Lightstreamer.
    def get_account(self) -> Account:
        self._require()
        raise NotImplementedError
    def get_positions(self) -> list[Position]:
        self._require()
        raise NotImplementedError
    def place_order(self, order: Order) -> Fill:
        self._require()
        raise NotImplementedError
    def close(self, symbol: str) -> Fill:
        self._require()
        raise NotImplementedError
    def flatten_all(self) -> list[Fill]:
        self._require()
        raise NotImplementedError
    def reconcile(self) -> Reconciliation:
        self._require()
        raise NotImplementedError
