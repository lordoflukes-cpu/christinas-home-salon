#!/usr/bin/env python3
"""PreToolUse(Bash) guard: if a command looks like it places/cancels a live order,
emit a non-blocking reminder to run the risk check and respect the news window / kill-switch.

Silent (exit 0) for every non-order command, so it never nags. It ADVISES, it does not block —
make blocking a deliberate choice once a real broker is wired."""

import json
import re
import sys

_ORDER_PATTERNS = re.compile(
    r"\b(place[_-]?order|market[_-]?order|create[_-]?order|submit[_-]?order|"
    r"buy|sell|metaapi|mt5|ig[_-]?api|/orders\b|flatten|close[_-]?position|deal)\b",
    re.IGNORECASE,
)


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0  # never break the tool call on a parse error
    command = (payload.get("tool_input", {}) or {}).get("command", "")
    if command and _ORDER_PATTERNS.search(command):
        print(
            "⚠️ trading-core: this looks like an order action. Before sending:\n"
            "   • run /trading-core:risk-check (size within limits),\n"
            "   • confirm no high-impact news window is active,\n"
            "   • confirm the kill-switch is clear,\n"
            "   • confirm the account track (cfd|spreadbet) is correct.",
            file=sys.stdout,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
