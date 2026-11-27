---
meta:
  title: Filter Tray
  description: Lays a toolbar's filter controls out inline, and on narrow screens folds them behind one summary button that opens them in a bottom sheet.
layout: component
---

```html:preview
<zn-panel caption="Tickets" flush>
  <zn-filter-tray slot="actions" label="Report options" summary="1–31 Oct 2026 · Department" count="1">
    <zn-data-table-search placeholder="Search department..."></zn-data-table-search>
    <zn-date-range from="2026-10-01" to="2026-10-31"></zn-date-range>
  </zn-filter-tray>
</zn-panel>
```

Wrap a toolbar's filter controls (search, date range, filter, group by) in `zn-filter-tray`. On wide screens the tray steps out of the way and the controls lay out exactly as they would without it. At or below the `breakpoint` (640px of viewport width by default) the controls fold behind a single button showing `summary`, and open in a bottom sheet, stacked full width.

While collapsed the tray reflects a `collapsed` attribute and emits `zn-collapse` (and `zn-expand` on the way back), so a host can render controls that suit a touch sheet better, as [Report Table](/components/report-table) does with chips for its date presets and group by.

## Examples

### Summary and Count

`summary` is what the controls are set to, shown on the button. `count` is how many filters are applied, shown as a badge. Without a summary the button shows `label`, which is also the sheet's heading.

```html:preview
<zn-filter-tray label="Filters" count="2" breakpoint="100000">
  <zn-data-table-search placeholder="Search..."></zn-data-table-search>
  <zn-date-range from="2026-10-01" to="2026-10-31"></zn-date-range>
</zn-filter-tray>
```

### Breakpoint

Set `breakpoint` to the viewport width, in px, at or below which the controls fold. A very large value keeps the tray collapsed on every screen.

```html:preview
<zn-filter-tray summary="Last month · Department" breakpoint="100000" done-label="Show 3 rows">
  <zn-data-table-search placeholder="Search department..."></zn-data-table-search>
  <zn-date-range from="2026-10-01" to="2026-10-31"></zn-date-range>
</zn-filter-tray>
```

### Header Actions

Put a reset button, or anything else that acts on the whole sheet, in the `header-actions` slot beside the heading.

```html:preview
<zn-filter-tray summary="Last month" breakpoint="100000">
  <zn-button slot="header-actions" color="transparent" size="small">Reset</zn-button>
  <zn-data-table-search placeholder="Search..."></zn-data-table-search>
</zn-filter-tray>
```

### Done Label

`done-label` sets the text of the button that closes the sheet. [Report Table](/components/report-table) uses it to show how many rows the filters leave, e.g. "Show 3 rows".
