"""Routing — decide whether an allowed alert is auto-executed (bot) or suggested (manual).

Safe by default: any strategy not explicitly opted into `auto` is routed `manual`."""

from __future__ import annotations


class Router:
    def __init__(self, auto_strategies: dict | None = None, default_mode: str = "manual") -> None:
        self.auto_strategies = auto_strategies or {}
        self.default_mode = default_mode if default_mode in ("auto", "manual") else "manual"

    def mode_for(self, strategy_id: str) -> str:
        return self.auto_strategies.get(strategy_id, self.default_mode)
