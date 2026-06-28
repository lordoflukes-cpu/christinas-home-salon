"""Tests for trading-data: news-window logic, calendar, prices, fred (sim), cot, intermarket."""

import data as D


# ── news-window (the bridge guard) ──────────────────────────────────────────
def test_news_window_active_inside_window():
    nw = D.news_window(now=0, events=[{"ts": 60, "title": "CPI", "impact": "high"}])
    assert nw["active"] is True
    assert nw["next_event"]["title"] == "CPI"


def test_news_window_inactive_outside_window():
    nw = D.news_window(now=0, events=[{"ts": 600, "title": "CPI", "impact": "high"}])
    assert nw["active"] is False
    assert nw["next_event"]["in_minutes"] == 10.0


def test_news_window_ignores_medium_impact():
    nw = D.news_window(now=0, events=[{"ts": 30, "title": "PMI", "impact": "medium"}])
    assert nw["active"] is False
    assert nw["next_event"] is None


def test_news_window_no_events():
    nw = D.news_window(now=0, events=[])
    assert nw["active"] is False and nw["next_event"] is None


# ── calendar ────────────────────────────────────────────────────────────────
def test_calendar_horizon_and_sort():
    evs = [{"ts": 60, "title": "CPI", "impact": "high"},
           {"ts": 7200, "title": "PMI", "impact": "medium"},
           {"ts": 999999, "title": "NFP", "impact": "high"}]
    cal = D.economic_calendar(hours_ahead=3, now=0, events=evs)
    titles = [e["title"] for e in cal["events"]]
    assert titles == ["CPI", "PMI"]  # NFP beyond 3h excluded; sorted by time


# ── prices ──────────────────────────────────────────────────────────────────
def test_candles_returns_ohlc():
    c = D.candles("XAUUSD", "H4", 100)
    assert c["source"] == "simulated" and c["n"] == 100
    b = c["bars"][0]
    assert {"ts", "open", "high", "low", "close"} <= set(b)


def test_quote_has_price():
    q = D.quote("XAGUSD")
    assert q["price"] is not None and q["source"] == "simulated"


# ── fred (sim) ──────────────────────────────────────────────────────────────
def test_fred_sim_has_series():
    f = D.fred()
    for k in ("real_yield_10y", "nominal_10y", "breakeven_10y", "dxy"):
        assert k in f
    assert f["source"] == "simulated"


def test_fred_single_series():
    f = D.fred("dxy")
    assert f["series"] == "dxy" and f["value"] == 99.0


# ── cot & intermarket ───────────────────────────────────────────────────────
def test_cot_lagged_flag():
    c = D.cot()
    assert c["lagged"] is True and "gold_mm_net" in c


def test_intermarket_assembles_ratio_and_macro():
    im = D.intermarket()
    assert im["gold_silver_ratio"] is not None
    assert im["dxy"] == 99.0 and im["real_yield_10y"] == 1.95
    assert "G/S ratio" in im["read"]
