"""Reconciliation — compare internal expected positions vs the venue's reported positions.
A mismatch must halt trading (kill-switch) and alert (docs/08)."""

from __future__ import annotations

from .interface import Reconciliation


def compare(internal: list[dict], venue: list[dict], tol: float = 1e-6) -> Reconciliation:
    """Each list item: {symbol, units}. Flags symbols whose net units differ beyond `tol`."""
    def as_map(rows):
        return {r["symbol"]: float(r.get("units", 0.0)) for r in rows}

    a, b = as_map(internal), as_map(venue)
    mismatches = []
    for sym in sorted(set(a) | set(b)):
        if abs(a.get(sym, 0.0) - b.get(sym, 0.0)) > tol:
            mismatches.append({"symbol": sym, "internal": a.get(sym, 0.0), "venue": b.get(sym, 0.0)})
    return Reconciliation(ok=not mismatches, internal=internal, venue=venue, mismatches=mismatches)
