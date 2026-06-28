"""Telegram notifier — sends alerts/confirmations. Console stub when no token (so it runs
with no creds); real Telegram Bot API path when EXEC_TELEGRAM_TOKEN + chat id are set."""

from __future__ import annotations

import logging

import httpx

from exec.config import settings

log = logging.getLogger("telegram")


class Notifier:
    def __init__(self, token: str = "", chat_id: str = "") -> None:
        self.token = token or settings.telegram_token
        self.chat_id = chat_id or settings.telegram_chat_id
        self.sent: list[str] = []

    def send(self, text: str) -> dict:
        self.sent.append(text)
        if not (self.token and self.chat_id):
            log.info("[telegram-stub] %s", text)
            return {"sent": False, "stub": True, "text": text}
        try:
            httpx.post(f"https://api.telegram.org/bot{self.token}/sendMessage",
                       json={"chat_id": self.chat_id, "text": text}, timeout=10)
            return {"sent": True, "text": text}
        except Exception as exc:  # noqa: BLE001 — never let alerting crash a caller
            log.warning("telegram send failed: %s", exc)
            return {"sent": False, "error": str(exc), "text": text}
