# External plugin · Data — Explore Data + Validate Data (EXTERNAL)

**Plugin.** Data. Install via Customize → + → Browse Plugins → search `Data` → Install. Connect your
files or data warehouse, then run the skills against Excel / CSV / JSON / Parquet files or warehouse
tables.

**Status.** EXTERNAL (installed separately). Portable local equivalents ship in this kit:
`skills/data-explore` and `skills/data-validate` (lighter, no install, no warehouse).

## Skill · Explore Data
Auto-profiles a dataset: data quality, anomalies, seasonality, segments, and business insights.

**Exact trigger prompt**
```
/explore-data Analyze this raw enterprise sales and finance dataset, identify hidden patterns,
anomalies, seasonality, customer segments, and
```
**Trading use cases.** Profile an exported **trade log** (find streaks, session/day-of-week skew,
per-instrument edge), an **equity curve** (drawdown clustering, regime segments), a **backtest
output** (parameter sensitivity), or **raw price/macro** before research. → kit: `data-explore`,
then `equity-report` / `decay-scan`.

## Skill · Validate Data
Audits a workbook/dashboard/report/dataset: broken calculations, reporting risks, inconsistencies,
methodology — and emits a structured validation report.

**Exact trigger prompt**
```
/validate-data Audit this financial reporting workbook for data integrity issues, broken
calculations, inconsistencies, duplicate records, impossible values, and audit risks, then
generate a validation summary with findings.
```
(Upload the source workbook, e.g. `Financial Reporting.xlsx`, first.)

**Trading use cases.** Audit a **strategy P&L spreadsheet**, a **broker statement**, or a
**backtest export** before trusting its numbers; catch leaked/look-ahead columns and double-counted
fees. → kit: `data-validate`; code-level review → `trading-code-reviewer`; live mismatch →
`reconcile`.

## When to use the plugin vs the local skill
Use the **plugin** for large workbooks/dashboards and warehouse tables with deep formula tracing;
use the **kit's `data-explore` / `data-validate`** for fast in-context profiling/auditing with no
install.
