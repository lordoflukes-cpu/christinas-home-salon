"""trading-bridge engine: the ts.alert.v1 receiver pipeline (auth → idempotency →
risk-gate → route). Pure-Python; reuses the gold-bot engine for sizing and paper fills."""

from .config import Settings
from .contract import validate_alert
from .core import Bridge, Decision
from .sign import canonical_body, sign_payload, verify

__all__ = ["Bridge", "Decision", "Settings", "validate_alert",
           "sign_payload", "verify", "canonical_body"]
