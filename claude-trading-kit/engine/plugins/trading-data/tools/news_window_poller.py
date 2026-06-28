#!/usr/bin/env python3
"""News-window poller — closes the data→bridge loop.

Polls the economic calendar and POSTs the news-window state to the bridge's
`/api/news-window` endpoint, so the bridge auto-blocks new entries around high-impact
releases (CPI/FOMC/NFP) with no human in the loop.

Run alongside the bridge:
  python tools/news_window_poller.py --bridge http://localhost:8000 --interval 30
  python tools/news_window_poller.py --bridge http://localhost:8000 --once          # single check
  python tools/news_window_poller.py --bridge http://localhost:8000 --event-in 60   # inject a test event 60s out
"""

from __future__ import annotations

import argparse
import os
import sys
import time
import urllib.request

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from data.calendar import news_window  # noqa: E402


def _post(bridge: str, active: bool) -> int:
    url = f"{bridge.rstrip('/')}/api/news-window?active={'true' if active else 'false'}"
    req = urllib.request.Request(url, data=b"", method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status


def _check_and_post(bridge: str, events) -> dict:
    nw = news_window(events=events)
    try:
        code = _post(bridge, nw["active"])
        print(f"news_window active={nw['active']} → POST {bridge}/api/news-window [{code}]"
              + (f"  next: {nw['next_event']['title']} in {nw['next_event']['in_minutes']}m"
                 if nw["next_event"] else ""))
    except Exception as exc:  # noqa: BLE001
        print(f"POST failed (is the bridge running?): {exc}", file=sys.stderr)
    return nw


def main() -> int:
    p = argparse.ArgumentParser(description="Poll the calendar → set the bridge news-window")
    p.add_argument("--bridge", default="http://localhost:8000")
    p.add_argument("--interval", type=int, default=30)
    p.add_argument("--once", action="store_true")
    p.add_argument("--event-in", type=float, default=None,
                   help="inject a test high-impact event N seconds from now")
    args = p.parse_args()

    events = None
    if args.event_in is not None:
        events = [{"ts": time.time() + args.event_in, "title": "TEST CPI", "impact": "high"}]

    if args.once:
        _check_and_post(args.bridge, events)
        return 0
    while True:
        _check_and_post(args.bridge, events)
        time.sleep(args.interval)


if __name__ == "__main__":
    sys.exit(main())
