"""trading-bridge HTTP shell (FastAPI) — a thin wrapper over Bridge.handle.

NB: this package is named `service` (not `app`) to avoid colliding with the vendored
gold-bot's top-level `app` package that the engine import shim loads.

Cloud-hostable so it runs 24/7 (ADR 0007). Routes:
  POST /tv-webhook       receive a ts.alert.v1 alert (X-Signature header or body signature)
  POST /api/kill-switch  toggle the kill-switch
  POST /api/news-window  set the news-window flag (Phase-4 data plugin wires this for real)
  GET  /api/state        status + recent decisions
  GET  /health           liveness

Run:  uvicorn service.server:app   (from the plugin root)
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from fastapi import FastAPI, Request  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

from bridge import Bridge  # noqa: E402

app = FastAPI(title="trading-bridge", version="0.1.0")
bridge = Bridge()  # configured from env (BRIDGE_SECRET, BRIDGE_AUTO_STRATEGIES, …)

_STATUS_CODE = {"rejected": 400, "duplicate": 200, "blocked": 200, "routed": 200}


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "auth": "enforced" if bridge.settings.secret else "dev"}


@app.post("/tv-webhook")
async def tv_webhook(request: Request) -> JSONResponse:
    raw = await request.body()
    sig = request.headers.get("X-Signature")
    d = bridge.handle(raw, signature=sig)
    code = _STATUS_CODE.get(d.status, 200)
    if d.status == "rejected" and d.stage == "auth":
        code = 401
    return JSONResponse(d.as_dict(), status_code=code)


@app.post("/api/kill-switch")
async def kill_switch() -> dict:
    bridge.set_kill_switch(not bridge.kill_switch)
    return {"kill_switch": bridge.kill_switch}


@app.post("/api/news-window")
async def news_window(active: bool = True) -> dict:
    bridge.set_news_window(active)
    return {"news_window_active": bridge.news_window_active}


@app.get("/api/state")
async def state() -> dict:
    return {"status": bridge.status(),
            "recent": [d.as_dict() for d in list(bridge.decisions)[-20:]]}
