/*!
 * Serity Project Budget & Delivery Report - template v1.0
 * Renders window.REPORT_DATA (rows copied unchanged from Productive queries) into a fixed report.
 * All parsing, arithmetic, checks and findings happen here. Contains no customer data.
 * Requires Chart.js 4.x loaded before this script.
 */
(function () {
  "use strict";
  var VERSION = "1.0", MAJOR = 1;
  var COL = { ceiling: "#6B7280", billable: "#2563EB", invoiced: "#059669", committed: "#D97706", cost: "#DC2626", booked: "#6B7280", actual: "#2563EB" };
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONFULL = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

  var CSS = [
    ":root{--ink:#172033;--mut:#5b6678;--line:#e4e8ef;--bg:#f5f7fa;--card:#fff;--g:#047857;--gb:#ecfdf5;--a:#b45309;--ab:#fffbeb;--r:#b91c1c;--rb:#fef2f2}",
    "body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif}",
    ".srt{max-width:1280px;margin:0 auto;padding:24px 16px 40px}",
    ".srt h1{font-size:26px;margin:2px 0 6px}.srt h2{font-size:18px;margin:34px 0 12px}.srt h3{font-size:15px;margin:0 0 8px}",
    ".srt .ey{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}",
    ".srt .scope{display:inline-block;font-weight:700;padding:4px 10px;border-radius:6px;margin:4px 0 10px}",
    ".srt .scope.m{background:var(--rb);color:var(--r)}.srt .scope.p{background:#eff6ff;color:#1d4ed8}",
    ".srt .meta{display:flex;flex-wrap:wrap;gap:6px 22px;color:var(--mut);font-size:13px}.srt .meta b{color:var(--ink);font-weight:600}",
    ".srt .ext{margin-top:10px;font-size:13px;background:#f5f3ff;border-left:4px solid #7c3aed;padding:8px 12px;border-radius:6px}",
    ".srt .tiles{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.srt .tiles.t3{grid-template-columns:repeat(3,minmax(0,1fr));margin-top:12px}",
    ".srt .tile,.srt .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}",
    ".srt .lab{font-size:12px;font-weight:600;color:var(--mut)}.srt .num{font-size:22px;font-weight:800;margin:4px 0 2px;font-variant-numeric:tabular-nums}.srt .sub{font-size:12px;color:var(--mut)}",
    ".srt .st{display:inline-block;font-size:12px;font-weight:700;padding:2px 8px;border-radius:99px}",
    ".srt .st.g{background:var(--gb);color:var(--g)}.srt .st.a{background:var(--ab);color:var(--a)}.srt .st.r{background:var(--rb);color:var(--r)}",
    ".srt .neg{color:var(--r);font-weight:700}",
    ".srt .tw{background:var(--card);border:1px solid var(--line);border-radius:10px;overflow-x:auto}",
    ".srt table{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}",
    ".srt th,.srt td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}",
    ".srt th:first-child,.srt td:first-child,.srt td.l,.srt th.l{text-align:left}",
    ".srt th{font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:var(--mut);background:#f8fafc;font-weight:700}",
    ".srt tr.tot td{font-weight:800;background:#f8fafc}",
    ".srt .grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}",
    ".srt .ch{position:relative;height:260px}.srt .ch.big{height:300px}",
    ".srt .note{font-size:12px;color:var(--mut);margin:8px 2px 0}",
    ".srt .legend{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12px;color:var(--mut);margin:0 0 12px}",
    ".srt .legend i{display:inline-block;width:18px;height:0;border-top:3px solid;vertical-align:middle;margin-right:6px}",
    ".srt ol.tasks{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px 14px 14px 38px;margin:0}",
    ".srt ol.tasks li{margin:6px 0}.srt ol.tasks ul{margin:4px 0;padding-left:18px;color:var(--mut);font-size:13px}",
    ".srt .err{background:var(--rb);color:var(--r);border-left:4px solid #dc2626;padding:12px 14px;border-radius:8px;margin:12px 0}",
    ".srt .err ul{margin:6px 0 0;padding-left:18px;font-weight:400}",
    ".srt .na{display:flex;align-items:center;justify-content:center;height:100%;color:var(--mut);font-size:13px;border:1px dashed var(--line);border-radius:8px}",
    ".srt footer{margin-top:36px;padding-top:14px;border-top:1px solid var(--line);font-size:12px;color:var(--mut)}.srt footer p{margin:6px 0}",
    "@media(max-width:1100px){.srt .tiles{grid-template-columns:repeat(3,minmax(0,1fr))}}",
    "@media(max-width:760px){.srt .grid2{grid-template-columns:1fr}.srt .tiles,.srt .tiles.t3{grid-template-columns:repeat(2,minmax(0,1fr))}.srt h1{font-size:22px}}",
    "@media(max-width:420px){.srt .tiles,.srt .tiles.t3{grid-template-columns:1fr}}",
    "@media print{body{background:#fff}.srt .ch{break-inside:avoid}}"
  ].join("\n");

  // ---------- output scaffolding ----------
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
  var root = document.getElementById("report");
  if (!root) { root = document.createElement("div"); root.id = "report"; document.body.appendChild(root); }
  root.className = "srt";

  var errors = [], notes = [];
  function fail(m) { if (errors.indexOf(m) < 0) errors.push(m); }
  function note(m) { if (notes.indexOf(m) < 0) notes.push(m); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function showErrors() {
    root.innerHTML = '<div class="ey">Project Budget &amp; Delivery Report \u00b7 template v' + VERSION + '</div>' +
      '<div class="err"><strong>Report not rendered \u2014 the data failed ' + errors.length + ' check(s). Fix the data and run again.</strong><ul>' +
      errors.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul></div>";
  }

  // ---------- parsers ----------
  var CUR = null;
  function str(v) { return v == null ? "" : String(v).trim(); }
  function money(v, ctx) {
    if (typeof v === "number" && isFinite(v)) return v;
    var s = str(v);
    if (s === "") return 0;
    var m = s.replace(/[\u00a0\s]/g, " ").match(/^(-?[\d,]*\.?\d+)\s*([A-Z]{3})?$/);
    if (!m) { fail(ctx + ": cannot read money value '" + s + "'."); return 0; }
    if (m[2]) { if (!CUR) CUR = m[2]; else if (CUR !== m[2]) fail(ctx + ": currency " + m[2] + " differs from " + CUR + "."); }
    return parseFloat(m[1].replace(/,/g, ""));
  }
  function hours(v, ctx) {
    if (typeof v === "number" && isFinite(v)) return v;
    var s = str(v);
    if (s === "" || s === "0") return 0;
    var p = s.match(/\(([^)]*)\)/); if (p) s = p[1];
    var re = /(-?\d+(?:[.,]\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|min|m)\b/gi, t = 0, found = false, mm;
    var rest = s.replace(re, function (all, n, u) {
      found = true; n = parseFloat(n.replace(",", "."));
      t += /^m/i.test(u) ? n / 60 : n; return "";
    });
    if (!found || rest.replace(/[\s,]/g, "") !== "") { fail(ctx + ": cannot read duration '" + str(v) + "'."); return 0; }
    return t;
  }
  function dateOf(v, ctx) {
    var s = str(v); if (!s || s === "null") return null;
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})$/);
    if (m) { var mi = monIdx(m[1]); if (mi >= 0) return Date.UTC(+m[3], mi, +m[2]); }
    m = s.match(/^(\d{1,2})\.?\s+([A-Za-z]{3,9})\.?\s+(\d{4})$/);
    if (m) { var mj = monIdx(m[2]); if (mj >= 0) return Date.UTC(+m[3], mj, +m[1]); }
    m = s.match(/^([A-Za-z]{3,9})\.?,?\s+(\d{4})$/);
    if (m) { var mk2 = monIdx(m[1]); if (mk2 >= 0) return Date.UTC(+m[2], mk2, 1); }
    m = s.match(/^(\d{4})-(\d{2})$/);
    if (m) return Date.UTC(+m[1], +m[2] - 1, 1);
    fail(ctx + ": cannot read date '" + s + "'."); return null;
  }
  function monIdx(n) { n = n.toLowerCase(); for (var i = 0; i < 12; i++) if (MONFULL[i].indexOf(n) === 0 && n.length >= 3) return i; return -1; }
  function monthKey(t) { var d = new Date(t); return d.getUTCFullYear() + "-" + ("0" + (d.getUTCMonth() + 1)).slice(-2); }
  function monthOf(v, ctx) { var t = dateOf(v, ctx); return t == null ? null : monthKey(t); }
  function monthLabel(k) { return MON[+k.slice(5) - 1] + " " + k.slice(2, 4); }
  function nextMonth(k) { var y = +k.slice(0, 4), m = +k.slice(5); m++; if (m > 12) { m = 1; y++; } return y + "-" + ("0" + m).slice(-2); }
  function isoMonday(y, w) {
    var j4 = Date.UTC(y, 0, 4), dw = (new Date(j4).getUTCDay() + 6) % 7;
    return j4 - dw * 864e5 + (w - 1) * 7 * 864e5;
  }
  function weekOf(v, ctx) {
    var s = str(v), m = s.match(/^Week\s+(\d{1,2}),?\s+(\d{4})$/i) || s.match(/^(\d{4})-W(\d{1,2})$/);
    if (!m) { fail(ctx + ": cannot read week '" + s + "'."); return null; }
    return /^Week/i.test(s) ? isoMonday(+m[2], +m[1]) : isoMonday(+m[1], +m[2]);
  }
  function mondayOf(t) { var dw = (new Date(t).getUTCDay() + 6) % 7; return t - dw * 864e5; }
  function weekLabel(t) {
    var d = new Date(t + 3 * 864e5), y = d.getUTCFullYear(), w = Math.round((mondayOf(t) - isoMonday(y, 1)) / (7 * 864e5)) + 1;
    return "W" + w;
  }
  function yes(v) { var s = str(v).toLowerCase(); return s === "yes" || s === "true" || v === true; }

  // ---------- formatters ----------
  function fm(n) {
    if (n == null || !isFinite(n)) return "\u2014";
    var r = Math.round(n), a = Math.abs(r).toLocaleString("en-US");
    var sym = { EUR: "\u20ac", USD: "$", GBP: "\u00a3", CHF: "CHF\u00a0" }[CUR] || ((CUR || "") + "\u00a0");
    return (r < 0 ? "\u2212" : "") + sym + a;
  }
  function fmN(n) { var s = fm(n); return n < -0.5 ? '<span class="neg">' + s + "</span>" : s; }
  function fh(h) {
    if (h == null || !isFinite(h)) return "\u2014";
    var r = Math.round(h * 4) / 4;
    return (r < 0 ? "\u2212" : "") + Math.abs(r).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " h";
  }
  function fhs(h) { var r = Math.round(h * 4) / 4; return (r > 0 ? "+" : "") + fh(h); }
  function fp(x) { return x == null || !isFinite(x) ? "\u2014" : (x < -0.0005 ? "\u2212" : "") + Math.abs(x * 100).toFixed(1) + "%"; }
  function fd(t) { if (t == null) return "\u2014"; var d = new Date(t); return d.getUTCDate() + " " + MON[d.getUTCMonth()] + " " + d.getUTCFullYear(); }

  // ---------- input ----------
  var D = window.REPORT_DATA;
  if (!D || typeof D !== "object") { fail("REPORT_DATA is missing."); showErrors(); return; }
  if (String(D.template || "").split(".")[0] !== String(MAJOR)) fail("Data was prepared for template version " + (D.template || "?") + "; this is template v" + VERSION + ".");
  var VIEW = D.view === "Management" ? "M" : D.view === "PM" ? "P" : null;
  if (!VIEW) fail("view must be \"Management\" or \"PM\".");
  var Q = D.queries || {};

  function table(name, cols, required) {
    var q = Q[name];
    if (!q) { if (required) fail("Query '" + name + "' is missing."); return null; }
    if (!Array.isArray(q.cols) || !Array.isArray(q.rows)) { fail("Query '" + name + "' must have cols and rows arrays."); return null; }
    cols.forEach(function (c) { if (q.cols.indexOf(c) < 0) fail("Query '" + name + "' is missing column '" + c + "'."); });
    var out = [];
    q.rows.forEach(function (r, i) {
      if (!Array.isArray(r) || r.length !== q.cols.length) { fail("Query '" + name + "' row " + (i + 1) + " has " + (r && r.length) + " values; expected " + q.cols.length + "."); return; }
      var o = { _c: name + " row " + (i + 1) }; q.cols.forEach(function (c, j) { o[c] = r[j]; }); out.push(o);
    });
    return out;
  }

  // Confidentiality guard: a PM view must not contain internal cost data anywhere.
  if (VIEW === "P" && Object.keys(Q).some(function (n) { return Q[n] && Array.isArray(Q[n].cols) && Q[n].cols.some(function (c) { return /cost|margin|profit/i.test(c); }); }))
    fail("PM view contains cost, margin or profit fields \u2014 the report is not rendered. Remove them and run again.");
  if (VIEW === "M" && Q.monthly && Q.monthly.cols && Q.monthly.cols.indexOf("total_cost") < 0)
    fail("Management view requires total_cost in the monthly query. If it is unavailable, the runner lacks profitability access: run the PM view.");

  var S = table("services", ["budget", "service", "total_budget_total", "total_price", "unit", "billing_type"], true);
  var B = table("budgets", ["budget", "total_budget_used", "total_revenue"], true);
  var M = table("monthly", ["budget", "service", "date:month", "total_billable_revenue", "total_time"].concat(VIEW === "M" ? ["total_cost"] : []), true);
  var IF = table("invoices_finalized", ["budget.name", "amount", "invoice.invoiced_on", "date_from", "date_to"], true);
  var ID = table("invoices_draft", ["budget.name", "amount", "invoice.invoiced_on", "date_from", "date_to"], true);
  var BC = table("bookings_confirmed", ["budget", "person", "service", "date:week", "time", "person.placeholder"], true);
  var BT = table("bookings_tentative", ["budget", "person", "service", "date:week", "time", "person.placeholder"], false);
  var TW = table("time_weekly", ["budget", "person", "service", "date:week", "total_time", "total_billable_time"], true);
  var TS = table("time_status", ["person", "status", "total_time"], false);
  var P = D.project || {};
  if (!str(P.name)) fail("project.name is missing.");
  var asOfStr = str(D.as_of), asOf = dateOf(asOfStr.slice(0, 10), "as_of");
  if (asOf == null) fail("as_of is missing or invalid.");
  var TH = D.thresholds || {}, MONI = (TH.monitor != null ? TH.monitor : 50) / 100, CRIT = (TH.critical != null ? TH.critical : 80) / 100;
  if (errors.length) { showErrors(); return; }

  // ---------- budgets, services, workstreams ----------
  var BUD = {}, BORDER = [];
  S.forEach(function (r) {
    var b = str(r.budget), s = str(r.service);
    if (!b) return fail(r._c + ": empty budget name.");
    if (!BUD[b]) { BUD[b] = { name: b, svc: {}, svcOrder: [], ceiling: 0, owner: str(r.responsible) }; BORDER.push(b); }
    var bu = BUD[b], c = money(r.total_budget_total, r._c);
    if (bu.svc[s]) { note("Service '" + s + "' appears more than once in budget '" + b + "'; the rows were combined."); bu.svc[s].ceiling += c; }
    else { bu.svc[s] = { name: s, ceiling: c, price: money(r.total_price, r._c), unit: str(r.unit), billing: str(r.billing_type) }; bu.svcOrder.push(s); }
    bu.ceiling += c;
    if (!bu.owner && str(r.responsible)) bu.owner = str(r.responsible);
  });
  if (!BORDER.length) fail("The services query returned no budgets.");
  BORDER.sort(function (a, b) { return BUD[b].ceiling - BUD[a].ceiling; });
  var MODE = BORDER.length === 1 && BUD[BORDER[0]].svcOrder.length > 1 ? "service" : "budget";

  function knownBudget(b, ctx) { if (!BUD[b]) { fail(ctx + ": budget '" + b + "' is not in the services query."); return false; } return true; }
  function wsKey(b, s, ctx) {
    if (!knownBudget(b, ctx)) return null;
    if (MODE === "budget") return b;
    if (!BUD[b].svc[s]) { fail(ctx + ": service '" + s + "' is not in the services query."); return null; }
    return b + " | " + s;
  }
  var WS = {}, WORDER = [];
  BORDER.forEach(function (b) {
    var bu = BUD[b];
    if (MODE === "budget") { WS[b] = { key: b, name: b, budget: b, ceiling: bu.ceiling, svcs: bu.svcOrder.map(function (s) { return bu.svc[s]; }) }; WORDER.push(b); }
    else bu.svcOrder.forEach(function (s) { var k = b + " | " + s; WS[k] = { key: k, name: s, budget: b, ceiling: bu.svc[s].ceiling, svcs: [bu.svc[s]] }; WORDER.push(k); });
  });
  if (MODE === "service") WORDER.sort(function (a, b) { return WS[b].ceiling - WS[a].ceiling; });
  WORDER.forEach(function (k) { var w = WS[k]; w.billM = {}; w.costM = {}; w.billQ = 0; w.cost = 0; w.timeQ = 0; });
  function pricing(w) {
    var seen = {}, out = [];
    w.svcs.forEach(function (s) {
      var t = (s.billing && !/time and materials/i.test(s.billing) ? s.billing + " \u00b7 " : "") + fm(s.price) + "/" + (s.unit || "?").toLowerCase();
      if (!seen[t]) { seen[t] = 1; out.push(t); }
    });
    return out.join("; ");
  }

  // ---------- budget-level figures ----------
  BORDER.forEach(function (b) { BUD[b].used = null; BUD[b].rev = null; BUD[b].billQ = 0; BUD[b].first = null; });
  B.forEach(function (r) {
    var b = str(r.budget); if (!knownBudget(b, r._c)) return;
    BUD[b].used = money(r.total_budget_used, r._c); BUD[b].rev = money(r.total_revenue, r._c);
    if ("total_budget_total" in r) { var tb = money(r.total_budget_total, r._c); if (Math.abs(tb - BUD[b].ceiling) >= 1) note("Service budgets for '" + b + "' add up to " + fm(BUD[b].ceiling) + " but the budget total is " + fm(tb) + "."); }
  });
  BORDER.forEach(function (b) { if (BUD[b].used == null) { note("No budget-used figure was returned for '" + b + "'; it is treated as 0."); BUD[b].used = 0; BUD[b].rev = 0; } });

  var MONTHS = {};
  M.forEach(function (r) {
    var b = str(r.budget), k = wsKey(b, str(r.service), r._c); if (!k) return;
    var mk = monthOf(r["date:month"], r._c); if (!mk) return;
    var bill = money(r.total_billable_revenue, r._c), t = hours(r.total_time, r._c), w = WS[k];
    w.billM[mk] = (w.billM[mk] || 0) + bill; w.billQ += bill; w.timeQ += t; BUD[b].billQ += bill;
    if (VIEW === "M") { var c = money(r.total_cost, r._c); w.costM[mk] = (w.costM[mk] || 0) + c; w.cost += c; }
    if ((t > 0 || bill > 0) && (!BUD[b].first || mk < BUD[b].first)) BUD[b].first = mk;
    MONTHS[mk] = 1;
  });
  BORDER.forEach(function (b) {
    var bu = BUD[b];
    if (Math.abs(bu.billQ - bu.used) >= 1) note("Monthly billable revenue for '" + b + "' adds up to " + fm(bu.billQ) + ", but budget used is " + fm(bu.used) + " (difference " + fm(bu.used - bu.billQ) + "). Tables use budget used; charts use the monthly figures.");
    if (bu.rev < bu.used - 0.5) note(fm(bu.used - bu.rev) + " of billable time on '" + b + "' exceeds recognised revenue (" + fm(bu.rev) + "); revenue may be capped at the ceiling. Check before invoicing.");
  });

  // ---------- invoices ----------
  var REG = [];
  function inv(rows, state) {
    rows.forEach(function (r) {
      var b = str(r["budget.name"]); if (!knownBudget(b, r._c)) return;
      var o = {
        number: str(r["invoice.number"]) || str(r.invoice_reference) || str(r.invoice) || "\u2014",
        issue: dateOf(r["invoice.invoiced_on"], r._c), from: dateOf(r.date_from, r._c), to: dateOf(r.date_to, r._c),
        budget: b, amount: money(r.amount, r._c), state: state, source: "Productive"
      };
      o.month = o.from != null ? monthKey(o.from) : o.issue != null ? monthKey(o.issue) : null;
      REG.push(o);
    });
  }
  inv(IF, "Finalized"); inv(ID, "Draft");
  var EXT = D.external_invoices || null, EXTSRC = "";
  if (EXT) {
    EXTSRC = str(EXT.source) || "unnamed source";
    if (!str(EXT.source)) note("External invoices were supplied without a source system.");
    (EXT.rows || []).forEach(function (r, i) {
      var ctx = "external invoice " + (i + 1), b = str(r.budget);
      var o = {
        number: str(r.number) || "\u2014", issue: dateOf(r.issue_date, ctx), from: dateOf(r.service_from, ctx), to: dateOf(r.service_to, ctx),
        budget: b, amount: money(r.net_amount, ctx), state: "External", source: EXTSRC
      };
      if (o.from == null && o.to == null) note("External invoice " + o.number + " has no service period; its issue month is used.");
      o.month = o.from != null ? monthKey(o.from) : o.to != null ? monthKey(o.to) : o.issue != null ? monthKey(o.issue) : null;
      o.endMonth = o.to != null ? monthKey(o.to) : o.month;
      if (!BUD[b]) { note("External invoice " + o.number + " (" + fm(o.amount) + ") could not be matched to a budget ('" + b + "'). It counts in the programme totals only; allocate it to a budget."); o.budget = null; }
      REG.push(o);
    });
  }
  REG.forEach(function (o) { if (o.month) MONTHS[o.month] = 1; });

  // ---------- money metrics per budget ----------
  function status(c) { return c == null ? null : c > 1 ? ["Over budget", "r"] : c >= CRIT ? ["Critical", "r"] : c >= MONI ? ["Monitor", "a"] : ["On track", "g"]; }
  BORDER.forEach(function (b) {
    var bu = BUD[b]; bu.P = 0; bu.E = 0; bu.Dr = 0; bu.Dn = 0; bu.Dold = null; bu.PP = 0; bu.ext = []; bu.zeroDrafts = [];
  });
  var UNALLOC = 0;
  REG.forEach(function (o) {
    if (o.state === "External" && !o.budget) { UNALLOC += o.amount; return; }
    var bu = BUD[o.budget];
    if (o.state === "Finalized") bu.P += o.amount;
    else if (o.state === "Draft") {
      bu.Dr += o.amount; bu.Dn++; if (o.issue != null && (bu.Dold == null || o.issue < bu.Dold)) bu.Dold = o.issue;
      if (Math.abs(o.amount) < 0.005) bu.zeroDrafts.push(o);
    } else {
      bu.E += o.amount; bu.ext.push(o);
      o.pre = !bu.first || (o.endMonth && o.endMonth < bu.first);
      if (o.pre) bu.PP += o.amount;
    }
  });
  BORDER.forEach(function (b) {
    var bu = BUD[b];
    bu.B = bu.used; bu.T = bu.P + bu.E; bu.I = bu.T - bu.PP;
    bu.NYI = Math.max(0, bu.B - bu.I); bu.ahead = Math.max(0, bu.I - bu.B);
    bu.K = bu.T + bu.NYI; bu.R = bu.ceiling - bu.K; bu.cons = bu.ceiling > 0 ? bu.K / bu.ceiling : null; bu.st = status(bu.cons);
  });
  WORDER.forEach(function (k) {
    var w = WS[k], bu = BUD[w.budget];
    if (MODE === "budget") { ["B", "P", "E", "T", "Dr", "NYI", "K", "R", "cons", "st"].forEach(function (f) { w[f] = bu[f]; }); }
    else { w.B = w.billQ; w.R = w.ceiling - w.B; w.cons = w.ceiling > 0 ? w.B / w.ceiling : null; w.st = status(w.cons); }
    w.margin = w.B - w.cost; w.mpct = w.B ? w.margin / w.B : null;
  });
  var TOT = { ceiling: 0, B: 0, P: 0, E: UNALLOC, Dr: 0, NYI: 0, K: UNALLOC, cost: 0 };
  BORDER.forEach(function (b) { var bu = BUD[b]; TOT.ceiling += bu.ceiling; TOT.B += bu.B; TOT.P += bu.P; TOT.E += bu.E; TOT.Dr += bu.Dr; TOT.NYI += bu.NYI; TOT.K += bu.K; });
  WORDER.forEach(function (k) { TOT.cost += WS[k].cost; });
  TOT.T = TOT.P + TOT.E; TOT.R = TOT.ceiling - TOT.K; TOT.cons = TOT.ceiling > 0 ? TOT.K / TOT.ceiling : null; TOT.st = status(TOT.cons);
  TOT.margin = TOT.B - TOT.cost; TOT.mpct = TOT.B ? TOT.margin / TOT.B : null;

  // ---------- monthly series ----------
  var asOfMonth = monthKey(asOf), mkeys = Object.keys(MONTHS).filter(function (m) { return m <= asOfMonth; }).sort();
  var AX = []; if (mkeys.length) { for (var mk = mkeys[0]; mk <= asOfMonth; mk = nextMonth(mk)) AX.push(mk); } else AX.push(asOfMonth);
  function clampM(m) { return m == null ? null : m < AX[0] ? AX[0] : m > asOfMonth ? asOfMonth : m; }
  function cum(map) { var s = 0; return AX.map(function (m) { s += map[m] || 0; return s; }); }
  function addTo(map, m, v) { m = clampM(m); if (m) map[m] = (map[m] || 0) + v; }
  var SER = {};
  BORDER.forEach(function (b) {
    var bill = {}, cost = {}, invd = {}, pp = {}, mk = {};
    WORDER.forEach(function (k) { var w = WS[k]; if (w.budget !== b) return; Object.keys(w.billM).forEach(function (m) { addTo(bill, m, w.billM[m]); }); Object.keys(w.costM).forEach(function (m) { addTo(cost, m, w.costM[m]); }); });
    REG.forEach(function (o) {
      if (o.budget !== b || o.state === "Draft") return;
      addTo(invd, o.month, o.amount); var cm = clampM(o.month); if (cm) mk[cm] = o.state === "External" ? "ext" : (mk[cm] === "ext" ? "ext" : "prod");
      if (o.state === "External" && o.pre) addTo(pp, o.month, o.amount);
    });
    var cb = cum(bill), ci = cum(invd), cp = cum(pp);
    SER[b] = { ceiling: AX.map(function () { return BUD[b].ceiling; }), bill: cb, inv: ci, cost: cum(cost), marks: AX.map(function (m) { return mk[m] || null; }),
      comm: AX.map(function (m, i) { return Math.max(ci[i], cb[i] + cp[i]); }) };
  });
  var un = {}, unm = {}; REG.forEach(function (o) { if (o.state === "External" && !o.budget) { addTo(un, o.month, o.amount); unm[clampM(o.month)] = "ext"; } });
  var cun = cum(un);
  var PROG = { ceiling: AX.map(function () { return TOT.ceiling; }) };
  ["bill", "inv", "cost", "comm"].forEach(function (f) { PROG[f] = AX.map(function (m, i) { var s = 0; BORDER.forEach(function (b) { s += SER[b][f][i]; }); return s + ((f === "inv" || f === "comm") ? cun[i] : 0); }); });
  PROG.marks = AX.map(function (m, i) { var r = unm[m] || null; BORDER.forEach(function (b) { var x = SER[b].marks[i]; if (x === "ext" || (x && !r)) r = x; }); return r; });
  // Built-in consistency checks on the computed series
  function mono(a, lab) { for (var i = 1; i < a.length; i++) if (a[i] < a[i - 1] - 0.005) { fail("Internal check: cumulative series '" + lab + "' decreases at " + monthLabel(AX[i]) + "."); return; } }
  BORDER.forEach(function (b) { ["bill", "inv", "cost", "comm"].forEach(function (f) { mono(SER[b][f], b + " / " + f); }); });
  ["bill", "inv", "cost", "comm"].forEach(function (f) { mono(PROG[f], "Programme / " + f); });

  // ---------- delivery ----------
  var asOfMon = mondayOf(asOf), PEOPLE = {}, WP = {}, UNASSIGNED = {}, futureBooked = 0, tentPast = 0, tentFuture = 0;
  function person(n) { return PEOPLE[n] || (PEOPLE[n] = { name: n, booked: 0, actual: 0, billable: 0, unappr: null, wk: {} }); }
  function wperson(k, n) { var id = k + "\u0001" + n; return WP[id] || (WP[id] = { ws: k, name: n, booked: 0, actual: 0, billable: 0, wk: {} }); }
  function wk(o, t) { return o.wk[t] || (o.wk[t] = { b: 0, a: 0 }); }
  BC.forEach(function (r) {
    var k = wsKey(str(r.budget), str(r.service), r._c), t = weekOf(r["date:week"], r._c), h = hours(r.time, r._c); if (!k || t == null) return;
    if (t > asOfMon) { futureBooked += h; return; }
    if (yes(r["person.placeholder"])) { var sn = str(r.service) || "Unspecified"; UNASSIGNED[sn] = (UNASSIGNED[sn] || 0) + h; return; }
    var p = person(str(r.person)), q = wperson(k, str(r.person));
    p.booked += h; wk(p, t).b += h; q.booked += h; wk(q, t).b += h;
  });
  (BT || []).forEach(function (r) { var t = weekOf(r["date:week"], r._c), h = hours(r.time, r._c); if (t == null) return; if (t > asOfMon) tentFuture += h; else tentPast += h; });
  TW.forEach(function (r) {
    var k = wsKey(str(r.budget), str(r.service), r._c), t = weekOf(r["date:week"], r._c); if (!k || t == null) return;
    var a = hours(r.total_time, r._c), bl = hours(r.total_billable_time, r._c), p = person(str(r.person)), q = wperson(k, str(r.person));
    p.actual += a; p.billable += bl; wk(p, t).a += a; q.actual += a; q.billable += bl; wk(q, t).a += a;
  });
  var OPEN = { unapproved: 1, rejected: 1, submitted: 1, unsubmitted: 1 }, DONE = { approved: 1, "auto-approved": 1, "auto approved": 1, autoapproved: 1 };
  if (TS) {
    Object.keys(PEOPLE).forEach(function (n) { PEOPLE[n].unappr = 0; });
    TS.forEach(function (r) {
      var s = str(r.status).toLowerCase(), h = hours(r.total_time, r._c);
      if (OPEN[s]) person(str(r.person)).unappr = (person(str(r.person)).unappr || 0) + h;
      else if (!DONE[s]) note("Unknown time-entry status '" + str(r.status) + "' (" + fh(h) + ") was not counted as unapproved.");
    });
  } else note("Approval status was not supplied; unapproved hours are not shown.");
  function fin(o) {
    o.var = o.actual - o.booked; o.varp = o.booked > 0 ? o.var / o.booked : null; o.unbooked = 0;
    Object.keys(o.wk).forEach(function (t) { if (o.wk[t].b <= 0.0001) o.unbooked += o.wk[t].a; });
  }
  var PL = Object.keys(PEOPLE).map(function (n) { fin(PEOPLE[n]); return PEOPLE[n]; }).sort(function (a, b) { return Math.abs(b.var) - Math.abs(a.var) || a.name.localeCompare(b.name); });
  var WPL = Object.keys(WP).map(function (id) { fin(WP[id]); return WP[id]; }).sort(function (a, b) { return WORDER.indexOf(a.ws) - WORDER.indexOf(b.ws) || Math.abs(b.var) - Math.abs(a.var); });
  var H = { booked: 0, actual: 0, billable: 0, unappr: 0, unbooked: 0 };
  PL.forEach(function (p) { H.booked += p.booked; H.actual += p.actual; H.billable += p.billable; H.unappr += p.unappr || 0; H.unbooked += p.unbooked; });
  H.var = H.actual - H.booked; H.varp = H.booked ? H.var / H.booked : null;
  var unassignedTotal = 0; Object.keys(UNASSIGNED).forEach(function (s) { unassignedTotal += UNASSIGNED[s]; });

  // weekly axis: last 26 weeks up to the current week
  var firstWk = null; PL.forEach(function (p) { Object.keys(p.wk).forEach(function (t) { t = +t; if (firstWk == null || t < firstWk) firstWk = t; }); });
  var WAX = []; var startW = Math.max(firstWk == null ? asOfMon : firstWk, asOfMon - 25 * 7 * 864e5);
  for (var tw = startW; tw <= asOfMon; tw += 7 * 864e5) WAX.push(tw);

  if (errors.length) { showErrors(); return; }

  // ---------- data quality and tasks ----------
  var TASKS = [];
  function task(t, sub) { TASKS.push({ t: t, sub: sub || null }); }
  var wsName = function (b) { return b; };
  // 1 ceiling breaches
  BORDER.forEach(function (b) {
    var bu = BUD[b], a = bu.T > bu.ceiling + 0.5, bb = !a && bu.T + bu.Dr > bu.ceiling + 0.5, c = !a && bu.K > bu.ceiling + 0.5;
    if (a) task("<b>" + esc(wsName(b)) + ":</b> customer invoiced " + fm(bu.T) + " against a ceiling of " + fm(bu.ceiling) + " (" + fm(bu.T - bu.ceiling) + " over)" + (bu.E ? ", of which external " + fm(bu.E) : "") + ".");
    if (bb) task("<b>" + esc(wsName(b)) + ":</b> finalizing drafts (" + fm(bu.Dr) + ") would breach the ceiling by " + fm(bu.T + bu.Dr - bu.ceiling) + " \u2014 do not finalize without customer approval or a budget change.");
    if (c) task("<b>" + esc(wsName(b)) + ":</b> billable work not yet invoiced would take the budget " + fm(bu.K - bu.ceiling) + " over the ceiling.");
    if (!a && !bb && !c && bu.st && bu.st[1] !== "g") task("<b>" + esc(wsName(b)) + "</b> is at " + fp(bu.cons) + " consumption (" + bu.st[0] + ").");
  });
  if (MODE === "service") WORDER.forEach(function (k) { var w = WS[k]; if (w.st && w.st[1] !== "g") task("Service <b>" + esc(w.name) + "</b> has used " + fp(w.cons) + " of its " + fm(w.ceiling) + " budget (" + w.st[0] + ")."); });
  // 2 invoiced ahead of time
  BORDER.forEach(function (b) { var bu = BUD[b]; if (bu.ahead > 0.5) task("<b>" + esc(b) + ":</b> " + fm(bu.ahead) + " invoiced beyond recorded billable time \u2014 check against time entries."); });
  // 3 not yet invoiced from closed months
  var lastClosed = (function () { var y = +asOfMonth.slice(0, 4), m = +asOfMonth.slice(5) - 1; if (m < 1) { m = 12; y--; } return y + "-" + ("0" + m).slice(-2); })();
  var li = AX.indexOf(lastClosed), nyiClosed = [];
  if (li >= 0) BORDER.forEach(function (b) {
    var bu = BUD[b], billClosed = SER[b].bill[li], x = Math.max(0, billClosed - bu.I);
    if (x > 0.5) nyiClosed.push(esc(b) + ": " + fm(x));
  });
  if (nyiClosed.length) task("Billable value from closed months (to end of " + MON[+lastClosed.slice(5) - 1] + " " + lastClosed.slice(0, 4) + ") not yet invoiced:", nyiClosed);
  // 4 drafts
  BORDER.forEach(function (b) {
    var bu = BUD[b]; if (!bu.Dn) return;
    task("<b>" + esc(b) + ":</b> " + bu.Dn + " draft invoice" + (bu.Dn > 1 ? "s" : "") + " totalling " + fm(bu.Dr) + ", oldest " + fd(bu.Dold) + " \u2014 review and finalize or delete." +
      (bu.zeroDrafts.length ? " Includes " + bu.zeroDrafts.length + " draft for " + fm(0) + " (" + bu.zeroDrafts.map(function (o) { return esc(o.number); }).join(", ") + ")." : ""));
  });
  // 5 no invoices found
  BORDER.forEach(function (b) { var bu = BUD[b]; if (bu.B > 0.5 && bu.T < 0.005) task("<b>" + esc(b) + ":</b> billable value of " + fm(bu.B) + " but no invoices found in Productive or supplied \u2014 confirm whether invoices were issued and from which system."); });
  // 6 external invoices to create in Productive
  BORDER.forEach(function (b) {
    var bu = BUD[b]; if (!bu.ext.length) return;
    task("<b>" + esc(b) + ":</b> create " + bu.ext.length + " invoice" + (bu.ext.length > 1 ? "s" : "") + " retrospectively in Productive, total " + fm(bu.E) + ", source: " + esc(EXTSRC) + ".",
      bu.ext.slice().sort(function (x, y) { return (x.issue || 0) - (y.issue || 0); }).map(function (o) { return esc(o.number) + " \u00b7 issued " + fd(o.issue) + " \u00b7 service " + period(o) + " \u00b7 " + fm(o.amount); }));
  });
  // 7 possible duplicates
  REG.forEach(function (d) {
    if (d.state !== "Draft" || Math.abs(d.amount) < 0.005) return;
    REG.forEach(function (e) {
      if (e.state !== "External" || e.budget !== d.budget) return;
      if (Math.abs(e.amount - d.amount) < 0.5 || (d.month && d.month === e.month)) task("<b>" + esc(d.budget) + ":</b> do not finalize draft " + esc(d.number) + " (" + fm(d.amount) + ") until checked against external invoice " + esc(e.number) + " (" + fm(e.amount) + ", service " + period(e) + ") \u2014 possible duplicate.");
    });
  });
  // 8 unapproved
  if (TS && H.unappr > 0.12) task(fh(H.unappr) + " of time is not yet approved:", PL.filter(function (p) { return (p.unappr || 0) > 0.12; }).map(function (p) { return esc(p.name) + ": " + fh(p.unappr); }));
  // 9 variance
  var over = PL.filter(function (p) { return p.varp != null && p.varp >= 0.2 && p.var >= 8; }), under = PL.filter(function (p) { return p.varp != null && p.varp <= -0.2 && p.var <= -8; });
  if (over.length) task("Over plan (actual above confirmed bookings by \u2265 20% and \u2265 8 h):", over.map(function (p) { return esc(p.name) + ": " + fhs(p.var) + " (" + fp(p.varp) + ")"; }));
  if (under.length) task("Under plan (actual below confirmed bookings by \u2265 20% and \u2265 8 h):", under.map(function (p) { return esc(p.name) + ": " + fhs(p.var) + " (" + fp(p.varp) + ")"; }));
  // 10 unbooked actuals
  var ub = PL.filter(function (p) { return p.unbooked > 0.12; });
  if (ub.length) task("Unbooked actuals (time recorded in weeks with no confirmed booking):", ub.map(function (p) { return esc(p.name) + ": " + fh(p.unbooked); }));
  // 11 data notes
  if (tentPast + tentFuture > 0.12) note("Tentative bookings are excluded from booked hours: " + fh(tentPast) + " to date, " + fh(tentFuture) + " in future weeks.");
  if (futureBooked > 0.12) note("Confirmed bookings in future weeks (" + fh(futureBooked) + ") are excluded from booked hours.");
  if (unassignedTotal > 0.12) note("Unassigned (placeholder) booked hours to date: " + Object.keys(UNASSIGNED).map(function (s) { return s + " " + fh(UNASSIGNED[s]); }).join("; ") + ". These are not in the consultant tables.");
  if (MODE === "service") note("This project has one budget, so workstreams are its services. Invoices are recorded per budget, so invoicing columns are shown on the total row only.");
  if (notes.length) task("Data notes:", notes.map(esc));

  function period(o) { if (o.from == null && o.to == null) return "\u2014"; if (o.from != null && o.to != null && monthKey(o.from) === monthKey(o.to) && new Date(o.from).getUTCDate() === 1) return MON[new Date(o.from).getUTCMonth()] + " " + new Date(o.from).getUTCFullYear(); if (o.to == null) return "from " + fd(o.from); if (o.from == null) return "to " + fd(o.to); return fd(o.from) + " \u2013 " + fd(o.to); }

  // ---------- render ----------
  var h = [], isM = VIEW === "M";
  var scope = isM ? "Management view \u2014 CONFIDENTIAL: contains internal cost and margin" : "Project Manager view \u2014 internal cost and profitability excluded";
  var owners = {}; BORDER.forEach(function (b) { if (BUD[b].owner) owners[BUD[b].owner] = 1; });
  var tStr = asOfStr.length > 10 ? asOfStr.slice(11, 16) : "";
  h.push('<div class="ey">Project Budget &amp; Delivery Report</div>');
  h.push("<h1>" + esc((P.customer ? P.customer + " \u2013 " : "") + P.name) + "</h1>");
  h.push('<div class="scope ' + (isM ? "m" : "p") + '">' + esc(scope) + "</div>");
  h.push('<div class="meta"><span><b>Period:</b> ' + monthLabel(AX[0]).replace(/ (\d\d)$/, " 20$1") + " \u2013 " + fd(asOf) + "</span><span><b>Data as of:</b> " + fd(asOf) + (tStr ? ", " + tStr : "") + " " + esc(P.timezone || "Europe/Berlin") + "</span><span><b>Project manager:</b> " + esc(P.project_manager || "\u2014") + "</span><span><b>Budget owner(s):</b> " + esc(Object.keys(owners).join(", ") || "\u2014") + "</span><span><b>Currency:</b> " + esc(CUR || "\u2014") + "</span></div>");
  if (EXT) h.push('<div class="ext">Includes external invoices from <b>' + esc(EXTSRC) + "</b>, supplied by " + esc(EXT.supplied_by || "\u2014") + " on " + fd(dateOf(EXT.supplied_on, "external_invoices.supplied_on")) + " \u2014 not yet in Productive.</div>");

  function tile(l, v, s) { return '<div class="tile"><div class="lab">' + l + '</div><div class="num">' + v + "</div>" + (s ? '<div class="sub">' + s + "</div>" : "") + "</div>"; }
  function stTag(s) { return s ? '<span class="st ' + s[1] + '">' + s[0] + "</span>" : "\u2014"; }
  h.push("<h2>Key figures</h2><div class='tiles'>");
  h.push(tile("Budget ceiling", fm(TOT.ceiling), BORDER.length + " budget" + (BORDER.length > 1 ? "s" : "")));
  h.push(tile("Total invoiced", fm(TOT.T), TOT.E ? "of which external " + fm(TOT.E) : "Finalized Productive invoices"));
  h.push(tile("Not yet invoiced", fm(TOT.NYI), "Billable value not yet invoiced"));
  h.push(tile("Committed", fm(TOT.K), "Invoiced + not yet invoiced"));
  h.push(tile("Remaining", fmN(TOT.R), fp(TOT.cons) + " consumed \u00b7 " + stTag(TOT.st)));
  h.push(tile("Hours: actual vs booked", fh(H.actual) + " / " + fh(H.booked), "Variance " + fhs(H.var) + (H.varp != null ? " (" + fp(H.varp) + ")" : "")));
  h.push("</div>");
  if (isM) h.push("<div class='tiles t3'>" + tile("Time cost", fm(TOT.cost)) + tile("Margin", fmN(TOT.margin), "Billable value \u2212 time cost") + tile("Margin %", fp(TOT.mpct)) + "</div>");

  // table 2
  var hasExt = TOT.E > 0.005 || !!EXT;
  var cols = ["Workstream", "Pricing", "Budget ceiling", "Billable value", "Productive invoiced"].concat(hasExt ? ["External invoiced"] : []).concat(["Total invoiced", "Draft invoices", "Not yet invoiced", "Committed", "Remaining", "Consumption", "Status"]).concat(isM ? ["Time cost", "Margin", "Margin %"] : []);
  function row(name, pr, o, inv, cls) {
    var d = [esc(name), '<span style="white-space:normal">' + esc(pr) + "</span>", fm(o.ceiling), fm(o.B)];
    var dash = "\u2014";
    d.push(inv ? fm(o.P) : dash); if (hasExt) d.push(inv ? fm(o.E) : dash);
    d.push(inv ? fm(o.T) : dash, inv ? fm(o.Dr) : dash, inv ? fm(o.NYI) : dash, inv ? fm(o.K) : dash, fmN(o.R), fp(o.cons), stTag(o.st));
    if (isM) d.push(fm(o.cost), fmN(o.margin), fp(o.mpct));
    return "<tr" + (cls ? ' class="' + cls + '"' : "") + ">" + d.map(function (x, i) { return "<td" + (i < 2 ? ' class="l"' : "") + ">" + x + "</td>"; }).join("") + "</tr>";
  }
  h.push("<h2>Budget &amp; billing by workstream</h2><div class='tw'><table><thead><tr>" + cols.map(function (c, i) { return "<th" + (i < 2 ? ' class="l"' : "") + ">" + c + "</th>"; }).join("") + "</tr></thead><tbody>");
  WORDER.forEach(function (k) { var w = WS[k]; h.push(row(w.name, pricing(w), w, MODE === "budget")); });
  if (UNALLOC) h.push(row("Unallocated external invoices", "", { ceiling: 0, B: 0, P: 0, E: UNALLOC, T: UNALLOC, Dr: 0, NYI: 0, K: UNALLOC, R: -UNALLOC, cons: null, st: null, cost: 0, margin: 0, mpct: null }, true));
  h.push(row("Total", "", TOT, true, "tot"));
  h.push("</tbody></table></div><p class='note'>Committed = total invoiced (Productive + external) + billable value not yet invoiced. Remaining and consumption are measured against Committed." + (MODE === "service" ? " Service rows: consumption = billable value \u00f7 service budget." : "") + "</p>");

  // charts
  var LEG = [["Budget ceiling", COL.ceiling, "dashed"], ["Billable value", COL.billable, "solid"], ["Total invoiced", COL.invoiced, "solid"], ["Committed", COL.committed, "dotted"]].concat(isM ? [["Time cost", COL.cost, "solid"]] : []);
  h.push("<h2>Cumulative billing</h2><div class='legend'>" + LEG.map(function (l) { return '<span><i style="border-top-color:' + l[1] + ";border-top-style:" + l[2] + '"></i>' + l[0] + "</span>"; }).join("") + "<span>\u25a0 Productive invoice month \u00b7 \u25c6 external invoice month</span></div>");
  var CH = [];
  function chartBox(id, title, big) { return '<div class="card"><h3>' + esc(title) + '</h3><div class="ch' + (big ? " big" : "") + '"><canvas id="' + id + '"></canvas></div></div>'; }
  var multi = WORDER.length > 1;
  if (multi) { h.push(chartBox("c_prog", MODE === "service" ? "Budget total \u2014 " + BORDER[0] : "Programme total", true)); CH.push(["c_prog", PROG, true]); }
  h.push("<div class='grid2' style='margin-top:14px'>");
  WORDER.forEach(function (k, i) {
    var w = WS[k], id = "c_ws" + i;
    if (MODE === "budget") { h.push(chartBox(id, w.name)); CH.push([id, SER[w.budget], true]); }
    else {
      var c = { ceiling: AX.map(function () { return w.ceiling; }), bill: cum(w.billM), cost: cum(w.costM) };
      h.push(chartBox(id, w.name)); CH.push([id, c, false]);
    }
  });
  h.push("</div>");

  // delivery
  h.push("<h2>Delivery by consultant</h2><div class='tw'><table><thead><tr><th>Consultant</th><th>Booked</th><th>Actual</th><th>Billable</th><th>Non-billable</th><th>Variance</th><th>Variance %</th><th>Unbooked actuals</th><th>Unapproved</th></tr></thead><tbody>");
  PL.forEach(function (p) { h.push("<tr><td>" + esc(p.name) + "</td><td>" + fh(p.booked) + "</td><td>" + fh(p.actual) + "</td><td>" + fh(p.billable) + "</td><td>" + fh(p.actual - p.billable) + "</td><td>" + fhs(p.var) + "</td><td>" + fp(p.varp) + "</td><td>" + fh(p.unbooked) + "</td><td>" + (p.unappr == null ? "\u2014" : fh(p.unappr)) + "</td></tr>"); });
  h.push("<tr class='tot'><td>Total</td><td>" + fh(H.booked) + "</td><td>" + fh(H.actual) + "</td><td>" + fh(H.billable) + "</td><td>" + fh(H.actual - H.billable) + "</td><td>" + fhs(H.var) + "</td><td>" + fp(H.varp) + "</td><td>" + fh(H.unbooked) + "</td><td>" + (TS ? fh(H.unappr) : "\u2014") + "</td></tr>");
  h.push("</tbody></table></div><p class='note'>Booked = confirmed bookings for named people in weeks up to " + fd(asOf) + ". Variance = actual \u2212 booked. Unbooked actuals = time recorded in weeks with no confirmed booking for that person.</p>");
  if (WORDER.length > 1) {
    h.push("<h3 style='margin-top:18px'>Consultant \u00d7 workstream</h3><div class='tw'><table><thead><tr><th>Workstream</th><th>Consultant</th><th>Booked</th><th>Actual</th><th>Billable</th><th>Non-billable</th><th>Variance</th><th>Variance %</th><th>Unbooked actuals</th></tr></thead><tbody>");
    WPL.forEach(function (p) { h.push("<tr><td>" + esc(WS[p.ws].name) + "</td><td class='l'>" + esc(p.name) + "</td><td>" + fh(p.booked) + "</td><td>" + fh(p.actual) + "</td><td>" + fh(p.billable) + "</td><td>" + fh(p.actual - p.billable) + "</td><td>" + fhs(p.var) + "</td><td>" + fp(p.varp) + "</td><td>" + fh(p.unbooked) + "</td></tr>"); });
    h.push("</tbody></table></div>");
  }
  h.push("<h3 style='margin-top:18px'>Weekly booked vs actual hours</h3><div class='legend'><span><i style='border-top-color:" + COL.booked + ";border-top-style:dashed'></i>Booked hours (confirmed)</span><span><i style='border-top-color:" + COL.actual + "'></i>Actual hours</span><span>\u25b2 current week (in progress)</span></div><div class='grid2'>");
  PL.forEach(function (p, i) { h.push(chartBox("c_p" + i, p.name)); });
  h.push("</div>");

  // register
  var RS = REG.slice().sort(function (a, b) { return (a.issue || 0) - (b.issue || 0); });
  h.push("<h2>Invoice register</h2><div class='tw'><table><thead><tr><th>Number</th><th class='l'>Issue date</th><th class='l'>Status</th><th class='l'>Source</th><th class='l'>Budget</th><th class='l'>Service period</th><th>Net amount</th></tr></thead><tbody>");
  if (!RS.length) h.push("<tr><td colspan='7' class='l'>No invoices found in Productive or supplied.</td></tr>");
  RS.forEach(function (o) { h.push("<tr><td>" + esc(o.number) + "</td><td class='l'>" + fd(o.issue) + "</td><td class='l'>" + o.state + "</td><td class='l'>" + esc(o.source) + "</td><td class='l'>" + esc(o.budget || "Unallocated") + "</td><td class='l'>" + period(o) + "</td><td>" + fm(o.amount) + "</td></tr>"); });
  h.push("</tbody></table></div>");

  // tasks
  h.push("<h2>Data quality and tasks</h2>");
  if (!TASKS.length) h.push("<p>No issues found.</p>");
  else h.push("<ol class='tasks'>" + TASKS.map(function (t) { return "<li>" + t.t + (t.sub ? "<ul>" + t.sub.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ul>" : "") + "</li>"; }).join("") + "</ol>");

  // footer
  h.push("<footer><p><b>Scope:</b> " + esc(scope) + ".</p>");
  h.push("<p><b>Definitions:</b> Billable value = Productive budget used. Total invoiced = finalized Productive invoices + external invoices (drafts excluded). Committed = total invoiced + billable value not yet invoiced. Booked hours = confirmed bookings for named people up to the as-of date (tentative, absence, placeholder and future bookings excluded).</p>");
  h.push("<p><b>Sources:</b> Productive service, budget, time-entry, invoice-attribution and booking reports" + (EXT ? "; external invoices from " + esc(EXTSRC) : "") + ". Data as of " + fd(asOf) + (tStr ? ", " + tStr : "") + ". Template v" + VERSION + ".</p></footer>");
  root.innerHTML = h.join("");

  // ---------- charts ----------
  if (typeof window.Chart !== "function") {
    Array.prototype.forEach.call(root.querySelectorAll("canvas"), function (c) { c.parentNode.innerHTML = '<div class="na">Chart.js did not load</div>'; });
    return;
  }
  var tipMoney = { callbacks: { label: function (x) { return x.dataset.label + ": " + fm(x.parsed.y); } } };
  var base = function (ticks) { return { animation: false, responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, plugins: { legend: { display: false }, tooltip: ticks }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }; };
  CH.forEach(function (c) {
    var s = c[1], full = c[2], ds = [{ label: "Budget ceiling", data: s.ceiling, borderColor: COL.ceiling, borderDash: [6, 5], borderWidth: 2, pointRadius: 0 },
      { label: "Billable value", data: s.bill, borderColor: COL.billable, backgroundColor: COL.billable, borderWidth: 2.5, pointRadius: 2 }];
    if (full) {
      ds.push({ label: "Total invoiced", data: s.inv, borderColor: COL.invoiced, backgroundColor: COL.invoiced, borderWidth: 2.5,
        pointStyle: s.marks.map(function (m) { return m === "ext" ? "rectRot" : "rect"; }), pointRadius: s.marks.map(function (m) { return m ? 5 : 0; }) });
      ds.push({ label: "Committed", data: s.comm, borderColor: COL.committed, borderDash: [2, 4], borderWidth: 2.5, pointRadius: 0 });
    }
    if (isM) ds.push({ label: "Time cost", data: s.cost, borderColor: COL.cost, backgroundColor: COL.cost, borderWidth: 2, pointRadius: 2 });
    var o = base(tipMoney); o.scales.y.ticks = { callback: function (v) { return fm(v); } };
    new Chart(document.getElementById(c[0]), { type: "line", data: { labels: AX.map(monthLabel), datasets: ds }, options: o });
  });
  var tipH = { callbacks: { label: function (x) { return x.dataset.label + ": " + fh(x.parsed.y); } } };
  PL.forEach(function (p, i) {
    var cur = WAX.length - 1, o = base(tipH);
    new Chart(document.getElementById("c_p" + i), { type: "line", data: { labels: WAX.map(weekLabel), datasets: [
      { label: "Booked", data: WAX.map(function (t) { return p.wk[t] ? p.wk[t].b : 0; }), borderColor: COL.booked, borderDash: [6, 5], borderWidth: 2, pointRadius: 0 },
      { label: "Actual", data: WAX.map(function (t) { return p.wk[t] ? p.wk[t].a : 0; }), borderColor: COL.actual, backgroundColor: COL.actual, borderWidth: 2.5,
        pointStyle: WAX.map(function (t, j) { return j === cur ? "triangle" : "circle"; }), pointRadius: WAX.map(function (t, j) { return j === cur ? 6 : 2; }) }] }, options: o });
  });
})();
