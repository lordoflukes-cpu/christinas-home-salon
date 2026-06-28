"""Environment-driven settings (Tier configuration, thresholds, credentials)."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Feed mode — simulated needs no API keys and runs out of the box.
    use_simulated_feed: bool = True

    # Tier 0/1: real-time price provider (WebSocket).
    price_ws_url: str = ""
    price_api_key: str = ""

    # Tier 3: macro (FRED).
    fred_api_key: str = ""

    # Telegram alerting (logs to console when unset).
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""

    # Alert thresholds.
    price_move_pct: float = 0.5           # % move within the window to alert
    price_move_window_sec: int = 900      # 15 minutes
    ratio_low: float = 50.0               # gold/silver ratio: silver rich below this
    ratio_high: float = 90.0              # silver cheap above this
    feed_stale_sec: int = 30              # no tick for this long => anomaly
    news_guard_minutes: int = 2           # block entries +/- this around high-impact events

    # Refresh cadences (seconds). Defaults reflect real-world cadence (daily).
    macro_refresh_sec: int = 86_400
    cot_refresh_sec: int = 86_400

    # Risk / kill-switch.
    max_daily_loss_pct: float = 5.0

    # Paper executor (research->live loop on the same strategy + sizing).
    # Defaults are tuned for the SIMULATED demo so it trades within ~1 minute.
    # For live trading set H4 bars + the roadmap params, e.g.
    #   EXEC_BAR_SECONDS=14400 EXEC_FAST=20 EXEC_SLOW=50
    exec_enabled: bool = True
    exec_instrument: str = "XAU/USD"
    exec_bar_seconds: int = 3
    exec_fast: int = 8
    exec_slow: int = 21
    exec_equity0: float = 20_000.0
    exec_risk_frac: float = 0.005     # 0.5% per trade
    exec_cost_per_unit: float = 0.05  # spread+slippage proxy
    exec_point_value: float = 1.0


settings = Settings()
