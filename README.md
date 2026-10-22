# Productive template test (v0.1)

This test checks whether Productive's AI can produce an HTML report that loads a template script from a public GitHub repository through jsDelivr, without changing the code it is given.

`report-template.js` contains no customer data. It does three things:

1. It reads the data block embedded in the page.
2. It works out cumulative values in code.
3. It draws one chart, or shows a red banner explaining what went wrong.

## 1. Publish the script (about 5 minutes)

1. On GitHub, create a **public** repository, for example `serity-report-template`.
2. Upload `report-template.js` to the root of the repository and commit it.
3. Go to **Releases → Create a new release**, enter the tag `v0.1`, and publish.
4. Open this address in your browser. It should show the script's source code:

   ```
   https://cdn.jsdelivr.net/gh/<github-user>/serity-report-template@v0.1/report-template.js
   ```

   jsDelivr caches tagged versions. Each future change gets a new tag (`v0.2`, …), so a report always loads the exact template version it was built with.

## 2. Prompt for Productive AI

Replace `<github-user>` in the prompt below, then paste it into Productive:

````
Produce an HTML report containing exactly the code below and nothing else.
Do not change, reformat, reorder or add anything.

```html
<meta charset="utf-8">
<div id="report"></div>
<script>window.REPORT_DATA = {"view":"PM","project":"Test","months":["Jan","Feb","Mar"],"invoiced":[100,0,50]};</script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/<github-user>/serity-report-template@v0.1/report-template.js"></script>
```
````

## 3. Reading the result

| What you see | Meaning | Next step |
|---|---|---|
| Green banner "Template v0.1 loaded · cumulative invoiced: 100 → 100 → 150", with a line chart rising to 150 | **Option 2 works** | Go to step 2 (permission test) |
| Green banner, plus a red banner "Chart.js did not load" | Our script loaded, but Chart.js did not | Check the Chart.js address; this is unlikely |
| Blank page, or only the heading | The template script was blocked from that address | Ask Productive whether `cdn.jsdelivr.net/gh/` is allowed, or use option 1 |
| A different chart, or a different number sequence | The AI changed the code or the data | Look at the generated HTML; you need a stricter instruction or option 3 |

## 4. Optional second test: the PM confidentiality check

Run the prompt again, adding `,"total_cost":[1,2,3]` after `[100,0,50]`.

The expected result is a red banner: *"PM view contains cost or margin fields — report not rendered."* This shows that the template refuses to render a PM report containing cost data. It is a safety net only: Productive's own permissions should still stop cost data from reaching the AI.
