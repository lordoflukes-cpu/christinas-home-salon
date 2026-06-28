"""HMAC-SHA256 verification — VENDORED copy matching charting/sign.py so the bytes signed
by Pine/charting and verified by the bridge agree (canonical body excludes `signature`)."""

from __future__ import annotations

import hashlib
import hmac
import json


def canonical_body(payload: dict) -> str:
    body = {k: v for k, v in payload.items() if k != "signature"}
    return json.dumps(body, sort_keys=True, separators=(",", ":"))


def sign_payload(payload: dict, secret: str) -> str:
    return hmac.new(secret.encode(), canonical_body(payload).encode(), hashlib.sha256).hexdigest()


def verify(payload: dict, secret: str, signature: str | None = None) -> bool:
    """Verify `signature` (or payload['signature']) against the recomputed HMAC."""
    provided = signature if signature is not None else payload.get("signature", "")
    expected = sign_payload(payload, secret)
    return hmac.compare_digest(str(provided), expected)
