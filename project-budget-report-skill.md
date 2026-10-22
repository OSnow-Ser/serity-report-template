# Project Budget & Delivery Report

Produces a fixed-format budget, billing and delivery report for one Productive project.

Your job is limited to five things: run the queries below, copy their rows **unchanged** into a data block, ask about external invoices when needed, and output the page. The template does all calculation, formatting, charts, checks and findings.

**You must not:**
- calculate, round, convert, re-format, summarise or re-order any value;
- write HTML other than the page in step 6;
- add commentary to the report.

## 1. Find the project

1. Call `search_records` with `{"type":["project"],"keywordSearchQuery":"<project name>","status":"all"}`.
   - If more than one project matches, list them and stop.
   - Take `fields.record_id` as `<project-record-id>`.
2. Load the project: `{"resource_type":"projects","id":"<project-record-id>","include_fields":["name","project_manager.first_name","project_manager.last_name","company.name"]}`.

## 2. Choose the view

- If the runner's permission set has **View profitability**: use the view the user named. If none was named, ask once: "Management view or Project Manager view?"
- Otherwise use the **PM** view, and do not offer the Management view.
- In the PM view, remove `total_cost` from query Q3 before running it.

## 3. Run the queries

In every query below, replace `<project-record-id>` only. Change nothing else.

Fetch all pages: repeat with `offset` + 200 until a page returns fewer than 200 rows.

For each query, keep only the columns listed under "Copy columns", in that order.

| Key | Query | Copy columns |
|---|---|---|
| `services` | Q1 | budget, responsible, service, total_budget_total, total_price, unit, billing_type |
| `budgets` | Q2 | budget, total_budget_used, total_revenue |
| `monthly` | Q3 | budget, service, date:month, total_billable_revenue, total_time, total_cost *(Management only)* |
| `invoices_finalized` | Q4, state 2 | invoice_reference, invoice.number, invoice.invoiced_on, budget.name, date_from, date_to, amount |
| `invoices_draft` | Q4, state 1 | same as above |
| `bookings_confirmed` | Q5, draft false | budget, person, service, date:week, time, person.placeholder |
| `bookings_tentative` | Q5, draft true | same as above |
| `time_weekly` | Q6 | budget, person, service, date:week, total_time, total_billable_time |
| `time_status` | Q7 | person, status, total_time |

**Q1 – services**
```json
{"report_type":"service_reports","group_by":["budget","responsible","service_type","service"],"filters":{"project_id":{"eq":"<project-record-id>"},"stage_type":{"eq":2}},"sort_by":"budget","currency_variant":"base","include_fields":["budget.name","responsible.first_name","responsible.last_name","service_type.name"],"display_fields":["budget","responsible","service_type","service","total_budget_total","total_price","unit","billing_type"],"report_layout":"table","limit":200,"offset":0}
```

**Q2 – budget totals**
```json
{"report_type":"budget_reports","group_by":["budget"],"filters":{"project_id":{"eq":"<project-record-id>"}},"sort_by":"budget","display_fields":["budget","total_budget_used","total_revenue"],"report_layout":"table","limit":200,"offset":0}
```

**Q3 – monthly financials**
```json
{"report_type":"time_entry_reports","group_by":["budget","service","date:month"],"filters":{"project_id":{"eq":"<project-record-id>"},"stage_type":{"eq":2}},"sort_by":"budget","display_fields":["budget","service","date:month","total_billable_revenue","total_cost","total_time"],"report_layout":"table","limit":200,"offset":0}
```

**Q4 – invoice attributions** (run twice: with `"eq":"2"` for finalized, and with `"eq":"1"` for drafts)
```json
{"resource_type":"invoice_attributions","filters":{"budget.project":{"eq":"<project-record-id>"},"invoice.invoice_state":{"eq":"2"}},"include_fields":["date_from","date_to","amount","currency","invoice.number","invoice.invoiced_on","budget.name"],"limit":200,"offset":0}
```
Fill `invoice_reference` with the invoice's visible reference (e.g. `#1521694`, or the invoice number).

**Q5 – bookings by week** (run twice: with `"eq":false` for confirmed, and with `"eq":true` for tentative)
```json
{"report_type":"booking_reports","group_by":["budget","person","service","date:week"],"filters":{"project_id":{"eq":"<project-record-id>"},"stage_type":{"eq":2},"booking_type":{"eq":"service"},"draft":{"eq":false}},"sort_by":"budget","include_fields":["person.placeholder","service.name"],"display_fields":["budget","person","service","date:week","time","person.placeholder"],"report_layout":"table","limit":200,"offset":0}
```

**Q6 – time by week**
```json
{"report_type":"time_entry_reports","group_by":["budget","person","service","date:week"],"filters":{"project_id":{"eq":"<project-record-id>"},"stage_type":{"eq":2}},"sort_by":"budget","display_fields":["budget","person","service","date:week","total_time","total_billable_time"],"report_layout":"table","limit":200,"offset":0}
```

**Q7 – time by approval status**
```json
{"report_type":"time_entry_reports","group_by":["person","status"],"filters":{"project_id":{"eq":"<project-record-id>"},"stage_type":{"eq":2}},"sort_by":"person","display_fields":["person","status","total_time"],"report_layout":"table","limit":200,"offset":0}
```

## 4. External invoices

1. Find each budget whose `total_budget_used` is above 0 and which has **no** row in `invoices_finalized`.
2. If there are any, and the user has not already supplied external invoices, ask once:

   > No finalized invoices were found in Productive for: <budget — budget used — number and total of drafts, one per line>.
   > Were invoices issued from another system? If so, give for each invoice: number, issue date, service period, net amount, budget, and the source system. Reply "none" to continue without them.

3. Record the supplied invoices as given. Write dates as YYYY-MM-DD and amounts as plain numbers. If an invoice has no service period, leave those fields `null`.
4. Do not ask any other questions.

## 5. Build the data block

```json
{
  "template": "1.0",
  "view": "Management | PM",
  "as_of": "<current date and time, Europe/Berlin, e.g. 2026-10-22T14:05:00+02:00>",
  "project": {"name": "<project name>", "customer": "<company.name>", "project_manager": "<first last>", "timezone": "Europe/Berlin"},
  "thresholds": {"monitor": 50, "critical": 80},
  "queries": {
    "services": {"cols": ["budget", "..."], "rows": [["MEWA - AI Governance", "..."], ["..."]]},
    "...": "one entry per key in section 3"
  },
  "external_invoices": null
}
```

- Each `rows` entry is one result row: its values in the same order as `cols`, copied exactly as returned. For example, keep `"34800.00 EUR"`, `"1170 min"`, `"Week 21, 2026"` and `"No"` as they are.
- Copy `null` and empty values as they are.
- When external invoices were supplied, set `external_invoices` to `{"source": "...", "supplied_by": "...", "supplied_on": "YYYY-MM-DD", "rows": [{"number": "...", "issue_date": "...", "service_from": "...", "service_to": "...", "budget": "...", "net_amount": 0.0}]}`.

## 6. Output

Create an **in-chat HTML artifact** containing exactly the code below, with the data block inserted. Do not return it as chat text or as a code block, and do not save it as a file or as a Productive report. Do not change anything else.

```html
<meta charset="utf-8">
<title>CUSTOMER – PROJECT – VIEW – YYYY-MM-DD</title>
<div id="report"></div>
<script>window.REPORT_DATA = DATA_BLOCK;</script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OSnow-Ser/serity-report-template@v1.0/report-template.js"></script>
```

After the artifact, reply with one line: the view and the project name.

If the report shows a red "Report not rendered" banner, tell the user which checks failed. Do not try to work around them.

## Guardrails

- This skill is read-only. Never create, edit or finalize invoices, bookings or time entries.
- Never put cost, margin or profit data into a PM view.
