---
meta:
  title: Report Table
  description: A grouped report that fetches its own rows, with group headings, gain and loss colouring and a total row.
layout: component
fullWidth: true
---

```html:preview
<zn-report-table caption="Day Compare" data-uri="/data/report-table.json" method="GET" locale="en-US"
                 from="2026-10-19" to="2026-10-20" group-by="affiliateFid"
                 types='[{"value":"compare","label":"Day Compare"},{"value":"summary","label":"Summary"}]'
                 group-bys='[
                   {"value":"affiliateFid","label":"Publisher","category":"Publisher"},
                   {"value":"publisherType","label":"Publisher Type","category":"Publisher"},
                   {"value":"subId1","label":"Sub ID 1","category":"Publisher"},
                   {"value":"campaignFid","label":"Campaign","category":"Campaign"},
                   {"value":"brand","label":"Brand","category":"Campaign"},
                   {"value":"media","label":"Media","category":"Campaign"},
                   {"value":"country","label":"Country","category":"Location"},
                   {"value":"city","label":"City","category":"Location"},
                   {"value":"device","label":"Device","category":"Location"}
                 ]'
                 filter-fields='[
                   {"id":"country","name":"Country","options":{"GB":"United Kingdom","US":"United States","DE":"Germany"}},
                   {"id":"device","name":"Device","options":{"desktop":"Desktop","mobile":"Mobile","tablet":"Tablet"}},
                   {"id":"campaign","name":"Campaign","operators":["eq","contains"]}
                 ]'></zn-report-table>
```

`zn-report-table` shows a report: one row per value of a dimension (a publisher, a country, a campaign) over a date range, read column by column. Use it for reporting. For lists of records with paging, selection and row actions, use [Data Table](/components/data-table).

The table fetches its own data from `data-uri`, and fetches again whenever the report type, group by, date range or filter changes. The columns come back in the response, so the server decides what a report contains.

## Examples

### Everything Enabled

Report types, a categorised group by, the server filter, the column filter row, ticking and charting rows, the heatmap and hiding empty columns, together. `sharable` is left out here only because it would rewrite this page's address.

```html:preview
<zn-report-table caption="Day Compare" data-uri="/data/report-table-day-compare.json"
                 chart-uri="/data/report-table-chart.json" method="GET" locale="en-US"
                 from="2026-10-19" to="2026-10-20" group-by="affiliateFid"
                 date-note="Day Compare sets the first day against the last."
                 column-filters heatmap hide-empty-columns
                 types='[{"value":"compare","label":"Day Compare"},{"value":"summary","label":"Summary"}]'
                 group-bys='[
                   {"value":"affiliateFid","label":"Publisher","category":"Publisher"},
                   {"value":"publisherType","label":"Publisher Type","category":"Publisher"},
                   {"value":"subId1","label":"Sub ID 1","category":"Publisher"},
                   {"value":"campaignFid","label":"Campaign","category":"Campaign"},
                   {"value":"brand","label":"Brand","category":"Campaign"},
                   {"value":"country","label":"Country","category":"Location"},
                   {"value":"device","label":"Device","category":"Location"}
                 ]'
                 filter-fields='[
                   {"id":"country","name":"Country","options":{"GB":"United Kingdom","US":"United States","DE":"Germany"}},
                   {"id":"device","name":"Device","options":{"desktop":"Desktop","mobile":"Mobile","tablet":"Tablet"}},
                   {"id":"campaign","name":"Campaign","operators":["eq","contains"]}
                 ]'></zn-report-table>
```

### Groups and Columns

The response's `groups` give the heading row. Each group lists its `columns`, and a faint line marks the first column of each group. When a group has one column with the same label as the group, the column's own heading is left blank.

Each column has a `key`, a `label` and a `format`, and gets its value in one of three ways:

- `value`: a dotted path into the row's `values`, such as `d1.i.unique`.
- `formula`: arithmetic over `{dotted.path}` placeholders (see [Formulas and Totals](#formulas-and-totals)).
- Neither: the column's `key` is used as the path.

| Field | Values | Default | Meaning |
|---|---|---|---|
| `format` | `number`, `decimal`, `percent`, `currency`, `financial`, `text` | `number` | How the value is displayed. |
| `decimals` | integer | 0 for `number`, 2 otherwise | Decimal places. |
| `style` | `none`, `breakeven`, `ibreakeven`, `bold` | `none` | Colouring. |
| `threshold` | number | 0 | The breakeven point. |
| `summable` | bool | `true`, `false` for `text` | Whether the column gets a computed total. `false` shows `–`. |
| `currency` | ISO code | response `currency`, then the `currency` attribute, then `USD` | |

The formats:

- `number` and `decimal` use the locale's grouping.
- `percent` multiplies by 100 and adds `%`, since ratios are sent as fractions.
- `currency` shows negatives in brackets, such as `($1,396.73)`.
- `financial` is the same as `currency`, without the symbol.
- `text` shows the row's value as it is, for cells the server has already formatted.

With `breakeven`, a value above `threshold` is green and one below it is red. `ibreakeven` reverses that. Columns with no style are never coloured.

Each row has an `id`, a `label` for the first column and its `values`. A `uri` (and an optional `target`) turns the label into a link, which is how drill-down reports are linked. A row's `links` maps column keys to `{uri, target?}` and links those cells, for example a count to the records behind it. A `target` is rendered as `data-target`, so the console opens the link in that space, such as `slide`.

### Formulas and Totals

A `formula` uses `+ - * /`, parentheses, numbers and unary minus over `{dotted.path}` placeholders, such as `{d2.total.revenue} - {d1.total.revenue}`. A leading `=` is ignored. Dividing by zero, a missing path or a value that isn't a number gives `0`. Formulas are parsed, never run as script.

The total row works the same way for every column. First, every numeric value is added up across the rows shown. Then each column's formula is read from those sums. That way a ratio such as Click / Acquisition is recalculated from the summed counts, not averaged.

When the response has `totals`, those are shown instead. Columns missing from `totals` show `–`. While the search box narrows the rows, the table goes back to computing totals from the rows on screen, so the total always matches what is shown.

### Search and Sorting

The search box is a [Data Table Search](/components/data-table-search). It filters rows by their first column in the browser, a moment after typing stops, and its clear button shows every row again. The row count next to the caption reads `2 of 6 rows` while a search narrows the rows. The placeholder defaults to `Search` followed by the dimension's label, and `search-placeholder` replaces it.

Click a column heading to sort by it. The first click sorts descending, the second ascending, and the third goes back to the server's order. The first column sorts by text, and numbers inside it sort naturally, so `Sub ID 9` comes before `Sub ID 10`. The total row never moves. Search and sort are never sent to the server.

### Column Filters

Add `column-filters` to give the first column heading a funnel that opens a filter row under the headings. Each cell filters the rows already shown by that column's values, in the browser, without fetching again. The first column's cell matches rows whose label contains what's typed, so it replaces the search box, which isn't shown. The row stays open while any filter has text. Use `filter-fields` for filters the server should apply.

| Type | Shows rows |
|---|---|
| `>1000`, `>=1000`, `<0`, `<=5`, `=0` | compared with the number |
| `1000` | at least the number |
| `10..50` | between the two numbers, inclusive |
| `!0` | that aren't zero |
| `top 5`, `bottom 5` | with the highest or lowest values, among the rows the other filters leave |

Numbers are typed as they're shown: grouping commas, currency symbols and `%` are ignored, and `5` on a percent column means 5%. A text column matches rows containing what's typed. While a cell has focus, a list of examples shows under it, and clicking one fills it in.

A filter that applies shows as its formatted value, such as `> $1,000.00`, and its column heading turns the primary colour. Click the cell to edit it, or use its clear button or press Escape to remove it. A filter that can't be read is outlined and ignored.

The row count reads `2 of 6 rows`, and the total row is computed from the rows shown, as with search. When the filters hide every row, the table and its filter row stay on screen with a message and a button to clear them, rather than the empty state.

```html:preview
<zn-report-table caption="Day Compare" data-uri="/data/report-table.json" method="GET" locale="en-US"
                 from="2026-10-19" to="2026-10-20" column-filters></zn-report-table>
```

### Selecting and Charting Rows

`selectable` gives each row a tick box, with one in the heading that ticks every row shown. While rows are ticked, a bar under the header offers Clear selection. Ticks are cleared when the group by changes.

Add `chart-uri` to chart rows over time. It adds a chart button at the end of the header. Pressing it shows the tick boxes, ticks every row shown and opens a line chart above the table, so sorting and filtering pick what's charted. Untick rows to take their lines off; with none ticked, the chart asks for some. The bar under the header has a Chart by menu, which lists each number column once (a label repeated across groups, such as each day's Leads, is one metric over time), and Clear selection. The chart draws a line for each ticked row, in the order the server sent them, with a legend under it. The first six take the theme's chart colours, and further rows take lighter, then darker, versions of them, so every line has its own colour. Changing the column or the ticks fetches it again. The chart button, the chart's close button or Clear selection ends charting, which hides the tick boxes and clears them.

```html:preview
<zn-report-table caption="Day Compare" data-uri="/data/report-table.json" chart-uri="/data/report-table-chart.json"
                 method="GET" locale="en-US" from="2026-10-19" to="2026-10-20"></zn-report-table>
```

The table sends the report's state to `chart-uri`, with the picked column's `key` as `metric` and the ticked rows' ids as `rows`, using `method` and the `inputs` slot as the report request does. It sends the header `x-kx-fetch-style: zn-report-table-chart`.

```json
{
  "type": "compare", "groupBy": "affiliateFid", "from": "2026-10-19", "to": "2026-10-20", "filter": "",
  "metric": "revenue",
  "rows": ["AFF-1", "AFF-6"]
}
```

The response gives the x-axis `labels` and, for each row by `id`, one value per label. Values use the column's format: percentages are sent as fractions and money in the column's currency.

```json
{
  "labels": ["7 Oct", "8 Oct", "9 Oct"],
  "series": [
    {"id": "AFF-1", "data": [1324.22, 1245.39, 1360.65]},
    {"id": "AFF-6", "data": [802.1, 911.4, null]}
  ]
}
```

### Report Type, Group By and Dates

- `types` is a JSON array of `{value, label}`. With two or more types, they show as tabs under the header, and `type` defaults to the first.
- `group-bys` is a JSON array of `{value, label, category?}` for the Group by menu. Options with a `category` are listed under its heading in a three-column grid. Without categories, the options are one list.
- `from` and `to` are ISO dates for the date range. `max-date` is the latest day that can be picked, and defaults to today. `presets` replaces the quick ranges, as on [Date Range](/components/date-range). `date-note` adds a short line under the calendar, such as "Day Compare sets the first day against the last."
- `filter-fields` gives the funnel its fields, in the same shape as Data Table's `filter-fields`. The funnel is a [Data Table Filter](/components/data-table-filter), and the rules that apply show as chips under the header. The funnel is hidden when there are no fields. The applied rules are sent as `filter`.

The response can send its own `groupBys` and `filterFields`, for a type whose options differ, and they replace the attributes. When the response's `groupBy` differs from the one requested, the table adopts it.

Each change sets the matching attribute and emits `zn-report-change` with `{type, groupBy, from, to, filter}`, then the table fetches again.

```html:preview
<zn-report-table class="report-events" caption="Day Compare" data-uri="/data/report-table.json" method="GET"
                 locale="en-US" from="2026-10-19" to="2026-10-20" group-by="affiliateFid"
                 group-bys='[
                   {"value":"affiliateFid","label":"Publisher"},
                   {"value":"campaignFid","label":"Campaign"},
                   {"value":"country","label":"Country"},
                   {"value":"device","label":"Device"}
                 ]'></zn-report-table>
<pre class="report-events__log">Change the group by or dates to see zn-report-change.</pre>

<script type="module">
  const table = document.querySelector('.report-events');
  const log = document.querySelector('.report-events__log');
  table.addEventListener('zn-report-change', event => {
    log.textContent = JSON.stringify(event.detail, null, 2);
  });
</script>
```

### Wide Reports

A report wider than its panel scrolls sideways. The first column stays in place and the other columns pass behind it, so each row's label stays in view. This Day Compare has a group per day, each with its own counts, ratios and spend.

```html:preview
<zn-report-table caption="Day Compare" data-uri="/data/report-table-day-compare.json" method="GET" locale="en-US"
                 from="2026-10-19" to="2026-10-20" group-by="affiliateFid"
                 types='[{"value":"compare","label":"Day Compare"},{"value":"summary","label":"Summary"}]'
                 group-bys='[
                   {"value":"affiliateFid","label":"Publisher"},
                   {"value":"campaignFid","label":"Campaign"},
                   {"value":"country","label":"Country"}
                 ]'
                 filter-fields='[{"id":"country","name":"Country","options":{"GB":"United Kingdom","US":"United States"}}]'></zn-report-table>
```

### Small Screens

On a phone (640px wide or less) the search, filter, date range and group by fold into a [Filter Tray](/components/filter-tray): one button showing the date range and grouping, badged with the number of filters applied, that opens them in a bottom sheet. The sheet lays them out for touch: date presets as chips with a Custom… chip for any other range, group by as a segmented control (or chips, past three options), a Filters row showing how many are applied, Reset to clear search and filters, and a button showing how many rows are left. Narrow this window to see it.

### Sharable

Add `sharable` to keep the report's state in the URL's query string, so the view can be bookmarked or shared. The table writes `type`, `groupBy`, `from`, `to`, `filter` and `search` when they differ from the attributes it started with, and reads them back on load. Other query parameters are left alone.

```html
<zn-report-table sharable data-uri="/reports/compare" caption="Day Compare"
                 from="2026-10-19" to="2026-10-20"></zn-report-table>
```

A link such as `?type=summary&groupBy=country&from=2026-10-01&to=2026-10-07` opens the Summary type grouped by Country for that week.

### Inputs and Empty State

Inputs in the `inputs` slot are sent with every request, which is useful for csrf tokens. Content in the `empty-state` slot replaces the default empty state, which is shown inside the panel when there are no rows.

```html
<zn-report-table data-uri="/reports/compare">
  <input slot="inputs" type="hidden" name="csrf" value="token">
  <zn-empty-state slot="empty-state" caption="No traffic" icon="bar_chart"
                  description="Nothing ran in this range."></zn-empty-state>
</zn-report-table>
```

## Request and Response

The table sends JSON to `data-uri` with a `POST`, or a `GET` without a body when `method="GET"`. It sends the header `x-kx-fetch-style: zn-report-table`.

```json
{
  "type": "compare",
  "groupBy": "affiliateFid",
  "from": "2026-10-19",
  "to": "2026-10-20",
  "filter": "W3sia2V5IjoiY291bnRyeSIsImNvbXBhcmF0b3IiOiJlcSIsInZhbHVlIjoiR0IifV0="
}
```

`filter` is `btoa(JSON.stringify(rules))` of `{key, comparator, value}` rules, as Data Table sends it, or `''` when no rules apply. The server decides what `from` and `to` mean for each type. A Day Compare compares the two days, and other types treat them as a span.

The response:

```json
{
  "dimension": {"label": "Publisher"},
  "groups": [
    {
      "label": "Difference between 2026-10-19 and 2026-10-20",
      "columns": [
        {"key": "revenue", "label": "Revenue", "format": "currency", "style": "breakeven",
         "formula": "{d2.total.revenue} - {d1.total.revenue}"}
      ]
    },
    {
      "label": "2026-10-19",
      "columns": [{"key": "d1In", "label": "Inbound Actions", "format": "number", "value": "d1.i.unique"}]
    }
  ],
  "rows": [
    {"id": "AFF-1", "label": "NovaBeyond - Push/Display - Jake", "uri": "/reports/compare/campaignFid",
     "values": {"d1": {"total": {"revenue": 2097.41}, "i": {"unique": 1298}}, "d2": {"total": {"revenue": 700.68}}}}
  ],
  "totals": {"revenue": -25736.81},
  "currency": "USD",
  "groupBy": "affiliateFid",
  "groupBys": [{"value": "affiliateFid", "label": "Publisher", "category": "Publisher"}],
  "filterFields": [{"id": "country", "name": "Country"}],
  "error": {"text": "Results are limited to 1,000 rows", "level": "warning"}
}
```

- `groups` and `rows` are required. `null` is read as an empty list.
- `totals` is optional. Without it, the table computes the totals.
- `groupBy`, `groupBys` and `filterFields` are optional and replace the attributes.
- `error` shows an alert inside the panel, above the table.
