"""Tests for trading-execution: sizing, PaperVenue, kill-switch, Telegram commands, tax, registry."""

import exec as E
from exec.interface import Order
from exec.killswitch import KillSwitch
from exec.ig_venue import IGVenue
from exec.metaapi_venue import MetaApiVenue
from telegram import commands
from telegram.notifier import Notifier


# ── sizing adapters ─────────────────────────────────────────────────────────
def test_units_to_lots():
    assert E.units_to_lots(250, 100) == 2.5
    assert E.units_to_lots(250, 0) == 0.0


def test_units_to_stake_per_point():
    assert E.units_to_stake_per_point(4.17, 1.0) == 4.17
    assert E.units_to_stake_per_point(4.17, 0.5) == 2.08  # rounded


# ── PaperVenue ──────────────────────────────────────────────────────────────
def _paper():
    from exec.paper_venue import PaperVenue
    return PaperVenue()


def test_paper_place_close_flatten():
    v = _paper()
    f = v.place_order(Order("o1", "XAUUSD", "buy", 4.0, "cfd", price=2350))
    assert f.status == "filled"
    assert [(p.symbol, p.units) for p in v.get_positions()] == [("XAUUSD", 4.0)]
    assert v.place_order(Order("o1", "XAUUSD", "buy", 4.0, "cfd", price=2350)).status == "duplicate"
    flat = v.flatten_all()
    assert flat and v.get_positions() == []


def test_paper_reconcile_ok():
    v = _paper()
    v.place_order(Order("o1", "XAUUSD", "buy", 2.0, "cfd", price=2350))
    assert v.reconcile().ok is True


# ── reconcile mismatch ──────────────────────────────────────────────────────
def test_reconcile_detects_mismatch():
    r = E.compare([{"symbol": "XAUUSD", "units": 2.0}], [{"symbol": "XAUUSD", "units": 0.0}])
    assert r.ok is False and r.mismatches


# ── registry ────────────────────────────────────────────────────────────────
def test_registry_defaults_to_paper():
    reg = E.Registry()
    assert reg.venue("cfd").name == "paper"
    assert reg.venue("spreadbet").name == "paper"


def test_registry_unknown_track():
    import pytest
    with pytest.raises(ValueError):
        E.Registry().venue("isa")


# ── real-venue stubs: sizing works, live calls raise clearly ────────────────
def test_metaapi_prepare_and_guard():
    m = MetaApiVenue()
    assert m.prepare(Order("x", "XAUUSD", "buy", 250, "cfd"))["lots"] == 2.5
    assert m.configured is False
    import pytest
    with pytest.raises(RuntimeError):
        m.place_order(Order("x", "XAUUSD", "buy", 1, "cfd"))


def test_ig_prepare_stake():
    ig = IGVenue()
    assert ig.prepare(Order("x", "XAUUSD", "buy", 4.17, "spreadbet"))["stake_per_point"] == 4.17


# ── kill-switch + Telegram commands ─────────────────────────────────────────
def test_halt_flattens_and_blocks():
    reg, kill, note = E.Registry(), KillSwitch(), Notifier()
    reg.venue("cfd").place_order(Order("o1", "XAUUSD", "buy", 3.0, "cfd", price=2350))
    out = commands.handle("/halt", "owner", registry=reg, killswitch=kill, notifier=note,
                          allowlist=[])
    assert out["ok"] and out["kill_switch"] is True
    assert kill.blocked and reg.venue("cfd").get_positions() == []


def test_status_command():
    reg, kill, note = E.Registry(), KillSwitch(), Notifier()
    out = commands.handle("/status", "owner", registry=reg, killswitch=kill, notifier=note,
                          allowlist=[])
    assert out["ok"] and out["command"] == "status"


def test_size_command():
    reg, kill, note = E.Registry(), KillSwitch(), Notifier()
    out = commands.handle("/size 20000 10", "owner", registry=reg, killswitch=kill,
                          notifier=note, allowlist=[])
    assert out["ok"] and round(out["units"], 4) == 5.0  # 0.5% of 20000 / (10*2)


def test_unauthorized_sender_rejected():
    reg, kill, note = E.Registry(), KillSwitch(), Notifier()
    out = commands.handle("/halt", "stranger", registry=reg, killswitch=kill, notifier=note,
                          allowlist=["owner"])
    assert out["ok"] is False and "unauthorized" in out["reason"]


# ── tax ─────────────────────────────────────────────────────────────────────
def test_tax_split_cfd_vs_spreadbet():
    t = E.tax_records([{"track": "cfd", "pnl": 5000}, {"track": "spreadbet", "pnl": 2000}])
    assert t["cfd"]["estimated_cgt"] == round((5000 - 3000) * 0.24, 2)
    assert "tax-free" in t["spreadbet"]["tax"]
