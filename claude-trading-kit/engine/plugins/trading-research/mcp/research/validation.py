"""Honest-validation suite (NEW) — the anti-self-deception tools (ROADMAP §5).

Built as a thin layer over the verified `run_backtest`; the vendor is untouched.
Everything is deterministic given seeds so results are reproducible.

  walk_forward      — rolling re-optimization, test out-of-sample, report efficiency
  monte_carlo       — reshuffle trade order to get the drawdown/return distribution
  parameter_plateau — is the chosen parameter on a robust plateau or a lone spike?
  deflated_sharpe   — correct an observed Sharpe for multiple-testing & non-normality
"""

from __future__ import annotations

import math
import random
import statistics

from .goldbot import DualEMATrend, load_csv, run_backtest, synthetic_ohlc


def _bars(csv_path: str, n: int, seed: int):
    return load_csv(csv_path) if csv_path else synthetic_ohlc(n=n, seed=seed)


def _percentile(xs: list[float], q: float) -> float:
    xs = sorted(xs)
    if not xs:
        return 0.0
    k = (len(xs) - 1) * q
    f = int(k)
    c = min(f + 1, len(xs) - 1)
    return xs[f] + (xs[c] - xs[f]) * (k - f)


# ── walk-forward ────────────────────────────────────────────────────────────
def walk_forward(*, csv_path: str = "", n: int = 1500, seed: int = 7,
                 in_sample: int = 400, out_sample: int = 150, step: int = 150,
                 param_grid: list | None = None, risk_frac: float = 0.005,
                 cost_per_unit: float = 0.05, bars_per_year: int = 1512,
                 point_value: float = 1.0, allow_short: bool = True) -> dict:
    bars = _bars(csv_path, n, seed)
    grid = param_grid or [(f, s) for f in (10, 20, 30) for s in (40, 50, 80) if f < s]
    windows: list[dict] = []
    i = 0
    while i + in_sample + out_sample <= len(bars):
        is_bars = bars[i:i + in_sample]
        oos_bars = bars[i + in_sample:i + in_sample + out_sample]
        best = None
        for f, s in grid:
            m = run_backtest(is_bars, DualEMATrend(fast=f, slow=s), risk_frac=risk_frac,
                             cost_per_unit=cost_per_unit, bars_per_year=bars_per_year,
                             point_value=point_value, allow_short=allow_short).metrics
            sh = m.get("sharpe", 0) or 0
            if best is None or sh > best[0]:
                best = (sh, f, s)
        is_sharpe, f, s = best
        oos = run_backtest(oos_bars, DualEMATrend(fast=f, slow=s), risk_frac=risk_frac,
                           cost_per_unit=cost_per_unit, bars_per_year=bars_per_year,
                           point_value=point_value, allow_short=allow_short).metrics
        windows.append({
            "window": len(windows), "params": {"fast": f, "slow": s},
            "is_sharpe": round(is_sharpe, 3),
            "oos_sharpe": round(oos.get("sharpe", 0) or 0, 3),
            "oos_profit_factor": round(oos.get("profit_factor", 0) or 0, 3),
            "oos_return": round(oos.get("total_return", 0) or 0, 4),
            "oos_trades": oos.get("num_trades", 0),
        })
        i += step

    if not windows:
        return {"error": "not enough bars for the given in_sample/out_sample/step"}
    mean_oos = statistics.fmean(w["oos_sharpe"] for w in windows)
    mean_is = statistics.fmean(w["is_sharpe"] for w in windows)
    wfe = (mean_oos / mean_is) if mean_is else 0.0
    return {
        "n_windows": len(windows),
        "mean_is_sharpe": round(mean_is, 3),
        "mean_oos_sharpe": round(mean_oos, 3),
        "walk_forward_efficiency": round(wfe, 3),
        "oos_positive_windows": sum(1 for w in windows if w["oos_sharpe"] > 0),
        "verdict": "stable" if (wfe >= 0.5 and mean_oos > 0) else "unstable/degrading",
        "windows": windows,
        "note": "WFE = mean OOS Sharpe / mean IS Sharpe. WFE < 0.5 or negative mean OOS "
                "Sharpe => the in-sample edge does not survive out-of-sample (overfit).",
    }


# ── Monte-Carlo (trade-order reshuffle) ─────────────────────────────────────
def monte_carlo(*, csv_path: str = "", n: int = 1500, seed: int = 7,
                fast: int = 20, slow: int = 50, risk_frac: float = 0.005,
                cost_per_unit: float = 0.05, bars_per_year: int = 1512,
                point_value: float = 1.0, allow_short: bool = True,
                runs: int = 1000, mc_seed: int = 0, equity0: float = 20_000.0) -> dict:
    bars = _bars(csv_path, n, seed)
    res = run_backtest(bars, DualEMATrend(fast=fast, slow=slow), equity0=equity0,
                       risk_frac=risk_frac, cost_per_unit=cost_per_unit,
                       bars_per_year=bars_per_year, point_value=point_value,
                       allow_short=allow_short)
    pnls = [t.pnl for t in res.trades]
    if len(pnls) < 5:
        return {"error": "too few trades for Monte Carlo (need >= 5)", "num_trades": len(pnls)}
    rng = random.Random(mc_seed)
    final_returns, max_dds = [], []
    for _ in range(runs):
        order = pnls[:]
        rng.shuffle(order)
        eq = peak = equity0
        mdd = 0.0
        for p in order:
            eq += p
            peak = max(peak, eq)
            if peak > 0:
                mdd = max(mdd, (peak - eq) / peak)
        final_returns.append(eq / equity0 - 1)
        max_dds.append(mdd)
    return {
        "runs": runs, "num_trades": len(pnls),
        "return": {"p5": round(_percentile(final_returns, 0.05), 4),
                   "p50": round(_percentile(final_returns, 0.50), 4),
                   "p95": round(_percentile(final_returns, 0.95), 4)},
        "max_drawdown": {"p50": round(_percentile(max_dds, 0.50), 4),
                         "p95": round(_percentile(max_dds, 0.95), 4),
                         "worst": round(max(max_dds), 4)},
        "prob_loss": round(sum(1 for r in final_returns if r < 0) / runs, 3),
        "note": "Trade-order reshuffle. The p95 max-drawdown is what you must be prepared "
                "to survive; prob_loss = P(final equity < start). A path that only works in "
                "one lucky order is fragile.",
    }


# ── parameter plateau ───────────────────────────────────────────────────────
def parameter_plateau(*, csv_path: str = "", n: int = 1500, seed: int = 7,
                      center_fast: int = 20, center_slow: int = 50,
                      fast_span: int = 4, slow_span: int = 10,
                      fast_step: int = 2, slow_step: int = 10,
                      risk_frac: float = 0.005, cost_per_unit: float = 0.05,
                      bars_per_year: int = 1512, point_value: float = 1.0,
                      allow_short: bool = True, metric: str = "sharpe") -> dict:
    bars = _bars(csv_path, n, seed)
    fasts = list(range(center_fast - fast_span, center_fast + fast_span + 1, fast_step))
    slows = list(range(center_slow - slow_span, center_slow + slow_span + 1, slow_step))
    grid, vals, center_val = [], [], None
    for f in fasts:
        if f <= 1:
            continue
        for s in slows:
            if s <= f:
                continue
            m = run_backtest(bars, DualEMATrend(fast=f, slow=s), risk_frac=risk_frac,
                             cost_per_unit=cost_per_unit, bars_per_year=bars_per_year,
                             point_value=point_value, allow_short=allow_short).metrics
            v = m.get(metric, 0) or 0
            grid.append({"fast": f, "slow": s, metric: round(v, 3),
                         "num_trades": m.get("num_trades", 0)})
            vals.append(v)
            if f == center_fast and s == center_slow:
                center_val = v
    if not vals:
        return {"error": "empty grid (check spans/steps vs center)"}
    mean_v = statistics.fmean(vals)
    std_v = statistics.pstdev(vals) if len(vals) > 1 else 0.0
    on_plateau = (center_val is not None and std_v <= abs(mean_v) * 0.5
                  and center_val >= mean_v - std_v)
    return {
        "metric": metric,
        "center": {"fast": center_fast, "slow": center_slow,
                   metric: round(center_val, 3) if center_val is not None else None},
        "grid_mean": round(mean_v, 3), "grid_std": round(std_v, 3),
        "on_plateau": bool(on_plateau), "cells": len(grid), "grid": grid,
        "note": "Robust parameters sit on a PLATEAU — neighbours perform similarly. A lone "
                "spike that collapses at ±10% is overfit. Low grid_std vs |grid_mean| = plateau.",
    }


# ── deflated Sharpe (multiple-testing + non-normality correction) ───────────
def _norm_cdf(x: float) -> float:
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


def _norm_ppf(p: float) -> float:
    """Acklam's inverse normal CDF approximation."""
    if p <= 0:
        return -math.inf
    if p >= 1:
        return math.inf
    a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
         1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00]
    b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
         6.680131188771972e+01, -1.328068155288572e+01]
    c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
         -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00]
    d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
         3.754408661907416e+00]
    plow, phigh = 0.02425, 1 - 0.02425
    if p < plow:
        q = math.sqrt(-2 * math.log(p))
        return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / \
               ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
    if p > phigh:
        q = math.sqrt(-2 * math.log(1 - p))
        return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / \
                ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
    q = p - 0.5
    r = q * q
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / \
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)


def deflated_sharpe(*, sharpe: float, n_trials: int, n_obs: int,
                    skew: float = 0.0, kurtosis: float = 3.0) -> dict:
    """Deflated Sharpe Ratio (Bailey & López de Prado). `sharpe` is the per-period
    (non-annualised) Sharpe of the selected strategy; `n_trials` = how many
    configurations were tried; `n_obs` = number of return observations."""
    if n_obs < 2 or n_trials < 1:
        return {"error": "need n_obs >= 2 and n_trials >= 1"}
    euler = 0.5772156649
    # Expected maximum Sharpe under the null across n_trials (variance of SR ≈ 1 under null).
    z1 = _norm_ppf(1 - 1.0 / n_trials)
    z2 = _norm_ppf(1 - 1.0 / (n_trials * math.e))
    sr0 = (1 - euler) * z1 + euler * z2
    denom = math.sqrt(1 - skew * sharpe + (kurtosis - 1) / 4.0 * sharpe * sharpe)
    if denom <= 0:
        return {"error": "degenerate variance term"}
    dsr = _norm_cdf((sharpe - sr0) * math.sqrt(n_obs - 1) / denom)
    return {
        "sharpe": round(sharpe, 4), "n_trials": n_trials, "n_obs": n_obs,
        "expected_max_sharpe_under_null": round(sr0, 4),
        "deflated_sharpe_ratio": round(dsr, 4),
        "verdict": "credible (DSR>0.95)" if dsr > 0.95 else
                   ("weak (DSR<0.90)" if dsr < 0.90 else "borderline"),
        "note": "DSR is P(true Sharpe>0) after correcting for the number of trials and "
                "non-normal returns. The more configs you tried, the higher the Sharpe must "
                "be to stay credible. Pass the per-period Sharpe, not the annualised one.",
    }
