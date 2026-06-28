"""The venue-agnostic execution interface (ADR 0006 / execution-abstraction.md).

Strategies and the bridge speak this interface; they never know whether the order lands on
VT Markets (CFD) or IG (spread-bet). Choosing a venue is a config/tax decision."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol, runtime_checkable


@dataclass
class Order:
    idempotency_key: str          # = the alert's client_order_id (no double-fills)
    symbol: str
    side: str                     # buy | sell | close
    units: float                  # venue-neutral size (the venue converts to lots / stake-per-point)
    track: str                    # cfd | spreadbet
    order_type: str = "market"
    price: float | None = None
    stop: float | None = None
    take: float | None = None


@dataclass
class Fill:
    order_id: str
    symbol: str
    side: str
    filled_units: float
    price: float
    track: str
    venue: str
    status: str = "filled"        # filled | blocked | error | duplicate


@dataclass
class Position:
    symbol: str
    units: float                  # signed
    avg_price: float
    track: str


@dataclass
class Account:
    equity: float
    currency: str = "USD"
    venue: str = ""
    track: str = ""


@dataclass
class Reconciliation:
    ok: bool
    internal: list = field(default_factory=list)
    venue: list = field(default_factory=list)
    mismatches: list = field(default_factory=list)


@runtime_checkable
class ExecutionVenue(Protocol):
    name: str
    track: str

    def get_account(self) -> Account: ...
    def get_positions(self) -> list[Position]: ...
    def place_order(self, order: Order) -> Fill: ...
    def close(self, symbol: str) -> Fill: ...
    def flatten_all(self) -> list[Fill]: ...
    def reconcile(self) -> Reconciliation: ...
