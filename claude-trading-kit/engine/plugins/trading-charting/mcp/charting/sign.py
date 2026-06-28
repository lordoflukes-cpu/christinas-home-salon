"""HMAC-SHA256 signing/verification for ts.alert.v1 payloads (docs/08-security.md).

The bridge verifies this signature before acting on any alert. Canonicalisation
excludes the `signature` field and uses sorted, compact JSON so Pine and the bridge
agree on the bytes that were signed."""

from __future__ import annotations

import hashlib
import hmac
import json


def canonical_body(payload: dict) -> str:
    body = {k: v for k, v in payload.items() if k != "signature"}
    return json.dumps(body, sort_keys=True, separators=(",", ":"))


def sign_payload(payload: dict, secret: str) -> str:
    """Return the HMAC-SHA256 hex signature over the canonical body."""
    return hmac.new(secret.encode(), canonical_body(payload).encode(), hashlib.sha256).hexdigest()


def verify_payload(payload: dict, secret: str) -> bool:
    """Constant-time check of payload['signature'] against the recomputed HMAC."""
    expected = sign_payload(payload, secret)
    return hmac.compare_digest(str(payload.get("signature", "")), expected)
