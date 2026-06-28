"""MetaApiVenue — VT Markets (CFD) via MetaApi cloud (ADR 0001). The sizing (units→lots) and
track tagging are implemented and tested; the live REST/WebSocket calls are documented TODOs
that raise a clear error until credentials are configured."""

from __future__ import annotations

from .interface import Account, Fill, Order, Position, Reconciliation
from .sizing import units_to_lots

_CONTRACT_SIZE = {"XAUUSD": 100.0, "XAGUSD": 5000.0}  # 1 lot = 100 oz gold / 5000 oz silver


class MetaApiVenue:
    name = "metaapi"
    track = "cfd"

    def __init__(self, token: str = "", account_id: str = "") -> None:
        self.token = token
        self.account_id = account_id

    @property
    def configured(self) -> bool:
        return bool(self.token and self.account_id)

    def prepare(self, order: Order) -> dict:
        """Venue-specific order shape (tested): units→lots, CFD track."""
        lots = units_to_lots(order.units, _CONTRACT_SIZE.get(order.symbol, 100.0))
        return {"symbol": order.symbol, "side": order.side, "lots": lots,
                "type": order.order_type, "stop": order.stop, "track": "cfd",
                "client_order_id": order.idempotency_key}

    def _require(self) -> None:
        if not self.configured:
            raise RuntimeError(
                "MetaApiVenue not configured — set EXEC_METAAPI_TOKEN + EXEC_METAAPI_ACCOUNT. "
                "Live MetaApi calls are not wired in this build (see docs/03-integrations/"
                "vt-markets-metaapi.md). Use the PaperVenue for testing.")

    # TODO(real): implement via metaapi-cloud-sdk against the configured account.
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
