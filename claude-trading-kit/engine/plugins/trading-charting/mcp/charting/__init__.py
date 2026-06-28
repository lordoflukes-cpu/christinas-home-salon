"""charting-tools engine: the ts.alert.v1 contract, HMAC signing, Pine lint, and the
Strategy-Tester cross-check. Pure-Python (stdlib only)."""

from .compare import diff_metrics
from .contract import load_schema, make_alert_payload, validate_alert
from .pinelint import lint_pine
from .sign import canonical_body, sign_payload, verify_payload

__all__ = [
    "load_schema", "validate_alert", "make_alert_payload",
    "sign_payload", "verify_payload", "canonical_body",
    "lint_pine", "diff_metrics",
]
