"""Cross-check TradingView Strategy-Tester metrics against the gold-bot engine.

Divergence beyond tolerance usually means the two sides model costs or fills
differently — trust the engine (no-look-ahead, honest costs) and fix the TV side."""

from __future__ import annotations


def diff_metrics(tv_metrics: dict, engine_metrics: dict, tolerance: float = 0.2) -> dict:
    """Per-field relative-difference report. `tolerance` is the max relative gap
    (0.2 = 20%) before a metric is flagged as diverged."""
    rows: list[dict] = []
    diverged = False
    for k in sorted(set(tv_metrics) | set(engine_metrics)):
        a, b = tv_metrics.get(k), engine_metrics.get(k)
        if isinstance(a, (int, float)) and isinstance(b, (int, float)) \
                and not isinstance(a, bool) and not isinstance(b, bool):
            denom = max(abs(a), abs(b), 1e-9)
            rel = abs(a - b) / denom
            d = rel > tolerance
            rows.append({"metric": k, "tv": a, "engine": b, "rel_diff": round(rel, 3), "diverged": d})
        else:
            d = a != b
            rows.append({"metric": k, "tv": a, "engine": b, "rel_diff": None, "diverged": d})
        diverged = diverged or d
    return {
        "diverged": diverged,
        "tolerance": tolerance,
        "rows": rows,
        "note": "Large divergence usually means TV and the engine model costs/fills "
                "differently. Trust the engine and fix the TradingView cost/fill assumptions.",
    }
