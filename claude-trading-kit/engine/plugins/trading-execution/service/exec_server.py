"""trading-execution service (FastAPI) — the execution endpoint the bridge POSTs to, plus
Telegram in/out and the kill-switch. Cloud-hostable (ADR 0007). Defaults to PaperVenue +
console Telegram, so it runs with no credentials.

  uvicorn service.exec_server:app
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from fastapi import FastAPI, Request  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

from exec import KillSwitch, Registry  # noqa: E402
from exec.interface import Order  # noqa: E402
from telegram import commands  # noqa: E402
from telegram.notifier import Notifier  # noqa: E402

app = FastAPI(title="trading-execution", version="0.1.0")
registry = Registry()
killswitch = KillSwitch()
notifier = Notifier()


def _all_positions() -> list:
    out = []
    for v in registry.all_venues():
        try:
            out += [{"venue": v.name, "symbol": p.symbol, "units": p.units,
                     "avg_price": p.avg_price, "track": v.track} for p in v.get_positions()]
        except Exception:  # noqa: BLE001
            pass
    return out


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "kill_switch": killswitch.blocked}


@app.post("/execute")
async def execute(request: Request) -> JSONResponse:
    body = await request.json()
    if killswitch.blocked:
        return JSONResponse({"status": "blocked", "reason": "kill-switch engaged"}, 200)
    track = body.get("track", "cfd")
    try:
        order = Order(idempotency_key=body["idempotency_key"], symbol=body["symbol"],
                      side=body.get("side") or body.get("action"),
                      units=float(body.get("units", 0) or 0), track=track,
                      price=body.get("price"), stop=body.get("stop"))
        fill = registry.venue(track).place_order(order)
        return JSONResponse({"status": fill.status, "venue": fill.venue,
                             "filled_units": fill.filled_units, "price": fill.price,
                             "track": fill.track}, 200)
    except Exception as exc:  # noqa: BLE001 — surface a clear error (e.g. unconfigured real venue)
        return JSONResponse({"status": "error", "reason": str(exc)}, 200)


@app.post("/notify")
async def notify(request: Request) -> dict:
    body = await request.json()
    return notifier.send(body.get("message") or str(body.get("payload", "")))


@app.post("/flatten")
async def flatten() -> dict:
    killswitch.engage()
    flat = []
    for v in registry.all_venues():
        try:
            flat += [f.symbol for f in v.flatten_all()]
        except Exception:  # noqa: BLE001
            pass
    notifier.send(f"FLATTEN/HALT — flattened {flat or 'nothing'}")
    return {"kill_switch": True, "flattened": flat}


@app.post("/resume")
async def resume() -> dict:
    killswitch.release()
    return {"kill_switch": False}


@app.get("/positions")
async def positions() -> dict:
    return {"positions": _all_positions(), "kill_switch": killswitch.blocked}


@app.get("/account")
async def account() -> dict:
    out = {}
    for track in ("cfd", "spreadbet"):
        try:
            a = registry.venue(track).get_account()
            out[track] = {"equity": a.equity, "venue": a.venue}
        except Exception as exc:  # noqa: BLE001
            out[track] = {"error": str(exc)}
    return out


@app.get("/reconcile")
async def reconcile() -> dict:
    out = {}
    for track in ("cfd", "spreadbet"):
        try:
            r = registry.venue(track).reconcile()
            out[track] = {"ok": r.ok, "mismatches": r.mismatches}
        except Exception as exc:  # noqa: BLE001
            out[track] = {"error": str(exc)}
    return out


@app.post("/telegram-webhook")
async def telegram_webhook(request: Request) -> dict:
    body = await request.json()
    msg = body.get("message", {}) or {}
    sender = (msg.get("chat") or {}).get("id")
    return commands.handle(msg.get("text", ""), sender, registry=registry,
                           killswitch=killswitch, notifier=notifier)
