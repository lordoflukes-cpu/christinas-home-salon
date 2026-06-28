#!/usr/bin/env python3
"""Stub alert poster — simulate a TradingView webhook for end-to-end testing.

Builds a ts.alert.v1 payload, validates it, optionally HMAC-signs it, and either prints it
or POSTs it to a URL (your trading-bridge, once it exists in Phase 3). No TradingView account
needed.

Examples:
  python tools/post_alert.py --print
  python tools/post_alert.py --secret testkey --print
  python tools/post_alert.py --secret testkey --url http://localhost:8000/tv-webhook
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "mcp"))

from charting import make_alert_payload, sign_payload, validate_alert  # noqa: E402


def build(args) -> dict:
    payload = make_alert_payload(
        strategy_id=args.strategy_id, symbol=args.symbol, action=args.action,
        account_track=args.track, price=args.price, atr=args.atr,
        client_order_id=args.client_order_id or f"demo-{args.action}-{args.symbol}")
    if args.secret:
        payload["signature"] = sign_payload(payload, args.secret)
    return payload


def main() -> int:
    p = argparse.ArgumentParser(description="Simulate a TradingView alert webhook")
    p.add_argument("--strategy-id", default="gold-trend-h4")
    p.add_argument("--symbol", default="XAUUSD")
    p.add_argument("--action", default="buy", choices=["buy", "sell", "close"])
    p.add_argument("--track", default="spreadbet", choices=["cfd", "spreadbet"])
    p.add_argument("--price", type=float, default=2350.0)
    p.add_argument("--atr", type=float, default=12.0)
    p.add_argument("--client-order-id", default="")
    p.add_argument("--secret", default="")
    p.add_argument("--url", default="")
    p.add_argument("--print", action="store_true", dest="do_print")
    args = p.parse_args()

    payload = build(args)
    result = validate_alert(payload)
    if not result["valid"]:
        print("INVALID payload:", result["errors"], file=sys.stderr)
        return 1

    if args.do_print or not args.url:
        print(json.dumps(payload, indent=2))
        if not args.url:
            return 0

    data = json.dumps(payload).encode()
    req = urllib.request.Request(args.url, data=data,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"POST {args.url} → {resp.status}")
            print(resp.read().decode()[:500])
    except Exception as exc:  # noqa: BLE001
        print(f"POST failed (is the bridge running?): {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
