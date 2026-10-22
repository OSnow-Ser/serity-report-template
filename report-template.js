/*!
 * Serity report template - capability test v0.1
 * Reads window.REPORT_DATA, computes cumulative values in code, renders one chart.
 * Contains no customer data. Safe to host in a public repository.
 */
(function () {
  var VERSION = "0.1";
  var root = document.getElementById("report");
  if (!root) { root = document.createElement("div"); document.body.appendChild(root); }

  function el(tag, style, text) {
    var e = document.createElement(tag);
    if (style) e.style.cssText = style;
    if (text != null) e.textContent = text;
    return e;
  }
  function banner(ok, msg) {
    root.appendChild(el("div",
      "font:600 14px system-ui,sans-serif;padding:12px 14px;border-radius:8px;margin:12px 0;" +
      (ok ? "background:#ecfdf5;color:#065f46;border-left:4px solid #059669"
          : "background:#fef2f2;color:#991b1b;border-left:4px solid #dc2626"), msg));
  }

  var d = window.REPORT_DATA;
  var errors = [];

  // ---- Input checks ----
  if (!d || typeof d !== "object") errors.push("REPORT_DATA is missing.");
  else {
    if (!Array.isArray(d.months) || !Array.isArray(d.invoiced)) errors.push("months and invoiced must be arrays.");
    else if (d.months.length !== d.invoiced.length) errors.push("months and invoiced have different lengths.");
    else d.invoiced.forEach(function (v, i) {
      if (typeof v !== "number" || !isFinite(v)) errors.push("invoiced[" + i + "] is not a plain number.");
    });
    // Confidentiality guard: a PM view must not carry cost data at all.
    if (d.view === "PM" && JSON.stringify(d).match(/"(cost|time_cost|total_cost|margin|profit)"/i))
      errors.push("PM view contains cost or margin fields \u2014 report not rendered.");
  }

  root.appendChild(el("h1", "font:700 22px system-ui,sans-serif;margin:8px 0",
    (d && d.project ? d.project : "Report") + " \u2014 template test"));

  if (errors.length) { banner(false, "Template v" + VERSION + " loaded, but data checks failed: " + errors.join(" ")); return; }

  // ---- Computation in code (never by the AI) ----
  var cum = [], s = 0;
  d.invoiced.forEach(function (v) { s += v; cum.push(s); });

  banner(true, "Template v" + VERSION + " loaded \u00b7 view: " + d.view +
    " \u00b7 cumulative invoiced: " + cum.join(" \u2192 "));

  if (typeof window.Chart !== "function") {
    banner(false, "Chart.js did not load \u2014 external CDN script blocked or failed.");
    return;
  }

  var box = el("div", "height:300px;max-width:720px");
  var canvas = document.createElement("canvas");
  box.appendChild(canvas);
  root.appendChild(box);

  new Chart(canvas, {
    type: "line",
    data: {
      labels: d.months,
      datasets: [{
        label: "Cumulative invoiced",
        data: cum,
        borderColor: "#059669",
        backgroundColor: "#059669",
        pointStyle: "rect",
        pointRadius: 4,
        borderWidth: 3
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
    }
  });
})();
