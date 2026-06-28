"""MT5Venue — VT Markets (CFD) via a self-hosted MetaTrader 5 terminal + the `MetaTrader5`
Python package. WINDOWS-ONLY optional backend (ADR 0007) — never the default. Same units→lots
sizing as MetaApi; live calls are a documented stub."""

from __future__ import annotations

from .interface import Account, Fill, Order, Position, Reconciliation
from .sizing import units_to_lots

_CONTRACT_SIZE = {"XAUUSD": 100.0, "XAGUSD": 5000.0}


class MT5Venue:
    name = "mt5"
    track = "cfd"

    def __init__(self, login: str = "", password: str = "", server: str = "") -> None:
        self.login, self.password, self.server = login, password, server

    @property
    def configured(self) -> bool:
        return bool(self.login and self.server)

    def prepare(self, order: Order) -> dict:
        lots = units_to_lots(order.units, _CONTRACT_SIZE.get(order.symbol, 100.0))
        return {"symbol": order.symbol, "side": order.side, "lots": lots, "track": "cfd"}

    def _require(self) -> None:
        raise RuntimeError(
            "MT5Venue is a Windows-only self-hosted backend and is not wired in this build "
            "(needs a running MT5 terminal + the MetaTrader5 package). Prefer MetaApi (cloud, "
            "cross-device) or the PaperVenue. See docs/03-integrations/vt-markets-metaapi.md.")

    def get_account(self) -> Account: self._require(); raise NotImplementedError
    def get_positions(self) -> list[Position]: self._require(); raise NotImplementedError
    def place_order(self, order: Order) -> Fill: self._require(); raise NotImplementedError
    def close(self, symbol: str) -> Fill: self._require(); raise NotImplementedError
    def flatten_all(self) -> list[Fill]: self._require(); raise NotImplementedError
    def reconcile(self) -> Reconciliation: self._require(); raise NotImplementedError
