"""UK tax records split by track (docs/07). CFD = taxable (CGT above the annual allowance,
losses offsettable); spread bet = tax-free (no CGT, no loss offset). Educational estimate
only — not tax advice."""

from __future__ import annotations


def tax_records(fills: list[dict], cgt_rate: float = 0.24, annual_allowance: float = 3000.0) -> dict:
    """`fills`: list of {track, pnl}. Returns a per-track summary + a rough CGT estimate."""
    cfd = [f for f in fills if f.get("track") == "cfd"]
    sb = [f for f in fills if f.get("track") == "spreadbet"]
    cfd_pnl = round(sum(f.get("pnl", 0.0) for f in cfd), 2)
    sb_pnl = round(sum(f.get("pnl", 0.0) for f in sb), 2)
    taxable = max(0.0, cfd_pnl - annual_allowance)
    return {
        "cfd": {"track": "cfd (VT Markets)", "realized_pnl": cfd_pnl,
                "annual_allowance": annual_allowance, "taxable": round(taxable, 2),
                "estimated_cgt": round(taxable * cgt_rate, 2), "cgt_rate": cgt_rate,
                "losses": "offsettable / carry-forward"},
        "spreadbet": {"track": "spreadbet (IG)", "realized_pnl": sb_pnl,
                      "tax": "tax-free (no CGT, no stamp duty)", "losses": "not offsettable"},
        "note": "Educational estimate, NOT tax advice. Keep records per track; consult a UK "
                "tax adviser. (docs/07-risk-and-compliance.md)",
    }
