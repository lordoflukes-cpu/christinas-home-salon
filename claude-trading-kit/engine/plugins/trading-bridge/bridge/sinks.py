"""Routing sinks — pluggable targets the router hands an allowed alert to.

Phase 3 ships stubs:
  • PaperSink   — simulates a fill via the gold-bot PaperBroker (the bot path).
  • NotifySink  — emits a "suggested action" string (the manual path; Telegram in Phase 5).
Phase 5 swaps PaperSink for venue-abstracted execution and NotifySink for the Telegram
connector, behind the same tiny interface (execute / suggest)."""

from __future__ import annotations

import logging

from .goldbot import PaperBroker

log = logging.getLogger("bridge.sink")


class PaperSink:
    """Bot path — simulated execution."""

    def __init__(self, broker: PaperBroker | None = None) -> None:
        self.broker = broker or PaperBroker()
        self.fills: list[dict] = []

    def execute(self, payload: dict, units: float, stop) -> dict:
        action = payload["action"]
        price = payload.get("price") or self.broker.last or 0.0
        self.broker.mark(price)
        if action == "close":
            target = 0.0
        else:
            target = units if action == "buy" else -units
        self.broker.market_to(target, price)
        fill = {"sink": "paper", "action": action, "price": price,
                "position": round(self.broker.position, 4),
                "equity": round(self.broker.equity(), 2),
                "realized": round(self.broker.realized, 2)}
        self.fills.append(fill)
        log.info("PAPER %s %s @ %s → pos %s", action, payload.get("symbol"), price,
                 self.broker.position)
        return fill

    @property
    def realized(self) -> float:
        return self.broker.realized


class NotifySink:
    """Manual path — a suggested action (printed/logged; Telegram in Phase 5)."""

    def __init__(self) -> None:
        self.messages: list[str] = []

    def suggest(self, payload: dict, units: float, stop) -> dict:
        msg = (f"SETUP {payload.get('symbol')} {payload.get('action')} "
               f"size {units} stop {stop} track {payload.get('account_track')} "
               f"(manual — execute on your platform)")
        self.messages.append(msg)
        log.info("NOTIFY %s", msg)
        return {"sink": "notify", "message": msg}


class HttpExecutionSink:
    """Phase 5 bot path — POST the allowed order to the trading-execution service /execute."""

    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")

    def execute(self, payload: dict, units: float, stop) -> dict:
        import httpx
        body = {
            "idempotency_key": payload["client_order_id"],
            "symbol": payload.get("symbol"),
            "action": payload.get("action"),
            "units": units,
            "track": payload.get("account_track"),
            "price": payload.get("price"),
            "stop": stop,
        }
        try:
            r = httpx.post(f"{self.base_url}/execute", json=body, timeout=10)
            return {"sink": "http-execution", "status_code": r.status_code, **(r.json() if r.content else {})}
        except Exception as exc:  # noqa: BLE001
            log.warning("execution POST failed: %s", exc)
            return {"sink": "http-execution", "error": str(exc)}


class HttpNotifySink:
    """Phase 5 manual path — POST the suggestion to the execution service /notify (Telegram)."""

    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")

    def suggest(self, payload: dict, units: float, stop) -> dict:
        import httpx
        msg = (f"SETUP {payload.get('symbol')} {payload.get('action')} size {units} "
               f"stop {stop} track {payload.get('account_track')} (manual)")
        try:
            r = httpx.post(f"{self.base_url}/notify", json={"message": msg}, timeout=10)
            return {"sink": "http-notify", "status_code": r.status_code, "message": msg}
        except Exception as exc:  # noqa: BLE001
            log.warning("notify POST failed: %s", exc)
            return {"sink": "http-notify", "error": str(exc), "message": msg}
