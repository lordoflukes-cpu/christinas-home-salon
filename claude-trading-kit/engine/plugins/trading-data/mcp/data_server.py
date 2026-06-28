"""trading-data — MCP (stdio) server: market data + FRED macro + economic calendar /
news-window + COT + the intermarket panel. Sim-first (no keys); FRED has a real path.

  pip install mcp httpx
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

import data as D  # noqa: E402

try:
    from mcp.server.fastmcp import FastMCP
except ModuleNotFoundError:  # pragma: no cover
    sys.stderr.write("trading-data: missing dependency — run `pip install mcp httpx`\n")
    raise

mcp = FastMCP("trading-data")


@mcp.tool()
def quote(symbol: str = "XAUUSD") -> dict:
    """Latest price for a symbol (XAUUSD, XAGUSD, DXY, …). Sim unless a provider key is set."""
    return D.quote(symbol)


@mcp.tool()
def candles(symbol: str = "XAUUSD", interval: str = "H4", n: int = 300) -> dict:
    """OHLC bars for a symbol/interval. Feeds research/regime. Sim via synthetic series."""
    return D.candles(symbol, interval, n)


@mcp.tool()
def fred(series: str = "") -> dict:
    """FRED macro: real_yield_10y (DFII10), nominal_10y (DGS10), breakeven_10y (T10YIE),
    dxy (DTWEXBGS). Real when FRED_API_KEY is set and not in sim mode; else seeded."""
    return D.fred(series)


@mcp.tool()
def economic_calendar(hours_ahead: int = 24) -> dict:
    """Upcoming high/medium-impact events within the horizon (CPI/FOMC/NFP/PMI). Sim schedule."""
    return D.economic_calendar(hours_ahead)


@mcp.tool()
def news_window() -> dict:
    """Is a high-impact release within ±NEWS_GUARD_MINUTES right now? The guard the bridge
    consumes to block new entries. Wire it via tools/news_window_poller.py."""
    return D.news_window()


@mcp.tool()
def cot() -> dict:
    """CFTC managed-money positioning (weekly, LAGGED). Crowded extremes flag squeeze risk."""
    return D.cot()


@mcp.tool()
def intermarket() -> dict:
    """The intermarket panel: DXY + real/nominal yields + breakeven + gold-silver ratio + a
    one-line read. Context for manual reads and bot regime."""
    return D.intermarket()


if __name__ == "__main__":
    mcp.run()
