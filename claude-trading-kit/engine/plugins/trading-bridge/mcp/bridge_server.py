"""bridge-control — MCP (stdio) to drive and inspect the bridge pipeline in-process
(no running server needed). Lets Claude dry-run alerts, flip the kill-switch / news-window,
and read recent decisions.

  pip install mcp
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from bridge import Bridge, sign_payload  # noqa: E402

try:
    from mcp.server.fastmcp import FastMCP
except ModuleNotFoundError:  # pragma: no cover
    sys.stderr.write("bridge-control: missing dependency — run `pip install mcp`\n")
    raise

mcp = FastMCP("bridge-control")
_bridge = Bridge()  # shares config from env; in-process state for this session


@mcp.tool()
def dry_run_alert(payload: dict, sign: bool = True) -> dict:
    """Run a ts.alert.v1 payload through the full pipeline (validate → auth → idempotency →
    risk-gate → route) and return the Decision. If `sign` and a secret is configured, the
    payload is HMAC-signed first so auth passes."""
    p = dict(payload)
    if sign and _bridge.settings.secret:
        p["signature"] = sign_payload(p, _bridge.settings.secret)
    return _bridge.handle(p).as_dict()


@mcp.tool()
def bridge_status() -> dict:
    """Current bridge state: kill-switch, news-window, routing mode, auth mode, paper position."""
    return _bridge.status()


@mcp.tool()
def set_kill_switch(on: bool) -> dict:
    """Engage/disengage the kill-switch (blocks all entries; closes still allowed)."""
    _bridge.set_kill_switch(on)
    return {"kill_switch": _bridge.kill_switch}


@mcp.tool()
def set_news_window(active: bool) -> dict:
    """Set the news-window flag (blocks NEW entries while active). Phase-4 data wires this live."""
    _bridge.set_news_window(active)
    return {"news_window_active": _bridge.news_window_active}


@mcp.tool()
def recent_decisions(n: int = 20) -> dict:
    """The last `n` pipeline decisions (for audit/debugging)."""
    return {"decisions": [d.as_dict() for d in list(_bridge.decisions)[-n:]]}


if __name__ == "__main__":
    mcp.run()
