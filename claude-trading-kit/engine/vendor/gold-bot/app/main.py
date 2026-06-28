"""FastAPI app: starts the tiered feeds, serves the live dashboard, streams state
over a WebSocket, and exposes a kill-switch. Run: `uvicorn app.main:app`."""

from __future__ import annotations

import asyncio
import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse

from .alerts.engine import AlertEngine
from .alerts.notifier import send_alert
from .bus import EventBus
from .config import settings
from .feeds.calendar import run_calendar_feed
from .feeds.cot import run_cot_feed
from .feeds.macro import run_macro_feed
from .feeds.price_ws import run_price_feed
from .execution.executor import run_executor
from .state import StateStore

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("app")

state = StateStore()
bus = EventBus()
engine = AlertEngine()

_DASHBOARD = (Path(__file__).parent / "dashboard.html").read_text(encoding="utf-8")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    tasks = [
        asyncio.create_task(run_price_feed(state, bus, engine, send_alert)),
        asyncio.create_task(run_macro_feed(state, bus)),
        asyncio.create_task(run_cot_feed(state, bus)),
        asyncio.create_task(run_calendar_feed(state, bus)),
    ]
    if settings.exec_enabled:
        tasks.append(asyncio.create_task(run_executor(state, bus, send_alert)))
    log.info("feeds started (simulated=%s)", settings.use_simulated_feed)
    try:
        yield
    finally:
        for t in tasks:
            t.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
        log.info("feeds stopped")


app = FastAPI(title="Gold & Silver Live Monitor", version="0.1.0", lifespan=lifespan)


@app.get("/", response_class=HTMLResponse)
async def index() -> str:
    return _DASHBOARD


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "uptime_sec": state.snapshot()["uptime_sec"]}


@app.get("/api/snapshot")
async def snapshot() -> JSONResponse:
    return JSONResponse(state.snapshot())


@app.post("/api/kill-switch")
async def toggle_kill_switch() -> dict:
    state.kill_switch = not state.kill_switch
    log.warning("kill-switch -> %s", state.kill_switch)
    await bus.publish({"type": "snapshot", "data": state.snapshot()})
    return {"kill_switch": state.kill_switch}


@app.websocket("/ws")
async def websocket(ws: WebSocket) -> None:
    await ws.accept()
    q = bus.subscribe()
    await ws.send_text(json.dumps({"type": "snapshot", "data": state.snapshot()}, default=str))
    try:
        while True:
            event = await q.get()
            await ws.send_text(json.dumps(event, default=str))
    except WebSocketDisconnect:
        pass
    finally:
        bus.unsubscribe(q)
