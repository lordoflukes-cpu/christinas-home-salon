# Connector · Google Sheets (SPEC; ENV/Zapier alternative)

**Purpose.** Keep the trade journal / equity log in a spreadsheet for easy human review and
sharing — a lightweight alternative to Supabase for `trade-journal` / `equity-report`.

**Status.** SPEC. Reachable today via the ENV **Zapier** connector or **Google Drive** API; or
wire a dedicated Sheets MCP.

**Auth.** Google OAuth or a service account with the **Google Sheets API** enabled
(developers.google.com/sheets/api); share the target sheet with the service-account email. Scope =
`spreadsheets` only (least-privilege); credentials in env/secrets-manager, never in the sheet or
repo. Env: `GSHEETS_SHEET_ID` (+ credential path/JSON per route).

**Tools.** `append_trade(row)` → `{updated_range}` (values.append); `read_trades(range)` → rows;
`update_equity(curve)` → `{updated_cells}`.

**Notes.** Keep one tab per track (cfd/spreadbet) for tax (`tax-uk`). Don't store secrets in the
sheet. Good for at-a-glance review on mobile.

**Use cases.** Journaling, equity logging, sharing a read-only performance sheet.
