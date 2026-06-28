"""Lightweight Pine-script linter — catches the mistakes that matter for a money path:
missing version, no declaration, no alert, look-ahead/repaint smells, hardcoded secrets."""

from __future__ import annotations

import re


def lint_pine(source: str) -> dict:
    findings: list[dict] = []

    if not re.search(r"//@version=\d", source):
        findings.append({"level": "error", "msg": "missing //@version pragma"})

    is_strategy = "strategy(" in source
    is_indicator = "indicator(" in source
    if not (is_strategy or is_indicator):
        findings.append({"level": "error", "msg": "no strategy() or indicator() declaration"})

    if "alert(" not in source and "alertcondition(" not in source:
        findings.append({"level": "warning",
                         "msg": "no alert()/alertcondition() — this script won't emit signals"})

    if re.search(r"lookahead\s*=\s*barmerge\.lookahead_on", source):
        findings.append({"level": "error",
                         "msg": "request.security(..., lookahead_on) — look-ahead/repaint risk"})

    if re.search(r'\bsecret\b\s*=\s*"[^"]{12,}"', source):
        findings.append({"level": "warning",
                         "msg": "a secret looks hardcoded — use input(...) and keep it out of source"})

    # Entry without an alert message smell (strategy that places orders but never alerts).
    if is_strategy and "strategy.entry" in source and "alert(" not in source:
        findings.append({"level": "warning",
                         "msg": "strategy.entry present but no alert() — the bridge won't be notified"})

    ok = not any(f["level"] == "error" for f in findings)
    return {"ok": ok, "is_strategy": is_strategy, "is_indicator": is_indicator,
            "findings": findings}
