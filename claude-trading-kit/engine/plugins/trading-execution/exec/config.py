"""trading-execution settings (env-driven). Defaults are paper venues + console Telegram, so
everything runs with NO credentials. Secrets via env / secrets manager (docs/08)."""

from __future__ import annotations

import os
from dataclasses import dataclass, field


def _csv(env: str) -> list[str]:
    return [x.strip() for x in env.split(",") if x.strip()]


@dataclass
class Settings:
    equity0: float = field(default_factory=lambda: float(os.environ.get("EXEC_EQUITY0", "20000")))
    # Venue per track. Default paper for both (no creds). cfd: paper|metaapi|mt5 ; spreadbet: paper|ig
    cfd_venue: str = field(default_factory=lambda: os.environ.get("EXEC_CFD_VENUE", "paper"))
    spreadbet_venue: str = field(
        default_factory=lambda: os.environ.get("EXEC_SPREADBET_VENUE", "paper"))
    # Credentials (only needed for real venues).
    metaapi_token: str = field(default_factory=lambda: os.environ.get("EXEC_METAAPI_TOKEN", ""))
    metaapi_account: str = field(default_factory=lambda: os.environ.get("EXEC_METAAPI_ACCOUNT", ""))
    mt5_login: str = field(default_factory=lambda: os.environ.get("EXEC_MT5_LOGIN", ""))
    mt5_password: str = field(default_factory=lambda: os.environ.get("EXEC_MT5_PASSWORD", ""))
    mt5_server: str = field(default_factory=lambda: os.environ.get("EXEC_MT5_SERVER", ""))
    ig_api_key: str = field(default_factory=lambda: os.environ.get("EXEC_IG_API_KEY", ""))
    ig_username: str = field(default_factory=lambda: os.environ.get("EXEC_IG_USERNAME", ""))
    ig_password: str = field(default_factory=lambda: os.environ.get("EXEC_IG_PASSWORD", ""))
    ig_account: str = field(default_factory=lambda: os.environ.get("EXEC_IG_ACCOUNT", ""))
    # Telegram (console stub when token unset). Allow-list of chat ids permitted to command.
    telegram_token: str = field(default_factory=lambda: os.environ.get("EXEC_TELEGRAM_TOKEN", ""))
    telegram_chat_id: str = field(default_factory=lambda: os.environ.get("EXEC_TELEGRAM_CHAT_ID", ""))
    telegram_allowlist: list = field(
        default_factory=lambda: _csv(os.environ.get("EXEC_TELEGRAM_ALLOWLIST", "")))


settings = Settings()
