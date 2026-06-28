"""Alert delivery. Sends to Telegram when configured, otherwise logs — so the
skeleton is fully functional with no credentials."""

from __future__ import annotations

import logging

import httpx

from ..config import settings

log = logging.getLogger("alerts")

_LEVEL_EMOJI = {"info": "ℹ️", "warning": "⚠️", "critical": "🚨"}


async def send_alert(alert: dict) -> None:
    text = f"{_LEVEL_EMOJI.get(alert.get('level'), '')} {alert.get('message', '')}".strip()
    if not (settings.telegram_bot_token and settings.telegram_chat_id):
        log.warning("ALERT %s", text)
        return
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(url, json={"chat_id": settings.telegram_chat_id, "text": text})
    except Exception as exc:  # noqa: BLE001 — never let alerting crash the feed
        log.warning("telegram send failed (%s): %s", exc, text)
