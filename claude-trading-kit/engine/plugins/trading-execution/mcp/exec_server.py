"""execution — MCP (stdio) to drive/inspect the execution layer in-process: preview/place
orders, positions, account, reconcile, flatten, switch venue, tax records, Telegram commands.

  pip install mcp
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from exec import KillSwitch, Registry, tax_records as _tax_records, units_to_lots, \
    units_to_stake_per_point  # noqa: E402
from exec.goldbot import atr_position_size  # noqa: E402
from exec.interface import Order  # noqa: E402
from telegram import commands  # noqa: E402
from telegram.notifier import Notifier  # noqa: E402

try:
    from mcp.server.fastmcp import FastMCP
except ModuleNotFoundError:  # pragma: no cover
    sys.stderr.write("execution: missing dependency — run `pip install mcp`\n")
    raise

mcp = FastMCP("execution")
_reg = Registry()
_kill = KillSwitch()
_notifier = Notifier()


@mcp.tool()
def order_preview(symbol: str, side: str, equity: float, atr: float, track: str = "cfd",
                  risk_frac: float = 0.005, stop_atr_mult: float = 2.0) -> dict:
    """Translate a signal into a venue order WITHOUT sending: ATR-sized units plus the
    venue-specific size (lots for cfd, stake/point for spreadbet)."""
    units = atr_position_size(equity, risk_frac, atr, stop_atr_mult)
    venue_size = (units_to_lots(units) if track == "cfd"
                  else units_to_stake_per_point(units))
    unit_label = "lots" if track == "cfd" else "stake_per_point"
    return {"symbol": symbol, "side": side, "track": track, "units": round(units, 6),
            unit_label: venue_size, "stop_atr_mult": stop_atr_mult, "risk_frac": risk_frac}


@mcp.tool()
def place_order(symbol: str, side: str, units: float, track: str, idempotency_key: str,
                price: float = 0.0, stop: float = 0.0) -> dict:
    """Place an order on the track's venue (PaperVenue by default). Blocked if the
    kill-switch is engaged; idempotent on `idempotency_key`."""
    if _kill.blocked:
        return {"status": "blocked", "reason": "kill-switch engaged"}
    order = Order(idempotency_key=idempotency_key, symbol=symbol, side=side, units=units,
                  track=track, price=price or None, stop=stop or None)
    try:
        f = _reg.venue(track).place_order(order)
        return {"status": f.status, "venue": f.venue, "filled_units": f.filled_units,
                "price": f.price, "track": f.track}
    except Exception as exc:  # noqa: BLE001
        return {"status": "error", "reason": str(exc)}


@mcp.tool()
def positions() -> dict:
    """Open positions across both tracks' venues."""
    out = []
    for v in _reg.all_venues():
        try:
            out += [{"venue": v.name, "symbol": p.symbol, "units": p.units, "track": v.track}
                    for p in v.get_positions()]
        except Exception:  # noqa: BLE001
            pass
    return {"positions": out, "kill_switch": _kill.blocked}


@mcp.tool()
def account() -> dict:
    """Account equity per track (PaperVenue computes from fills)."""
    out = {}
    for track in ("cfd", "spreadbet"):
        try:
            a = _reg.venue(track).get_account()
            out[track] = {"equity": a.equity, "venue": a.venue}
        except Exception as exc:  # noqa: BLE001
            out[track] = {"error": str(exc)}
    return out


@mcp.tool()
def flatten_all() -> dict:
    """Engage the kill-switch and flatten every position (the emergency stop)."""
    _kill.engage()
    flat = []
    for v in _reg.all_venues():
        try:
            flat += [f.symbol for f in v.flatten_all()]
        except Exception:  # noqa: BLE001
            pass
    return {"kill_switch": True, "flattened": flat}


@mcp.tool()
def reconcile() -> dict:
    """Reconcile internal vs venue positions per track; a mismatch should halt trading."""
    out = {}
    for track in ("cfd", "spreadbet"):
        try:
            r = _reg.venue(track).reconcile()
            out[track] = {"ok": r.ok, "mismatches": r.mismatches}
        except Exception as exc:  # noqa: BLE001
            out[track] = {"error": str(exc)}
    return out


@mcp.tool()
def set_venue(track: str, name: str) -> dict:
    """Switch the venue for a track (cfd: paper|metaapi|mt5 ; spreadbet: paper|ig). Clears the
    cached venue so the next call uses it."""
    if track == "cfd":
        _reg.settings.cfd_venue = name
    elif track == "spreadbet":
        _reg.settings.spreadbet_venue = name
    else:
        return {"ok": False, "reason": f"unknown track {track}"}
    _reg._cache.pop(track, None)
    return {"ok": True, "track": track, "venue": name}


@mcp.tool()
def tax_records(fills: list, cgt_rate: float = 0.24, annual_allowance: float = 3000.0) -> dict:
    """UK tax split by track: CFD (CGT estimate above the allowance) vs spread-bet (tax-free).
    `fills`: list of {track, pnl}. Educational estimate, not tax advice."""
    return _tax_records(fills, cgt_rate, annual_allowance)


@mcp.tool()
def telegram_command(text: str, sender_id: str = "") -> dict:
    """Run a Telegram control command (/halt /flat /status /size) through the same handler the
    webhook uses (allow-list enforced)."""
    return commands.handle(text, sender_id, registry=_reg, killswitch=_kill, notifier=_notifier)


if __name__ == "__main__":
    mcp.run()
