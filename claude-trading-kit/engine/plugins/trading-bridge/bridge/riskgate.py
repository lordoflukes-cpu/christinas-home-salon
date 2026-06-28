"""The risk-gate — the deterministic checks every authenticated alert must pass before it
can become an order or a suggestion. Reuses the engine's ATR sizing (vendor/gold-bot).

Returns {allow: bool, reason: str, units: float, stop: float|None, equity: float}."""

from __future__ import annotations

from .goldbot import atr_position_size


def evaluate(payload: dict, *, settings, kill_switch: bool, news_window_active: bool,
             equity: float, realized_pnl: float) -> dict:
    action = payload["action"]
    risk_frac = payload.get("risk_frac", settings.default_risk_frac)
    stop_mult = payload.get("stop_atr_mult", settings.default_stop_atr_mult)
    atr = payload.get("atr")

    # 1. Kill-switch — always blocks.
    if kill_switch:
        return {"allow": False, "reason": "kill-switch engaged", "units": 0.0,
                "stop": None, "equity": equity}

    # 2. Daily-loss breach — block further entries (closes still allowed to flatten).
    if realized_pnl <= -settings.daily_loss_frac * settings.equity0 and action != "close":
        return {"allow": False, "reason": "daily-loss limit reached", "units": 0.0,
                "stop": None, "equity": equity}

    # 3. Closes bypass sizing/news (reducing risk is always allowed).
    if action == "close":
        return {"allow": True, "reason": "close (flatten)", "units": 0.0,
                "stop": None, "equity": equity}

    # 4. News-window — block NEW entries.
    if news_window_active:
        return {"allow": False, "reason": "news-window active (entries blocked)", "units": 0.0,
                "stop": None, "equity": equity}

    # 5. Entries need ATR to size.
    if not atr or atr <= 0:
        return {"allow": False, "reason": "missing/invalid atr for sizing", "units": 0.0,
                "stop": None, "equity": equity}

    # 6. Size via the engine and cap.
    units = atr_position_size(equity, risk_frac, atr, stop_mult)
    if units <= 0:
        return {"allow": False, "reason": "computed size is zero", "units": 0.0,
                "stop": None, "equity": equity}
    if units > settings.max_position_units:
        return {"allow": False, "reason": f"size {units:.3f} exceeds max {settings.max_position_units}",
                "units": round(units, 6), "stop": None, "equity": equity}

    price = payload.get("price")
    stop = None
    if price is not None:
        stop = price - stop_mult * atr if action == "buy" else price + stop_mult * atr
    return {"allow": True, "reason": "ok", "units": round(units, 6),
            "stop": round(stop, 4) if stop is not None else None, "equity": equity}
