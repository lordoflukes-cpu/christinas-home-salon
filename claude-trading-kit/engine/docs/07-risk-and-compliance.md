# 07 · Risk & Compliance

> Educational record-keeping/classification helpers — **not financial or tax advice**.
> Consult a qualified UK tax adviser. Trading leveraged products risks losing money.

## Risk framework (reused from vendor/gold-bot ROADMAP §6/§11/§16)

- **Sizing**: ATR / volatility targeting; default **0.5%** risk per trade; stop at
  `stop_atr_mult × ATR`.
- **Limits**: hard **daily-loss limit** (default 5%) and **max-drawdown**; one stop-out
  must not breach the daily limit.
- **Correlation buckets**: gold + silver (and correlated FX) count as **one** risk bucket.
- **Kill-switch**: automated halt on daily-loss / max-DD / data-anomaly / exec-error, plus
  one-tap manual (Telegram). Mandatory on every money-touching path.
- **Scorecard gates** before going live (§11): Sharpe ≥0.7, profit factor ≥1.3,
  expectancy ≥0.2R, Calmar ≥0.5 — out-of-sample, on a parameter plateau.
- **Health review** (§16): monthly pulse + quarterly deep review → keep/de-risk/retire.

## Dual tax track (UK) — the venue decision

| Venue | Product | UK tax | Losses | Notes |
|---|---|---|---|---|
| **UK spread-bet (IG)** | spread bet | **tax-free** (no CGT, no stamp duty) | **not** offsettable | HMRC treats as gambling (BIM22015 / CG56105) |
| **VT Markets** | CFD/forex | **taxable (CGT 18%/24%)** above £3,000 allowance | offsettable, carry-forward | reported via Self Assessment |

- Tag every fill `account_track: spreadbet | cfd`. The `tax-uk` skill keeps **separate
  records** per track (spread-bet: tax-free; CFD: CGT computation + loss ledger).
- **Strategy → track guidance**: multi-day holds and the tax-free own-capital track suit
  **spread-bet**; instrument breadth / EA flexibility / certain costs may favour **CFD**.
  Don't mix a single strategy's fills across tracks without intent (it complicates records).
- Caveat: a full-time professional spread-bettor *could* be reclassified by HMRC (rare;
  BIM22017). Keep clean records.

## Regulatory

- Use **FCA-regulated** brokers (FSCS up to £85k). Retail leverage caps: gold 20:1,
  silver 10:1; negative-balance protection; 50% margin close-out.
- Prop/funded accounts (if added later): respect daily/max-drawdown and news rules;
  verify payout history before paying fees.

## Compliance posture for the suite

- The suite **records and classifies**; it does **not** give tax/financial advice — every
  user-facing output that touches tax carries the disclaimer.
- Marketing/performance claims: none. No advertised returns (FCA scrutiny of such claims
  is tightening).
