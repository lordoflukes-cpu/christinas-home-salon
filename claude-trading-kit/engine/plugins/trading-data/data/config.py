"""trading-data settings (env-driven). Stub mode (default) needs no keys."""

from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    use_simulated: bool = field(
        default_factory=lambda: os.environ.get("USE_SIMULATED_DATA", "true").lower() != "false")
    fred_api_key: str = field(default_factory=lambda: os.environ.get("FRED_API_KEY", ""))
    market_data_key: str = field(default_factory=lambda: os.environ.get("MARKET_DATA_KEY", ""))
    calendar_key: str = field(default_factory=lambda: os.environ.get("CALENDAR_KEY", ""))
    news_guard_minutes: int = field(
        default_factory=lambda: int(os.environ.get("NEWS_GUARD_MINUTES", "2")))


settings = Settings()
