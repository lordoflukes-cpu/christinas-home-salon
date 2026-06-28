"""Bridge.handle — the deterministic pipeline: parse → validate → auth → idempotency →
risk-gate → route. Pure (no HTTP), so the FastAPI server, the MCP, and the tests all call
the same code. Holds the mutable operational state (kill-switch, news-window) and the
decision log."""

from __future__ import annotations

import json
import time
from collections import deque
from dataclasses import asdict, dataclass, field

from . import riskgate
from .config import Settings
from .contract import validate_alert
from .idempotency import SeenStore
from .router import Router
from .sign import verify
from .sinks import HttpExecutionSink, HttpNotifySink, NotifySink, PaperSink


@dataclass
class Decision:
    ts: float
    status: str          # rejected | duplicate | blocked | routed
    stage: str           # parse | validate | auth | idempotency | riskgate | route
    reason: str
    strategy_id: str = ""
    symbol: str = ""
    action: str = ""
    mode: str = ""
    units: float = 0.0
    stop: float | None = None
    route: str = ""
    detail: dict = field(default_factory=dict)

    def as_dict(self) -> dict:
        return asdict(self)


class Bridge:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or Settings()
        self.seen = SeenStore(self.settings.idempotency_ttl_sec)
        self.router = Router(self.settings.auto_strategies, self.settings.default_mode)
        self.paper = PaperSink()
        self.notify = NotifySink()
        # Phase 5: route to the execution service when configured; else in-process stubs.
        self.exec_sink = HttpExecutionSink(self.settings.execution_url) \
            if self.settings.execution_url else None
        self.notify_sink = HttpNotifySink(self.settings.execution_url) \
            if self.settings.execution_url else None
        self.kill_switch = False
        self.news_window_active = False
        self.decisions: deque[Decision] = deque(maxlen=500)

    # operator controls (used by MCP + FastAPI)
    def set_kill_switch(self, on: bool) -> None:
        self.kill_switch = bool(on)

    def set_news_window(self, active: bool) -> None:
        self.news_window_active = bool(active)

    def _record(self, d: Decision) -> Decision:
        self.decisions.append(d)
        return d

    def handle(self, raw_body, signature: str | None = None, now: float | None = None) -> Decision:
        now = now if now is not None else time.time()

        # 1. parse
        try:
            payload = json.loads(raw_body) if isinstance(raw_body, (str, bytes, bytearray)) else raw_body
            if not isinstance(payload, dict):
                raise ValueError("not an object")
        except Exception as exc:  # noqa: BLE001
            return self._record(Decision(now, "rejected", "parse", f"malformed JSON: {exc}"))

        sid = str(payload.get("strategy_id", ""))
        sym = str(payload.get("symbol", ""))
        act = str(payload.get("action", ""))

        # 2. validate against the contract
        v = validate_alert(payload)
        if not v["valid"]:
            return self._record(Decision(now, "rejected", "validate",
                                         "; ".join(v["errors"]), sid, sym, act))

        # 3. auth (HMAC). DEV mode (no secret configured) skips enforcement.
        if self.settings.secret:
            if not verify(payload, self.settings.secret, signature):
                return self._record(Decision(now, "rejected", "auth",
                                             "HMAC signature invalid", sid, sym, act))

        # 4. idempotency
        if self.seen.seen(payload["client_order_id"], now):
            return self._record(Decision(now, "duplicate", "idempotency",
                                         "duplicate client_order_id", sid, sym, act))

        # 5. risk-gate
        g = riskgate.evaluate(payload, settings=self.settings, kill_switch=self.kill_switch,
                              news_window_active=self.news_window_active,
                              equity=self.paper.broker.equity() or self.settings.equity0,
                              realized_pnl=self.paper.realized)
        if not g["allow"]:
            return self._record(Decision(now, "blocked", "riskgate", g["reason"], sid, sym, act,
                                         units=g["units"], stop=g["stop"]))

        # 6. route
        mode = self.router.mode_for(sid)
        if mode == "auto":
            if self.exec_sink:
                detail = self.exec_sink.execute(payload, g["units"], g["stop"])
                route = "http-execution"
            else:
                detail = self.paper.execute(payload, g["units"], g["stop"])
                route = "paper-execution"
        else:
            if self.notify_sink:
                detail = self.notify_sink.suggest(payload, g["units"], g["stop"])
                route = "http-notify"
            else:
                detail = self.notify.suggest(payload, g["units"], g["stop"])
                route = "telegram-suggestion"
        return self._record(Decision(now, "routed", "route", g["reason"], sid, sym, act,
                                     mode=mode, units=g["units"], stop=g["stop"],
                                     route=route, detail=detail))

    def status(self) -> dict:
        return {
            "kill_switch": self.kill_switch,
            "news_window_active": self.news_window_active,
            "default_mode": self.settings.default_mode,
            "auto_strategies": list(self.settings.auto_strategies),
            "auth": "enforced" if self.settings.secret else "DEV (no secret set)",
            "paper": self.paper.broker.state(),
            "decisions": len(self.decisions),
        }
