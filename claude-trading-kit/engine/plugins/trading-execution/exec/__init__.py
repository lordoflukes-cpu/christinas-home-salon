"""trading-execution engine: the venue-agnostic interface + backends (PaperVenue working;
MetaApi/IG/MT5 real-path stubs), sizing adapters, kill-switch, reconciliation, and UK tax
records. Vendor stays pristine."""

from .config import Settings, settings
from .interface import Account, ExecutionVenue, Fill, Order, Position, Reconciliation
from .killswitch import KillSwitch
from .reconcile import compare
from .registry import Registry
from .sizing import units_to_lots, units_to_stake_per_point
from .tax import tax_records

__all__ = [
    "Settings", "settings", "Registry", "KillSwitch", "compare", "tax_records",
    "units_to_lots", "units_to_stake_per_point",
    "Order", "Fill", "Position", "Account", "Reconciliation", "ExecutionVenue",
]
