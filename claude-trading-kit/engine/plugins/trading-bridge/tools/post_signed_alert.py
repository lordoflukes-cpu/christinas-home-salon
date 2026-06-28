#!/usr/bin/env python3
"""Post an HMAC-signed ts.alert.v1 alert to a running bridge — end-to-end test of the
webhook path without TradingView. Use --tamper to prove the bridge rejects a bad signature.

Examples:
  python tools/post_signed_alert.py --secret testkey --url http://localhost:8000/tv-webhook
  python tools/post_signed_alert.py --secret testkey --url http://localhost:8000/tv-webhook --tamper
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from bridge.sign import sign_payload  # noqa: E402


def main() -> int:
    p = argparse.ArgumentParser(description="Post a signed alert to a running bridge")
    p.add_argument("--url", default="http://localhost:8000/tv-webhook")
    p.add_argument("--secret", default="testkey")
    p.add_argument("--strategy-id", default="gold-trend-h4")
    p.add_argument("--symbol", default="XAUUSD")
    p.add_argument("--action", default="buy", choices=["buy", "sell", "close"])
    p.add_argument("--track", default="spreadbet", choices=["cfd", "spreadbet"])
    p.add_argument("--client-order-id", default="")
    p.add_argument("--tamper", action="store_true", help="corrupt the body after signing")
    args = p.parse_args()

    payload = {
        "schema": "ts.alert.v1", "strategy_id": args.strategy_id,
        "client_order_id": args.client_order_id or f"e2e-{args.action}-{args.symbol}",
        "account_track": args.track, "symbol": args.symbol, "action": args.action,
        "order_type": "market", "price": 2350.0, "atr": 12.0,
        "stop_atr_mult": 2.0, "risk_frac": 0.005,
    }
    sig = sign_payload(payload, args.secret)
    if args.tamper:
        payload["price"] = 9999.0  # body no longer matches the signature

    data = json.dumps(payload).encode()
    req = urllib.request.Request(args.url, data=data, headers={
        "Content-Type": "application/json", "X-Signature": sig})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"{resp.status} {args.url}")
            print(resp.read().decode()[:600])
            return 0
    except urllib.error.HTTPError as e:
        print(f"{e.code} {args.url}")
        print(e.read().decode()[:600])
        return 0  # an HTTP error (e.g. 401 on tamper) is an expected outcome
    except Exception as exc:  # noqa: BLE001
        print(f"POST failed (is the bridge running?): {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
