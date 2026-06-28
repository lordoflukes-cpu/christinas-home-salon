"""Inbound Telegram commands — the cross-device control surface: /halt /flat /status /size.

Security (docs/08): only allow-listed sender chat-ids may issue commands. Empty allow-list =
DEV mode (accept) so it runs with no config; set EXEC_TELEGRAM_ALLOWLIST in production."""

from __future__ import annotations

from exec.config import settings
from exec.goldbot import atr_position_size


def _authorized(sender_id, allowlist) -> bool:
    if not allowlist:
        return True  # DEV: no allow-list configured
    return str(sender_id) in [str(x) for x in allowlist]


def _flatten(registry) -> list:
    flat = []
    for v in registry.all_venues():
        try:
            flat += [f.symbol for f in v.flatten_all()]
        except Exception:  # noqa: BLE001 — a venue that's unconfigured just contributes nothing
            pass
    return flat


def handle(text: str, sender_id, *, registry, killswitch, notifier, allowlist=None) -> dict:
    allowlist = allowlist if allowlist is not None else settings.telegram_allowlist
    if not _authorized(sender_id, allowlist):
        return {"ok": False, "reason": "unauthorized sender", "sender": sender_id}

    parts = (text or "").strip().split()
    cmd = parts[0].lower() if parts else ""

    if cmd == "/halt":
        killswitch.engage()
        flat = _flatten(registry)
        notifier.send(f"🚨 KILL-SWITCH engaged — flattened {flat or 'nothing'}")
        return {"ok": True, "command": "halt", "kill_switch": True, "flattened": flat}

    if cmd == "/flat":
        flat = _flatten(registry)
        notifier.send(f"Flattened {flat or 'nothing'}")
        return {"ok": True, "command": "flat", "flattened": flat}

    if cmd == "/status":
        positions = []
        for v in registry.all_venues():
            try:
                positions += [{"venue": v.name, "symbol": p.symbol, "units": p.units,
                               "track": v.track} for p in v.get_positions()]
            except Exception:  # noqa: BLE001
                pass
        notifier.send(f"STATUS kill={killswitch.blocked} positions={positions}")
        return {"ok": True, "command": "status", "kill_switch": killswitch.blocked,
                "positions": positions}

    if cmd == "/size":
        try:
            equity = float(parts[1]); atr = float(parts[2])
            risk_frac = float(parts[3]) if len(parts) > 3 else 0.005
            stop_mult = float(parts[4]) if len(parts) > 4 else 2.0
        except (IndexError, ValueError):
            return {"ok": False, "reason": "usage: /size <equity> <atr> [risk_frac] [stop_mult]"}
        units = atr_position_size(equity, risk_frac, atr, stop_mult)
        notifier.send(f"SIZE {round(units, 4)} units (risk {risk_frac} @ {stop_mult}×ATR)")
        return {"ok": True, "command": "size", "units": round(units, 6)}

    return {"ok": False, "reason": f"unknown command: {cmd or '(empty)'}"}
